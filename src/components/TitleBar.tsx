'use client';

import { useEffect, useState } from 'react';
import { Minus, Square, X } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isTauri, setIsTauri] = useState(false);

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
      className="h-10 bg-background border-b border-border flex items-center justify-between px-4 select-none shrink-0"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      {/* App Name */}
      <span className="text-sm font-medium text-foreground/70 pointer-events-none">
        Epoch {isTauri && '(Tauri)'}
      </span>

      {/* Window Controls */}
      <div className="flex items-center gap-1 pointer-events-auto" style={{ WebkitAppRegion: 'no-drag' } as any}>
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
