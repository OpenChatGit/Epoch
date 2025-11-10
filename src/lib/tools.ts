import { tool } from "ai";
import { z } from "zod";
import { searchWeb, searchImage } from "./searchUtils";

/**
 * Get latest GitHub release version
 */
async function getGitHubLatestRelease(owner: string, repo: string): Promise<string> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Epoch-AI-Assistant'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const data = await response.json();
    return `Latest release: ${data.tag_name || data.name}\nPublished: ${data.published_at}\nURL: ${data.html_url}\n\nRelease notes:\n${(data.body || '').substring(0, 500)}`;
  } catch (error) {
    return `Error fetching GitHub release: ${error}`;
  }
}

/**
 * Create tools with API key support
 * @param serperApiKey - Optional Serper API key for web/image search
 */
export function createTools(serperApiKey?: string) {
  return {
    search: tool({
      description: "Search the web for current information, facts, statistics, or recent events. For software versions, use getGitHubRelease instead.",
      inputSchema: z.object({
        query: z.string().describe("The search query. Be specific and include relevant keywords."),
      }),
      execute: async ({ query }) => {
        console.log(`[TOOL CALL] Searching web for: "${query}"`);
        const result = await searchWeb(query, serperApiKey);
        console.log(`[TOOL RESULT] Search completed, got ${result.length} characters`);
        return result;
      },
    }),
    getGitHubRelease: tool({
      description: "Get the latest release version from a GitHub repository. Use this for software version queries (e.g., 'What is the latest version of Ollama?'). This is more reliable than web search for version information.",
      inputSchema: z.object({
        owner: z.string().describe("GitHub repository owner/organization (e.g., 'ollama')"),
        repo: z.string().describe("GitHub repository name (e.g., 'ollama')"),
      }),
      execute: async ({ owner, repo }) => {
        console.log(`[TOOL CALL] Getting GitHub release for: ${owner}/${repo}`);
        const result = await getGitHubLatestRelease(owner, repo);
        console.log(`[TOOL RESULT] GitHub release fetched`);
        return result;
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
