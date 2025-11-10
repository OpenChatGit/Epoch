"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ReasoningIndicatorProps {
  reasoning: string;
  isComplete: boolean;
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
        <div className="mt-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
          {reasoning || (
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
