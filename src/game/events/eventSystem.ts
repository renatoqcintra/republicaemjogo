import { EVENTS, EVENT_MAP } from '../data/events';
import { evalAll } from '../conditions';
import { applyEffects } from '../effects';
import { unlockPass } from '../engine/missionEngine';
import { createRng } from '../rng';
import { clamp } from '../rules/numbers';
import { DIFFICULTY } from '../constants';
import type { CampaignState, EventDef, EventId } from '../types';

export interface EventOutcome {
  state: CampaignState;
  notices: string[];
  error?: string;
}

/** Eventos elegíveis no estado atual (condições ok, ainda não disparados). */
export function eligibleEvents(state: CampaignState, limit = 5): EventDef[] {
  return EVENTS.filter(
    (e) =>
      !state.firedEvents.includes(e.id) &&
      !state.eventQueue.includes(e.id) &&
      evalAll(e.when, state),
  )
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}

/**
 * Sorteia eventos do dia de forma determinística (semente da partida).
 * A frequência é controlada pela dificuldade — nunca há sorte pura, apenas
 * escolha entre eventos já elegíveis.
 *
 * Dois mecanismos convivem:
 * 1. **Eventos de arco garantidos** (`guaranteed`): entram na fila no primeiro
 *    dia em que suas condições valem, sem sorteio — aberturas de arco e
 *    consequências de decisões não podem ficar de fora por azar.
 * 2. **Sorteio ordinário**: 2 vagas para os maiores prioridades + 1 vaga
 *    sorteada entre TODOS os demais elegíveis — prioridade manda, mas nenhum
 *    evento elegível fica permanentemente sem chance (o topo-3 puro sufocava
 *    eventos de prioridade baixa em campanhas com muitos eventos elegíveis).
 */
export function rollDailyEvents(state: CampaignState): CampaignState {
  if (state.phase === 'ended' || state.phase === 'election') return state;
  // Campanha encerrada: não sorteia novos eventos.
  if (state.day >= 56) return state;

  const must = EVENTS.filter(
    (e) =>
      e.guaranteed &&
      !state.firedEvents.includes(e.id) &&
      !state.eventQueue.includes(e.id) &&
      evalAll(e.when, state),
  ).sort((a, b) => b.priority - a.priority)[0];
  if (must) {
    return { ...state, eventQueue: [...state.eventQueue, must.id] };
  }

  const rng = createRng((state.seed ^ (state.day * 2654435761)) >>> 0);
  const freq = DIFFICULTY[state.difficulty].eventFrequency;
  const chanceRoll = rng();
  if (chanceRoll > 0.45 * freq) return state;

  const eligible = eligibleEvents(state, EVENTS.length);
  if (eligible.length === 0) return state;
  const rest = eligible.slice(2);
  const candidates = rest.length
    ? [...eligible.slice(0, 2), rest[Math.floor(rng() * rest.length)]]
    : eligible;
  const chosen = candidates[Math.floor(rng() * candidates.length)];
  return {
    ...state,
    eventQueue: [...state.eventQueue, chosen.id],
  };
}

export function nextPendingEvent(state: CampaignState): EventDef | null {
  const id = state.eventQueue[0];
  return id ? EVENT_MAP[id] ?? null : null;
}

/** Resolve o evento pendente com a escolha do jogador. */
export function resolveEvent(
  state: CampaignState,
  eventId: EventId,
  choiceId: string,
): EventOutcome {
  const def = EVENT_MAP[eventId];
  if (!def) return { state, notices: [], error: 'Evento desconhecido.' };
  if (state.eventQueue[0] !== eventId) {
    return { state, notices: [], error: 'Este evento não está mais pendente.' };
  }
  // Campanha encerrada: não permite mais eventos.
  if (state.day >= 56) {
    return {
      state,
      notices: [],
      error: 'A campanha chegou ao fim. Encerre a apuração para ver o resultado.',
    };
  }
  const choice = def.choices.find((c) => c.id === choiceId);
  if (!choice) return { state, notices: [], error: 'Escolha inválida.' };
  if (!evalAll(choice.requires, state)) {
    return { state, notices: [], error: 'Requisitos não atendidos.' };
  }
  const costFunds = choice.cost?.funds;
  if (costFunds !== undefined && state.funds < costFunds) {
    return {
      state,
      notices: [],
      error: `Verba insuficiente: necessário R$ ${costFunds} mi, disponível R$ ${state.funds} mi.`,
    };
  }

  let working: CampaignState = {
    ...state,
    funds: costFunds !== undefined ? state.funds - costFunds : state.funds,
    day: clamp(state.day + (choice.cost?.days ?? 0), 1, 56),
    eventQueue: state.eventQueue.slice(1),
    firedEvents: state.firedEvents.includes(eventId)
      ? state.firedEvents
      : [...state.firedEvents, eventId],
  };

  if (choice.summary) {
    working = {
      ...working,
      counters: { ...working.counters, decisionId: working.counters.decisionId + 1 },
      decisions: [
        ...working.decisions,
        {
          id: working.counters.decisionId + 1,
          day: working.day,
          mission: 'livre',
          missionTitle: def.title,
          text: choice.summary!,
          consequences: [],
        },
      ],
    };
  }

  const applied = applyEffects(working, choice.effects, def.title);
  let next = unlockPass(applied.state);
  next = {
    ...next,
    log: [
      {
        id: next.counters.logId + 1,
        day: next.day,
        text: `${def.title}: ${choice.label}`,
        tone: 'story',
        source: 'Evento',
      },
      ...next.log,
    ],
    counters: { ...next.counters, logId: next.counters.logId + 1 },
  };

  return { state: next, notices: [`Evento resolvido: ${def.title}`] };
}

/** Marca uma missão como origem do evento e força sua entrada na fila. */
export function queueEvent(state: CampaignState, eventId: EventId): CampaignState {
  if (state.eventQueue.includes(eventId) || state.firedEvents.includes(eventId)) return state;
  return { ...state, eventQueue: [...state.eventQueue, eventId] };
}
