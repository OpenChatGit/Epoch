/**
 * Tool Registry for Epoch Agent
 * 
 * This file exports all available tools for the agent to use.
 * Tools are organized by category for better maintainability.
 */

import { tool } from "ai";
import { z } from "zod";
import { searchWeb, searchImage } from "../searchUtils";

// Re-export search tools
export const webTools = {
  search: tool({
    description: "Search the web for information using Google search. Use this when you need current information, facts, or data from the internet.",
    inputSchema: z.object({
      query: z.string().describe("The search query to find information on the web."),
    }),
    execute: async ({ query }) => {
      return await searchWeb(query);
    },
  }),

  searchImage: tool({
    description: "Search for images on the web. Use this when you need to find or display images related to a topic.",
    inputSchema: z.object({
      query: z.string().describe("The search query to find images."),
    }),
    execute: async ({ query }) => {
      try {
        const imageUrl = await searchImage(query);
        return imageUrl || `No image found for query: ${query}`;
      } catch (error) {
        return `Error searching for image: ${error}`;
      }
    },
  }),
};

// Data & Analysis Tools
export const dataTools = {
  calculate: tool({
    description: "Perform mathematical calculations. Supports basic arithmetic (+, -, *, /), percentages, and common functions.",
    inputSchema: z.object({
      expression: z.string().describe("Mathematical expression to calculate (e.g., '2 + 2', '100 * 0.15', 'sqrt(16)')."),
    }),
    execute: async ({ expression }) => {
      try {
        // Sanitize expression to prevent code injection
        // Only allow numbers, basic operators, parentheses, spaces, and sqrt
        const sanitized = expression.replace(/[^0-9+\-*/().\s%sqrt]/g, '');
        
        // Handle sqrt function
        if (sanitized.includes('sqrt')) {
          const num = parseFloat(sanitized.replace(/sqrt\(|\)/g, ''));
          if (isNaN(num) || num < 0) {
            return "Error: sqrt requires a non-negative number";
          }
          return String(Math.sqrt(num));
        }
        
        // Basic arithmetic - use eval in a controlled way
        // Note: In production, consider using a proper math parser library
        // This is a simplified version for demonstration
        const allowedChars = /^[0-9+\-*/().\s%]+$/;
        if (!allowedChars.test(sanitized)) {
          return "Error: Invalid characters in expression";
        }
        
        // Use eval with strict mode (still not ideal, but safer than Function)
        const result = eval(`(${sanitized})`);
        if (typeof result !== 'number' || !isFinite(result)) {
          return "Error: Invalid expression or result";
        }
        return String(result);
      } catch (error) {
        return `Error calculating: ${error}. Please provide a valid mathematical expression.`;
      }
    },
  }),

  analyzeData: tool({
    description: "Analyze numerical data arrays. Can calculate sum, average, min, max, count, and other statistics.",
    inputSchema: z.object({
      data: z.array(z.number()).describe("Array of numbers to analyze."),
      operation: z.enum(["sum", "avg", "min", "max", "count", "median", "range"]).describe("Statistical operation to perform."),
    }),
    execute: async ({ data, operation }) => {
      try {
        if (data.length === 0) {
          return "Error: Data array is empty";
        }

        switch (operation) {
          case "sum":
            return String(data.reduce((a, b) => a + b, 0));
          case "avg":
            return String(data.reduce((a, b) => a + b, 0) / data.length);
          case "min":
            return String(Math.min(...data));
          case "max":
            return String(Math.max(...data));
          case "count":
            return String(data.length);
          case "median": {
            const sorted = [...data].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            return sorted.length % 2 !== 0
              ? String(sorted[mid])
              : String((sorted[mid - 1] + sorted[mid]) / 2);
          }
          case "range":
            return String(Math.max(...data) - Math.min(...data));
          default:
            return `Unknown operation: ${operation}`;
        }
      } catch (error) {
        return `Error analyzing data: ${error}`;
      }
    },
  }),
};

// File System Tools (for future use - currently limited for security)
export const fileTools = {
  // Note: File operations are restricted for security reasons
  // In a production environment, these would require proper sandboxing
  validateJson: tool({
    description: "Validate and parse JSON data. Returns parsed JSON if valid, or error message if invalid.",
    inputSchema: z.object({
      jsonString: z.string().describe("JSON string to validate and parse."),
    }),
    execute: async ({ jsonString }) => {
      try {
        const parsed = JSON.parse(jsonString);
        return JSON.stringify(parsed, null, 2);
      } catch (error) {
        return `Invalid JSON: ${error}`;
      }
    },
  }),
};

// API Tools
export const apiTools = {
  fetchApi: tool({
    description: "Make HTTP requests to external APIs. Supports GET and POST requests. Use this to fetch data from REST APIs.",
    inputSchema: z.object({
      url: z.string().url().describe("The API endpoint URL."),
      method: z.enum(["GET", "POST", "PUT", "DELETE"]).optional().describe("HTTP method to use (default: GET)."),
      headers: z.record(z.string(), z.string()).optional().describe("Optional HTTP headers as key-value pairs."),
      body: z.string().optional().describe("Optional request body (for POST/PUT requests)."),
    }),
    execute: async ({ url, method, headers, body }) => {
      const httpMethod = method || "GET";
      const httpHeaders = headers || {};
      try {
        const response = await fetch(url, {
          method: httpMethod,
          headers: {
            "Content-Type": "application/json",
            ...httpHeaders,
          },
          body: body ? body : undefined,
        });

        if (!response.ok) {
          return `API Error: ${response.status} ${response.statusText}`;
        }

        const data = await response.json();
        return JSON.stringify(data, null, 2);
      } catch (error) {
        return `Error calling API: ${error}`;
      }
    },
  }),
};

// Combine all tools
export const allTools = {
  ...webTools,
  ...dataTools,
  ...fileTools,
  ...apiTools,
};

// Tool metadata for planning and orchestration
export const toolMetadata = {
  search: {
    category: "web",
    dependencies: [],
    outputType: "text",
    estimatedTime: 2000, // ms
  },
  searchImage: {
    category: "web",
    dependencies: [],
    outputType: "url",
    estimatedTime: 2000,
  },
  calculate: {
    category: "data",
    dependencies: [],
    outputType: "number",
    estimatedTime: 100,
  },
  analyzeData: {
    category: "data",
    dependencies: [],
    outputType: "number",
    estimatedTime: 100,
  },
  validateJson: {
    category: "data",
    dependencies: [],
    outputType: "object",
    estimatedTime: 50,
  },
  fetchApi: {
    category: "api",
    dependencies: [],
    outputType: "object",
    estimatedTime: 1000,
  },
};

