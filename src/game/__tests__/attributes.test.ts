import { describe, expect, it } from 'vitest';
import { applyEffects } from '@/game/effects';
import { createCampaignState } from '@/game/state/initialState';
import type { CampaignState, Effect } from '@/game/types';

function fresh(difficulty: 'facil' | 'normal' | 'dificil' = 'normal'): CampaignState {
  return createCampaignState({ seed: 1234, difficulty });
}

function run(state: CampaignState, effects: Effect[]) {
  return applyEffects(state, effects, 'teste').state;
}

describe('alterações de atributos', () => {
  it('aplica deltas positivos e negativos', () => {
    const start = fresh();
    const base = start.attributes.popularity;
    const next = run(start, [{ t: 'attr', attr: 'popularity', amount: 10 }]);
    expect(next.attributes.popularity).toBe(Math.min(100, base + 10));

    const down = run(next, [{ t: 'attr', attr: 'popularity', amount: -20 }]);
    expect(down.attributes.popularity).toBe(Math.max(0, next.attributes.popularity - 20));
  });

  it('respeita limites de 0 a 100', () => {
    const start = fresh();
    const high = run(start, [{ t: 'attr', attr: 'reputation', amount: 500 }]);
    expect(high.attributes.reputation).toBe(100);

    const low = run(start, [{ t: 'attr', attr: 'loyalty', amount: -1000 }]);
    expect(low.attributes.loyalty).toBe(0);
  });

  it('não deixa a verba ficar negativa', () => {
    const start = fresh();
    const broke = run(start, [{ t: 'funds', amount: -99999 }]);
    expect(broke.funds).toBe(0);
  });

  it('registra efeitos no log com fonte', () => {
    const start = fresh();
    const next = run(start, [{ t: 'attr', attr: 'influence', amount: 5 }]);
    expect(next.log[0]?.source).toBe('teste');
    // O log exibe o rótulo em pt-BR, não a chave técnica do atributo.
    expect(next.log[0]?.text).toContain('Influência');
    expect(next.log[0]?.text).toContain('+5 (30 → 35)');
  });

  it('não duplica conquistas', () => {
    const start = fresh();
    const first = run(start, [{ t: 'achievement', id: 'primeiro_passo' }]);
    const second = run(first, [{ t: 'achievement', id: 'primeiro_passo' }]);
    expect(second.achievements.filter((a) => a === 'primeiro_passo')).toHaveLength(1);
  });

  it('registra decisões no histórico', () => {
    const start = fresh();
    const next = run(start, [{ t: 'decision', text: 'Testei o histórico' }]);
    expect(next.decisions).toHaveLength(1);
    expect(next.decisions[0]?.text).toBe('Testei o histórico');
  });

  it('é imutável: o estado original não muda', () => {
    const start = fresh();
    run(start, [{ t: 'attr', attr: 'popularity', amount: 30 }]);
    expect(start.attributes.popularity).toBe(38);
  });

  it('aplica a dificuldade corretamente nos valores iniciais', () => {
    expect(fresh('facil').funds).toBe(140);
    expect(fresh('normal').funds).toBe(120);
    expect(fresh('dificil').funds).toBe(105);
  });
});
