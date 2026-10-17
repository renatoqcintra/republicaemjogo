import type { CampaignState, Condition } from './types';

/**
 * Avaliador de condições declarativas.
 * Função pura: lê o estado e devolve true/false. Nenhum efeito colateral.
 */
export function evalCondition(cond: Condition, state: CampaignState): boolean {
  switch (cond.t) {
    case 'attrGte':
      return state.attributes[cond.attr] >= cond.value;
    case 'attrLte':
      return state.attributes[cond.attr] <= cond.value;
    case 'fundsGte':
      return state.funds >= cond.value;
    case 'fundsLte':
      return state.funds <= cond.value;
    case 'flag': {
      const v = state.flags[cond.flag];
      if (cond.equals === undefined) {
        // Sem "equals": a condição é satisfeita quando a flag existe e é truthy.
        return v === true || (typeof v === 'string' && v.length > 0) || (typeof v === 'number' && v !== 0);
      }
      return v === cond.equals;
    }
    case 'relationGte':
      return (state.relations[cond.who] ?? 0) >= cond.value;
    case 'relationLte':
      return (state.relations[cond.who] ?? 0) <= cond.value;
    case 'regionSupportGte':
      return state.regions[cond.region].player >= cond.value;
    case 'regionSupportLte':
      return state.regions[cond.region].player <= cond.value;
    case 'factionGte':
      return (state.factions[cond.faction] ?? 0) >= cond.value;
    case 'factionLte':
      return (state.factions[cond.faction] ?? 0) <= cond.value;
    case 'missionDone':
      return state.completedMissions.includes(cond.mission);
    case 'missionFailed':
      return state.failedMissions.includes(cond.mission);
    case 'missionAvailable':
      return state.missions[cond.mission]?.status === 'available';
    case 'daysGte':
      return state.day >= cond.value;
    case 'daysLte':
      return state.day <= cond.value;
    case 'phase':
      return state.phase === cond.value;
    case 'achievement':
      return state.achievements.includes(cond.id);
    case 'endingUnlocked':
      return state.ending === cond.id;
    case 'not':
      return !evalCondition(cond.of, state);
    case 'any':
      return cond.of.some((c) => evalCondition(c, state));
    case 'all':
      return cond.of.every((c) => evalCondition(c, state));
    default: {
      const never: never = cond;
      void never;
      return false;
    }
  }
}

export function evalAll(conds: Condition[] | undefined, state: CampaignState): boolean {
  if (!conds || conds.length === 0) return true;
  return conds.every((c) => evalCondition(c, state));
}

export function evalAny(conds: Condition[] | undefined, state: CampaignState): boolean {
  if (!conds || conds.length === 0) return false;
  return conds.some((c) => evalCondition(c, state));
}

/** Explicação legível de uma condição — usada em dicas de interface. */
export function describeCondition(cond: Condition): string {
  switch (cond.t) {
    case 'attrGte':
      return `${cond.attr} ≥ ${cond.value}`;
    case 'attrLte':
      return `${cond.attr} ≤ ${cond.value}`;
    case 'fundsGte':
      return `verba ≥ ${cond.value}`;
    case 'fundsLte':
      return `verba ≤ ${cond.value}`;
    case 'flag':
      return `sinal "${cond.flag}"`;
    case 'relationGte':
      return `relação com ${cond.who} ≥ ${cond.value}`;
    case 'relationLte':
      return `relação com ${cond.who} ≤ ${cond.value}`;
    case 'regionSupportGte':
      return `${cond.region} ≥ ${cond.value}`;
    case 'regionSupportLte':
      return `${cond.region} ≤ ${cond.value}`;
    case 'factionGte':
      return `facção ${cond.faction} ≥ ${cond.value}`;
    case 'factionLte':
      return `facção ${cond.faction} ≤ ${cond.value}`;
    case 'missionDone':
      return `missão ${cond.mission} concluída`;
    case 'missionFailed':
      return `missão ${cond.mission} falhou`;
    case 'missionAvailable':
      return `missão ${cond.mission} disponível`;
    case 'daysGte':
      return `dia ≥ ${cond.value}`;
    case 'daysLte':
      return `dia ≤ ${cond.value}`;
    case 'phase':
      return `fase ${cond.value}`;
    case 'achievement':
      return `conquista ${cond.id}`;
    case 'endingUnlocked':
      return `final ${cond.id}`;
    case 'not':
      return `não: ${describeCondition(cond.of)}`;
    case 'any':
      return cond.of.map(describeCondition).join(' ou ');
    case 'all':
      return cond.of.map(describeCondition).join(' e ');
    default:
      return 'condição';
  }
}
