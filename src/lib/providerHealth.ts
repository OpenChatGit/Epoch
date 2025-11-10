import { fetch } from '@tauri-apps/plugin-http';

export interface ProviderStatus {
  ollama: boolean;
  openai: boolean;
}

export async function checkOllamaHealth(baseUrl: string = 'http://localhost:11434'): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
    
    const response = await fetch(`${baseUrl}/api/tags`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    return response.ok;
  } catch (error) {
    return false;
  }
}

export async function checkOpenAIHealth(apiKey: string): Promise<boolean> {
  if (!apiKey) return false;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    return response.ok;
  } catch (error) {
    return false;
  }
}

export async function checkProviderHealth(
  provider: 'ollama' | 'openai',
  config: { ollamaBaseUrl?: string; openaiApiKey?: string }
): Promise<boolean> {
  if (provider === 'ollama') {
    return checkOllamaHealth(config.ollamaBaseUrl);
  } else {
    return checkOpenAIHealth(config.openaiApiKey || '');
  }
}
