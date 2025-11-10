'use client';

import { useEffect, useState } from 'react';
import { fetch } from '@tauri-apps/plugin-http';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getProviderSettings } from '@/lib/settingsStore';

interface Model {
  name: string;
  size?: number;
  modified_at?: string;
}

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onProviderError?: (provider: string, error: string) => void;
}

export function ModelSelector({ value, onChange, onProviderError }: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const fetchModels = async () => {
      try {
        const settings = getProviderSettings();
        
        if (settings.provider === 'ollama') {
          const baseUrl = settings.ollamaBaseUrl || 'http://localhost:11434/api';
          // Remove trailing /api if it exists to avoid duplication
          const cleanBaseUrl = baseUrl.replace(/\/api\/?$/, '');
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          const response = await fetch(`${cleanBaseUrl}/api/tags`, {
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error('Ollama not responding');
          }
          
          const data = await response.json();
          const modelList = data.models || [];
          setModels(modelList);
          
          if (!value && modelList.length > 0) {
            onChange(modelList[0].name);
          }
        } else if (settings.provider === 'openai') {
          // OpenAI models - static list
          const openaiModels = [
            { name: 'gpt-4o' },
            { name: 'gpt-4o-mini' },
            { name: 'gpt-4-turbo' },
            { name: 'gpt-3.5-turbo' },
          ];
          setModels(openaiModels);
          
          if (!value) {
            onChange('gpt-4o-mini');
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching models:', err);
        const settings = getProviderSettings();
        const providerName = settings.provider === 'openai' ? 'OpenAI' : 'Ollama';
        const errorMsg = `${providerName} not reachable`;
        setError(errorMsg);
        setModels([]);
        
        if (onProviderError) {
          onProviderError(providerName, errorMsg);
        }
      } finally {
        setLoading(false);
        setIsReconnecting(false);
      }
    };

  useEffect(() => {
    fetchModels();
  }, []);

  if (loading) {
    return (
      <div className="text-xs text-gray-400 px-3 py-2 h-9 flex items-center gap-1.5">
        <div className="animate-spin h-3 w-3 border border-gray-300 border-t-gray-600 rounded-full" />
        <span>Checking...</span>
      </div>
    );
  }

  if (error || isReconnecting) {
    const handleReconnect = async () => {
      setIsReconnecting(true);
      await fetchModels();
    };

    return (
      <button
        onClick={handleReconnect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isReconnecting}
        className="text-xs px-3 py-2 h-9 flex items-center gap-1.5 rounded-lg transition-all duration-200 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isReconnecting ? (
          <>
            <div className="animate-spin h-3 w-3 border border-gray-400 border-t-gray-600 rounded-full pointer-events-none" />
            <span className="text-gray-600 pointer-events-none">Connecting...</span>
          </>
        ) : (
          <span className={`transition-all duration-200 pointer-events-none ${isHovered ? 'text-red-700 font-medium' : 'text-red-600'}`}>
            {isHovered ? 'Reconnect' : 'Not connected'}
          </span>
        )}
      </button>
    );
  }

  if (models.length === 0) {
    return null;
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 text-xs border-0 bg-transparent hover:bg-gray-100 rounded-lg px-3 gap-2 text-gray-600 font-medium shadow-none">
        <SelectValue placeholder="Model" />
      </SelectTrigger>
      <SelectContent className="min-w-[200px]">
        {models.map((model) => (
          <SelectItem key={model.name} value={model.name} className="text-xs">
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
