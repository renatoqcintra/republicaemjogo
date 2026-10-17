import { actionDef } from '../data/actions';
import { applyEffects } from '../effects';
import { evalAll } from '../conditions';
import { unlockPass } from '../engine/missionEngine';
import { clamp } from './numbers';
import { regionDef } from '../data/regions';
import type { CampaignState, Effect, RegionId } from '../types';

export interface ActionOutcome {
  state: CampaignState;
  notices: string[];
  error?: string;
}

/**
 * Executa uma ação estratégica do painel.
 * - Verifica requisitos e custos (com multiplicador de dificuldade).
 * - Aplica retornos decrescentes por região já muito investida.
 * - Avança o calendário da campanha.
 */
export function performAction(
  state: CampaignState,
  actionId: string,
  regionId?: RegionId,
): ActionOutcome {
  const def = actionDef(actionId);
  if (!def) return { state, notices: [], error: 'Ação desconhecida.' };

  if (!evalAll(def.requires, state)) {
    return { state, notices: [], error: 'Seus atributos atuais não permitem esta ação.' };
  }
  if (def.requiresRegion && !regionId) {
    return { state, notices: [], error: 'Escolha uma região como alvo desta ação.' };
  }

  const costFunds =
    def.cost.funds !== undefined ? Math.ceil(def.cost.funds * costMultiplier(state)) : undefined;
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
    day: clamp(state.day + (def.cost.days ?? 0), 1, 56),
  };

  // Efeitos regionais com retornos decrescentes.
  if (def.regional && regionId) {
    const rs = working.regions[regionId];
    const def2 = regionDef(regionId);
    const bonusFromPriorities = def2.priorities.slice(0, 2).length * 0.4; // regiões afins rendem mais
    const diminishing = 1 - clamp(rs.investment * 0.06, 0, 0.55);
    const rawGain =
      (def.id === 'caravana' ? 8 : def.id === 'comicio' ? 5 : def.id === 'pacto_local' ? 4 : 4) *
      diminishing *
      (1 + bonusFromPriorities / 10);
    working = {
      ...working,
      regions: {
        ...working.regions,
        [regionId]: {
          ...rs,
          player: clamp(rs.player + rawGain, 0, 100),
          investment: rs.investment + 1,
        },
      },
    };
  }

  // Efeitos nacionais/regionais declarados (o alvo já foi tratado acima).
  const nonRegional: Effect[] = def.effects.filter((e) => e.t !== 'region');
  const applied = applyEffects(working, nonRegional, def.name);

  const regionText = regionId ? ` em ${regionDef(regionId).name}` : '';
  let next = unlockPass(applied.state);
  next = {
    ...next,
    log: [
      {
        id: next.counters.logId + 1,
        day: next.day,
        text: `Ação executada: ${def.name}${regionText}.`,
        tone: 'neutral',
        source: 'Painel estratégico',
      },
      ...next.log,
    ],
    counters: { ...next.counters, logId: next.counters.logId + 1 },
  };

  return { state: next, notices: [`Ação concluída: ${def.name}${regionText}.`] };
}

export function costMultiplier(state: CampaignState): number {
  if (state.difficulty === 'facil') return 0.8;
  if (state.difficulty === 'dificil') return 1.25;
  return 1;
}
