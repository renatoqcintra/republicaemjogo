/**
 * Camada de armazenamento da plataforma.
 * Toda operação de persistência passa por aqui, de modo que a versão desktop
 * (Tauri) possa trocar a implementação sem tocar no restante do jogo.
 */

export interface KeyValueStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

const memory = new Map<string, string>();

export const memoryStorage: KeyValueStorage = {
  get: (key) => memory.get(key) ?? null,
  set: (key, value) => {
    memory.set(key, value);
  },
  remove: (key) => {
    memory.delete(key);
  },
};

function localStorageWorks(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const probe = '__rej_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

let cached: KeyValueStorage | null = null;

export function getStorage(): KeyValueStorage {
  if (cached) return cached;
  if (localStorageWorks()) {
    cached = {
      get: (key) => {
        try {
          return window.localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      set: (key, value) => {
        try {
          window.localStorage.setItem(key, value);
        } catch {
          /* quota ou modo privado: jogo continua sem salvar */
        }
      },
      remove: (key) => {
        try {
          window.localStorage.removeItem(key);
        } catch {
          /* ignore */
        }
      },
    };
  } else {
    cached = memoryStorage;
  }
  return cached;
}

/** Somente para testes: força o armazenamento em memória. */
export function useMemoryStorage(): void {
  cached = memoryStorage;
}
