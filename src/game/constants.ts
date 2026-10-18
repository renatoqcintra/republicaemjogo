import type { AttributeId, Difficulty, Settings } from './types';

export const SAVE_VERSION = 1;
export const SAVE_KEY = 'republica-em-jogo:save';
export const META_KEY = 'republica-em-jogo:meta';
export const SETTINGS_KEY = 'republica-em-jogo:settings';

export const CAMPAIGN_DAYS = 84; // 12 semanas fictícias
export const FINAL_WEEK_START = 77;

export const ATTR_MIN = 0;
export const ATTR_MAX = 100;
export const FUNDS_MIN = 0;

/** Rótulos em pt-BR dos atributos — usados no log, no painel e nas missões. */
export const ATTR_LABELS: Record<AttributeId, string> = {
  popularity: 'Popularidade',
  influence: 'Influência',
  reputation: 'Reputação',
  institutionalTrust: 'Confiança institucional',
  loyalty: 'Lealdade dos aliados',
};

export const INITIAL_FUNDS = 120; // R$ milhões fictícios
export const INITIAL_DEBATE_SKILL = 40;

export const INITIAL_ATTRIBUTES: Record<AttributeId, number> = {
  popularity: 38,
  influence: 30,
  reputation: 45,
  institutionalTrust: 35,
  loyalty: 55,
};

export const DIFFICULTY: Record<
  Difficulty,
  {
    label: string;
    description: string;
    costMultiplier: number;
    eventFrequency: number;
    tolerance: number; // margem extra de erro antes de penalidades severas
    startFunds: number;
    aiBonus: number; // bônus do adversário na apuração
  }
> = {
  facil: {
    label: 'Aprendiz de política',
    description:
      'Aliados pacientes, custos menores e uma imprensa um pouco mais tolerante. Recomendado para a primeira campanha.',
    costMultiplier: 0.8,
    eventFrequency: 0.8,
    tolerance: 15,
    startFunds: 140,
    aiBonus: 1,
  },
  normal: {
    label: 'Para-campo',
    description:
      'Custos e eventos equilibrados. O adversário joga sério e cada escolha pesa.',
    costMultiplier: 1,
    eventFrequency: 1,
    tolerance: 8,
    startFunds: 120,
    aiBonus: 2.5,
  },
  dificil: {
    label: 'Área restrita',
    description:
      'Custos mais altos, eventos frequentes e pouca margem para erro. Para quem já venceu antes.',
    costMultiplier: 1.25,
    eventFrequency: 1.35,
    tolerance: 3,
    startFunds: 105,
    aiBonus: 4,
  },
};

export const DEFAULT_SETTINGS: Settings = {
  volume: 0.6,
  muted: false,
  reducedMotion: 'auto',
  highContrast: false,
  showDiagnostics: false,
};

export const DISCIAMER_ELECTION =
  'Simulação fictícia construída para fins de entretenimento. Não representa previsão, pesquisa ou resultado de eleição real. Regiões, partidos, personagens e votos são inventados.';

export const GAME_TITLE = 'República em Jogo';
export const GAME_SUBTITLE = 'Uma sátira de estratégia política';
export const GAME_FICTION_NOTICE =
  'Todo o elenco, os partidos, as instituições e os acontecimentos são fictícios. Qualquer semelhança com pessoas ou fatos reais é mera coincidência.';
