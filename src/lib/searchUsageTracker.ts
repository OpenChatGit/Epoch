/**
 * Client-side utility for tracking Serper API usage
 */

export interface ApiUsageStats {
  totalSearches: number;
  totalImageSearches: number;
  estimatedCost: number;
  lastUsed?: string;
}

const STORAGE_KEY = 'serper_usage_stats';
// Serper API pricing: ~$5 per 1000 searches = $0.005 per search
const COST_PER_SEARCH = 0.005;

export function getUsageStats(): ApiUsageStats {
  if (typeof window === 'undefined') {
    return {
      totalSearches: 0,
      totalImageSearches: 0,
      estimatedCost: 0,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse usage stats:', e);
  }

  return {
    totalSearches: 0,
    totalImageSearches: 0,
    estimatedCost: 0,
  };
}

export function saveUsageStats(stats: ApiUsageStats): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save usage stats:', e);
  }
}

export function trackWebSearch(): void {
  const stats = getUsageStats();
  stats.totalSearches += 1;
  stats.estimatedCost = (stats.totalSearches + stats.totalImageSearches) * COST_PER_SEARCH;
  stats.lastUsed = new Date().toISOString();
  saveUsageStats(stats);
}

export function trackImageSearch(): void {
  const stats = getUsageStats();
  stats.totalImageSearches += 1;
  stats.estimatedCost = (stats.totalSearches + stats.totalImageSearches) * COST_PER_SEARCH;
  stats.lastUsed = new Date().toISOString();
  saveUsageStats(stats);
}

export function resetUsageStats(): void {
  const newStats: ApiUsageStats = {
    totalSearches: 0,
    totalImageSearches: 0,
    estimatedCost: 0,
  };
  saveUsageStats(newStats);
}
