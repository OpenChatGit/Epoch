export interface ProviderSettings {
  provider: 'openai' | 'ollama';
  openaiApiKey?: string;
  ollamaBaseUrl?: string;
  serperApiKey?: string;
  webSearchEnabled?: boolean;
}

const SETTINGS_KEY = 'epoch_provider_settings';

export const defaultSettings: ProviderSettings = {
  provider: 'ollama',
  ollamaBaseUrl: 'http://localhost:11434/api',
  webSearchEnabled: false,
};

export function getProviderSettings(): ProviderSettings {
  if (typeof window === 'undefined') return defaultSettings;
  
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  
  return defaultSettings;
}

export function saveProviderSettings(settings: ProviderSettings): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}
