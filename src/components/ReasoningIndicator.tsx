"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Search, Image as ImageIcon, Github } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface ReasoningIndicatorProps {
  reasoning: string;
  isComplete: boolean;
}

interface ToolCall {
  type: 'search' | 'searchImage' | 'github';
  title: string;
  details: string[];
}

function parseReasoningWithTools(reasoning: string): (string | ToolCall)[] {
  const parts: (string | ToolCall)[] = [];
  const lines = reasoning.split('\n');
  let currentText = '';
  let currentTool: ToolCall | null = null;
  let inToolContext = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check for tool start patterns
    if (trimmedLine.includes('Using search tool') || trimmedLine.includes('Using getGitHubRelease tool') || trimmedLine.includes('Using searchImage tool')) {
      if (currentText) {
        parts.push(currentText);
        currentText = '';
      }
      if (currentTool) {
        parts.push(currentTool);
      }
      
      let type: 'search' | 'searchImage' | 'github' = 'search';
      let title = 'Web Search';
      
      if (trimmedLine.includes('searchImage')) {
        type = 'searchImage';
        title = 'Image Search';
      } else if (trimmedLine.includes('getGitHubRelease')) {
        type = 'github';
        title = 'GitHub Release';
      }
      
      currentTool = { type, title, details: [trimmedLine] };
      inToolContext = true;
    } else if (trimmedLine.includes('Retrieved results from') || trimmedLine.includes('Retrieved:')) {
      // Add to current tool if exists
      if (currentTool) {
        currentTool.details.push(trimmedLine);
        inToolContext = true;
      } else {
        // Create a new tool for orphaned results
        if (currentText) {
          parts.push(currentText);
          currentText = '';
        }
        currentTool = { type: 'search', title: 'Search Results', details: [trimmedLine] };
        inToolContext = true;
      }
    } else if (inToolContext && currentTool && trimmedLine) {
      // While in tool context, capture related lines
      // Lines starting with "From", "-", "•", or containing "URL:", "Published:", etc.
      if (
        trimmedLine.startsWith('From') ||
        trimmedLine.startsWith('-') ||
        trimmedLine.startsWith('•') ||
        trimmedLine.startsWith('*') ||
        trimmedLine.includes('URL:') ||
        trimmedLine.includes('Published:') ||
        trimmedLine.includes('Version:') ||
        trimmedLine.includes('Latest release:') ||
        trimmedLine.includes('Release notes:') ||
        trimmedLine.match(/^(The latest|Source \d+|Direct Answer|About|Details|Info)/)
      ) {
        currentTool.details.push(trimmedLine);
      } else {
        // End of tool context - this is new reasoning
        parts.push(currentTool);
        currentTool = null;
        inToolContext = false;
        currentText += (currentText ? '\n' : '') + line;
      }
    } else {
      if (currentTool && !trimmedLine) {
        // Empty line - keep tool open for now
        currentTool.details.push('');
      } else if (currentTool && trimmedLine) {
        // Non-empty line while tool is active but not in context
        parts.push(currentTool);
        currentTool = null;
        inToolContext = false;
        currentText += (currentText ? '\n' : '') + line;
      } else {
        currentText += (currentText ? '\n' : '') + line;
      }
    }
  }
  
  if (currentTool) {
    parts.push(currentTool);
  }
  if (currentText) {
    parts.push(currentText);
  }
  
  return parts;
}

function ToolCallBox({ tool }: { tool: ToolCall }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getIcon = () => {
    switch (tool.type) {
      case 'search':
        return <Search className="h-4 w-4" />;
      case 'searchImage':
        return <ImageIcon className="h-4 w-4" />;
      case 'github':
        return <Github className="h-4 w-4" />;
    }
  };
  
  const getColor = () => {
    switch (tool.type) {
      case 'search':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          hover: 'hover:bg-blue-100'
        };
      case 'searchImage':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-700',
          hover: 'hover:bg-purple-100'
        };
      case 'github':
        return {
          bg: 'bg-gray-800',
          border: 'border-gray-700',
          text: 'text-white',
          hover: 'hover:bg-gray-700'
        };
    }
  };
  
  const colors = getColor();
  
  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg my-2 overflow-hidden`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-3 py-2 ${colors.text} text-xs font-medium w-full ${colors.hover} transition-colors`}
      >
        {getIcon()}
        <span className="flex-1 text-left">{tool.title}</span>
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      
      {isExpanded && tool.details.length > 0 && (
        <div className={`px-3 py-2 ${colors.text} text-xs border-t ${colors.border}`}>
          {tool.details.map((detail, idx) => {
            const trimmedDetail = detail.trim();
            if (!trimmedDetail) return null;
            
            return (
              <div key={idx} className="leading-snug mb-1 last:mb-0">
                <MarkdownRenderer content={trimmedDetail} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ReasoningIndicator({ reasoning, isComplete }: ReasoningIndicatorProps) {
  // Start expanded while thinking, collapse when complete
  const [isExpanded, setIsExpanded] = useState(true);

  // Auto-collapse when reasoning is complete
  useEffect(() => {
    if (isComplete) {
      setIsExpanded(false);
    }
  }, [isComplete]);

  // Show indicator even without reasoning text if not complete yet
  if (!reasoning && isComplete) return null;

  const parts = parseReasoningWithTools(reasoning);

  return (
    <div className="mb-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm text-gray-600 w-full"
      >
        {!isComplete && (
          <div className="animate-spin h-3 w-3 border border-gray-400 border-t-gray-600 rounded-full" />
        )}
        <span className="font-medium flex-1 text-left">
          {isComplete ? "Thought process" : "Thinking..."}
        </span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      
      {isExpanded && (
        <div className="mt-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600 leading-snug space-y-2">
          {parts.length > 0 ? (
            parts.map((part, index) => {
              if (typeof part === 'string') {
                // Remove excessive whitespace and empty lines
                const cleanedText = part
                  .split('\n')
                  .map(line => line.trim())
                  .filter(line => line.length > 0)
                  .join('\n');
                
                if (!cleanedText) return null;
                
                return (
                  <div key={index}>
                    <MarkdownRenderer content={cleanedText} />
                  </div>
                );
              } else {
                return <ToolCallBox key={index} tool={part} />;
              }
            })
          ) : (
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <div className="animate-spin h-3 w-3 border border-gray-300 border-t-gray-500 rounded-full" />
              <span>Waiting for reasoning...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
