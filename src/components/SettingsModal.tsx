'use client';

import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getProviderSettings, saveProviderSettings, ProviderSettings } from '@/lib/settingsStore';
import { WebSearchSettings } from './WebSearchSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'app' | 'provider' | 'websearch';

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('app');
  const [settings, setSettings] = useState<ProviderSettings>(getProviderSettings());

  useEffect(() => {
    if (isOpen) {
      setSettings(getProviderSettings());
    }
  }, [isOpen]);

  const handleSave = () => {
    saveProviderSettings(settings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close settings"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 border-r border-gray-200 bg-gray-50 p-3">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('app')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'app'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                App Settings
              </button>
              <button
                onClick={() => setActiveTab('provider')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'provider'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                Provider Settings
              </button>
              <button
                onClick={() => setActiveTab('websearch')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'websearch'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                Web Search
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'app' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-4">
                    App Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
                        <option>Light</option>
                        <option>Dark</option>
                        <option>System</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
                        <option>English</option>
                        <option>Deutsch</option>
                        <option>Español</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'provider' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-4">
                    Provider Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Provider
                      </label>
                      <select 
                        value={settings.provider}
                        onChange={(e) => setSettings({ ...settings, provider: e.target.value as 'openai' | 'ollama' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                      >
                        <option value="openai">OpenAI</option>
                        <option value="ollama">Ollama</option>
                      </select>
                    </div>
                    
                    {settings.provider === 'openai' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          OpenAI API Key
                        </label>
                        <input
                          type="password"
                          value={settings.openaiApiKey || ''}
                          onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                          placeholder="sk-..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Your API key is stored locally and never sent to our servers
                        </p>
                      </div>
                    )}

                    {settings.provider === 'ollama' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ollama Base URL
                        </label>
                        <input
                          type="text"
                          value={settings.ollamaBaseUrl || ''}
                          onChange={(e) => setSettings({ ...settings, ollamaBaseUrl: e.target.value })}
                          placeholder="http://localhost:11434/api"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Make sure Ollama is running locally
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'websearch' && (
              <WebSearchSettings
                serperApiKey={settings.serperApiKey}
                webSearchEnabled={settings.webSearchEnabled}
                onSerperApiKeyChange={(key) => setSettings({ ...settings, serperApiKey: key })}
                onWebSearchEnabledChange={(enabled) => setSettings({ ...settings, webSearchEnabled: enabled })}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-pink-500 to-yellow-500 rounded-lg hover:opacity-90 transition-opacity"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
