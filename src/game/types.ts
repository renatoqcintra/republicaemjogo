/**
 * Tipos centais de República em Jogo.
 *
 * Este arquivo é a espinha dorsal de todo o jogo: estado da partida, motor
 * narrativo, sistema eleitoral, eventos e salvamento compartilham estes tipos.
 * Regra geral: conteúdo declarativo (dados) + interpretador (motor puro e testável).
 */

// ---------------------------------------------------------------------------
// Atributos e recursos
// ---------------------------------------------------------------------------

export const ATTRIBUTES = [
  'popularity',
  'influence',
  'reputation',
  'institutionalTrust',
  'loyalty',
] as const;

export type AttributeId = (typeof ATTRIBUTES)[number];

export type Attributes = Record<AttributeId, number>;

export type Difficulty = 'facil' | 'normal' | 'dificil';

// ---------------------------------------------------------------------------
// Regiões eleitorais
// ---------------------------------------------------------------------------

export const ISSUES = [
  'economia',
  'trabalho',
  'seguranca',
  'saude',
  'educacao',
  'ambiente',
  'justica',
  'infraestrutura',
] as const;

export type IssueId = (typeof ISSUES)[number];

export type RegionId = 'sle' | 'vam' | 'cvm' | 'plc' | 'isb';

export interface RegionDef {
  id: RegionId;
  code: string;
  name: string;
  profile: string;
  /** Peso da região na apuração nacional (soma 100). */
  weight: number;
  /** Votos nominais fictícios (apenas para exibição). */
  voters: number;
  /** Suporte inicial do candidato do jogador (0–100). */
  basePlayer: number;
  /** Suporte inicial do adversário (0–100). */
  baseOpponent: number;
  /** Não decididos (0–100); complementa a soma inicial. */
  baseUndecided: number;
  /** Prioridades do eleitorado, da mais forte para a mais fraca. */
  priorities: IssueId[];
  /** Quanto a região reage a escândalos e boas notícias (0–1). */
  volatility: number;
  /** Força das alianças locais do adversário (0–100). */
  opponentAlliance: number;
  /** Força das alianças locais acessíveis ao jogador (0–100). */
  playerAlliance: number;
}

export interface RegionState {
  /** Suporte atual do jogador na região (0–100). */
  player: number;
  /** Suporte atual do adversário (0–100). */
  opponent: number;
  /** Não decididos atuais (0–100). */
  undecided: number;
  /** Nível de investimento de campanha já feito (impacta retornos decrescentes). */
  investment: number;
}

// ---------------------------------------------------------------------------
// Personagens
// ---------------------------------------------------------------------------

export type CharacterId =
  | 'rafael'
  | 'aurelio'
  | 'helio'
  | 'zorana'
  | 'bento'
  | 'camurca'
  | 'dulcinea'
  | 'iris'
  | 'amaro'
  | 'vera'
  | 'salome'
  | 'sandoval'
  | 'lutero'
  | 'dante'
  | 'caetano'
  | 'tiago';

export interface CharacterDef {
  id: CharacterId;
  name: string;
  role: string;
  faction: string;
  bio: string;
  personality: string;
  interests: string[];
  secret: string;
  /** Relação inicial com o protagonista (-100 a 100). */
  baseRelation: number;
  /**
   * Alinhamento político estático (-100 a 100): proximidade programática com a
   * plataforma de Fábio Barreto. Diferente de `baseRelation` (afeto pessoal) e
   * de `state.factions` (lealdade dinâmica das facções): dois personagens do
   * mesmo partido podem ter relação ruim, e adversários podem se respeitar.
   */
  alignment: number;
  /** Descrição da postura inicial para exibição. */
  initialStance: string;
  /** Retrato (gerado por SVG determinístico a partir destes parâmetros). */
  portrait: PortraitSpec;
}

