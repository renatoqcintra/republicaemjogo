import { create } from 'zustand';
import { CAMPAIGN_DAYS, FINAL_WEEK_START } from '../constants';
import { evalAll } from '../conditions';
import {
  advanceNode,
  chooseOption,
  concludeMission,
  missionDef,
  startMission,
  unlockPass,
} from '../engine/missionEngine';
import { resolveEvent, rollDailyEvents } from '../events/eventSystem';
import { simulateElection } from '../election/election';
import { ENDINGS } from '../data/endings';
import { runAchievementChecks } from '../rules/achievements';
import { resolveJudicialFate } from '../rules/judgement';
import { performAction } from '../rules/strategicActions';
import { createRng, randomSeed } from '../rng';
import {
  deleteSave,
  hasSave,
  loadGame,
  loadMeta,
  loadSettings,
  persistSettings,
  saveGame,
  saveMeta,
} from '../save/saveManager';
import { createCampaignState } from './initialState';
import { clamp } from '../rules/numbers';
import type {
  CampaignState,
  Difficulty,
  EndingId,
  MetaProgress,
  MissionId,
  RegionId,
  Settings,
} from '../types';

export type ViewId =
  | 'menu'
  | 'novaCampanha'
  | 'intro'
  | 'painel'
  | 'mapa'
  | 'missoes'
  | 'missao'
  | 'personagens'
  | 'historico'
  | 'financas'
  | 'aliancas'
  | 'debates'
  | 'apuracao'
  | 'fim'
  | 'galeria'
  | 'conquistas'
  | 'config'
  | 'creditos';

export interface CampaignStore {
  // UI
  view: ViewId;
  selectedRegion: RegionId;
  notices: string[];
  error: string | null;
  loadWarnings: string[];
  saveAvailable: boolean;

  // Estado
  state: CampaignState | null;
  settings: Settings;
  meta: MetaProgress;

  // Navegação
  setView: (view: ViewId) => void;
  setSelectedRegion: (region: RegionId) => void;
  clearNotices: () => void;
  dismissError: () => void;

  // Fluxo de jogo
  newGame: (difficulty: Difficulty, seed?: number) => void;
  continueGame: () => boolean;
  confirmDeleteSave: () => void;
  introDone: () => void;
  startMission: (id: MissionId) => void;
  advance: () => void;
  choose: (choiceId: string) => void;
  conclude: () => void;
  performAction: (actionId: string) => void;
  resolveEventChoice: (choiceId: string) => void;
  advanceDays: (days: number) => void;
  withdraw: () => void;
  finishElection: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  restartSameSeed: () => void;
}

function resolveEnding(state: CampaignState): EndingId {
  for (const ending of ENDINGS) {
    if (evalAll(ending.when, state)) return ending.id;
  }
  return 'derrota_digna';
}

