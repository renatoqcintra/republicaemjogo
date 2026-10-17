import { beforeEach, describe, expect, it } from 'vitest';
import {
  deleteSave,
  hasSave,
  loadGame,
  loadMeta,
  loadSettings,
  persistSettings,
  saveGame,
  saveMeta,
} from '@/game/save/saveManager';
import { migrateSave, validateSave } from '@/game/save/validate';
import { useMemoryStorage, getStorage } from '@/game/save/storage';
import { createCampaignState } from '@/game/state/initialState';
import { SAVE_VERSION } from '@/game/constants';

beforeEach(() => {
  useMemoryStorage();
  deleteSave();
});

describe('salvamento e carregamento', () => {
  it('faz roundtrip completo do estado', () => {
    const state = createCampaignState({ seed: 555, difficulty: 'dificil' });
    const saved = saveGame(state);
    expect(saved).toBe(true);
    expect(hasSave()).toBe(true);

    const loaded = loadGame();
    expect(loaded.error).toBeUndefined();
    expect(loaded.game?.state.seed).toBe(555);
    expect(loaded.game?.state.difficulty).toBe('dificil');
    expect(loaded.game?.state.funds).toBe(state.funds);
    expect(loaded.game?.state.regions.sle.player).toBe(state.regions.sle.player);
  });

  it('informa erro quando não há salvamento', () => {
    const loaded = loadGame();
    expect(loaded.game).toBeNull();
    expect(loaded.error).toBeUndefined();
  });

  it('trata JSON corrompido sem apagar nada', () => {
    const state = createCampaignState({ seed: 1, difficulty: 'normal' });
    saveGame(state);
    // sobrescreve com lixo manualmente
    getStorage().set('republica-em-jogo:save', '{corrompido');
    const loaded = loadGame();
    expect(loaded.game).toBeNull();
    expect(loaded.error).toMatch(/corrompido/i);
    expect(hasSave()).toBe(true);
  });

  it('rejeita salvamento de versão futura', () => {
    const future = { version: SAVE_VERSION + 5, savedAt: new Date().toISOString(), state: {} };
    const result = validateSave(future);
    expect(result.state).toBeNull();
    expect(result.error).toMatch(/versão mais nova/i);
  });

  it('corrige valores fora dos limites e emite avisos', () => {
    const state = createCampaignState({ seed: 9, difficulty: 'normal' });
    const broken = JSON.parse(JSON.stringify(state));
    broken.attributes.popularity = 400;
    broken.attributes.reputation = -50;
    broken.funds = -100;
    broken.day = 999;
    broken.seed = 'não-numérico';
    const result = validateSave({ version: SAVE_VERSION, savedAt: '', state: broken });
    expect(result.state).not.toBeNull();
    expect(result.state?.attributes.popularity).toBe(100);
    expect(result.state?.attributes.reputation).toBe(0);
    expect(result.state?.funds).toBe(0);
    expect(result.state?.day).toBe(56);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('migra versões antigas com aviso', () => {
    const state = createCampaignState({ seed: 3, difficulty: 'normal' });
    const old = { version: 0, savedAt: '', state };
    const result = migrateSave(old);
    expect(result.state).not.toBeNull();
    expect(result.warnings.some((w) => w.includes('migrado'))).toBe(true);
  });

  it('não aceita estruturas arbitrárias', () => {
    expect(validateSave('texto').state).toBeNull();
    expect(validateSave(null).state).toBeNull();
    expect(validateSave({}).state).toBeNull();
    expect(validateSave({ version: SAVE_VERSION }).state).toBeNull();
  });

  it('progresso global persiste separadamente da campanha', () => {
    const meta = loadMeta();
    const updated = { ...meta, endings: [...meta.endings, 'derrota_digna' as const], campaignsPlayed: 3 };
    saveMeta(updated);
    expect(loadMeta().endings).toContain('derrota_digna');
    expect(loadMeta().campaignsPlayed).toBe(3);
  });

  it('configurações persistem com validação', () => {
    persistSettings({ volume: 0.3, muted: true, reducedMotion: 'reduced', highContrast: true, showDiagnostics: false });
    const settings = loadSettings();
    expect(settings.volume).toBe(0.3);
    expect(settings.muted).toBe(true);
    expect(settings.reducedMotion).toBe('reduced');
  });
});
