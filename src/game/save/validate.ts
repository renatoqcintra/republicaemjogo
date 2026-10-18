import { SAVE_VERSION } from '../constants';
import { CHARACTER_MAP } from '../data/characters';
import { INITIAL_RELATIONS } from '../state/initialState';
import { ATTRIBUTES, type CampaignState, type SaveFile } from '../types';

export interface ValidationOutcome {
  state: CampaignState | null;
  warnings: string[];
  error?: string;
}

const REGION_IDS = ['sle', 'vam', 'cvm', 'plc', 'isb'] as const;
const MISSION_IDS = ['m1', 'm2', 'm3', 'm4', 'm5'] as const;
const PHASES = ['intro', 'campaign', 'finalWeek', 'election', 'ended'] as const;
const DIFFS = ['facil', 'normal', 'dificil'] as const;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function num(v: unknown, fallback: number, warnings: string[], label: string): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  warnings.push(`"${label}" inválido; usando ${fallback}.`);
  return fallback;
}

/**
 * Valida um arquivo de salvamento cru. Em caso de dados corrompidos, devolve
 * erro — nunca apaga silenciosamente nada do armazenamento do jogador.
 */
export function validateSave(raw: unknown): ValidationOutcome {
  const warnings: string[] = [];
  if (!isRecord(raw)) return { state: null, warnings, error: 'Arquivo de salvamento inválido.' };

  const version = raw['version'];
  if (typeof version !== 'number') {
    return { state: null, warnings, error: 'Versão do salvamento ausente.' };
  }
  if (version > SAVE_VERSION) {
    return {
      state: null,
      warnings,
      error: 'Este salvamento foi criado por uma versão mais nova do jogo.',
    };
  }

  const state = raw['state'];
  if (!isRecord(state)) {
    return { state: null, warnings, error: 'Conteúdo do salvamento ausente ou corrompido.' };
  }

  const seed = num(state['seed'], 1, warnings, 'seed');
  const day = Math.min(84, Math.max(1, num(state['day'], 1, warnings, 'day')));
  const difficulty = (DIFFS as readonly string[]).includes(String(state['difficulty']))
    ? (state['difficulty'] as CampaignState['difficulty'])
    : 'normal';
  if (!DIFFS.includes(difficulty as (typeof DIFFS)[number])) warnings.push('Dificuldade inválida.');

  const phaseRaw = String(state['phase']);
  const phase = (PHASES as readonly string[]).includes(phaseRaw)
    ? (phaseRaw as CampaignState['phase'])
    : 'campaign';
  if (phaseRaw !== phase) warnings.push('Fase inválida; retornando para a campanha.');

  const attrsIn = isRecord(state['attributes']) ? state['attributes'] : {};
  const attributes = {} as CampaignState['attributes'];
  for (const attr of ATTRIBUTES) {
    attributes[attr] = Math.min(100, Math.max(0, num(attrsIn[attr], 40, warnings, attr)));
  }

  const funds = Math.max(0, num(state['funds'], 100, warnings, 'funds'));
  const debateSkill = Math.min(100, Math.max(0, num(state['debateSkill'], 40, warnings, 'debateSkill')));

  const regionsIn = isRecord(state['regions']) ? state['regions'] : {};
  const regions = {} as CampaignState['regions'];
  for (const id of REGION_IDS) {
    const r = isRecord(regionsIn[id]) ? regionsIn[id] : {};
    regions[id] = {
      player: Math.min(100, Math.max(0, num(r['player'], 35, warnings, `região ${id}`))),
      opponent: Math.min(100, Math.max(0, num(r['opponent'], 35, warnings, `região ${id} (adversário)`))),
      undecided: Math.min(100, Math.max(0, num(r['undecided'], 30, warnings, `região ${id} (indecisos)`))),
      investment: Math.max(0, num(r['investment'], 0, warnings, `região ${id} (investimento)`)),
    };
  }

  const missionsIn = isRecord(state['missions']) ? state['missions'] : {};
  const missions = {} as CampaignState['missions'];
  for (const id of MISSION_IDS) {
    const m = isRecord(missionsIn[id]) ? missionsIn[id] : {};
    const status = ['locked', 'available', 'active', 'done', 'failed'].includes(String(m['status']))
      ? (m['status'] as CampaignState['missions'][typeof id]['status'])
      : 'locked';
    missions[id] = {
      status,
      currentNode: typeof m['currentNode'] === 'string' ? m['currentNode'] : null,
      completedObjectives: Array.isArray(m['completedObjectives'])
        ? (m['completedObjectives'] as string[])
        : [],
      started: m['started'] === true,
    };
  }

  const relationsIn = isRecord(state['relations']) ? state['relations'] : {};
  const relations = {} as CampaignState['relations'];
  for (const [who, value] of Object.entries(relationsIn)) {
    if (typeof value === 'number') {
      relations[who as keyof CampaignState['relations']] = Math.min(100, Math.max(-100, value));
    }
  }
  // Migração segura: personagens adicionados depois ganham a relação inicial
  // quando um salvamento antigo não os conhece ainda.
  for (const [who, value] of Object.entries(INITIAL_RELATIONS)) {
    const key = who as keyof CampaignState['relations'];
    if (typeof relations[key] !== 'number') relations[key] = value;
  }
  // Migração do rebalanceamento de relações (Rodada 4): salvamentos criados
  // antes do rebalanceamento trazem os valores padrão legados exatos. A relação
  // com Felipe Azevedo, por exemplo, nunca é alterada por missões, eventos ou
  // ações — um "+40" salvo é comprovadamente o padrão antigo (ministro do
  // governo adversário hoje inicia em -40). Só substituímos quando o valor
  // salvo é idênt ao legado (o jogador nunca moveu aquela relação); qualquer
  // outro valor é progresso real e preservado.
  const LEGACY_RELATION_DEFAULTS: Record<string, { legacy: number; current: number }> = {
    camurca: { legacy: 40, current: -40 },
    aurelio: { legacy: 5, current: -55 },
  };
  for (const [who, fix] of Object.entries(LEGACY_RELATION_DEFAULTS)) {
    const key = who as keyof CampaignState['relations'];
    if (relations[key] === fix.legacy) {
      relations[key] = fix.current;
      warnings.push(
        `Relação com ${CHARACTER_MAP[key]?.name ?? who} atualizada para o balanceamento atual (o valor salvo era o padrão antigo).`,
      );
    }
  }

  const factionsIn = isRecord(state['factions']) ? state['factions'] : {};
  const factions = {} as CampaignState['factions'];
  for (const [f, value] of Object.entries(factionsIn)) {
    if (typeof value === 'number') {
      factions[f as keyof CampaignState['factions']] = Math.min(100, Math.max(0, value));
    }
  }

  const countersIn = isRecord(state['counters']) ? state['counters'] : {};
  const counters = {
    logId: Math.max(0, num(countersIn['logId'], 0, warnings, 'counters.logId')),
    decisionId: Math.max(0, num(countersIn['decisionId'], 0, warnings, 'counters.decisionId')),
  };

  const validated: CampaignState = {
    version: SAVE_VERSION,
    seed,
    difficulty,
    phase,
    day,
    attributes,
    funds,
    debateSkill,
    regions,
    factions,
    relations,
    flags: isRecord(state['flags']) ? (state['flags'] as CampaignState['flags']) : {},
    missions,
    completedMissions: Array.isArray(state['completedMissions'])
      ? (state['completedMissions'] as CampaignState['completedMissions'])
      : [],
    failedMissions: Array.isArray(state['failedMissions'])
      ? (state['failedMissions'] as CampaignState['failedMissions'])
      : [],
    eventQueue: Array.isArray(state['eventQueue'])
      ? ((state['eventQueue'] as CampaignState['eventQueue']).slice(0, 10))
      : [],
    firedEvents: Array.isArray(state['firedEvents'])
      ? (state['firedEvents'] as CampaignState['firedEvents'])
      : [],
    log: Array.isArray(state['log']) ? (state['log'] as CampaignState['log']).slice(0, 200) : [],
    decisions: Array.isArray(state['decisions'])
      ? (state['decisions'] as CampaignState['decisions'])
      : [],
    achievements: Array.isArray(state['achievements'])
      ? (state['achievements'] as CampaignState['achievements'])
      : [],
    ending: typeof state['ending'] === 'string' ? (state['ending'] as CampaignState['ending']) : null,
    electionResult: null,
    counters,
  };

  if (validated.phase === 'election' || validated.phase === 'ended') {
    warnings.push('A apuração será recalculada ao carregar.');
    validated.phase = validated.phase === 'ended' ? 'ended' : 'finalWeek';
  }

  return { state: validated, warnings };
}

/** Migra salvamentos antigos para o formato atual. */
export function migrateSave(raw: unknown): ValidationOutcome {
  if (!isRecord(raw)) return { state: null, warnings: [], error: 'Arquivo inválido.' };
  const version = typeof raw['version'] === 'number' ? raw['version'] : 0;
  if (version === SAVE_VERSION) return validateSave(raw);
  // Versões futuras são rejeitadas; versões passadas (0/1) são normalizadas.
  const upgraded: SaveFile = { version: SAVE_VERSION, savedAt: new Date().toISOString(), state: raw as unknown as CampaignState };
  const result = validateSave(upgraded);
  if (!result.error && version < SAVE_VERSION) {
    result.warnings.push(`Salvamento migrado da versão ${version} para ${SAVE_VERSION}.`);
  }
  return result;
}
