import { ACHIEVEMENTS } from '../data/achievements';
import { evalAll } from '../conditions';
import type { CampaignState } from '../types';

/**
 * Verifica conquistas e devolve um novo estado apenas quando algo mudou.
 * Efeitos colaterais: registra conquistas (sem duplicar) e avisa o jogador.
 */
export function runAchievementChecks(state: CampaignState): CampaignState {
  let current = state;
  for (const achievement of ACHIEVEMENTS) {
    if (current.achievements.includes(achievement.id)) continue;
    if (evalAll(achievement.when, current)) {
      current = {
        ...current,
        achievements: [...current.achievements, achievement.id],
      };
    }
  }
  return current;
}
