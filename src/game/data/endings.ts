import type { EndingDef } from '../types';

/**
 * Finais alternativos.
 *
 * A trama judicial é resolvida ANTES da apuração (Missão 3) e permanece
 * independente do resultado eleitoral: ganhar a eleição não salva ninguém.
 * A ordem importa: o primeiro final cujas condições forem satisfeitas vence.
 */
export const ENDINGS: EndingDef[] = [
  {
    id: 'vitoria_julgamento_limpo',
    title: 'Vitória com o pai absolvido',
    tone: 'vitoria',
    when: [
      { t: 'flag', flag: 'electionWon' },
      { t: 'flag', flag: 'fathersFate', equals: 'revisao_ganha' },
    ],
    text: [
      'A apuração terminou de madrugada e o país acordou com um resultado que ninguém ousava projetar: você venceu, e a revisão do processo do pai foi acolhida pela instância competente.',
      'A cerimônia de posse aconteceu sob chuva fina. Júlio Barreto assistiu da cela de Santa Brígida, de pijama, aplaudindo a si mesmo com o volume no mínimo.',
      'Você descobriu, ao assinar o primeiro decreto, que governar é a única atividade humana em que todo mundo é simultaneamente especialista e insatisfeito.',
      'E, pela primeira vez em seis anos, o nome da família voltou a significar apenas uma coisa: um trabalho pela frente.',
    ],
    electoralSummary: 'Mandato completo com agenda alinhada às prioridades eleitorais vitoriosas.',
  },
  {
    id: 'vitoria_processo_aberto',
    title: 'Vitória, com o processo ainda aberto',
    tone: 'vitoria',
    when: [
      { t: 'flag', flag: 'electionWon' },
      { t: 'flag', flag: 'fathersFate', equals: 'revisao_negada' },
    ],
    text: [
      'Você venceu a eleição e perdeu a batalha jurídica: a revisão do processo do pai foi negada em definitivo, quatro dias antes da apuração.',
      'Na primeira coletiva do presidente eleito, perguntaram sobre o pai. Você respondeu o mesmo que disse no primeiro comício: o julgamento segue o seu curso, e o governo não toca nele.',
      'Metade da plateia aplaudiu. A outra metade aplaudiu depois, com menos vontade.',
      'Governar com o sobrenome pesando menos — mas ainda pesando — é, talvez, o final mais honesto que a República oferece.',
    ],
    electoralSummary: 'Mandato vitorioso com desafio judicial pendente.',
  },
  {
    id: 'vitoria_ruptura',
    title: 'Vitória no abismo institucional',
    tone: 'vitoria',
    when: [{ t: 'flag', flag: 'electionWon' }],
    text: [
      'Você venceu — e a confiança nas instituições terminou a campanha no chão da sala.',
      'Tribunais questionam, oposição convoca, analistas alertam. Você tem maioria no voto e minoria na paciência do país.',
      'A história vai julgar seu primeiro ano com régua própria. Por enquanto, você tem a cadeira, o decreto e o vazio de quem realizou um sonho caro.',
      'Júlio Barreto ligou da cela para parabenizar. Você deixou tocar até o terceiro sinal.',
    ],
    electoralSummary: 'Vitória eleitoral com crise institucional ativa.',
  },
  {
    id: 'impasse_apuracao',
    title: 'Impasse na apuração',
    tone: 'neutro',
    when: [{ t: 'flag', flag: 'electionTie' }],
    text: [
      'A diferença nacional ficou dentro da margem de erro da própria simulação. Os tribunais eleitorais convocaram apuração complementar.',
      'Durante semanas, o país discutiu urnas, testemunhas e um vídeo de um gato atravessando um colégio eleitoral.',
      'Enquanto a justiça conta votos, o processo do pai segue em ritmo próprio — indiferente à demora da história.',
      'Nem vitória, nem derrota: a República empatou consigo mesma.',
    ],
    electoralSummary: 'Diferença nacional inferior a 0,5 ponto percentual.',
  },
  {
    id: 'derrota_traicao',
    title: 'Derrota e negociação de rendição',
    tone: 'derrota',
    when: [
      { t: 'flag', flag: 'electionWon', equals: false },
      { t: 'attrLte', attr: 'loyalty', value: 40 },
    ],
    text: [
      'A derrota veio acompanhada de uma delação seca: três aliados assinaram, no mesmo dia, um acordo de transição com o vencedor.',
      'O Partido Popular do Vale devolveu os favores recebidos — em dobro, para o outro lado.',
      'Na última reunião do comitê, faltaram cadeiras. Literalmente: alguém levou.',
      'O processo do pai continuou exatamente onde estava. Como sempre esteve.',
    ],
    electoralSummary: 'Derrota com colapso das alianças de campanha.',
  },
  {
    id: 'derrota_exilio',
    title: 'Derrota e silêncio estratégico',
    tone: 'derrota',
    when: [
      { t: 'flag', flag: 'electionWon', equals: false },
      { t: 'attrLte', attr: 'reputation', value: 45 },
    ],
    text: [
      'Você perdeu, recusou cargos de acomodação e anunciou um intervalo indefinido da vida pública.',
      'A imprensa chamou de "sabedoria". Sua equipe chamou de "pânico administrado".',
      'Júlio Barreto escreveu uma carta longa, cheia de conselhos sobre o que fazer em 2030. Você leu metade e guardou no fundo de uma mala.',
      'A República segue em jogo. Você, por enquanto, não.',
    ],
    electoralSummary: 'Derrota com reputação desgastada e afastamento da vida pública.',
  },
  {
    id: 'derrota_digna',
    title: 'Derrota com o nome limpo',
    tone: 'derrota',
    when: [{ t: 'flag', flag: 'electionWon', equals: false }],
    text: [
      'A apuração corria a favor de Leandro Lacerda desde o primeiro boletim. Você concedeu às 23h47, com o discurso mais elogiado da sua carreira — e o mais curto.',
      'A defesa do pai obteve, no dia seguinte, o direito de apresentar novas razões. Nada de reviravolta: apenas o direito de continuar.',
      'Você perdeu a eleição e ganhou um país onde seu nome pode significar alguma coisa além do processo.',
      'Pedro Marques guardou o material da campanha em caixas. "Para o próximo", disse. Você fingiu acreditar.',
    ],
    electoralSummary: 'Derrota eleitoral com reputação preservada.',
  },
  {
    id: 'recuo_honroso',
    title: 'Recuo antes do fim',
    tone: 'neutro',
    when: [{ t: 'flag', flag: 'withdrew' }],
    text: [
      'Você retirou a candidatura antes da apuração, alegando que a campanha havia sido capturada por seus próprios problemas jurídicos.',
      'Foi chamado de covarde e de adulto. Nos dois dias seguintes, pelos mesmos jornais.',
      'O processo do pai seguiu — e, pela primeira vez, você acompanhou sem precisar reagir.',
      'Existe coragem em recuar. Existe também cansaço. Nem sempre é fácil distinguir.',
    ],
    electoralSummary: 'Candidatura retirada antes da apuração.',
  },
];

export const ENDING_MAP: Record<string, EndingDef> = Object.fromEntries(
  ENDINGS.map((e) => [e.id, e]),
);
