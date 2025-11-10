'use client';

import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface ChatTab {
  id: string;
  title: string;
}

interface ChatTabsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: ChatTab[];
  activeTabId: string;
  onTabSelect: (tabId: string) => void;
  onNewTab: () => void;
  onDeleteTab: (tabId: string) => void;
}

export function ChatTabsDropdown({
  isOpen,
  onClose,
  tabs,
  activeTabId,
  onTabSelect,
  onNewTab,
  onDeleteTab,
}: ChatTabsDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-10 right-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
      style={{ WebkitAppRegion: 'no-drag' } as any}
    >
      {/* New Tab Button */}
      <button
        onClick={() => {
          onNewTab();
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
      >
        <div className="h-8 w-8 flex items-center justify-center bg-gradient-to-br from-pink-500 to-yellow-500 rounded-lg">
          <Plus className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-medium text-gray-700">New Chat</span>
      </button>

      {/* Tabs List */}
      <div className="max-h-80 overflow-y-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group ${
              activeTabId === tab.id ? 'bg-gray-50' : ''
            }`}
          >
            <button
              onClick={() => {
                onTabSelect(tab.id);
                onClose();
              }}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <MessageSquare className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-700 truncate text-left">
                {tab.title}
              </span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTab(tab.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
              aria-label="Delete chat"
            >
              <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
