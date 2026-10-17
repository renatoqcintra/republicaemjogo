import { MISSIONS } from '../data/missions';
import { evalAll, evalCondition } from '../conditions';
import { applyEffects } from '../effects';
import { runAchievementChecks } from '../rules/achievements';
import { clamp } from '../rules/numbers';
import { DIFFICULTY } from '../constants';
import type { CampaignState, MissionCost, MissionDef, MissionId, MissionNode } from '../types';

export interface EngineOutcome {
  state: CampaignState;
  /** Avisos para a interface ("Missão concluída", "Faltam recursos"...). */
  notices: string[];
  /** Erro de regra (custo insuficiente, escolha indisponível...). */
  error?: string;
  missionFinished?: { id: MissionId; failed: boolean };
}

export function missionDef(id: MissionId): MissionDef {
  const def = MISSIONS.find((m) => m.id === id);
  if (!def) throw new Error(`Missão desconhecida: ${id}`);
  return def;
}

function costWithDifficulty(state: CampaignState, cost: MissionCost | undefined): MissionCost {
  if (!cost) return {};
  const mult = DIFFICULTY[state.difficulty].costMultiplier;
  return {
    funds: cost.funds !== undefined ? Math.ceil(cost.funds * mult) : undefined,
    days: cost.days,
  };
}

export function realCost(state: CampaignState, cost: MissionCost | undefined): MissionCost {
  return costWithDifficulty(state, cost);
}

export function canAfford(state: CampaignState, cost: MissionCost | undefined): boolean {
  const real = costWithDifficulty(state, cost);
  if (real.funds !== undefined && state.funds < real.funds) return false;
  return true;
}

function recordDecision(
  state: CampaignState,
  mission: MissionDef,
  text: string,
  consequences: string[],
): CampaignState {
  return {
    ...state,
    counters: { ...state.counters, decisionId: state.counters.decisionId + 1 },
    decisions: [
      ...state.decisions,
      {
        id: state.counters.decisionId + 1,
        day: state.day,
        mission: mission.id,
        missionTitle: mission.title,
        text,
        consequences,
      },
    ],
  };
}

function currentNodeOf(def: MissionDef, state: CampaignState): MissionNode {
  const nodeId = state.missions[def.id].currentNode ?? def.startNode;
  const node = def.nodes[nodeId];
  if (!node) throw new Error(`Nó "${nodeId}" ausente na missão ${def.id}`);
  return node;
}

/**
 * Inicia uma missão disponível: marca como ativa e aplica os efeitos de entrada
 * do primeiro nó.
 */
export function startMission(state: CampaignState, id: MissionId): EngineOutcome {
  const def = missionDef(id);
  const progress = state.missions[id];
  if (!progress || progress.status !== 'available') {
    return { state, notices: [], error: 'Missão indisponível no momento.' };
  }
  const startNode = def.nodes[def.startNode];
  const applied = applyEffects(
    {
      ...state,
      missions: {
        ...state.missions,
        [id]: { ...progress, status: 'active', currentNode: def.startNode, started: true },
      },
    },
    startNode.t === 'dialogue' || startNode.t === 'end' ? startNode.effects : undefined,
    def.title,
  );
  const notices = [...applied.result.notices, `Missão iniciada: ${def.title}`];
  const failure = checkFailure(applied.state, def);
  if (failure) {
    return { state: failMission(applied.state, def), notices, missionFinished: failure };
  }
  return { state: applied.state, notices };
}

/** Avança um nó do tipo diálogo. */
export function advanceNode(state: CampaignState, id: MissionId): EngineOutcome {
  const def = missionDef(id);
  const progress = state.missions[id];
  if (!progress || progress.status !== 'active') {
    return { state, notices: [], error: 'Nenhuma missão ativa.' };
  }
  const node = currentNodeOf(def, state);
  if (node.t !== 'dialogue') {
    return { state, notices: [], error: 'Este nó exige uma escolha.' };
  }
  const nextId = node.next;
  const nextNode = def.nodes[nextId];
  if (!nextNode) throw new Error(`Próximo nó "${nextId}" ausente na missão ${id}`);
  const withAdvance: CampaignState = {
    ...state,
    missions: { ...state.missions, [id]: { ...progress, currentNode: nextId } },
  };
  const entryEffects = nextNode.t === 'dialogue' || nextNode.t === 'end' ? nextNode.effects : undefined;
  const applied = applyEffects(withAdvance, entryEffects, def.title);
  return {
    state: applied.state,
    notices: applied.result.notices,
    missionFinished: checkFailure(applied.state, def),
  };
}

