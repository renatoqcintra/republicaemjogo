import { createRng } from '../rng';
import { REGION_MAP, REGIONS } from '../data/regions';
import { clamp, round1, round2 } from '../rules/numbers';
import { DIFFICULTY } from '../constants';
import type { CampaignState, ElectionResult, IssueId, RegionBreakdown } from '../types';
/**
 * Sistema eleitoral determinístico.
 *
 * A apuração é uma função pura do estado da campanha + semente da partida.
 * Cada fator que move o resultado é registrado em "fatores" para que o jogador
 * entenda *por que* venceu ou perdeu — nada de número mágico sem explicação.
 *
 * Modelo simplificado (fictício):
 *   apoio_final = base_de_campanha + ajuste_de_issues + alianças + momentum
 *                 + debate + ruído(controlado) ± bônus da dificuldade
 *   não decididos são rateados pela atração relativa dos candidatos
 *   participação eleitoral cresce com popularidade e mobilização
 */

const ISSUE_WEIGHTS: Record<IssueId, { attr: [keyof CampaignState['attributes'], number][] }> = {
  economia: { attr: [['influence', 0.6], ['reputation', 0.4]] },
  trabalho: { attr: [['popularity', 0.6], ['loyalty', 0.4]] },
  seguranca: { attr: [['institutionalTrust', 0.5], ['reputation', 0.5]] },
  saude: { attr: [['popularity', 0.6], ['institutionalTrust', 0.4]] },
  educacao: { attr: [['popularity', 0.5], ['influence', 0.5]] },
  ambiente: { attr: [['reputation', 0.6], ['institutionalTrust', 0.4]] },
  justica: { attr: [['institutionalTrust', 0.8], ['reputation', 0.2]] },
  infraestrutura: { attr: [['influence', 0.5], ['loyalty', 0.3], ['influence', 0.2]] },
};

export function issueScore(state: CampaignState, issue: IssueId): number {
  const spec = ISSUE_WEIGHTS[issue];
  let score = 0;
  for (const [attr, weight] of spec.attr) {
    score += state.attributes[attr] * weight;
  }
  return clamp(score, 0, 100);
}

/** Score agregado do jogador nas prioridades de uma região (top 3). */
export function regionalIssueFit(state: CampaignState, regionId: keyof typeof REGION_MAP): number {
  const def = REGION_MAP[regionId];
  const top = def.priorities.slice(0, 3);
  const total = top.reduce((acc, issue) => acc + issueScore(state, issue), 0) / top.length;
  // O adversário é bom nas mesmas questões: parcela do score dele vem da estrutura.
  return total;
}

