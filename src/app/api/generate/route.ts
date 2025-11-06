import { jsonSchema, Output, tool, ToolLoopAgent } from "ai";
import { TextEncoder } from "util";
import { z } from "zod";
import { searchWeb } from "../../../lib/searchUtils";
import { ollama } from "ollama-ai-provider-v2";
import { openai } from "@ai-sdk/openai";
import { staticSchema } from "@/lib/responseSchema";
import { systemPrompt } from "@/lib/prompts";

export const POST = async (request: Request) => {
  const body = await request.json();
  const model =
    process.env.USE_OPENAI === "true"
      ? openai(process.env.MODEL_NAME || "gpt-4.1-mini")
      : process.env.USE_OLLAMA === "true"
        ? ollama(process.env.MODEL_NAME || "gpt-oss:120b-cloud")
        : null;

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