/** Executa uma escolha do jogador em um nó do tipo escolha. */
export function chooseOption(
  state: CampaignState,
  id: MissionId,
  choiceId: string,
): EngineOutcome {
  const def = missionDef(id);
  const progress = state.missions[id];
  if (!progress || progress.status !== 'active') {
    return { state, notices: [], error: 'Nenhuma missão ativa.' };
  }
  const node = currentNodeOf(def, state);
  if (node.t !== 'choice') {
    return { state, notices: [], error: 'Este nó não aceita escolhas.' };
  }
  const choice = node.choices.find((c) => c.id === choiceId);
  if (!choice) return { state, notices: [], error: 'Escolha inexistente.' };

  if (!evalAll(choice.requires, state)) {
    return { state, notices: [], error: 'Requisitos não atendidos para esta escolha.' };
  }
  const real = costWithDifficulty(state, choice.cost);
  if (real.funds !== undefined && state.funds < real.funds) {
    return {
      state,
      notices: [],
      error: `Verba insuficiente: necessário R$ ${real.funds} mi (disponível R$ ${state.funds} mi).`,
    };
  }

  let working: CampaignState = {
    ...state,
    funds: real.funds !== undefined ? state.funds - real.funds : state.funds,
    day: real.days !== undefined ? clamp(state.day + real.days, 1, 56) : state.day,
  };

  const consequences: string[] = [];
  if (real.funds) consequences.push(`Verba −R$ ${real.funds} mi`);
  if (real.days) consequences.push(`+${real.days} dia(s)`);
  for (const e of choice.effects ?? []) {
    if (e.t === 'attr') consequences.push(`${e.attr} ${e.amount > 0 ? '+' : ''}${e.amount}`);
    if (e.t === 'funds' && e.amount > 0) consequences.push(`Verba +R$ ${e.amount} mi`);
  }

  if (choice.summary) {
    working = recordDecision(working, def, choice.summary, consequences);
  }

  const applied = applyEffects(working, choice.effects, def.title);
  let resultState = applied.state;

  // Objetivos com critério declarado são marcados automaticamente.
  resultState = syncObjectives(resultState, def);

  if (choice.completes) {
    resultState = finishMission(resultState, def, false);
    return {
      state: resultState,
      notices: [...applied.result.notices, `Missão concluída: ${def.title}`],
      missionFinished: { id: def.id, failed: false },
    };
  }

  const nextId = choice.next;
  const nextNode = nextId ? def.nodes[nextId] : undefined;
  if (!nextNode) {
    resultState = finishMission(resultState, def, false);
    return {
      state: resultState,
      notices: [...applied.result.notices, `Missão concluída: ${def.title}`],
      missionFinished: { id: def.id, failed: false },
    };
  }

  resultState = {
    ...resultState,
    missions: {
      ...resultState.missions,
      [def.id]: { ...resultState.missions[def.id], currentNode: nextId! },
    },
  };
  const entryEffects = nextNode.t === 'dialogue' || nextNode.t === 'end' ? nextNode.effects : undefined;
  const entered = applyEffects(resultState, entryEffects, def.title);
  resultState = entered.state;

  const failure = checkFailure(resultState, def);
  if (failure) {
    resultState = failMission(resultState, def);
    return {
      state: resultState,
      notices: entered.result.notices,
      missionFinished: { id: def.id, failed: true },
    };
  }

  return { state: resultState, notices: entered.result.notices };
}

