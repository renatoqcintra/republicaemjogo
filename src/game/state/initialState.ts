import { CAMPAIGN_DAYS } from '../constants';
import { REGIONS } from '../data/regions';
import { INITIAL_ATTRIBUTES, INITIAL_DEBATE_SKILL, SAVE_VERSION } from '../constants';
import { clamp } from '../rules/numbers';
import type { CampaignState, CharacterId, Difficulty, RegionId, RegionState } from '../types';

/**
 * Relações iniciais: personagem → valor (-100..100).
 *
 * São a relação de Fábio Barreto com cada pessoa — afeto e histórico pessoal,
 * não alinhamento político (ver `CharacterDef.alignment`) nem lealdade de
 * facção (`state.factions`). Justificativas dos valores sensíveis:
 * - helio 80: pai e legado.
 * - tiago 65: duas auditorias conjuntas com a ONG; respeito profissional.
 * - zorana 55: admiração oportuna de Walker por um herdeiro com estrutura.
 * - vera 60: braço direito de campanha.
 * - dulcinea 45: presidente do partido que carrega a candidatura — aliado
 *   condicional com interesses próprios na legenda.
 * - dante 10: relação de negociação, ainda sem confiança.
 * - aurelio -55: adversário eleitoral direto, governo FPT.
 * - camurca -40: ministro da Economia do governo adversário.
 * - amaro -65: distância institucional entre o relator e a campanha que
 *   politiza o processo; precisa ser construída durante a trama judicial.
 */
export const INITIAL_RELATIONS: Record<CharacterId, number> = {
  rafael: 100, // consigo mesmo
  aurelio: -55,
  helio: 80,
  zorana: 55,
  bento: 10,
  camurca: -40,
  dulcinea: 45,
  iris: 15,
  amaro: -65,
  vera: 60,
  salome: 55,
  sandoval: 25,
  lutero: 50,
  dante: 10,
  caetano: 15,
  tiago: 65,
};

/** Lealdade das facções no início (0–100). */
export const INITIAL_FACTIONS: CampaignState['factions'] = {
  prn: 55,
  ppv: 20,
  imprensa: 40,
  judiciario: 25,
  mercado: 50,
  movimentos: 30,
};

export function initialRegions(): Record<RegionId, RegionState> {
  const regions = {} as Record<RegionId, RegionState>;
  for (const r of REGIONS) {
    regions[r.id] = {
      player: r.basePlayer,
      opponent: r.baseOpponent,
      undecided: r.baseUndecided,
      investment: 0,
    };
  }
  return regions;
}

export const FLAG_NAMES: Record<string, string> = {};

export interface NewCampaignOptions {
  seed: number;
  difficulty: Difficulty;
}

export function createCampaignState({ seed, difficulty }: NewCampaignOptions): CampaignState {
  const funds =
    difficulty === 'facil' ? 140 : difficulty === 'normal' ? 120 : 105;

  const state: CampaignState = {
    version: SAVE_VERSION,
    seed,
    difficulty,
    phase: 'intro',
    day: 1,
    attributes: { ...INITIAL_ATTRIBUTES },
    funds,
    debateSkill: INITIAL_DEBATE_SKILL,
    regions: initialRegions(),
    factions: { ...INITIAL_FACTIONS },
    relations: { ...INITIAL_RELATIONS },
    flags: {},
    missions: {
      m1: { status: 'available', currentNode: null, completedObjectives: [], started: false },
      m2: { status: 'locked', currentNode: null, completedObjectives: [], started: false },
      m3: { status: 'locked', currentNode: null, completedObjectives: [], started: false },
      m4: { status: 'locked', currentNode: null, completedObjectives: [], started: false },
      m5: { status: 'locked', currentNode: null, completedObjectives: [], started: false },
    },
    completedMissions: [],
    failedMissions: [],
    eventQueue: [],
    firedEvents: [],
    log: [],
    decisions: [],
    achievements: [],
    ending: null,
    electionResult: null,
    counters: { logId: 0, decisionId: 0 },
  };

  void clamp;
  return state;
}

export const MAX_DAY = CAMPAIGN_DAYS;
