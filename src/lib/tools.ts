import { tool } from "ai";
import { z } from "zod";
import { searchWeb, searchImage } from "./searchUtils";

/**
 * Create tools with API key support
 * @param serperApiKey - Optional Serper API key for web/image search
 */
export function createTools(serperApiKey?: string) {
  return {
    search: tool({
      description: "Search the web for information",
      inputSchema: z.object({
        query: z.string().describe("The query to search the web for."),
      }),
      execute: async ({ query }) => {
        return await searchWeb(query, serperApiKey);
      },
    }),
    searchImage: tool({
      description: "Search for images",
      inputSchema: z.object({
        query: z.string().describe("The query to search images for."),
      }),
      execute: async ({ query }) => {
        return await searchImage(query, serperApiKey);
      },
    }),
  };
}

// Default tools without API key (uses env variable)
export const allTools = createTools();