export interface PortraitSpec {
  skin: string;
  hair: string;
  /**
   * Estilo do cabelo. 'bald' = careca total (sem fios); 'long' e 'bun' têm
   * silhueta feminina; 'back' = penteado para trás; 'swoop' = penteado
   * volumoso para trás e de lado.
   */
  hairStyle:
    | 'short'
    | 'long'
    | 'bald'
    | 'curly'
    | 'cap'
    | 'receding'
    | 'wave'
    | 'bun'
    | 'back'
    | 'swoop';
  /** Formato do rosto: varia a silhueta da cabeça para diferenciar personagens. */
  faceShape: 'oval' | 'round' | 'square' | 'long';
  /** Idade aparente: 'senior' acrescenta rugas sutis; 'young', rosto liso. */
  age: 'young' | 'middle' | 'senior';
  /** Vestuário: muda gola/ombros (terno, camisa social, blusa-gola alta, jaqueta). */
  outfit: 'suit' | 'shirt' | 'turtleneck' | 'jacket' | 'robe';
  coat: string;
  accent: string;
  glasses: boolean;
  /** 'full' inclui bigode; 'mustache' desenha apenas o bigode. */
  beard: 'none' | 'short' | 'full' | 'mustache';
  accessory: 'none' | 'pin' | 'earpiece' | 'scarf' | 'tie' | 'earrings';
  /** Boca: 'thin' padrão, 'soft' com volume (maquiagem), 'smile' curvada. */
  lips?: 'thin' | 'soft' | 'smile';
  /** Espessura da sobrancelha (usa a cor do cabelo). Padrão: 'normal'. */
  brows?: 'thin' | 'normal' | 'thick';
}

// ---------------------------------------------------------------------------
// Condições (declarativas, avaliadas por conditions.ts)
// ---------------------------------------------------------------------------

export type Condition =
  | { t: 'attrGte'; attr: AttributeId; value: number }
  | { t: 'attrLte'; attr: AttributeId; value: number }
  | { t: 'fundsGte'; value: number }
  | { t: 'fundsLte'; value: number }
  | { t: 'flag'; flag: string; equals?: boolean | number | string }
  | { t: 'relationGte'; who: CharacterId; value: number }
  | { t: 'relationLte'; who: CharacterId; value: number }
  | { t: 'regionSupportGte'; region: RegionId; value: number }
  | { t: 'regionSupportLte'; region: RegionId; value: number }
  | { t: 'factionGte'; faction: FactionId; value: number }
  | { t: 'factionLte'; faction: FactionId; value: number }
  | { t: 'missionDone'; mission: MissionId }
  | { t: 'missionFailed'; mission: MissionId }
  | { t: 'missionAvailable'; mission: MissionId }
  | { t: 'daysGte'; value: number }
  | { t: 'daysLte'; value: number }
  | { t: 'phase'; value: CampaignPhase }
  | { t: 'achievement'; id: AchievementId }
  | { t: 'endingUnlocked'; id: EndingId }
  | { t: 'not'; of: Condition }
  | { t: 'any'; of: Condition[] }
  | { t: 'all'; of: Condition[] };

// ---------------------------------------------------------------------------
// Efeitos (declarativos, aplicados por effects.ts)
// ---------------------------------------------------------------------------

export type Effect =
  | { t: 'attr'; attr: AttributeId; amount: number }
  | { t: 'funds'; amount: number }
  | { t: 'region'; region: RegionId; player?: number; opponent?: number; undecided?: number }
  | { t: 'regionAll'; player?: number; opponent?: number; undecided?: number }
  | { t: 'relation'; who: CharacterId; amount: number }
  | { t: 'flag'; flag: string; value: boolean | number | string }
  | { t: 'unlockMission'; mission: MissionId }
  | { t: 'event'; event: EventId }
  | { t: 'achievement'; id: AchievementId }
  | { t: 'log'; text: string; tone?: LogTone }
  | { t: 'decision'; text: string }
  | { t: 'days'; amount: number }
  | { t: 'debateSkill'; amount: number }
  | { t: 'faction'; faction: FactionId; amount: number };

export type FactionId = 'prn' | 'ppv' | 'imprensa' | 'judiciario' | 'mercado' | 'movimentos';

// ---------------------------------------------------------------------------
// Missões
// ---------------------------------------------------------------------------

export type MissionId = 'm1' | 'm2' | 'm3' | 'm4' | 'm5';

export interface MissionObjective {
  id: string;
  text: string;
  optional?: boolean;
  /** Condições que marcam o objetivo como concluído (registradas no estado). */
  completeWhen?: Condition[];
}

export interface MissionChoice {
  id: string;
  label: string;
  description?: string;
  hint?: string;
  /** A escolha só aparece se as condições forem verdadeiras. */
  requires?: Condition[];
  /** Custo verificado antes de permitir a escolha. */
  cost?: MissionCost;
  effects?: Effect[];
  next?: string;
  completes?: boolean;
  /** Registro no histórico de decisões. */
  summary?: string;
}

export interface MissionCost {
  funds?: number;
  days?: number;
}

