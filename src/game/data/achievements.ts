import type { AchievementDef } from '../types';

/**
 * Conquistas: checadas automaticamente após cada leva de efeitos.
 * São persistidas no progresso global (independem da campanha atual).
 */
export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'primeiro_passo',
    name: 'O sobrenome pesa',
    description: 'Conclua a primeira missão da campanha.',
    when: [{ t: 'missionDone', mission: 'm1' }],
  },
  {
    id: 'sobrevivente_judicial',
    name: 'Sobrevivente judicial',
    description:
      'Conclua "O processo" mantendo reputação e confiança institucional acima de 40.',
    when: [
      { t: 'missionDone', mission: 'm3' },
      { t: 'attrGte', attr: 'reputation', value: 40 },
      { t: 'attrGte', attr: 'institutionalTrust', value: 40 },
    ],
  },
  {
    id: 'caçador_de_fontes',
    name: 'Caçador de fontes',
    description: 'Descubra a origem do vídeo crítico antes de reagir a ele.',
    when: [{ t: 'flag', flag: 'videoSourceFound' }],
  },
  {
    id: 'mao_amiga',
    name: 'Mão amiga',
    description: 'Lealdade dos aliados em 75 ou mais.',
    when: [{ t: 'attrGte', attr: 'loyalty', value: 75 }],
  },
  {
    id: 'orador_do_ano',
    name: 'Orador do ano',
    description: 'Termine o debate final com desempenho de 70 ou mais.',
    when: [{ t: 'flag', flag: 'debateFinalScore' }, { t: 'flag', flag: 'debateWon' }],
  },
  {
    id: 'federalista',
    name: 'Federalista',
    description: 'Alcance 55 ou mais de apoio em quatro regiões simultaneamente.',
    when: [
      { t: 'all', of: [
        { t: 'regionSupportGte', region: 'sle', value: 55 },
        { t: 'regionSupportGte', region: 'vam', value: 55 },
        { t: 'regionSupportGte', region: 'cvm', value: 55 },
        { t: 'regionSupportGte', region: 'isb', value: 55 },
      ] },
    ],
  },
  {
    id: 'caixa_limpo',
    name: 'Caixa limpo',
    description: 'Chegue à última semana com reputação 60+ e verba acima de 40.',
    when: [
      { t: 'phase', value: 'finalWeek' },
      { t: 'attrGte', attr: 'reputation', value: 60 },
      { t: 'fundsGte', value: 40 },
    ],
  },
  {
    id: 'coragem_civil',
    name: 'Coragem civil',
    description: 'Recuse um acordo que beneficiaria o julgamento do seu pai.',
    when: [{ t: 'flag', flag: 'refusedFathersDeal' }],
  },
  {
    id: 'pleno_voto',
    name: 'Pleno voto',
    description: 'Vença a eleição nacional com 50% ou mais dos votos simulados.',
    when: [{ t: 'flag', flag: 'nationalPlayerPct' }],
  },
];

export const ACHIEVEMENT_MAP: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
);
