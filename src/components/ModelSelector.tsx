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

interface Model {
  name: string;
  size: number;
  modified_at: string;
}

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        // Fetch directly from Ollama
        const response = await fetch('http://localhost:11434/api/tags');
        const data = await response.json();
        const modelList = data.models || [];
        setModels(modelList);
        
        // Set first model as default if no value
        if (!value && modelList.length > 0) {
          onChange(modelList[0].name);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
        setModels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  if (loading) {
    return (
      <div className="text-xs text-gray-400 px-3 py-2 h-9 flex items-center">
        Loading...
      </div>
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
