import { createContext, useContext, useEffect, useState } from 'react';

export interface AppConfig {
  site: {
    hero_title: string;
    hero_subtitle: string;
    trust_text: string;
  };
  products: Record<string, {
    price: number;
    is_enabled: boolean;
    audio_url: string | null;
    video_url: string | null;
    text_content: string | null;
  }>;
  results: Record<string, {
    title: string;
    preview_phrase_1: string;
    preview_phrase_2: string;
    full_description: string;
    recommendation: string;
  }>;
}

const ConfigContext = createContext<AppConfig | null>(null);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    function load() {
      fetch('/api/config')
        .then((r) => r.json())
        .then((data: AppConfig) => setConfig(data))
        .catch(() => { /* use defaults from hardcoded data */ });
    }

    load();

    function handleVisibility() {
      if (document.visibilityState === 'visible') load();
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig(): AppConfig | null {
  return useContext(ConfigContext);
}
