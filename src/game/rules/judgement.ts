import { evalAll } from '../conditions';
import type { CampaignState } from '../types';

/** Desfechos possíveis da trama judicial (sempre independente da eleição). */
export type FathersFate = 'revisao_ganha' | 'revisao_negada';

export interface JudgementOutcome {
  state: CampaignState;
  /** Aviso pronto para a interface quando o desfecho muda. */
  notice?: string;
  fate?: FathersFate;
}

/**
 * O desfecho do processo de Júlio Barreto NÃO é decidido por um clique.
 *
 * Esta função agrega as escolhas acumuladas ao longo da campanha — postura
 * adotada diante do sinal do tribunal (Missão 3), linha de defesa, posição
 * sobre a autenticidade dos documentos, confiança institucional e a relação
 * com o relator — e só resolve o desfecho quando o atraso narrativo termina:
 * quando a Missão 4 termina (bem-sucedida ou falhada) ou quando a última
 * semana começa. Até lá, o processo segue "em aberto" na história.
 *
 * Determinística (mesmo estado ⇒ mesmo resultado) e idempotente (rodar duas
 * vezes não altera nem duplica registro). Nenhuma escolha isolada garante um
 * resultado específico: regras ruins anulam regras boas.
 */
export function resolveJudicialFate(state: CampaignState): JudgementOutcome {
  // Já resolvido (inclusive pela falha da Missão 3): nunca reescreve.
  if (state.flags['fathersFate'] !== undefined) return { state };
  if (!judgementReady(state)) return { state };

  const trust = state.attributes.institutionalTrust;
  const posture = state.flags['casePosture'];
  const docs = state.flags['docsPosition'];
  const requested = state.flags['reviewRequested'] === true;
  const amaro = state.relations['amaro'] ?? 0;

  let fate: FathersFate;
  let text: string;

  if (docs === 'negar' && trust < 50) {
    // Negação desmentida pela perícia com clima institucional fraco.
    fate = 'revisao_negada';
    text =
      'A perícia sobre os documentos circulou antes do reexame: a revisão foi negada e a instrução do processo do pai prossegue.';
  } else if (requested && trust >= 42) {
    // Medida protocolada com margem institucional ainda suficiente.
    fate = 'revisao_ganha';
    text =
      'O requerimento de revisão protocolado pela equipe foi acolhido: o processo de Júlio Barreto terá reexame em instância superior.';
  } else if (
    (posture === 'incidentes' || posture === 'assessoria') &&
    trust >= 47 &&
    amaro >= -60
  ) {
    // Postura cautelosa, confiança consolidada e relator não alienado
    // (>= -60 ≈ +10 de melhoria sobre a base inicial de -65).
    fate = 'revisao_ganha';
    text =
      'Sem palanque e sem atalho, a defesa seguiu o rito: o tribunal acolheu o pedido de revisão do processo de Júlio Barreto.';
  } else if (trust >= 52 && docs !== 'negar') {
    // Clima institucional tão alto que pesa sozinho.
    fate = 'revisao_ganha';
    text =
      'O clima institucional ao redor do caso mudou de lado: a revisão do processo do pai foi acolhida.';
  } else {
    fate = 'revisao_negada';
    text =
      'A revisão do processo de Júlio Barreto foi negada. A trama judicial segue aberta — e separada da eleição.';
  }

  const entry = {
    id: state.counters.logId + 1,
    day: state.day,
    text,
    tone: fate === 'revisao_ganha' ? ('story' as const) : ('bad' as const),
    source: 'Tribunal — processo de Júlio Barreto',
  };

  return {
    state: {
      ...state,
      flags: { ...state.flags, fathersFate: fate },
      counters: { ...state.counters, logId: state.counters.logId + 1 },
      log: [entry, ...state.log].slice(0, 200),
    },
    notice:
      fate === 'revisao_ganha'
        ? 'O tribunal se pronunciou: a revisão do processo do pai foi acolhida.'
        : 'O tribunal se pronunciou: a revisão do processo do pai foi negada.',
    fate,
  };
}

/**
 * Só resolve depois de um atraso narrativo: Missão 4 concluída (ou falhada)
 * ou última semana alcançada. Assim o desfecho aparece em missões futuras,
 * nunca no mesmo clique que definiu a postura.
 */
function judgementReady(state: CampaignState): boolean {
  return evalAll(
    [
      {
        t: 'any',
        of: [
          { t: 'missionDone', mission: 'm3' },
          { t: 'missionFailed', mission: 'm3' },
        ],
      },
      {
        t: 'any',
        of: [
          { t: 'missionDone', mission: 'm4' },
          { t: 'missionFailed', mission: 'm4' },
          { t: 'phase', value: 'finalWeek' },
        ],
      },
    ],
    state,
  );
}
