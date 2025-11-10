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
    body: JSON.stringify({ q: query }),
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
    
    return encode({
      results: data.organic,
    });
  }

  return "No results found.";
};
