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
    // Simple text mode without JSON structure but with tools
    const { streamText } = await import('ai');
    
    // Get current date for context
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const askModePrompt = `You are a helpful AI assistant with access to tools.

Current date: ${dateString}

Available tools:
- getGitHubRelease: Get the latest version from a GitHub repository (BEST for software versions)
- search: Search the web for general information

When asked about software versions:
1. If it's on GitHub (like Ollama, React, etc.), use getGitHubRelease tool
   Example: For "Ollama version", use getGitHubRelease with owner="ollama" and repo="ollama"
2. Otherwise, use the search tool

Keep your reasoning brief (2-3 sentences max). Trust the tool results.

Use markdown formatting for better readability.`;
    
    // Create tools with API key if provided
    const tools = createTools(serperApiKey);
    
    // First call - get initial response and tool calls
    const firstResult = await streamText({
      model: model,
      system: askModePrompt,
      messages: body.messages,
      tools: tools,
      temperature: 1,
    });

    stream = new ReadableStream({
      async start(controller) {
        try {
          let buffer = '';
          let inReasoningTag = false;
          let reasoningBuffer = '';
          let tagName = '';
          let beforeToolCall = true;
          let reasoningPhase = true;
          let hasSeenToolCall = false;
          let postToolReasoningStarted = false;
          
          // Collect tool calls and results for continuation
          const toolCalls: any[] = [];
          const toolResults: any[] = [];
          let hasTools = false;
          
          for await (const chunk of firstResult.fullStream) {
            if (chunk.type === 'text-delta') {
              buffer += chunk.text;
              
              // Process buffer for reasoning tags
              while (buffer.length > 0) {
                if (!inReasoningTag) {
                  // Check for opening tag
                  const openMatch = buffer.match(/<(think|thinking|reasoning)>/i);
                  
                  if (openMatch) {
                    const beforeTag = buffer.substring(0, openMatch.index);
                    
                    // Send text before tag based on phase
                    if (beforeTag) {
                      const type = reasoningPhase ? 'reasoning' : 'text';
                      const data = `data: ${JSON.stringify({ type, content: beforeTag })}\n\n`;
                      controller.enqueue(encoder.encode(data));
                    }
                    
                    // Enter reasoning mode
                    inReasoningTag = true;
                    tagName = openMatch[1];
                    buffer = buffer.substring(openMatch.index! + openMatch[0].length);
                    reasoningBuffer = '';
                  } else {
                    // No opening tag found, check if we might have a partial tag at the end
                    const possiblePartialTag = buffer.match(/<(t(h(i(n(k(i(n(g)?)?)?)?)?)?)?|r(e(a(s(o(n(i(n(g)?)?)?)?)?)?)?)?)?$/i);
                    
                    if (possiblePartialTag) {
                      // Keep potential partial tag in buffer
                      const safeText = buffer.substring(0, possiblePartialTag.index);
                      if (safeText) {
                        const type = reasoningPhase ? 'reasoning' : 'text';
                        const data = `data: ${JSON.stringify({ type, content: safeText })}\n\n`;
                        controller.enqueue(encoder.encode(data));
                      }
                      buffer = buffer.substring(possiblePartialTag.index!);
                      break; // Wait for more chunks
                    } else {
                      // Send all based on phase
                      const type = reasoningPhase ? 'reasoning' : 'text';
                      const data = `data: ${JSON.stringify({ type, content: buffer })}\n\n`;
                      controller.enqueue(encoder.encode(data));
                      buffer = '';
                      break;
                    }
                  }
                } else {
                  // Inside reasoning tag, look for closing tag
                  const closePattern = new RegExp(`</${tagName}>`, 'i');
                  const closeMatch = buffer.match(closePattern);
                  
                  if (closeMatch) {
                    // Found closing tag
                    const reasoningContent = buffer.substring(0, closeMatch.index);
                    reasoningBuffer += reasoningContent;
                    
                    // Send reasoning content
                    if (reasoningBuffer) {
                      const data = `data: ${JSON.stringify({ type: 'reasoning', content: reasoningBuffer })}\n\n`;
                      controller.enqueue(encoder.encode(data));
                    }
                    
                    // Send reasoning complete
                    const completeData = `data: ${JSON.stringify({ type: 'reasoning_complete' })}\n\n`;
                    controller.enqueue(encoder.encode(completeData));
                    
                    // Exit reasoning mode and switch to text phase
                    inReasoningTag = false;
                    reasoningPhase = false;
                    buffer = buffer.substring(closeMatch.index! + closeMatch[0].length);
                    reasoningBuffer = '';
                    tagName = '';
                  } else {
                    // Check for partial closing tag
                    const possiblePartialClose = buffer.match(new RegExp(`<(/${tagName.substring(0, Math.min(buffer.length, tagName.length))})?$`, 'i'));
                    
                    if (possiblePartialClose && possiblePartialClose.index! > 0) {
                      // Keep potential partial closing tag in buffer
                      const reasoningContent = buffer.substring(0, possiblePartialClose.index);
                      reasoningBuffer += reasoningContent;
                      
                      // Send reasoning content
                      if (reasoningContent) {
                        const data = `data: ${JSON.stringify({ type: 'reasoning', content: reasoningContent })}\n\n`;
                        controller.enqueue(encoder.encode(data));
                      }
                      
                      buffer = buffer.substring(possiblePartialClose.index!);
                      break; // Wait for more chunks
                    } else {
                      // All is reasoning content
                      reasoningBuffer += buffer;
                      
                      // Send reasoning content
                      const data = `data: ${JSON.stringify({ type: 'reasoning', content: buffer })}\n\n`;
                      controller.enqueue(encoder.encode(data));
                      
                      buffer = '';
                      break;
                    }
                  }
                }
              }
            } else if (chunk.type === 'tool-call') {
              // Flush any remaining buffer as reasoning before tool call
              if (buffer && reasoningPhase) {
                console.log('[BACKEND] Flushing pre-tool reasoning:', buffer.substring(0, 50));
                const data = `data: ${JSON.stringify({ type: 'reasoning', content: buffer })}\n\n`;
                controller.enqueue(encoder.encode(data));
                buffer = '';
              }
              
              // Store tool call for continuation
              toolCalls.push(chunk);
              hasSeenToolCall = true;
              hasTools = true;
              beforeToolCall = false;
              
              console.log('[BACKEND] Tool call:', chunk.toolName);
              const toolReasoning = `data: ${JSON.stringify({ 
                type: 'reasoning', 
                content: `\n\nUsing ${chunk.toolName} tool...` 
              })}\n\n`;
              controller.enqueue(encoder.encode(toolReasoning));
            } else if (chunk.type === 'tool-result') {
              const output = 'output' in chunk ? chunk.output : '';
              console.log('[BACKEND] Tool result from:', chunk.toolName, 'Output:', output);
              
              // Store tool result for continuation
              toolResults.push({ toolName: chunk.toolName, output });
              
              // Show tool result in reasoning
              const resultPreview = typeof output === 'string' 
                ? output.substring(0, 100) 
                : JSON.stringify(output).substring(0, 100);
              
              const toolComplete = `data: ${JSON.stringify({ 
                type: 'reasoning', 
                content: `\n\nRetrieved: ${resultPreview}${resultPreview.length >= 100 ? '...' : ''}` 
              })}\n\n`;
              controller.enqueue(encoder.encode(toolComplete));
            } else if (chunk.type === 'finish') {
              console.log('[BACKEND] First stream finished, reason:', chunk.finishReason, 'Has tools:', hasTools);
            }
          }
          
          // Flush any remaining buffer from first stream
          if (buffer) {
            if (inReasoningTag) {
              const data = `data: ${JSON.stringify({ type: 'reasoning', content: buffer })}\n\n`;
              controller.enqueue(encoder.encode(data));
            } else {
              const type = reasoningPhase ? 'reasoning' : 'text';
              const data = `data: ${JSON.stringify({ type, content: buffer })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
            buffer = '';
          }
          
          // If we had tool calls, continue with a second stream
          if (hasTools && toolResults.length > 0) {
            console.log('[BACKEND] Starting continuation stream with tool results');
            
            // Build continuation messages with tool results
            const continuationMessages = [
              ...body.messages,
              {
                role: 'assistant' as const,
                content: `I've received the search results. Let me analyze them and provide a clear answer.`
              }
            ];
            
            // Second call - continue with tool results
            const continueResult = await streamText({
              model: model,
              system: `Today is ${dateString}. Your training data is outdated - trust the search results.

Search results (CURRENT as of ${dateString}):
${toolResults.map(r => `${r.toolName}: ${r.output}`).join('\n\n')}

Instructions:
1. Keep your analysis BRIEF (2-3 sentences max in <think></think> tags)
2. Look for version numbers (format: v0.0.0 or 0.0.0)
3. Trust official sources (marked with ⭐) - especially GitHub releases
4. Provide a clear, direct answer with the version number

Don't overthink. Don't question the dates. Just extract the version and answer.

Use markdown formatting.`,
              messages: continuationMessages,
              temperature: 0.7, // Lower temperature for more focused responses
            });
            
            // Stream the continuation - reasoning continues from first stream
            let continuationBuffer = '';
            let inContinuationReasoningTag = true; // ASSUME reasoning tag is still open from first stream
            let continuationReasoningBuffer = '';
            let continuationTagName = 'think'; // Assume it was a <think> tag
            let continuationReasoningPhase = true; // Start in reasoning phase
            let hasSeenContinuationTag = false;
            
            for await (const chunk of continueResult.fullStream) {
              if (chunk.type === 'text-delta') {
                continuationBuffer += chunk.text;
                
                // Process for reasoning tags in continuation
                while (continuationBuffer.length > 0) {
                  if (!inContinuationReasoningTag) {
                    const openMatch = continuationBuffer.match(/<(think|thinking|reasoning)>/i);
                    
                    if (openMatch) {
                      hasSeenContinuationTag = true;
                      const beforeTag = continuationBuffer.substring(0, openMatch.index);
                      if (beforeTag) {
                        // Text before tag - if still in reasoning phase, send as reasoning
                        const type = continuationReasoningPhase ? 'reasoning' : 'text';
                        const data = `data: ${JSON.stringify({ type, content: beforeTag })}\n\n`;
                        controller.enqueue(encoder.encode(data));
                      }
                      
                      inContinuationReasoningTag = true;
                      continuationTagName = openMatch[1];
                      continuationBuffer = continuationBuffer.substring(openMatch.index! + openMatch[0].length);
                      continuationReasoningBuffer = '';
                    } else {
                      // Check for partial tag
                      const possiblePartialTag = continuationBuffer.match(/<(t(h(i(n(k(i(n(g)?)?)?)?)?)?)?|r(e(a(s(o(n(i(n(g)?)?)?)?)?)?)?)?)?$/i);
                      
                      if (possiblePartialTag) {
                        const safeText = continuationBuffer.substring(0, possiblePartialTag.index);
                        if (safeText) {
                          // If no tag seen yet, treat as reasoning continuation
                          const type = (!hasSeenContinuationTag && continuationReasoningPhase) ? 'reasoning' : 'text';
                          const data = `data: ${JSON.stringify({ type, content: safeText })}\n\n`;
                          controller.enqueue(encoder.encode(data));
                        }
                        continuationBuffer = continuationBuffer.substring(possiblePartialTag.index!);
                        break;
                      } else {
                        // All is text or reasoning
                        const type = (!hasSeenContinuationTag && continuationReasoningPhase) ? 'reasoning' : 'text';
                        const data = `data: ${JSON.stringify({ type, content: continuationBuffer })}\n\n`;
                        controller.enqueue(encoder.encode(data));
                        continuationBuffer = '';
                        break;
                      }
                    }
                  } else {
                    // Inside reasoning tag
                    const closePattern = new RegExp(`</${continuationTagName}>`, 'i');
                    const closeMatch = continuationBuffer.match(closePattern);
                    
                    if (closeMatch) {
                      console.log('[BACKEND] Found closing tag in continuation:', closeMatch[0]);
                      const reasoningContent = continuationBuffer.substring(0, closeMatch.index);
                      continuationReasoningBuffer += reasoningContent;
                      
                      if (continuationReasoningBuffer) {
                        // Send as reasoning (continues the reasoning block)
                        console.log('[BACKEND] Sending continuation reasoning:', continuationReasoningBuffer.substring(0, 50));
                        const data = `data: ${JSON.stringify({ type: 'reasoning', content: '\n\n' + continuationReasoningBuffer })}\n\n`;
                        controller.enqueue(encoder.encode(data));
                      }
                      
                      inContinuationReasoningTag = false;
                      continuationReasoningPhase = false; // After closing tag, switch to text mode
                      continuationBuffer = continuationBuffer.substring(closeMatch.index! + closeMatch[0].length);
                      continuationReasoningBuffer = '';
                      continuationTagName = '';
                      console.log('[BACKEND] Switched to text mode after closing tag');
                    } else {
                      // Check for partial closing tag
                      const possiblePartialClose = continuationBuffer.match(new RegExp(`<(/${continuationTagName.substring(0, Math.min(continuationBuffer.length, continuationTagName.length))})?$`, 'i'));
                      
                      if (possiblePartialClose && possiblePartialClose.index! > 0) {
                        const reasoningContent = continuationBuffer.substring(0, possiblePartialClose.index);
                        continuationReasoningBuffer += reasoningContent;
                        
                        if (reasoningContent) {
                          const data = `data: ${JSON.stringify({ type: 'reasoning', content: reasoningContent })}\n\n`;
                          controller.enqueue(encoder.encode(data));
                        }
                        
                        continuationBuffer = continuationBuffer.substring(possiblePartialClose.index!);
                        break;
                      } else {
                        // All is reasoning
                        continuationReasoningBuffer += continuationBuffer;
                        const data = `data: ${JSON.stringify({ type: 'reasoning', content: continuationBuffer })}\n\n`;
                        controller.enqueue(encoder.encode(data));
                        continuationBuffer = '';
                        break;
                      }
                    }
                  }
                }
              } else if (chunk.type === 'finish') {
                console.log('[BACKEND] Continuation stream finished');
              }
            }
            
            // Flush continuation buffer
            if (continuationBuffer) {
              if (inContinuationReasoningTag) {
                const data = `data: ${JSON.stringify({ type: 'reasoning', content: continuationBuffer })}\n\n`;
                controller.enqueue(encoder.encode(data));
              } else {
                // If no tag was seen, treat remaining as reasoning, otherwise as text
                const type = (!hasSeenContinuationTag && continuationReasoningPhase) ? 'reasoning' : 'text';
                const data = `data: ${JSON.stringify({ type, content: continuationBuffer })}\n\n`;
                controller.enqueue(encoder.encode(data));
              }
            }
            
            // Mark reasoning as complete after continuation
            const completeData = `data: ${JSON.stringify({ type: 'reasoning_complete' })}\n\n`;
            controller.enqueue(encoder.encode(completeData));
          } else if (inReasoningTag || reasoningPhase) {
            // No tools used, mark reasoning complete
            const completeData = `data: ${JSON.stringify({ type: 'reasoning_complete' })}\n\n`;
            controller.enqueue(encoder.encode(completeData));
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
