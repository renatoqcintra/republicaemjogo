import {
  ATTR_LABELS,
  ATTR_MAX,
  ATTR_MIN,
  CAMPAIGN_DAYS,
  FINAL_WEEK_START,
  FUNDS_MIN,
} from './constants';
import { simulateElection } from './election/election';
import { MISSIONS } from './data/missions';
import { evalAll } from './conditions';
import { runAchievementChecks } from './rules/achievements';
import { resolveJudicialFate } from './rules/judgement';
import { clamp } from './rules/numbers';
import type {
  CampaignState,
  CharacterId,
  Effect,
  FactionId,
  LogEntry,
  RegionId,
} from './types';

export interface ApplyResult {
  /** Textos de aviso (ex.: "Missão concluída", "Conquista desbloqueada"). */
  notices: string[];
  /** Verdadeiro quando um efeito iniciou a apuração eleitoral. */
  electionStarted: boolean;
}

/**
 * Aplica uma lista de efeitos ao estado, gerando um novo estado imutável.
 * Todas as mudanças numéricas passam por aqui para garantir limites e
 * consequências rastreáveis (log + histórico de decisões).
 */
export function applyEffects(
  state: CampaignState,
  effects: Effect[] | undefined,
  source: string,
): { state: CampaignState; result: ApplyResult } {
  const result: ApplyResult = { notices: [], electionStarted: false };
  if (!effects || effects.length === 0) return { state, result };

  // Trabalhamos numa cópia rasa estruturada; cada campo tocado é copiado.
  const next: CampaignState = {
    ...state,
    attributes: { ...state.attributes },
    flags: { ...state.flags },
    relations: { ...state.relations },
    factions: { ...state.factions },
    regions: { ...state.regions },
    missions: { ...state.missions },
    counters: { ...state.counters },
    log: [...state.log],
    decisions: [...state.decisions],
    completedMissions: [...state.completedMissions],
    failedMissions: [...state.failedMissions],
    achievements: [...state.achievements],
    eventQueue: [...state.eventQueue],
    firedEvents: [...state.firedEvents],
  };

  const pushLog = (text: string, tone: LogEntry['tone']) => {
    next.counters.logId += 1;
    next.log.unshift({
      id: next.counters.logId,
      day: next.day,
      text,
      tone,
      source,
    });
    if (next.log.length > 200) next.log.length = 200;
  };

  for (const effect of effects) {
    switch (effect.t) {
      case 'attr': {
        const before = next.attributes[effect.attr];
        const after = clamp(before + effect.amount, ATTR_MIN, ATTR_MAX);
        next.attributes[effect.attr] = after;
        if (after !== before) {
          const diff = after - before;
          pushLog(
            `${ATTR_LABELS[effect.attr] ?? effect.attr}: ${diff > 0 ? '+' : ''}${diff} (${before} → ${after})`,
            diff > 0 ? 'good' : 'bad',
          );
        }
        break;
      }
      case 'funds': {
        const after = Math.max(FUNDS_MIN, next.funds + effect.amount);
        next.funds = after;
        if (effect.amount !== 0) {
          pushLog(
            `Verba: ${effect.amount > 0 ? '+' : ''}${effect.amount} (${after} em caixa)`,
            effect.amount > 0 ? 'good' : 'bad',
          );
        }
        break;
      }
      case 'region': {
        const rs = next.regions[effect.region];
        next.regions = {
          ...next.regions,
          [effect.region]: {
            ...rs,
            player: clamp(rs.player + (effect.player ?? 0), 0, 100),
            opponent: clamp(rs.opponent + (effect.opponent ?? 0), 0, 100),
            undecided: clamp(rs.undecided + (effect.undecided ?? 0), 0, 100),
          },
        };
        break;
      }
      case 'regionAll': {
        const regions = {} as CampaignState['regions'];
        for (const [id, rs] of Object.entries(next.regions) as [
          RegionId,
          CampaignState['regions'][RegionId],
        ][]) {
          regions[id] = {
            ...rs,
            player: clamp(rs.player + (effect.player ?? 0), 0, 100),
            opponent: clamp(rs.opponent + (effect.opponent ?? 0), 0, 100),
            undecided: clamp(rs.undecided + (effect.undecided ?? 0), 0, 100),
          };
        }
        next.regions = regions;
        break;
      }
      case 'relation': {
        const before = next.relations[effect.who] ?? 0;
        next.relations[effect.who] = clamp(before + effect.amount, -100, 100);
        break;
      }
      case 'flag': {
        next.flags[effect.flag] = effect.value;
        break;
      }
      case 'faction': {
        const f: FactionId = effect.faction;
        next.factions = {
          ...next.factions,
          [f]: clamp((next.factions[f] ?? 50) + effect.amount, 0, 100),
        };
        break;
      }
      case 'unlockMission': {
        const mp = next.missions[effect.mission];
        if (mp && mp.status === 'locked') {
          next.missions = {
            ...next.missions,
            [effect.mission]: { ...mp, status: 'available' },
          };
          result.notices.push(`Nova missão disponível: ${effect.mission.toUpperCase()}`);
        }
        break;
      }
      case 'event': {
        if (!next.eventQueue.includes(effect.event) && !next.firedEvents.includes(effect.event)) {
          next.eventQueue = [...next.eventQueue, effect.event];
        }
        break;
      }
      case 'achievement': {
        if (!next.achievements.includes(effect.id)) {
          next.achievements = [...next.achievements, effect.id];
          result.notices.push(`Conquista desbloqueada: ${effect.id}`);
        }
        break;
      }
      case 'log':
        pushLog(effect.text, effect.tone ?? 'neutral');
        break;
      case 'decision': {
        next.counters.decisionId += 1;
        next.decisions = [
          ...next.decisions,
          {
            id: next.counters.decisionId,
            day: next.day,
            mission: 'livre',
            text: effect.text,
            consequences: [],
          },
        ];
        break;
      }
      case 'days': {
        next.day = clamp(next.day + effect.amount, 0, CAMPAIGN_DAYS);
        if (next.day >= FINAL_WEEK_START && next.phase === 'campaign') {
          next.phase = 'finalWeek';
          result.notices.push('A última semana começou.');
        }
        break;
      }
      case 'debateSkill': {
        next.debateSkill = clamp(next.debateSkill + effect.amount, 0, 100);
        break;
      }
    }
  }

  // Checagem de desbloqueio automático, conquistas e desfecho judicial ao
  // final de cada leva (o desfecho só resolve quando o atraso narrativo
  // permitir — ver rules/judgement.ts).
  const withUnlocks = applyMissionUnlocks(next);
  const withAchievements = runAchievementChecks(withUnlocks);
  const judged = resolveJudicialFate(withAchievements);
  if (judged.notice) result.notices.push(judged.notice);

  return { state: judged.state, result };
}

/**
 * Libera missões cujas condições `unlock` já foram satisfeitas.
 * Chamado após cada leva de efeitos: assim o jogador nunca fica travado por
 * esquecer de um desbloqueio explícito.
 */
function applyMissionUnlocks(state: CampaignState): CampaignState {
  let changed = false;
  const missions = { ...state.missions };
  for (const mission of MISSIONS) {
    const progress = missions[mission.id];
    if (progress && progress.status === 'locked' && evalAll(mission.unlock, state)) {
      missions[mission.id] = { ...progress, status: 'available' };
      changed = true;
    }
  }
  return changed ? { ...state, missions } : state;
}

/** Inicia a apuração eleitoral (usada pelo motor narrativo e pela tela final). */
export function startElection(state: CampaignState): CampaignState {
  const result = simulateElection(state);
  const next: CampaignState = {
    ...state,
    phase: 'election',
    electionResult: result,
  };
  return next;
}

export function relationOf(state: CampaignState, who: CharacterId): number {
  return state.relations[who] ?? 0;
}
