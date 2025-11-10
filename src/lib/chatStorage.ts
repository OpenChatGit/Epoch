/**
 * Chat Storage - Persists chat tabs and messages to localStorage
 */

import { ResponseRoot } from '@/components/llm-components';

export interface Message {
  role: 'user' | 'assistant';
  content: string | ResponseRoot;
  reasoning?: string; // Optional reasoning for assistant messages
}

export interface ChatTab {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'epoch_chat_tabs';
const ACTIVE_TAB_KEY = 'epoch_active_tab';

/**
 * Load all chat tabs from localStorage
 */
export function loadChatTabs(): ChatTab[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const tabs = JSON.parse(stored);
      return tabs;
    }
  } catch (e) {
    console.error('Failed to load chat tabs:', e);
  }

  return [];
}

/**
 * Save all chat tabs to localStorage
 */
export function saveChatTabs(tabs: ChatTab[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
  } catch (e) {
    console.error('Failed to save chat tabs:', e);
  }
}

/**
 * Load active tab ID from localStorage
 */
export function loadActiveTabId(): string {
  if (typeof window === 'undefined') return '';

  try {
    const stored = localStorage.getItem(ACTIVE_TAB_KEY);
    return stored || '';
  } catch (e) {
    console.error('Failed to load active tab ID:', e);
    return '';
  }
}

/**
 * Save active tab ID to localStorage
 */
export function saveActiveTabId(tabId: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(ACTIVE_TAB_KEY, tabId);
  } catch (e) {
    console.error('Failed to save active tab ID:', e);
  }
}

/**
 * Create a new chat tab
 */
export function createNewTab(): ChatTab {
  const now = new Date().toISOString();
  return {
    id: Date.now().toString(),
    title: 'New Chat',
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Update a specific tab
 */
export function updateTab(tabs: ChatTab[], tabId: string, updates: Partial<ChatTab>): ChatTab[] {
  return tabs.map((tab) =>
    tab.id === tabId
      ? { ...tab, ...updates, updatedAt: new Date().toISOString() }
      : tab
  );
}

/**
 * Delete a specific tab
 */
export function deleteTab(tabs: ChatTab[], tabId: string): ChatTab[] {
  return tabs.filter((tab) => tab.id !== tabId);
}

/**
 * Generate a smart title from the first message
 */
export function generateTabTitle(firstMessage: string): string {
  // Take first 50 characters or until first newline
  const title = firstMessage.split('\n')[0].slice(0, 50);
  return title.length < firstMessage.length ? `${title}...` : title;
}

/**
 * Clear all chat tabs (with confirmation)
 */
export function clearAllTabs(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_TAB_KEY);
  } catch (e) {
    console.error('Failed to clear chat tabs:', e);
  }
}

/**
 * Export chat tabs as JSON
 */
export function exportChatTabs(tabs: ChatTab[]): string {
  return JSON.stringify(tabs, null, 2);
}

/**
 * Import chat tabs from JSON
 */
export function importChatTabs(jsonString: string): ChatTab[] {
  try {
    const tabs = JSON.parse(jsonString);
    if (Array.isArray(tabs)) {
      return tabs;
    }
  } catch (e) {
    console.error('Failed to import chat tabs:', e);
  }
  return [];
}

/**
 * Get storage usage info
 */
export function getStorageInfo(): {
  used: number;
  total: number;
  percentage: number;
} {
  if (typeof window === 'undefined') {
    return { used: 0, total: 0, percentage: 0 };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY) || '';
    const used = new Blob([stored]).size;
    const total = 5 * 1024 * 1024; // 5MB typical localStorage limit
    const percentage = (used / total) * 100;

    return { used, total, percentage };
  } catch (e) {
    console.error('Failed to get storage info:', e);
    return { used: 0, total: 0, percentage: 0 };
  }
}
