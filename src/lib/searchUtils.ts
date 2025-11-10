import { encode } from "@toon-format/toon";
import { trackImageSearch, trackWebSearch } from "./searchUsageTracker";

export const searchImage = async (query: string, apiKey?: string): Promise<string> => {
  const key = apiKey || (typeof process !== 'undefined' && process.env?.SERPER_API_KEY) || "";
  
  if (!key) {
    throw new Error("Serper API key not configured");
  }

  const response = await fetch("https://google.serper.dev/images", {
    method: "POST",
    headers: {
      "X-API-KEY": key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query }),
  });

  if (!response.ok) {
    throw new Error(
      `Image search failed for "${query}": ` + response.statusText,
    );
  }

  const data = await response.json();

  if (data.images && data.images.length > 0) {
    const imageUrl = data.images[0].imageUrl;
    
    // Track usage (only works client-side)
    if (typeof window !== 'undefined') {
      trackImageSearch();
    }

    return imageUrl;
  }

  return "";
};

export const searchWeb = async (query: string, apiKey?: string): Promise<string> => {
  const key = apiKey || (typeof process !== 'undefined' && process.env?.SERPER_API_KEY) || "";
  
  if (!key) {
    throw new Error("Serper API key not configured");
  }

  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      q: query,
      num: 10, // Get more results for better coverage
      // Don't use tbs filter - let Google return the most relevant results
    }),
  });

  if (!response.ok) {
    throw new Error(`Web search failed for "${query}": ` + response.statusText);
  }

  const data = await response.json();

  if (data.organic && data.organic.length > 0) {
    // Track usage (only works client-side)
    if (typeof window !== 'undefined') {
      trackWebSearch();
    }
    
    let result = '';
    
    // Priority 1: Answer Box (most concise and direct)
    if (data.answerBox) {
      const answer = data.answerBox.answer || data.answerBox.snippet || "";
      if (answer) {
        result += `Direct Answer: ${answer}\n\n`;
      }
    }
    
    // Priority 2: Knowledge Graph (structured data)
    if (data.knowledgeGraph) {
      if (data.knowledgeGraph.title) {
        result += `About: ${data.knowledgeGraph.title}\n`;
      }
      if (data.knowledgeGraph.description) {
        result += `${data.knowledgeGraph.description}\n`;
      }
      if (data.knowledgeGraph.attributes) {
        const attrs = Object.entries(data.knowledgeGraph.attributes)
          .slice(0, 3)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        if (attrs) {
          result += `Details: ${attrs}\n`;
        }
      }
      result += '\n';
    }
    
    // Priority 3: Prioritize official sources (GitHub, official websites)
    const officialResults = data.organic.filter((item: any) => 
      item.link && (
        item.link.includes('github.com') || 
        item.link.includes('ollama.com') ||
        item.link.includes('ollama.ai')
      )
    ).slice(0, 2);
    
    // Priority 4: Other top results
    const otherResults = data.organic
      .filter((item: any) => !officialResults.includes(item))
      .slice(0, 3);
    
    const allResults = [...officialResults, ...otherResults];
    
    allResults.forEach((item: any, index: number) => {
      if (item.snippet || item.title) {
        const isOfficial = item.link && (
          item.link.includes('github.com') || 
          item.link.includes('ollama.com') ||
          item.link.includes('ollama.ai')
        );
        result += `${isOfficial ? '⭐ ' : ''}Source ${index + 1}`;
        if (item.title) {
          result += ` (${item.title})`;
        }
        result += `:\n`;
        
        // Extract version numbers from title and snippet
        const text = `${item.title || ''} ${item.snippet || ''}`;
        const versionMatch = text.match(/v?\d+\.\d+\.\d+/gi);
        if (versionMatch && versionMatch.length > 0) {
          result += `Version found: ${versionMatch[0]}\n`;
        }
        
        if (item.snippet) {
          result += `${item.snippet}\n`;
        }
        if (item.link) {
          result += `URL: ${item.link}\n`;
        }
        if (item.date) {
          result += `Date: ${item.date}\n`;
        }
        result += '\n';
      }
    });
    
    return result.trim() || "No clear answer found.";
  }

  return "No results found.";
};
