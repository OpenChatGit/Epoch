'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, EyeOff, ExternalLink, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { getUsageStats, resetUsageStats as resetStats, ApiUsageStats } from '@/lib/searchUsageTracker';
import { invoke } from '@tauri-apps/api/core';

interface SerperUsageResult {
  success: boolean;
  credits_used: number;
  credits_remaining: number;
  credits_limit: number;
  plan: string;
  error?: string;
  raw_response?: string;
}

interface WebSearchSettingsProps {
  serperApiKey?: string;
  webSearchEnabled?: boolean;
  onSerperApiKeyChange: (key: string) => void;
  onWebSearchEnabledChange: (enabled: boolean) => void;
}

export function WebSearchSettings({
  serperApiKey,
  webSearchEnabled,
  onSerperApiKeyChange,
  onWebSearchEnabledChange,
}: WebSearchSettingsProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<'success' | 'error' | null>(null);
  const [usageStats, setUsageStats] = useState<ApiUsageStats>(getUsageStats());
  const [serperUsage, setSerperUsage] = useState<SerperUsageResult | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);

  // Load usage stats from localStorage and refresh periodically
  useEffect(() => {
    setUsageStats(getUsageStats());
    
    // Refresh stats every 2 seconds to show real-time updates
    const interval = setInterval(() => {
      setUsageStats(getUsageStats());
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch Serper usage when API key is available
  useEffect(() => {
    if (serperApiKey) {
      fetchSerperUsage();
    }
  }, [serperApiKey]);

  const testApiKey = async () => {
    if (!serperApiKey) {
      setApiTestResult('error');
      return;
    }

    setIsTestingApi(true);
    setApiTestResult(null);

    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': serperApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: 'test' }),
      });

      if (response.ok) {
        setApiTestResult('success');
        // Also fetch usage after successful test
        fetchSerperUsage();
      } else {
        setApiTestResult('error');
      }
    } catch (error) {
      setApiTestResult('error');
    } finally {
      setIsTestingApi(false);
    }
  };

  const fetchSerperUsage = async () => {
    if (!serperApiKey) {
      return;
    }

    setIsLoadingUsage(true);
    try {
      const result = await invoke<SerperUsageResult>('get_serper_usage', {
        apiKey: serperApiKey,
      });
      
      // Log raw response for debugging
      if (result.raw_response) {
        console.log('Serper API raw response:', result.raw_response);
      }
      
      setSerperUsage(result);
    } catch (error) {
      console.error('Failed to fetch Serper usage:', error);
      setSerperUsage(null);
    } finally {
      setIsLoadingUsage(false);
    }
  };

  const handleResetUsageStats = () => {
    resetStats();
    setUsageStats(getUsageStats());
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Web Search Settings
        </h3>
        
        {/* Enable/Disable Toggle */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-gray-600" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Enable Web Search
                </h4>
                <p className="text-xs text-gray-500">
                  Allow AI to search the web for real-time information
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={webSearchEnabled}
                onChange={(e) => onWebSearchEnabledChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
            </label>
          </div>
        </div>

        {/* Serper API Key */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Serper API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={serperApiKey || ''}
                onChange={(e) => onSerperApiKeyChange(e.target.value)}
                placeholder="Enter your Serper API key"
                className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                Get your API key from{' '}
                <a
                  href="https://serper.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:text-pink-700 inline-flex items-center gap-1"
                >
                  serper.dev
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
              {serperApiKey && (
                <button
                  onClick={testApiKey}
                  disabled={isTestingApi}
                  className="text-xs text-pink-600 hover:text-pink-700 font-medium disabled:opacity-50"
                >
                  {isTestingApi ? 'Testing...' : 'Test API Key'}
                </button>
              )}
            </div>
            
            {/* API Test Result */}
            {apiTestResult && (
              <div className={`mt-2 p-2 rounded-lg flex items-center gap-2 text-xs ${
                apiTestResult === 'success' 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {apiTestResult === 'success' ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    API key is valid and working!
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    API key is invalid or there was an error
                  </>
                )}
              </div>
            )}
          </div>

          {/* Serper Account Info */}
          {serperApiKey && serperUsage && serperUsage.success && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-green-900">
                  Serper Account Status
                </h4>
                <button
                  onClick={fetchSerperUsage}
                  disabled={isLoadingUsage}
                  className="text-xs text-green-700 hover:text-green-800 flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${isLoadingUsage ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              
              {serperUsage.credits_limit > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-green-600 mb-1">Plan</p>
                      <p className="text-sm font-semibold text-green-900 capitalize">
                        {serperUsage.plan}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-green-600 mb-1">Credits Remaining</p>
                      <p className="text-sm font-semibold text-green-900">
                        {serperUsage.credits_remaining.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-green-600 mb-1">Credits Used</p>
                      <p className="text-sm font-semibold text-green-900">
                        {serperUsage.credits_used.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-green-600 mb-1">Total Limit</p>
                      <p className="text-sm font-semibold text-green-900">
                        {serperUsage.credits_limit.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="bg-white/60 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-500"
                      style={{
                        width: `${(serperUsage.credits_used / serperUsage.credits_limit) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-green-700 mt-2 text-center">
                    {((serperUsage.credits_used / serperUsage.credits_limit) * 100).toFixed(1)}% used
                  </p>
                </>
              ) : (
                <div className="bg-white/60 rounded-lg p-4 text-center">
                  <p className="text-sm text-green-700">
                    API key is valid, but usage data is not available from Serper.
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    This might be normal for new accounts or certain plan types.
                  </p>
                  {serperUsage.raw_response && (
                    <details className="mt-3 text-left">
                      <summary className="text-xs text-green-600 cursor-pointer hover:text-green-700">
                        Show raw API response
                      </summary>
                      <pre className="text-xs bg-white/80 p-2 rounded mt-2 overflow-auto max-h-32">
                        {serperUsage.raw_response}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Error Display */}
          {serperApiKey && serperUsage && !serperUsage.success && serperUsage.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-900 mb-1">
                    Failed to fetch account status
                  </h4>
                  <p className="text-xs text-red-700">
                    {serperUsage.error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* API Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              About Serper API
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Free tier: 2,500 searches per month</li>
              <li>• Paid plans start at $50/month for 10,000 searches</li>
              <li>• Supports web search, image search, and more</li>
              <li>• Real-time Google search results</li>
            </ul>
          </div>

          {/* Usage Statistics */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">
                API Usage Statistics
              </h4>
              <button
                onClick={handleResetUsageStats}
                className="text-xs text-gray-600 hover:text-gray-700"
              >
                Reset
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Web Searches</p>
                <p className="text-lg font-semibold text-gray-900">
                  {usageStats.totalSearches}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Image Searches</p>
                <p className="text-lg font-semibold text-gray-900">
                  {usageStats.totalImageSearches}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Requests</p>
                <p className="text-lg font-semibold text-gray-900">
                  {usageStats.totalSearches + usageStats.totalImageSearches}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Est. Cost</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${usageStats.estimatedCost.toFixed(2)}
                </p>
              </div>
            </div>
            
            {usageStats.lastUsed && (
              <p className="text-xs text-gray-500 mt-3">
                Last used: {new Date(usageStats.lastUsed).toLocaleString()}
              </p>
            )}
            
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Cost calculation: $0.005 per search (based on Serper pricing)
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-gradient-to-br from-pink-50 to-yellow-50 border border-pink-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              How Web Search Works
            </h4>
            <ul className="text-xs text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-pink-500 font-bold">1.</span>
                <span>When you ask a question, the AI determines if web search is needed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-500 font-bold">2.</span>
                <span>Serper API fetches real-time results from Google</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-500 font-bold">3.</span>
                <span>The AI analyzes the results and generates a response</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-500 font-bold">4.</span>
                <span>Images are automatically fetched when relevant</span>
              </li>
            </ul>
          </div>

          {/* Warning */}
          {webSearchEnabled && !serperApiKey && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-900 mb-1">
                    API Key Required
                  </h4>
                  <p className="text-xs text-yellow-700">
                    Web search is enabled but no API key is configured. Please add your Serper API key above to use web search features.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
