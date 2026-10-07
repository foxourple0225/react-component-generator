import type { GeneratedComponent, Provider } from '../types';

const STORAGE_KEYS = {
  PROVIDER: 'app.provider',
  COMPONENTS: 'app.components',
  PROMPT_HISTORY: 'app.promptHistory',
} as const;

interface StoredComponent extends Omit<GeneratedComponent, 'createdAt'> {
  createdAt: string;
}

export const storageUtils = {
  saveProvider(provider: Provider): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROVIDER, provider);
    } catch {
      // localStorage 접근 불가 (private browsing 등)
    }
  },

  loadProvider(): Provider | null {
    try {
      return (localStorage.getItem(STORAGE_KEYS.PROVIDER) || null) as Provider | null;
    } catch {
      return null;
    }
  },

  saveComponents(components: GeneratedComponent[]): void {
    try {
      const stored: StoredComponent[] = components.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      }));
      localStorage.setItem(STORAGE_KEYS.COMPONENTS, JSON.stringify(stored));
    } catch {
      // localStorage 접근 불가
    }
  },

  loadComponents(): GeneratedComponent[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COMPONENTS);
      if (!stored) return [];

      const parsed: StoredComponent[] = JSON.parse(stored);
      return parsed.map((c) => ({
        ...c,
        createdAt: new Date(c.createdAt),
      }));
    } catch {
      return [];
    }
  },

  savePromptHistory(prompts: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROMPT_HISTORY, JSON.stringify(prompts));
    } catch {
      // localStorage 접근 불가
    }
  },

  loadPromptHistory(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROMPT_HISTORY);
      if (!stored) return [];

      const parsed: unknown = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.filter((p) => typeof p === 'string') : [];
    } catch {
      return [];
    }
  },

  clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch {
      // localStorage 접근 불가
    }
  },
};
