import type { StrategicActionDef } from '../types';

/**
 * Ações estratégicas do painel de campanha.
 * São o coração da camada de gerenciamento: custam verba e dias, produzem
 * efeitos regionais ou nacionais e interagem com as missões narrativas.
 */
export const STRATEGIC_ACTIONS: StrategicActionDef[] = [
  {
    id: 'comicio',
    name: 'Comício de praça',
    description:
      'Um comício clássico, com palanque alto e discurso curto. Barato, mas sensível ao humor do dia.',
    category: 'campanha',
    cost: { funds: 8, days: 1 },
    requiresRegion: true,
    regional: true,
    effects: [
      { t: 'attr', attr: 'popularity', amount: 1 },
      { t: 'attr', attr: 'loyalty', amount: 1 },
    ],
    preview: ['+5 de apoio na região alvo', '+1 popularidade', '+1 lealdade'],
  },
  {
    id: 'caravana',
    name: 'Caravana de trabalho',
    description:
      'Dois dias batendo estrada, visitando obras e ouvindo reclamações em campo aberto.',
    category: 'campanha',
    cost: { funds: 12, days: 2 },
    requiresRegion: true,
    regional: true,
    effects: [
      { t: 'attr', attr: 'popularity', amount: 2 },
      { t: 'attr', attr: 'loyalty', amount: 2 },
      { t: 'attr', attr: 'reputation', amount: 1 },
    ],
    preview: ['+8 de apoio na região alvo', '+2 popularidade', '+2 lealdade', '+1 reputação'],
  },
  {
    id: 'tv',
    name: 'Bloco de TV nacional',
    description:
      'Espaço pago em cadeia nacional. Alcance enorme — e uma conta que ninguém esquece.',
    category: 'campanha',
    cost: { funds: 24, days: 1 },
    requires: [{ t: 'attrGte', attr: 'influence', value: 30 }],
    effects: [
      { t: 'regionAll', player: 2.5 },
      { t: 'attr', attr: 'popularity', amount: 4 },
      { t: 'attr', attr: 'reputation', amount: -1 },
      { t: 'faction', faction: 'mercado', amount: 3 },
    ],
    preview: ['+2,5 de apoio em todas as regiões', '+4 popularidade', '−1 reputação'],
  },
  {
    id: 'digital',
    name: 'Campanha digital',
    description:
      'Vídeos curtos, memes autorais e um exércato de voluntários com muito café.',
    category: 'campanha',
    cost: { funds: 6, days: 1 },
    effects: [
      { t: 'regionAll', player: 1.5 },
      { t: 'attr', attr: 'influence', amount: 2 },
      { t: 'attr', attr: 'popularity', amount: 1 },
    ],
    preview: ['+1,5 de apoio em todas as regiões', '+2 influência', '+1 popularidade'],
  },
  {
    id: 'arrecadacao',
    name: 'Noite de arrecadação',
    description:
      'Jantar pago por apoiadores ricos. Enche o caixa e, de quebra, provoca olhares incômodos.',
    category: 'financas',
    cost: { funds: 3, days: 1 },
    effects: [
      { t: 'funds', amount: 20 },
      { t: 'attr', attr: 'reputation', amount: -2 },
      { t: 'faction', faction: 'mercado', amount: 6 },
    ],
    preview: ['+R$ 20 mi em caixa', '−2 reputação', '+6 apoio do mercado'],
  },
  {
    id: 'visita_institucional',
    name: 'Visita institucional',
    description:
      'Ronda de reuniões com servidores, tribunais de contas e entidades civis. Chato e essencial.',
    category: 'institucional',
    cost: { funds: 4, days: 1 },
    effects: [
      { t: 'attr', attr: 'institutionalTrust', amount: 5 },
      { t: 'attr', attr: 'influence', amount: 1 },
      { t: 'faction', faction: 'judiciario', amount: 3 },
    ],
    preview: ['+5 confiança institucional', '+1 influência', '+3 judiciário'],
  },
  {
    id: 'pacto_local',
    name: 'Pacto com lideranças locais',
    description:
      'Acordo com presidentes regionais do Partido Popular do Vale. Cada favor vira dívida.',
    category: 'aliancas',
    cost: { funds: 10, days: 1 },
    requiresRegion: true,
    regional: true,
    requires: [{ t: 'relationGte', who: 'sandoval', value: 20 }],
    effects: [
      { t: 'faction', faction: 'ppv', amount: 10 },
      { t: 'attr', attr: 'loyalty', amount: -2 },
      { t: 'relation', who: 'sandoval', amount: 5 },
    ],
    preview: ['+4 de apoio na região alvo', '+10 apoio do PPV', '−2 lealdade (seus aliados desconfiam)'],
  },
  {
    id: 'mutirao',
    name: 'Mutirão comunitário',
    description:
      'Pintura de escola, mutirão de limpeza e um microfone emprestado. Política de braços sujos.',
    category: 'campanha',
    cost: { funds: 4, days: 2 },
    requiresRegion: true,
    regional: true,
    effects: [
      { t: 'attr', attr: 'popularity', amount: 3 },
      { t: 'faction', faction: 'movimentos', amount: 5 },
    ],
    preview: ['+4 de apoio na região alvo', '+3 popularidade', '+5 movimentos sociais'],
  },
  {
    id: 'treino_debate',
    name: 'Preparação de debate',
    description:
      'Simulados, fichas de números e um assessor que faz o papel do adversário irritantemente bem.',
    category: 'debate',
    cost: { funds: 5, days: 1 },
    effects: [
      { t: 'debateSkill', amount: 8 },
      { t: 'attr', attr: 'influence', amount: 1 },
    ],
    preview: ['+8 de desempenho em debates', '+1 influência'],
  },
  {
    id: 'bastidores',
    name: 'Investigação de bastidores',
    description:
      'Contrata pesquisas e antecedentes sobre o adversário. É legal — mas ninguém aplaude.',
    category: 'institucional',
    cost: { funds: 12, days: 2 },
    requires: [{ t: 'attrGte', attr: 'influence', value: 40 }],
    effects: [
      { t: 'attr', attr: 'influence', amount: 4 },
      { t: 'attr', attr: 'reputation', amount: -3 },
      { t: 'relation', who: 'aurelio', amount: -10 },
      { t: 'faction', faction: 'imprensa', amount: -4 },
    ],
    preview: ['+4 influência', '−3 reputação', '−10 relação com Leandro Lacerda', '−4 imprensa'],
  },
];

export function actionDef(id: string): StrategicActionDef | undefined {
  return STRATEGIC_ACTIONS.find((a) => a.id === id);
}