export type MissionNode =
  | {
      t: 'dialogue';
      speaker?: CharacterId;
      speakerLabel?: string;
      text: string;
      effects?: Effect[];
      next: string;
    }
  | { t: 'choice'; prompt: string; speaker?: CharacterId; choices: MissionChoice[] }
  | { t: 'end'; text: string; effects?: Effect[] };

export interface MissionDef {
  id: MissionId;
  phase: 1 | 2 | 3 | 4 | 5;
  title: string;
  tagline: string;
  intro: string[];
  context: string;
  characters: CharacterId[];
  objectives: MissionObjective[];
  /** Condições para a missão aparecer como disponível. */
  unlock: Condition[];
  startNode: string;
  nodes: Record<string, MissionNode>;
  /** A missão falha se qualquer condição for verdadeira (com aviso ao jogador). */
  failWhen?: Condition[];
  onFail?: { text: string; effects: Effect[] };
  completion: { summary: string; effects: Effect[] };
  /** Missões liberadas ao concluir. */
  next: MissionId[];
}

export type MissionStatus = 'locked' | 'available' | 'active' | 'done' | 'failed';

export interface MissionProgress {
  status: MissionStatus;
  currentNode: string | null;
  completedObjectives: string[];
  started: boolean;
}

// ---------------------------------------------------------------------------
// Eventos inesperados
// ---------------------------------------------------------------------------

export interface EventChoice {
  id: string;
  label: string;
  description?: string;
  requires?: Condition[];
  cost?: MissionCost;
  effects: Effect[];
  summary?: string;
}

export interface EventDef {
  id: EventId;
  title: string;
  text: string;
  portrait?: CharacterId;
  /** Condições mínimas para o evento entrar na fila. */
  when: Condition[];
  /** Prioridade maior dispara primeiro. */
  priority: number;
  /** Uma vez disparado, não repete. */
  once: boolean;
  /**
   * Evento de arco: assim que as condições `when` ficam verdadeiras, entra na
   * fila no próximo avanço de dia — sem depender do sorteio diário (que só
   * escolhe entre os eventos ordinários). Garante que aberturas de arco e
   * consequências de decisões sejam sempre alcançáveis em qualquer campanha.
   */
  guaranteed?: boolean;
  choices: EventChoice[];
}

export const EVENT_IDS = [
  'aliado_vira',
  'documento_contradiz',
  'entrevista_bomba',
  'empresario_sai',
  'jornalista_descobre',
  'crise_diplomatica',
  'revelacao_antiga',
  'negocia_imprevisto',
  'greve_nacional',
  'apagao_midia',
  'vazamento_familiar',
  'debate_ultimato',
  'dante_proposta',
  'black_stallion',
  'documentario_republica',
  'dante_conflito',
  'caetano_articulacao',
  'tiago_gestao',
  'andre_tribunal',
  'bastidores_publicados',
  // Expansão narrativa (Rodada 7) — arcos de Felipe Azevedo, Caetano Góis,
  // Tiago Farias, Dante Valverde e presença distribuída do elenco.
  'pacote_economico',
  'diretorio_partido',
  'silvio_oferta',
  'pedro_pesquisa',
  'caetano_critica',
  'daniela_parecer',
  'debate_economico',
  'tiago_contato',
  'rafael_mobiliza',
  'valdemar_cobranca',
  'karsavia_contrapartida',
  'crise_orcamentaria',
  'dante_credito',
  'dante_divida',
  'caetano_exigencias',
  'tiago_ascensao',
  'gilberto_fechamento',
  'equipe_abalada',
  // Rodada 9 — Rafael Sampaio e o Movimento Nacional de Renovação (MNR):
  // organização independente, com agenda própria; sem apoio inicial a
  // candidato algum.
  'mnr_mobilizacao',
  'mnr_negociacao',
  'mnr_pragonismo',
  'mnr_regional',
  'mnr_bases',
  'contrato_mentoria',
  'mnr_crise_autonomia',
  'mnr_definicao',
] as const;

export type EventId = (typeof EVENT_IDS)[number];

export interface PendingEvent {
  eventId: EventId;
  /** Escolha já resolvida (o evento deixa de ficar pendente). */
  resolvedChoiceId?: string;
}

// ---------------------------------------------------------------------------
// Finais e conquistas
// ---------------------------------------------------------------------------