export const useCampaign = create<CampaignStore>((set, get) => {
  const commit = (next: CampaignState, extra?: Partial<CampaignStore>) => {
    saveGame(next);
    set({ state: next, saveAvailable: true, ...extra });
  };

  const pushNotices = (items: string[]) => {
    if (items.length === 0) return;
    set({ notices: [...get().notices, ...items].slice(-6) });
  };

  const finishCampaign = (state: CampaignState, extraFlags: Partial<Record<string, boolean | number | string>>) => {
    const judged = resolveJudicialFate(state);
    const flagged: CampaignState = {
      ...judged.state,
      flags: { ...judged.state.flags, ...extraFlags } as CampaignState['flags'],
    };
    if (judged.notice) pushNotices([judged.notice]);
    const ending = resolveEnding(flagged);
    const ended: CampaignState = { ...flagged, phase: 'ended', ending };
    const meta: MetaProgress = {
      endings: metaAdd(get().meta.endings, ending),
      achievements: metaAdd(get().meta.achievements, ended.achievements),
      campaignsPlayed: get().meta.campaignsPlayed + 1,
    };
    saveMeta(meta);
    commit(ended, { meta, view: 'fim' });
  };

  return {
    view: 'menu',
    selectedRegion: 'sle',
    notices: [],
    error: null,
    loadWarnings: [],
    saveAvailable: hasSave(),
    state: null,
    settings: loadSettings(),
    meta: loadMeta(),

    setView: (view) => set({ view }),
    setSelectedRegion: (region) => set({ selectedRegion: region }),
    clearNotices: () => set({ notices: [] }),
    dismissError: () => set({ error: null }),

    newGame: (difficulty, seed) => {
      const state = createCampaignState({
        seed: seed ?? randomSeed(),
        difficulty,
      });
      commit(state, { view: 'intro', notices: [], error: null, loadWarnings: [] });
    },

    continueGame: () => {
      const result = loadGame();
      if (!result.game) {
        set({ error: result.error ?? 'Nenhum salvamento encontrado.', saveAvailable: false });
        return false;
      }
      commit(result.game.state, {
        view: result.game.state.phase === 'ended' ? 'fim' : 'painel',
        loadWarnings: result.game.warnings,
        notices: result.game.warnings.length > 0 ? [...result.game.warnings] : [],
      });
      return true;
    },

    confirmDeleteSave: () => {
      deleteSave();
      set({ saveAvailable: false, state: null, view: 'menu' });
    },

    introDone: () => {
      const state = get().state;
      if (!state) return;
      commit({ ...state, phase: 'campaign' }, { view: 'painel' });
    },

    startMission: (id) => {
      const state = get().state;
      if (!state) return;
      const outcome = startMission(state, id);
      if (outcome.error) {
        set({ error: outcome.error });
        return;
      }
      pushNotices(outcome.notices);
      commit(outcome.state, { view: 'missao' });
    },

    advance: () => {
      const state = get().state;
      if (!state) return;
      const activeId = activeMissionId(state);
      if (!activeId) return;
      const outcome = advanceNode(state, activeId);
      if (outcome.error) {
        set({ error: outcome.error });
        return;
      }
      pushNotices(outcome.notices);
      commit(outcome.state);
    },

    choose: (choiceId) => {
      const state = get().state;
      if (!state) return;
      const activeId = activeMissionId(state);
      if (!activeId) return;
      const outcome = chooseOption(state, activeId, choiceId);
      if (outcome.error) {
        set({ error: outcome.error });
        return;
      }
      pushNotices(outcome.notices);
      const next = outcome.state;
      if (outcome.missionFinished?.id === 'm5' && !outcome.missionFinished.failed) {
        commit(next, { view: 'painel' });
        pushNotices(['Semana final concluída. A apuração está pronta quando você quiser.']);
        return;
      }
      commit(next);
    },

    conclude: () => {
      const state = get().state;
      if (!state) return;
      const activeId = activeMissionId(state);
      if (!activeId) return;
      const outcome = concludeMission(state, activeId);
      if (outcome.error) {
        set({ error: outcome.error });
        return;
      }
      pushNotices(outcome.notices);
      const next = outcome.state;
      if (outcome.missionFinished?.id === 'm5') {
        commit(next, { view: 'painel' });
        pushNotices(['Campanha encerrada. A apuração está pronta quando você quiser.']);
        return;
      }
      commit(next, { view: 'painel' });
    },

    performAction: (actionId) => {
      const state = get().state;
      if (!state) return;
      const outcome = performAction(state, actionId, get().selectedRegion);
      if (outcome.error) {
        set({ error: outcome.error });
        return;
      }
      pushNotices(outcome.notices);
      let next = outcome.state;
      if (next.day >= CAMPAIGN_DAYS) {
        pushNotices(['A campanha chegou ao último dia. A apuração está liberada.']);
      }
      next = runAchievementChecks(next);
      commit(next);
    },

    resolveEventChoice: (choiceId) => {
      const state = get().state;
      if (!state) return;
      const pending = state.eventQueue[0];
      if (!pending) return;
      const outcome = resolveEvent(state, pending, choiceId);
      if (outcome.error) {
        set({ error: outcome.error });
        return;
      }
      pushNotices(outcome.notices);
      commit(outcome.state);
    },

    advanceDays: (days) => {
      const state = get().state;
      if (!state || state.phase === 'ended' || state.phase === 'election') return;
      // Campanha encerrada: não permite avançar dias.
      if (state.day >= CAMPAIGN_DAYS) return;
      let next: CampaignState = {
        ...state,
        day: clamp(state.day + days, 1, CAMPAIGN_DAYS),
      };
      if (next.day >= FINAL_WEEK_START && next.phase === 'campaign') {
        next = { ...next, phase: 'finalWeek' };
        pushNotices(['A última semana começou. A apuração está próxima.']);
      }
      next = rollDailyEvents(next);
      next = unlockPass(next);
      next = runAchievementChecks(next);
      const judged = resolveJudicialFate(next);
      next = judged.state;
      commit(next);
      if (judged.notice) pushNotices([judged.notice]);
    },

    withdraw: () => {
      const state = get().state;
      if (!state) return;
      finishCampaign(state, { withdrew: true, electionWon: false });
    },

    finishElection: () => {
      const state = get().state;
      if (!state) return;
      // Rede de segurança: o desfecho judicial resolve antes do final,
      // mesmo que a campanha tenha pulado o avanço de dias que o liberaria.
      // O estado resolvido é a base de tudo — senão a flag fathersFate e o
      // registro no histórico se perderiam entre o aviso e o resultado.
      const judged = resolveJudicialFate(state);
      if (judged.notice) pushNotices([judged.notice]);
      const result = simulateElection(judged.state);
      const flags: Partial<Record<string, boolean | number>> = {
        electionWon: result.winner === 'player',
        electionTie: result.winner === 'tie',
      };
      if (result.playerPct >= 50) flags['nationalPlayerPct'] = result.playerPct;
      const flagged: CampaignState = {
        ...judged.state,
        flags: { ...judged.state.flags, ...flags } as CampaignState['flags'],
      };
      const ending = resolveEnding(flagged);
      const ended: CampaignState = {
        ...flagged,
        phase: 'ended',
        ending,
        electionResult: result,
      };
      const meta: MetaProgress = {
        endings: metaAdd(get().meta.endings, ending),
        achievements: metaAdd(get().meta.achievements, ended.achievements),
        campaignsPlayed: get().meta.campaignsPlayed + 1,
      };
      saveMeta(meta);
      commit(ended, { meta, view: 'apuracao' });
    },

    updateSettings: (patch) => {
      const settings = { ...get().settings, ...patch };
      persistSettings(settings);
      set({ settings });
    },

    restartSameSeed: () => {
      const state = get().state;
      if (!state) return;
      const fresh = createCampaignState({ seed: state.seed, difficulty: state.difficulty });
      commit(fresh, { view: 'intro', notices: ['Nova campanha com a mesma semente.'] });
    },
  };
});

function metaAdd<T>(list: T[], items: T[] | T): T[] {
  const arr = Array.isArray(items) ? items : [items];
  const next = [...list];
  for (const item of arr) {
    if (!next.includes(item)) next.push(item);
  }
  return next;
}

/** Id da missão ativa no momento, se houver. */
export function activeMissionId(state: CampaignState): MissionId | null {
  const id = (['m1', 'm2', 'm3', 'm4', 'm5'] as MissionId[]).find(
    (m) => state.missions[m].status === 'active',
  );
  return id ?? null;
}

/** Missão recomendada para o jogador iniciar agora. */
export function nextRecommendedMission(state: CampaignState): MissionId | null {
  const ids = (['m1', 'm2', 'm3', 'm4', 'm5'] as MissionId[]).filter(
    (m) => state.missions[m].status === 'available',
  );
  if (ids.length === 0) return null;
  return ids.sort((a, b) => missionDef(a).phase - missionDef(b).phase)[0];
}

/** Usado pela galeria de finais e pela tela de fim. */
export function endingSequence(seed: number, count: number): number[] {
  const rng = createRng(seed);
  return Array.from({ length: count }, () => Math.floor(rng() * 100));
}
