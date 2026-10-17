import { describe, expect, it } from 'vitest';
import { simulateElection, regionalIssueFit, issueScore } from '@/game/election/election';
import { createCampaignState } from '@/game/state/initialState';
import { REGIONS } from '@/game/data/regions';
import { round2 } from '@/game/rules/numbers';
import type { CampaignState } from '@/game/types';

function fresh(seed = 7): CampaignState {
  return createCampaignState({ seed, difficulty: 'normal' });
}

describe('sistema eleitoral', () => {
  it('é determinístico para a mesma semente', () => {
    const a = simulateElection(fresh(99));
    const b = simulateElection(fresh(99));
    expect(a).toEqual(b);
  });

  it('muda com a semente (ruído regional controlado)', () => {
    const a = simulateElection(fresh(1));
    const b = simulateElection(fresh(2));
    expect(a.regions.map((r) => r.playerPct)).not.toEqual(b.regions.map((r) => r.playerPct));
  });

  it('percentuais nacionais somam ~100 e cobrem todas as regiões', () => {
    const result = simulateElection(fresh());
    expect(round2(result.playerPct + result.opponentPct)).toBeCloseTo(100, 1);
    expect(result.regions).toHaveLength(REGIONS.length);
    const totalWeight = result.regions.reduce((acc, r) => acc + r.weight, 0);
    expect(totalWeight).toBe(100);
  });

  it('winner é coerente com os percentuais', () => {
    const result = simulateElection(fresh(2024));
    if (result.winner === 'tie') {
      expect(Math.abs(result.playerPct - result.opponentPct)).toBeLessThan(0.5);
    } else if (result.winner === 'player') {
      expect(result.playerPct).toBeGreaterThan(result.opponentPct);
    } else {
      expect(result.opponentPct).toBeGreaterThan(result.playerPct);
    }
  });

  it('melhores atributos melhoram o resultado', () => {
    const weak = fresh(5);
    const strong: CampaignState = {
      ...fresh(5),
      attributes: { popularity: 80, influence: 80, reputation: 80, institutionalTrust: 80, loyalty: 80 },
      debateSkill: 90,
      flags: { debateFinalScore: 90, debateWon: true },
    };
    expect(simulateElection(strong).playerPct).toBeGreaterThan(simulateElection(weak).playerPct);
  });

  it('explica os fatores que influenciaram o resultado', () => {
    const result = simulateElection(fresh());
    expect(result.topFactors.length).toBeGreaterThan(0);
    expect(result.topFactors[0]?.label).toBeTruthy();
    expect(result.regions[0]?.factors.length).toBeGreaterThan(0);
  });

  it('contém aviso de que é simulação fictícia', () => {
    const result = simulateElection(fresh());
    expect(result.disclaimer).toMatch(/fictícia/i);
  });

  it('aderência regional considera as prioridades locais', () => {
    const high = { ...fresh(), attributes: { popularity: 90, influence: 90, reputation: 90, institutionalTrust: 90, loyalty: 90 } };
    const low = { ...fresh(), attributes: { popularity: 10, influence: 10, reputation: 10, institutionalTrust: 10, loyalty: 10 } };
    expect(regionalIssueFit(high, 'plc')).toBeGreaterThan(regionalIssueFit(low, 'plc'));
    expect(issueScore(high, 'justica')).toBeGreaterThan(issueScore(low, 'justica'));
  });

  it('votação respeita o eleitorado projetado', () => {
    const result = simulateElection(fresh());
    for (const r of result.regions) {
      expect(r.votesPlayer + r.votesOpponent).toBeGreaterThan(0);
      expect(r.turnout).toBeGreaterThan(0.5);
    }
    expect(result.totalVotes).toBeGreaterThan(0);
  });
});
