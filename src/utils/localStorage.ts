import type { GeneratedComponent, Provider } from '../types';

const STORAGE_KEYS = {
  PROVIDER: 'app.provider',
  COMPONENTS: 'app.components',
  PROMPT_HISTORY: 'app.promptHistory',
} as const;

const VALID_PROVIDERS: readonly Provider[] = ['anthropic', 'google'] as const;

interface StoredComponent extends Omit<GeneratedComponent, 'createdAt'> {
  createdAt: string;
}

const isValidProvider = (value: unknown): value is Provider => {
  return typeof value === 'string' && VALID_PROVIDERS.includes(value as Provider);
};

const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !Number.isNaN(date.getTime());
};

const isStoredComponent = (obj: unknown): obj is StoredComponent => {
  if (typeof obj !== 'object' || obj === null) return false;
  const c = obj as Record<string, unknown>;
  return (
    typeof c.id === 'string' &&
    typeof c.prompt === 'string' &&
    typeof c.code === 'string' &&
    typeof c.createdAt === 'string' &&
    isValidDate(c.createdAt)
  );
};

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
      const value = localStorage.getItem(STORAGE_KEYS.PROVIDER);
      return isValidProvider(value) ? value : null;
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

      const parsed: unknown = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter(isStoredComponent)
        .map((c) => ({
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
