import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { useMemoryStorage } from '@/game/save/storage';

// Testes sempre usam armazenamento em memória: nada toca o localStorage real.
useMemoryStorage();

// Garante que cada teste comece com DOM limpo (independente do auto-cleanup).
afterEach(() => {
  cleanup();
});
