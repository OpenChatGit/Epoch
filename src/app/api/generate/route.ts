import { jsonSchema, LanguageModel, Output, ToolLoopAgent } from "ai";
import { TextEncoder } from "util";
import { createOllama } from "ollama-ai-provider-v2";
import { createOpenAI } from "@ai-sdk/openai";
import { staticSchema } from "@/lib/responseSchema";
import { systemPrompt } from "@/lib/prompts";
import { createTools } from "../../../lib/tools";

export const POST = async (request: Request) => {
  const body = await request.json();
  const selectedModel = body.model;
  const mode = body.mode || 'agent'; // 'ask' or 'agent'
  const provider = body.provider || 'ollama';
  const apiKey = body.apiKey;
  const baseUrl = body.baseUrl;
  const llmCliTools = body.llmCliTools;
  const serperApiKey = body.serperApiKey;

  let model: LanguageModel | null = null;

  if (provider === 'openai') {
    const openai = createOpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY || "",
    });

    model = openai(selectedModel || process.env.MODEL_NAME || "gpt-4o-mini");
  } else if (provider === 'ollama') {
    const ollama = createOllama({
      baseURL: baseUrl || process.env.OLLAMA_API_URL || "http://localhost:11434/api",
    });

    model = ollama(selectedModel || process.env.MODEL_NAME || "llama3.2");
  }

  if (!model) {
    return new Response(
      "No model configured. Please configure a provider in settings.",
      { status: 500 },
    );
  }

  const encoder = new TextEncoder();
  let stream: ReadableStream;

  if (mode === 'ask') {
    // Simple text mode without JSON structure
    const { streamText } = await import('ai');
    
    const result = await streamText({
      model: model,
      messages: body.messages,
      temperature: 1,
    });

    stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            const data = `data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });
  } else {
    // Agent mode with JSON structure and tools
    // Create tools with API key if provided
    const tools = createTools(serperApiKey);
    
    const agent = new ToolLoopAgent({
      model: model,
      instructions: systemPrompt,
      tools: tools,
      temperature: 1,
      output: Output.object({
        schema: jsonSchema(staticSchema),
      }),
      providerOptions: {
        ollama: {
          options: {
            num_ctx: 32000,
          },
        },
      },
    });

    const { partialOutputStream } = await agent.stream({
      messages: body.messages,
    });

    stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const partialObject of partialOutputStream) {
            const data = `data: ${JSON.stringify(partialObject)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });
  }

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
};
