import type { RegionDef, RegionId } from '../types';

/**
 * Cinco regiões eleitorais fictícias da República.
 * Os nomes, características e pesos são inventados para a sátira —
 * não correspondem a nenhum estado, país ou eleição real.
 */
export const REGIONS: RegionDef[] = [
  {
    id: 'sle',
    code: 'SLE',
    name: 'Serra do Leste',
    profile:
      'Cordilheira industrial de sindicatos antigos e fábricas em reforma. O eleitorado quer emprego estável e respeito às convenções coletivas.',
    weight: 26,
    voters: 9_400_000,
    basePlayer: 31,
    baseOpponent: 39,
    baseUndecided: 30,
    priorities: ['trabalho', 'economia', 'educacao'],
    volatility: 0.7,
    opponentAlliance: 68,
    playerAlliance: 24,
  },
  {
    id: 'vam',
    code: 'VAM',
    name: 'Vale do Amanhã',
    profile:
      'Agroexportadora de fronteira: cooperativas, estradas de terra e um pragmatismo econômico quase filosófico.',
    weight: 24,
    voters: 8_100_000,
    basePlayer: 41,
    baseOpponent: 30,
    baseUndecided: 29,
    priorities: ['economia', 'infraestrutura', 'seguranca'],
    volatility: 0.4,
    opponentAlliance: 34,
    playerAlliance: 61,
  },
  {
    id: 'cvm',
    code: 'CVM',
    name: 'Costa Vermelha',
    profile:
      'Litoral turístico e portuário, dividido entre hotelaria, universidades e movimentos ambientalistas muito bem organizados.',
    weight: 22,
    voters: 7_600_000,
    basePlayer: 33,
    baseOpponent: 37,
    baseUndecided: 30,
    priorities: ['ambiente', 'educacao', 'saude'],
    volatility: 1,
    opponentAlliance: 58,
    playerAlliance: 33,
  },
  {
    id: 'plc',
    code: 'PLC',
    name: 'Planalto Central',
    profile:
      'Distrito administrativo de tribunais e ministérios. Eleitorado técnico, obcecado por probidade e continuidade institucional.',
    weight: 16,
    voters: 5_200_000,
    basePlayer: 27,
    baseOpponent: 41,
    baseUndecided: 32,
    priorities: ['justica', 'saude', 'economia'],
    volatility: 0.6,
    opponentAlliance: 62,
    playerAlliance: 19,
  },
  {
    id: 'isb',
    code: 'ISB',
    name: 'Ilhas de Santa Brígida',
    profile:
      'Arquipélago de pesca, porto franco e a maior concentração de rádios comunitárias do país. Volátil e orgulhoso.',
    weight: 12,
    voters: 3_900_000,
    basePlayer: 36,
    baseOpponent: 32,
    baseUndecided: 32,
    priorities: ['saude', 'infraestrutura', 'trabalho'],
    volatility: 1.2,
    opponentAlliance: 29,
    playerAlliance: 47,
  },
];

export const REGION_MAP: Record<RegionId, RegionDef> = Object.fromEntries(
  REGIONS.map((r) => [r.id, r]),
) as Record<RegionId, RegionDef>;

export function regionDef(id: RegionId): RegionDef {
  return REGION_MAP[id];
}
