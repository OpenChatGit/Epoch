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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [usageStats, setUsageStats] = useState<ApiUsageStats | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUsageStats(getUsageStats());
  }, []);

  useEffect(() => {
    const checkTauri = async () => {
      try {
        const maximized = await invoke<boolean>('is_maximized');
        setIsMaximized(maximized);
      } catch {
        // Not in Tauri environment
      }
    };
    
    checkTauri();
  }, []);

  // Update usage stats periodically
  useEffect(() => {
    if (!mounted) return;
    
    const interval = setInterval(() => {
      setUsageStats(getUsageStats());
    }, 2000);
    
    return () => clearInterval(interval);
  }, [mounted]);

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
        <div className="flex items-center gap-2 pointer-events-none">
          <svg className="h-5 w-5" viewBox="0 0 427 427" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="213.5" cy="213.5" r="213.5" fill="#2443DD"/>
            <circle cx="213.5" cy="213.5" r="213.5" fill="url(#paint0_linear)" fillOpacity="0.97"/>
            <path d="M170.172 247.191C179.248 244.523 188.107 241.466 196.749 238.019C205.392 234.572 213.81 230.569 222.004 226.01C230.588 221.233 238.088 216.039 244.504 210.428C250.978 204.614 255.833 198.339 259.069 191.604C262.362 184.666 263.799 177.145 263.378 169.041C262.957 160.937 260.107 152.142 254.829 142.657C250.564 134.99 245.619 128.552 239.996 123.343C234.372 118.134 228.214 114.413 221.521 112.18C214.959 109.876 208 109.153 200.643 110.013C193.214 110.743 185.533 113.316 177.599 117.73C170.185 121.855 164.246 126.946 159.781 133.004C155.447 138.989 152.305 145.587 150.355 152.797C148.464 159.806 147.591 167.268 147.737 175.185C148.014 183.029 148.955 190.843 150.561 198.628C152.168 206.413 154.395 213.937 157.244 221.201C160.093 228.464 163.181 235.085 166.506 241.062C167.085 242.102 167.663 243.141 168.242 244.181C168.82 245.22 169.463 246.224 170.172 247.191ZM307.96 112.33C313.093 121.556 316.189 130.639 317.246 139.58C318.231 148.391 317.64 156.973 315.474 165.325C313.438 173.605 310.087 181.511 305.42 189.042C300.754 196.573 295.27 203.708 288.97 210.447C282.598 217.055 275.604 223.159 267.988 228.757C260.503 234.284 252.923 239.182 245.249 243.451C235.494 248.879 225.508 253.584 215.291 257.567C205.001 261.421 194.407 264.422 183.51 266.571C189.712 274.351 196.543 281.271 204.002 287.331C211.39 293.261 219.311 297.702 227.767 300.655C236.151 303.478 245.054 304.48 254.478 303.661C264.031 302.77 274.01 299.43 284.416 293.641C291.309 289.805 297.299 285.111 302.385 279.559C307.471 274.006 311.567 267.898 314.673 261.235C317.779 254.572 319.837 247.556 320.847 240.188C321.987 232.747 322.021 225.155 320.95 217.413L355.29 212.09C356.71 224.744 355.744 236.937 352.394 248.671C349.101 260.203 344.081 271.079 337.334 281.299C330.644 291.318 322.618 300.463 313.254 308.736C304.02 316.937 294.201 323.932 283.795 329.721C266.627 339.273 249.169 345.243 231.421 347.63C213.6 349.888 196.53 348.75 180.211 344.216C163.892 339.682 148.729 331.868 134.721 320.773C120.713 309.679 108.937 295.555 99.3937 278.403C89.8503 261.25 84.0576 243.798 82.0154 226.046C79.9732 208.293 81.3278 191.289 86.0791 175.032C90.8303 158.775 98.899 143.735 110.285 129.913C121.599 115.96 135.84 104.208 153.008 94.6556C161.332 90.0242 170.177 85.869 179.542 82.1899C188.907 78.5109 198.409 75.6913 208.049 73.7311C217.617 71.641 227.163 70.5838 236.688 70.5595C246.212 70.5352 255.304 72.0282 263.962 75.0386C272.678 77.8466 280.766 82.2805 288.226 88.3403C295.815 94.3276 302.393 102.324 307.96 112.33Z" fill="url(#paint1_linear)"/>
            <defs>
              <linearGradient id="paint0_linear" x1="-6.5" y1="-18" x2="372.5" y2="414.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#EF5454" stopOpacity="0.88"/>
                <stop offset="0.999343" stopColor="#32228B"/>
              </linearGradient>
              <linearGradient id="paint1_linear" x1="35.1849" y1="119.498" x2="404.011" y2="280.189" gradientUnits="userSpaceOnUse">
                <stop stopColor="white"/>
                <stop offset="1" stopColor="#F9F9F9"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="text-sm font-medium text-foreground/70">
            Epoch
          </span>
        </div>
        
        {/* Serper API Usage Indicator */}
        {mounted && usageStats && (usageStats.totalSearches > 0 || usageStats.totalImageSearches > 0) && (
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