export type EndingId =
  | 'vitoria_julgamento_limpo'
  | 'vitoria_processo_aberto'
  | 'vitoria_ruptura'
  | 'derrota_digna'
  | 'derrota_traicao'
  | 'derrota_exilio'
  | 'impasse_apuracao'
  | 'recuo_honroso';

export interface EndingDef {
  id: EndingId;
  title: string;
  tone: 'vitoria' | 'derrota' | 'neutro';
  /** Condições verificadas em ordem; a primeira verdadeira vence. */
  when: Condition[];
  text: string[];
  electoralSummary?: string;
}

export const ACHIEVEMENT_IDS = [
  'primeiro_passo',
  'sobrevivente_judicial',
  'caçador_de_fontes',
  'mao_amiga',
  'orador_do_ano',
  'federalista',
  'caixa_limpo',
  'coragem_civil',
  'pleno_voto',
] as const;

export type AchievementId = (typeof ACHIEVEMENT_IDS)[number];

export interface AchievementDef {
  id: AchievementId;
  name: string;
  description: string;
  when: Condition[];
}

// ---------------------------------------------------------------------------
// Ações estratégicas (camada de gerenciamento)
// ---------------------------------------------------------------------------

export interface StrategicActionDef {
  id: string;
  name: string;
  description: string;
  category: 'campanha' | 'financas' | 'aliancas' | 'institucional' | 'debate';
  cost: MissionCost;
  /** Alvo regional obrigatório para ações regionalizadas. */
  requiresRegion?: boolean;
  effects: Effect[];
  requires?: Condition[];
  /** Efeito exibido ao jogador antes de confirmar. */
  preview: string[];
  /** Reduz o efeito quando a região já foi muito investida (retornos decrescentes). */
  regional?: boolean;
}

// ---------------------------------------------------------------------------
// Estado da partida
// ---------------------------------------------------------------------------

export type CampaignPhase = 'intro' | 'campaign' | 'finalWeek' | 'election' | 'ended';

export type LogTone = 'good' | 'bad' | 'neutral' | 'story';

export interface LogEntry {
  id: number;
  day: number;
  text: string;
  tone: LogTone;
  source: string;
}

export interface DecisionRecord {
  id: number;
  day: number;
  mission?: MissionId | 'livre';
  missionTitle?: string;
  text: string;
  consequences: string[];
}

export interface CampaignState {
  version: number;
  seed: number;
  difficulty: Difficulty;
  phase: CampaignPhase;
  day: number;
  attributes: Attributes;
  funds: number;
  debateSkill: number;
  regions: Record<RegionId, RegionState>;
  factions: Record<FactionId, number>;
  relations: Record<CharacterId, number>;
  flags: Record<string, boolean | number | string>;
  missions: Record<MissionId, MissionProgress>;
  completedMissions: MissionId[];
  failedMissions: MissionId[];
  /** Fila de eventos pendentes (o jogador resolve um por vez). */
  eventQueue: EventId[];
  firedEvents: EventId[];
  log: LogEntry[];
  decisions: DecisionRecord[];
  achievements: AchievementId[];
  ending: EndingId | null;
  electionResult: ElectionResult | null;
  counters: { logId: number; decisionId: number };
}

// ---------------------------------------------------------------------------
// Sistema eleitoral
// ---------------------------------------------------------------------------

export interface RegionBreakdown {
  region: RegionId;
  name: string;
  weight: number;
  playerPct: number;
  opponentPct: number;
  undecidedPct: number;
  playerFinal: number;
  opponentFinal: number;
  finalUndecided: number;
  turnout: number;
  votesPlayer: number;
  votesOpponent: number;
  factors: { label: string; delta: number }[];
}

export interface ElectionResult {
  playerPct: number;
  opponentPct: number;
  winner: 'player' | 'opponent' | 'tie';
  regions: RegionBreakdown[];
  totalVotes: number;
  participation: number;
  topFactors: { label: string; delta: number }[];
  disclaimer: string;
}

// ---------------------------------------------------------------------------
// Salvamento e configurações
// ---------------------------------------------------------------------------

export interface SaveFile {
  version: number;
  savedAt: string;
  state: CampaignState;
}

export interface MetaProgress {
  endings: EndingId[];
  achievements: AchievementId[];
  campaignsPlayed: number;
}

export interface Settings {
  volume: number; // 0–1
  muted: boolean;
  reducedMotion: 'auto' | 'reduced' | 'full';
  highContrast: boolean;
  showDiagnostics: boolean;
}
