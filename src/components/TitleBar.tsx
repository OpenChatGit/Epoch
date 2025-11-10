'use client';

import { useEffect, useState } from 'react';
import { Minus, Square, X, MessageSquare, Settings, Search } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { ChatTabsDropdown } from './ChatTabsDropdown';
import { SettingsModal } from './SettingsModal';
import { getUsageStats, ApiUsageStats } from '@/lib/searchUsageTracker';

interface TitleBarProps {
  tabs: Array<{ id: string; title: string }>;
  activeTabId: string;
  onTabSelect: (tabId: string) => void;
  onNewTab: () => void;
  onDeleteTab: (tabId: string) => void;
}

export function TitleBar({ tabs, activeTabId, onTabSelect, onNewTab, onDeleteTab }: TitleBarProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isTauri, setIsTauri] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [usageStats, setUsageStats] = useState<ApiUsageStats>(getUsageStats());

  useEffect(() => {
    const checkTauri = async () => {
      try {
        const maximized = await invoke<boolean>('is_maximized');
        setIsTauri(true);
        setIsMaximized(maximized);
      } catch {
        setIsTauri(false);
      }
    };
    
    checkTauri();
  }, []);

  // Update usage stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setUsageStats(getUsageStats());
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const handleMinimize = async () => {
    try {
      await invoke('minimize_window');
    } catch (err) {
      console.error('Error minimizing:', err);
    }
  };

  const handleMaximize = async () => {
    try {
      if (isMaximized) {
        await invoke('unmaximize_window');
        setIsMaximized(false);
      } else {
        await invoke('maximize_window');
        setIsMaximized(true);
      }
    } catch (err) {
      console.error('Error maximizing:', err);
    }
  };

  const handleClose = async () => {
    try {
      await invoke('close_window');
    } catch (err) {
      console.error('Error closing:', err);
    }
  };

  return (
    <div
      data-tauri-drag-region
      className="h-10 bg-background flex items-center justify-between pl-4 pr-2 select-none shrink-0 relative"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      {/* App Name and Usage Stats */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-foreground/70 pointer-events-none">
          Epoch {isTauri && '(Tauri)'}
        </span>
        
        {/* Serper API Usage Indicator */}
        {(usageStats.totalSearches > 0 || usageStats.totalImageSearches > 0) && (
          <div className="flex items-center gap-2 text-xs text-foreground/50 pointer-events-none">
            <Search className="h-3.5 w-3.5" />
            <span>
              {usageStats.totalSearches + usageStats.totalImageSearches} searches
            </span>
            <span className="text-foreground/30">•</span>
            <span className="text-pink-600">
              ${usageStats.estimatedCost.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Window Controls */}
      <div className="flex items-center gap-1 pointer-events-auto" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="h-7 w-7 flex items-center justify-center hover:bg-black/5 rounded transition-colors pointer-events-auto cursor-pointer"
          aria-label="Chat History"
          type="button"
        >
          <MessageSquare className="h-4 w-4 text-foreground/60 pointer-events-none" />
        </button>
        
        <ChatTabsDropdown
          isOpen={isDropdownOpen}
          onClose={() => setIsDropdownOpen(false)}
          tabs={tabs}
          activeTabId={activeTabId}
          onTabSelect={onTabSelect}
          onNewTab={onNewTab}
          onDeleteTab={onDeleteTab}
        />

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="h-7 w-7 flex items-center justify-center hover:bg-black/5 rounded transition-colors pointer-events-auto cursor-pointer"
          aria-label="Settings"
          type="button"
        >
          <Settings className="h-4 w-4 text-foreground/60 pointer-events-none" />
        </button>

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />

        {/* Divider */}
        <div className="h-5 w-px bg-border/50 mx-1"></div>

        <button
          onClick={handleMinimize}
          className="h-7 w-7 flex items-center justify-center hover:bg-black/5 rounded transition-colors pointer-events-auto cursor-pointer"
          aria-label="Minimize"
          type="button"
        >
          <Minus className="h-4 w-4 text-foreground/60 pointer-events-none" />
        </button>
        <button
          onClick={handleMaximize}
          className="h-7 w-7 flex items-center justify-center hover:bg-black/5 rounded transition-colors pointer-events-auto cursor-pointer"
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
          type="button"
        >
          <Square className="h-3.5 w-3.5 text-foreground/60 pointer-events-none" />
        </button>
        <button
          onClick={handleClose}
          className="h-7 w-7 flex items-center justify-center hover:bg-red-500 hover:text-white rounded transition-colors pointer-events-auto cursor-pointer"
          aria-label="Close"
          type="button"
        >
          <X className="h-4 w-4 pointer-events-none" />
        </button>
      </div>
    </div>
  );
}