/** Conclui a missão quando o jogador está no nó final ("end"). */
export function concludeMission(state: CampaignState, id: MissionId): EngineOutcome {
  const def = missionDef(id);
  const progress = state.missions[id];
  if (!progress || progress.status !== 'active') {
    return { state, notices: [], error: 'Nenhuma missão ativa.' };
  }
  const node = currentNodeOf(def, state);
  if (node.t !== 'end') {
    return { state, notices: [], error: 'A missão ainda tem decisões pendentes.' };
  }
  const applied = applyEffects(state, node.effects, def.title);
  let next = syncObjectives(applied.state, def);
  next = finishMission(next, def);
  return {
    state: next,
    notices: [...applied.result.notices, `Missão concluída: ${def.title}`],
    missionFinished: { id: def.id, failed: false },
  };
}

/** Marca objetivos cujas condições foram satisfeitas. */
export function syncObjectives(state: CampaignState, def: MissionDef): CampaignState {
  const progress = state.missions[def.id];
  const completed = new Set(progress.completedObjectives);
  for (const objective of def.objectives) {
    if (!objective.completeWhen) continue;
    if (completed.has(objective.id)) continue;
    if (evalAll(objective.completeWhen, state)) completed.add(objective.id);
  }
  if (completed.size === progress.completedObjectives.length) return state;
  return {
    ...state,
    missions: {
      ...state.missions,
      [def.id]: { ...progress, completedObjectives: [...completed] },
    },
  };
}

function checkFailure(
  state: CampaignState,
  def: MissionDef,
): EngineOutcome['missionFinished'] | undefined {
  if (!def.failWhen || def.failWhen.length === 0) return undefined;
  const failed = def.failWhen.some((c) => evalCondition(c, state));
  return failed ? { id: def.id, failed: true } : undefined;
}

export function failMission(state: CampaignState, def: MissionDef): CampaignState {
  let next: CampaignState = {
    ...state,
    missions: {
      ...state.missions,
      [def.id]: { ...state.missions[def.id], status: 'failed', currentNode: null },
    },
    failedMissions: state.failedMissions.includes(def.id)
      ? state.failedMissions
      : [...state.failedMissions, def.id],
  };
  if (def.onFail) {
    const applied = applyEffects(next, def.onFail.effects, `${def.title} (falha)`);
    next = applied.state;
    next = {
      ...next,
      log: [
        {
          id: next.counters.logId + 1,
          day: next.day,
          text: def.onFail.text,
          tone: 'bad',
          source: def.title,
        },
        ...next.log,
      ],
      counters: { ...next.counters, logId: next.counters.logId + 1 },
    };
  }
  // Uma falha nunca bloqueia a progressão: as próximas missões seguem liberadas.
  const unlocked = unlockPass(next);
  return runAchievementChecks(unlocked);
}

export function finishMission(state: CampaignState, def: MissionDef, silent = false): CampaignState {
  let next: CampaignState = {
    ...state,
    missions: {
      ...state.missions,
      [def.id]: { ...state.missions[def.id], status: 'done', currentNode: null },
    },
    completedMissions: state.completedMissions.includes(def.id)
      ? state.completedMissions
      : [...state.completedMissions, def.id],
  };
  const applied = applyEffects(next, def.completion.effects, def.title);
  next = applied.state;
  if (!silent) {
    next = {
      ...next,
      log: [
        {
          id: next.counters.logId + 1,
          day: next.day,
          text: def.completion.summary,
          tone: 'story',
          source: def.title,
        },
        ...next.log,
      ],
      counters: { ...next.counters, logId: next.counters.logId + 1 },
    };
  }
  const unlocked = unlockPass(next);
  return runAchievementChecks(unlocked);
}

/** Libera missões cujas condições `unlock` já foram satisfeitas. */
export function unlockPass(state: CampaignState): CampaignState {
  let missions = state.missions;
  let changed = false;
  for (const def of MISSIONS) {
    const progress = missions[def.id];
    if (progress && progress.status === 'locked' && evalAll(def.unlock, state)) {
      if (!changed) {
        missions = { ...missions };
        changed = true;
      }
      missions[def.id] = { ...progress, status: 'available' };
    }
  }
  return changed ? { ...state, missions } : state;
}
