import { DEFAULT_SETTINGS, META_KEY, SAVE_KEY, SETTINGS_KEY } from '../constants';
import { migrateSave } from './validate';
import { getStorage } from './storage';
import type { CampaignState, MetaProgress, SaveFile, Settings } from '../types';

export interface LoadedGame {
  state: CampaignState;
  savedAt: string;
  warnings: string[];
}

export interface LoadResult {
  game: LoadedGame | null;
  error?: string;
}

/**
 * Salvamento e carregamento da campanha.
 * Regras: nunca apagar silenciosamente, sempre validar, sempre avisar.
 */

export function saveGame(state: CampaignState): boolean {
  const payload: SaveFile = {
    version: state.version,
    savedAt: new Date().toISOString(),
    state,
  };
  try {
    getStorage().set(SAVE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function hasSave(): boolean {
  return getStorage().get(SAVE_KEY) !== null;
}

export function loadGame(): LoadResult {
  const raw = getStorage().get(SAVE_KEY);
  if (raw === null) return { game: null };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { game: null, error: 'O arquivo de salvamento está corrompido e não pôde ser lido. Nada foi apagado.' };
  }
  const result = migrateSave(parsed);
  if (!result.state) {
    return { game: null, error: result.error ?? 'Salvamento inválido.' };
  }
  let savedAt = new Date().toISOString();
  if (typeof parsed === 'object' && parsed !== null && 'savedAt' in parsed) {
    const s = (parsed as SaveFile).savedAt;
    if (typeof s === 'string') savedAt = s;
  }
  return { game: { state: result.state, savedAt, warnings: result.warnings } };
}

export function deleteSave(): void {
  getStorage().remove(SAVE_KEY);
}

// ---------------------------------------------------------------------------
// Progresso global (finais, conquistas e campanhas jogadas)
// ---------------------------------------------------------------------------

export function loadMeta(): MetaProgress {
  const raw = getStorage().get(META_KEY);
  if (!raw) return { endings: [], achievements: [], campaignsPlayed: 0 };
  try {
    const parsed = JSON.parse(raw) as Partial<MetaProgress>;
    return {
      endings: Array.isArray(parsed.endings) ? parsed.endings : [],
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
      campaignsPlayed: typeof parsed.campaignsPlayed === 'number' ? parsed.campaignsPlayed : 0,
    };
  } catch {
    return { endings: [], achievements: [], campaignsPlayed: 0 };
  }
}

export function saveMeta(meta: MetaProgress): void {
  getStorage().set(META_KEY, JSON.stringify(meta));
}

// ---------------------------------------------------------------------------
// Configurações persistentes
// ---------------------------------------------------------------------------

export function loadSettings(): Settings {
  const raw = getStorage().get(SETTINGS_KEY);
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      volume: typeof parsed.volume === 'number' ? Math.min(1, Math.max(0, parsed.volume)) : DEFAULT_SETTINGS.volume,
      muted: typeof parsed.muted === 'boolean' ? parsed.muted : DEFAULT_SETTINGS.muted,
      reducedMotion: ['auto', 'reduced', 'full'].includes(String(parsed.reducedMotion))
        ? (parsed.reducedMotion as Settings['reducedMotion'])
        : DEFAULT_SETTINGS.reducedMotion,
      highContrast: parsed.highContrast === true,
      showDiagnostics: parsed.showDiagnostics === true,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function persistSettings(settings: Settings): void {
  getStorage().set(SETTINGS_KEY, JSON.stringify(settings));
}