export function simulateElection(state: CampaignState): ElectionResult {
  const rng = createRng(state.seed ^ 0x9e3779b9);
  const difficulty = DIFFICULTY[state.difficulty];
  const regions: RegionBreakdown[] = [];
  const factorTotals = new Map<string, number>();

  const addFactor = (label: string, delta: number) => {
    factorTotals.set(label, (factorTotals.get(label) ?? 0) + delta);
  };

  const popularity = state.attributes.popularity;
  const influence = state.attributes.influence;
  const reputation = state.attributes.reputation;
  const trust = state.attributes.institutionalTrust;
  const loyalty = state.attributes.loyalty;

  const debateScore =
    typeof state.flags['debateFinalScore'] === 'number'
      ? (state.flags['debateFinalScore'] as number)
      : state.debateSkill * 0.6;
  const debateWon = state.flags['debateWon'] === true;
  const scandalPenalty = trust < 35 ? (35 - trust) * 0.12 : 0;

  // Penalidade por missões não concluídas: cada missão pendente custa votos.
  const ALL_MISSIONS = ['m1', 'm2', 'm3', 'm4', 'm5'] as const;
  const incompleteMissions = ALL_MISSIONS.filter(
    (id) => !state.completedMissions.includes(id) && !state.failedMissions.includes(id),
  );
  const missionPenalty = incompleteMissions.length * 2.5;

  // Conexão entre missões e apuração: a região priorizada no primeiro dia
  // (Missão 1) e a região do empurrão final (Missão 5) viram fatores
  // nomeados no resultado de cada região.
  const priorityRegion = typeof state.flags['priorityRegion'] === 'string' ? state.flags['priorityRegion'] : null;
  const finalPush = typeof state.flags['finalPush'] === 'string' ? state.flags['finalPush'] : null;

  let totalVotes = 0;
  let votesPlayer = 0;
  let votesOpponent = 0;

  for (const def of REGIONS) {
    const rs = state.regions[def.id];
    const factors: { label: string; delta: number }[] = [];
    const push = (label: string, delta: number) => {
      if (Math.abs(delta) < 0.01) return;
      factors.push({ label, delta: round1(delta) });
      addFactor(label, round1(delta * def.weight));
    };

    const fit = regionalIssueFit(state, def.id);
    push('Aderência às prioridades locais', (fit - 45) * 0.22);

    const allianceDelta = (def.playerAlliance - def.opponentAlliance) * 0.05 * (1 + influence / 250);
    push('Alianças locais', allianceDelta);

    const momentum = (popularity - 42) * 0.28;
    push('Momentum nacional (popularidade)', momentum);

    const orgStrength = (loyalty - 50) * 0.06;
    push('Mobilização da rede de aliados', orgStrength);

    if (priorityRegion === def.id) push('Base definida no primeiro dia', 1.6);
    if (finalPush === def.id) push('Empurrão final da campanha', 2.4);

    const mediaStance = (reputation - 45) * 0.12;
    push('Tratamento da imprensa', mediaStance);

    const debateDelta = (debateScore - 45) * 0.1 * (debateWon ? 1.3 : 1);
    push('Desempenho nos debates', debateDelta);

    if (scandalPenalty > 0) push('Crise institucional em curso', -scandalPenalty);
    if (trust >= 60) push('Confiança institucional elevada', (trust - 60) * 0.05);
    if (missionPenalty > 0) push('Missões da campanha não concluídas', -missionPenalty);

    const volatilityNoise = (rng() - 0.5) * 2 * def.volatility * 2.2;
    push('Variação regional (ruído da simulação)', volatilityNoise);

    // Suporte de campanha (base regional já acumulada) + fatores nacionais/regionais.
    const campaignGain = factors.reduce((a, f) => a + f.delta, 0);
    let playerFinal = clamp(rs.player + campaignGain, 0, 100);
    let opponentFinal = clamp(rs.opponent + difficulty.aiBonus, 0, 100);

    // Rateio dos não decididos pela atração relativa.
    const playerAttraction = Math.max(0.5, (state.attributes.influence + popularity) / 2 + fit * 0.4 + allianceDelta * 3);
    const opponentAttraction = Math.max(0.5, (46 + def.opponentAlliance / 3) + (def.id === 'plc' ? 6 : 0));
    const share = playerAttraction / (playerAttraction + opponentAttraction);
    const undecidedShare = rs.undecided;
    playerFinal = clamp(playerFinal + undecidedShare * share, 0, 100);
    opponentFinal = clamp(opponentFinal + undecidedShare * (1 - share), 0, 100);

    // Normalização simples para somar 100 na região.
    const sum = playerFinal + opponentFinal || 1;
    const playerPct = round2((playerFinal / sum) * 100);
    const opponentPct = round2(100 - playerPct);

    const turnout = clamp(0.74 + (popularity - 40) * 0.002 + (loyalty - 50) * 0.001, 0.6, 0.92);
    const regionVotes = Math.round(def.voters * turnout);
    const pv = Math.round((regionVotes * playerPct) / 100);
    const ov = regionVotes - pv;

    totalVotes += regionVotes;
    votesPlayer += pv;
    votesOpponent += ov;

    regions.push({
      region: def.id,
      name: def.name,
      weight: def.weight,
      playerPct,
      opponentPct,
      undecidedPct: 0,
      playerFinal: round1(playerFinal),
      opponentFinal: round1(opponentFinal),
      finalUndecided: 0,
      turnout: round2(turnout),
      votesPlayer: pv,
      votesOpponent: ov,
      factors: factors.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)),
    });
  }

  const playerPct = round2((votesPlayer / Math.max(1, totalVotes)) * 100);
  const opponentPct = round2((votesOpponent / Math.max(1, totalVotes)) * 100);
  const margin = Math.abs(playerPct - opponentPct);
  const winner = margin < 0.5 ? 'tie' : playerPct > opponentPct ? 'player' : 'opponent';

  const topFactors = [...factorTotals.entries()]
    .map(([label, delta]) => ({ label, delta: round1(delta) }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 8);

  return {
    playerPct,
    opponentPct,
    winner,
    regions,
    totalVotes,
    participation: round2(
      regions.reduce((a, r) => a + r.turnout * (REGION_MAP[r.region].weight / 100), 0),
    ),
    topFactors,
    disclaimer:
      'Simulação fictícia construída para fins de entretenimento. Não representa previsão, pesquisa ou resultado de eleição real. Regiões, partidos, personagens e votos são inventados.',
  };
}
