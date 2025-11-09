import { jsonSchema, LanguageModel, Output, tool, ToolLoopAgent } from "ai";
import { TextEncoder } from "util";
import { z } from "zod";
import { searchWeb } from "../../../lib/searchUtils";
import { createOllama } from "ollama-ai-provider-v2";
import { createOpenAI } from "@ai-sdk/openai";
import { staticSchema } from "@/lib/responseSchema";
import { systemPrompt } from "@/lib/prompts";

export const POST = async (request: Request) => {
  const body = await request.json();
  const selectedModel = body.model;

  let model: LanguageModel | null = null;

  if (process.env.USE_OPENAI === "true") {
    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    });

    model = openai(selectedModel || process.env.MODEL_NAME || "gpt-4.1-mini");
  } else if (process.env.USE_OLLAMA === "true") {
    const ollama = createOllama({
      baseURL: process.env.OLLAMA_API_URL || "http://localhost:11434/api",
    });

    model = ollama(selectedModel || process.env.MODEL_NAME || "llama3.2");
  }

  if (!model) {
    return new Response(
      "No model configured. Please set USE_OPENAI or USE_OLLAMA environment variable.",
      { status: 500 },
    );
  }

  const agent = new ToolLoopAgent({
    model: model,
    instructions: systemPrompt,
    tools: {
      search: tool({
        description: "Search the web for information",
        inputSchema: z.object({
          query: z.string().describe("The query to search the web for."),
        }),
        execute: async ({ query }) => {
          return await searchWeb(query);
        },
      }),
    },
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

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
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

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
};
