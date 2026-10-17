import { describe, expect, it } from 'vitest';
import { ENDINGS } from '@/game/data/endings';
import { evalAll } from '@/game/conditions';
import { createCampaignState } from '@/game/state/initialState';
import type { CampaignState } from '@/game/types';

/** Reproduz a ordem de avaliação usada pelo store. */
function endingFor(state: CampaignState): string {
  for (const ending of ENDINGS) {
    if (evalAll(ending.when, state)) return ending.id;
  }
  return 'derrota_digna';
}

function withFlags(flags: Record<string, boolean | number | string>): CampaignState {
  const base = createCampaignState({ seed: 1, difficulty: 'normal' });
  return { ...base, flags: { ...base.flags, ...flags } };
}

describe('finais alternativos', () => {
  it('vitória com revisão acolhida dá o final melhor', () => {
    const state = withFlags({ electionWon: true, fathersFate: 'revisao_ganha' });
    expect(endingFor(state)).toBe('vitoria_julgamento_limpo');
  });

  it('vitória com revisão negada mantém o processo aberto', () => {
    const state = withFlags({ electionWon: true, fathersFate: 'revisao_negada' });
    expect(endingFor(state)).toBe('vitoria_processo_aberto');
  });

  it('vitória com baixa confiança institucional vira ruptura', () => {
    const state = withFlags({ electionWon: true });
    expect(endingFor(state)).toBe('vitoria_ruptura');
  });

  it('derrota com lealdade baixa trai a campanha', () => {
    const base = withFlags({ electionWon: false });
    const state: CampaignState = {
      ...base,
      attributes: { ...base.attributes, loyalty: 30 },
    };
    expect(endingFor(state)).toBe('derrota_traicao');
  });

  it('derrota com reputação baixa leva ao silêncio estratégico', () => {
    const base = withFlags({ electionWon: false });
    const state: CampaignState = {
      ...base,
      attributes: { ...base.attributes, loyalty: 60, reputation: 40 },
    };
    expect(endingFor(state)).toBe('derrota_exilio');
  });

  it('derrota saudável mantém o nome limpo', () => {
    const base = withFlags({ electionWon: false });
    const state: CampaignState = {
      ...base,
      attributes: { ...base.attributes, loyalty: 60, reputation: 55 },
    };
    expect(endingFor(state)).toBe('derrota_digna');
  });

  it('empate nacional produz impasse', () => {
    const state = withFlags({ electionTie: true, electionWon: false });
    expect(endingFor(state)).toBe('impasse_apuracao');
  });

  it('retirada de candidatura é tratada', () => {
    const state = withFlags({ withdrew: true });
    expect(endingFor(state)).toBe('recuo_honroso');
  });

  it('ganhar eleição NÃO resolve o processo do pai sozinho', () => {
    // Sem flag fathersFate = revisao_ganha, a vitória nunca dá o final limpo.
    const state = withFlags({ electionWon: true, fathersFate: 'revisao_negada' });
    expect(endingFor(state)).not.toBe('vitoria_julgamento_limpo');
  });

  it('todos os finais têm texto narrativo', () => {
    for (const ending of ENDINGS) {
      expect(ending.text.length).toBeGreaterThan(1);
      expect(ending.title.length).toBeGreaterThan(3);
    }
  });
});
