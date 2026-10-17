import { describe, expect, it } from 'vitest';
import { STRATEGIC_ACTIONS } from '@/game/data/actions';
import { performAction } from '@/game/rules/strategicActions';
import { createCampaignState } from '@/game/state/initialState';
import type { CampaignState, RegionId } from '@/game/types';

function fresh(): CampaignState {
  return createCampaignState({ seed: 31, difficulty: 'normal' });
}

describe('ações estratégicas', () => {
  it('toda ação tem custo, prévia e efeitos', () => {
    for (const action of STRATEGIC_ACTIONS) {
      expect(action.preview.length).toBeGreaterThan(0);
      expect(action.effects.length).toBeGreaterThan(0);
      expect(action.description.length).toBeGreaterThan(10);
    }
  });

  it('executa ação e desconta verba e dias', () => {
    const s = fresh();
    const outcome = performAction(s, 'comicio', 'sle');
    expect(outcome.error).toBeUndefined();
    expect(outcome.state.funds).toBe(s.funds - 8);
    expect(outcome.state.day).toBe(s.day + 1);
  });

  it('recusa ação sem verba', () => {
    const s = { ...fresh(), funds: 1 };
    const outcome = performAction(s, 'tv');
    expect(outcome.error).toMatch(/Verba insuficiente/i);
  });

  it('exige região alvo quando a ação é regional', () => {
    const outcome = performAction(fresh(), 'comicio');
    expect(outcome.error).toMatch(/região/i);
  });

  it('respeita requisitos de atributos', () => {
    const poor = fresh();
    poor.attributes.influence = 5;
    const outcome = performAction(poor, 'tv');
    expect(outcome.error).toMatch(/atributos/i);
  });

  it('retornos decrescem em região já investida', () => {
    let s = fresh();
    const first = performAction(s, 'comicio', 'sle').state;
    const gain1 = first.regions.sle.player - s.regions.sle.player;
    s = first;
    const second = performAction(s, 'comicio', 'sle').state;
    const gain2 = second.regions.sle.player - s.regions.sle.player;
    expect(gain2).toBeLessThan(gain1);
  });

  it('ação regional só afeta a região alvo', () => {
    const s = fresh();
    const outcome = performAction(s, 'comicio', 'isb');
    expect(outcome.state.regions.isb.player).toBeGreaterThan(s.regions.isb.player);
    expect(outcome.state.regions.vam.player).toBe(s.regions.vam.player);
  });

  it('ação nacional afeta todas as regiões', () => {
    const s = fresh();
    const outcome = performAction(s, 'digital');
    (Object.keys(s.regions) as RegionId[]).forEach((id) => {
      expect(outcome.state.regions[id].player).toBeGreaterThan(s.regions[id].player);
    });
  });

  it('arrecadação aumenta caixa e custa reputação', () => {
    const s = fresh();
    const outcome = performAction(s, 'arrecadacao');
    expect(outcome.state.funds).toBe(s.funds - 3 + 20);
    expect(outcome.state.attributes.reputation).toBeLessThan(s.attributes.reputation);
  });

  it('ação desconhecida é tratada', () => {
    expect(performAction(fresh(), 'nao_existe').error).toBeTruthy();
  });
});
