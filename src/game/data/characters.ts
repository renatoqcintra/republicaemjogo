import type { CharacterDef, CharacterId } from '../types';

/**
 * Elenco fictício. Nomes, biografias, partidos e segredos são inventados e
 * servem à sátira — nenhuma personagem corresponde a pessoas reais.
 * Os retratos são gerados por SVG determinístico a partir de `portrait`,
 * então podem ser substituídos por arte final sem tocar no código.
 */
export const CHARACTERS: CharacterDef[] = [
  {
    id: 'rafael',
    name: 'Fábio Barreto',
    role: 'Candidato à presidência',
    faction: 'Partido Renovador Nacional (PRN)',
    bio:
      'Filho do ex-presidente Júlio Barreto, condenado em 2021. Formou-se em Direito sem exercer, montou uma ONG de transparência que virou plataforma de discurso e agora disputa a cadeira que o pai ocupou — em parte para salvar o nome da família, em parte porque descobriu que gosta de palanque.',
    personality:
      'Preciso, controlado e arrogante o suficiente para achar que consegue falar com todo mundo. Ri pouco, prepara tudo, e tem um defeito familiar: não sabe largar um processo.',
    interests: ['Instituições', 'Imagem pessoal', 'Resgatar o legado do pai'],
    secret:
      'Sabe que parte dos documentos do processo do pai é autêntica — e que o pai mentiu para ele em 2020.',
    baseRelation: 100,
    alignment: 100,
    initialStance: 'Você.',
    portrait: {
      // Flávio Bolsonaro: pele clara, cabelo castanho-escuro curto, rosto oval,
      // bem barbeado, terno e gravata dourada do PRN.
      skin: '#ecc6a6',
      hair: '#33291f',
      hairStyle: 'short',
      faceShape: 'oval',
      age: 'middle',
      outfit: 'suit',
      coat: '#1e2a33',
      accent: '#c8a24b',
      glasses: false,
      beard: 'none',
      accessory: 'tie',
    },
  },
  {
    id: 'aurelio',
    name: 'Leandro Lacerda',
    role: 'Presidente em exercício e adversário principal',
    faction: 'Frente Popular Trabalhista (FPT)',
    bio:
      'Veterano de quatro disputas nacionais, ex-sindicato e presidente de honra de um partido que ele fundou com um jornal e um telefone. Governa em exercício e trata a reeleição como assunto de Estado — nunca perdeu uma eleição majoritária; perdeu apenas duas, e conta ambas como "derrotas históricas".',
    personality:
      'Generoso no privado, feroz no palco. Mestre do timing, do suspiro e da pergunta que não tem resposta. Despreza quem trata política como entretenimento — e faz discursos de 40 minutos.',
    interests: ['Memória de classe', 'Controle do partido', 'Vencer pela última vez'],
    secret:
      'Tem um acordo de não agressão com um antigo aliado do seu pai — e o usa como garantia de silêncio mútuo.',
    baseRelation: -55,
    alignment: -70,
    initialStance: 'Adversário respeitado e temido.',
    portrait: {
      // Lula: barba e bigode grisalhos cheios (traço fundamental), cabelo
      // grisalho com entradas, rosto largo e sorriso expressivo.
      skin: '#e3c4a2',
      hair: '#a39d94',
      hairStyle: 'receding',
      faceShape: 'round',
      age: 'senior',
      outfit: 'suit',
      coat: '#4a3121',
      accent: '#b0413e',
      glasses: false,
      beard: 'full',
      accessory: 'tie',
      lips: 'smile',
    },
  },
  {
    id: 'helio',
    name: 'Júlio Barreto',
    role: 'Ex-presidente condenado',
    faction: 'Preso no Presídio de Santa Brígida',
    bio:
      'Ganhou duas eleições com um sorriso que pesquisadores ainda tentam medir. Condenado por organização criminosa e lavagem em 2021, mantém apoio popular fiel e escreve cartas semanais ao filho, misturando conselhos estratégicos e reclamações sobre a comida.',
    personality:
      'Carismático até o último parágrafo. Nunca admite erro — admite apenas "leitura equivocada do momento histórico". Trata a família como um partido menor.',
    interests: ['Revisão do processo', 'Legado', 'Que ninguém vá ao enterro dele de terno'],
    secret:
      'Instruções para queimar documentos circulam em uma voz gravada que a defesa ainda não localizou.',
    baseRelation: 80,
    alignment: 65,
    initialStance: 'Pai. Motivo e problema da sua candidatura.',
    portrait: {
      // Jair Bolsonaro: idoso, cabelo castanho-escuro com grisalho nas
      // laterais penteado de lado, rosto comprido, sobrancelhas marcadas,
      // barba rala discreta, terno escuro e gravata azul.
      skin: '#e8cbaa',
      hair: '#57504a',
      hairStyle: 'wave',
      faceShape: 'long',
      age: 'senior',
      outfit: 'suit',
      coat: '#2d2620',
      accent: '#5b7fa6',
      glasses: false,
      beard: 'short',
      accessory: 'tie',
      brows: 'thick',
    },
  },
  {
    id: 'zorana',
    name: 'Thomas Walker',
    role: 'Líder internacional imprevisível',
    faction: 'Federação de Karsavia',
    bio:
      'Presidente de um país de seis fusos horários que exporta gás, xadrez e memes — e dono de um conglomerado de mídia herdado antes da política. Negocia por bilhetes, faz pausas dramáticas e tem o hábito de elogiar candidatos no momento mais inconveniente possível.',
    personality: 'Imprevisível, teatral e brilhante quando convém. Nunca faz nada sem plateia.',
    interests: ['Preços do gás', 'Surtos diplomáticos', 'Xadrez rápido'],
    secret: 'Já financiou, anos atrás, uma campanha de um adversário do seu pai — via intermediário.',
    baseRelation: 55,
    alignment: 30,
    initialStance: 'Apoiador oportuno e incômodo.',
    portrait: {
      // Trump: cabelo loiro-dourado volumoso e penteado para trás e de lado
      // (nunca castanho curto nem careca), rosto largo, sobrancelhas claras,
      // sem barba, terno escuro e gravata vermelha chamativa.
      skin: '#f0cfae',
      hair: '#e0c886',
      hairStyle: 'swoop',
      faceShape: 'round',
      age: 'senior',
      outfit: 'suit',
      coat: '#2c2536',
      accent: '#b3402f',
      glasses: false,
      beard: 'none',
      accessory: 'tie',
      brows: 'thin',
    },
  },
  {
    id: 'bento',
    name: 'Rafael Sampaio',
    role: 'Fundador e líder do Movimento Nacional de Renovação (MNR)',
    faction:
      'Movimento Nacional de Renovação (MNR) — terceira via de direita, organização independente, sem filiação partidária',
    bio:
      'Rafael Sampaio transformou uma audiência digital em uma organização política revolucionária de terceira via: núcleos regionais, militantes ativos e agenda própria. O MNR não quer reformar o Congresso nem sentar na mesa do establishment — quer substituir o jogo, cobrando de quem se candidata e recusando apoio a Fábio Barreto ou Leandro Lacerda por princípio. Não confia em partido, não pede licença e não se vende: o preço do MNR é a pauta, e a pauta é do movimento.',
    personality:
      'Irnico, combativo e revolucionário de terceira via: fala em derrubar a república de sempre, não em integrá-la. Fiél à autonomia do movimento — pode mudar de posição sobre uma proposta, mas resiste a ser tratado como subordinado de candidato algum.',
    interests: [
      'Terceira via',
      'Agenda de costumes e segurança',
      'Expansão do MNR',
      'Mobilização de militantes',
      'Autonomia política',
    ],
    secret: 'Tem contrato de mentoria com uma produtora ligada ao marketing do adversário — assinado antes da campanha.',
    baseRelation: 10,
    alignment: 70,
    initialStance:
      'Independente e combativo: mais à direita que o PRN na pauta, mas não apoia Fábio nem Leandro. Dialoga por conveniência — apoio viria de decisão da direção, nunca de simpatia.',
    portrait: {
      // Renan Santos: pele clara, cabelo castanho-escuro curto com laterais
      // aparadas, rosto fino e mandíbula definida, bem barbeado, jaqueta
      // casual contemporânea, sobrancelhas escuras.
      skin: '#e6c3a0',
      hair: '#2b2119',
      hairStyle: 'short',
      faceShape: 'square',
      age: 'young',
      outfit: 'jacket',
      coat: '#141821',
      accent: '#3fa796',
      glasses: false,
      beard: 'none',
      accessory: 'none',
      brows: 'thick',
    },
  },
  {
    id: 'camurca',
    name: 'Felipe Azevedo',
    role: 'Ministro da Economia do governo Lacerda',
    faction: 'Frente Popular Trabalhista (FPT)',
    bio:
      'Tecnocrata de três governos, planilhista convicto e mão direita do presidente na economia. Fala em "juros reais" como se fosse um conselho religioso e considera comício uma doença respiratória. Filia-se à FPT por cálculo de governabilidade: discorda do presidente nos detalhes e obedece em público.',
    personality: 'Seco, educado e impossível de impressionar. Sorri apenas em slides de abertura.',
    interests: ['Estabilidade fiscal', 'Orçamento secreto', 'Silêncio'],
    secret: 'Escreveu, anonimamente, um ensaio elogiando a política econômica do seu pai — em 2018.',
    baseRelation: -40,
    alignment: -60,
    initialStance: 'Neutro institucional, pragmático.',
    portrait: {
      // Haddad: pele clara, cabelo castanho-escuro curto com entradas
      // naturais, rosto oval de testa ampla e traços suaves, sem barba,
      // óculos redondos, terno escuro e gravata.
      skin: '#e0c8ae',
      hair: '#3d3733',
      hairStyle: 'receding',
      faceShape: 'oval',
      age: 'middle',
      outfit: 'suit',
      coat: '#26313d',
      accent: '#9fb2c4',
      glasses: true,
      beard: 'none',
      accessory: 'tie',
    },
  },
  {
    id: 'dulcinea',
    name: 'Gilberto Kaspar',
    role: 'Presidente do PRN',
    faction: 'Partido Renovador Nacional',
    bio:
      'Dirigente partidário há vinte anos, sabedor de que partido não sobrevive ao próximo presidente — apenas ao próximo acordo. Faz alianças como quem joga xadrez: sempre três lances à frente, sempre com um café na mão. Apoia Fábio Barreto quando a matemática fecha e guarda, no bolso, um plano B para a legenda.',
    personality: 'Pragmático, bem-humorado sem querer e incapaz de prometer algo que não possa cobrar.',
    interests: ['Sobrevivência da legenda', 'Cadeiras no congresso', 'Agenda do dia seguinte'],
    secret:
      'Tem um dossiê interno sobre a viabilidade real da candidatura de Fábio — e um prazo para usá-lo.',
    baseRelation: 45,
    alignment: 50,
    initialStance: 'Aliado condicional.',
    portrait: {
      // Kassab: pele clara, cabelo curto castanho-escuro com fios grisalhos
      // penteado de lado, testa ampla e rosto arredondado de bochechas cheias,
      // sem barba, terno formal e gravata.
      skin: '#e9c9a6',
      hair: '#4f4a45',
      hairStyle: 'short',
      faceShape: 'round',
      age: 'senior',
      outfit: 'suit',
      coat: '#3c2233',
      accent: '#c8a24b',
      glasses: false,
      beard: 'none',
      accessory: 'tie',
    },
  },
  {
    id: 'iris',
    name: 'William Nogueira',
    role: 'Editor investigativo',
    faction: 'Jornal Diáfano',
    bio:
      'Editor de uma revista de apuração lenta, com leitores fiéis e inimigos históricos. Publica apenas o que documenta, o que o torna a pessoa mais temida e mais consultada da campanha.',
    personality: 'Impassível, cirúrgico e honesto até o desconforto. Não aceita falastrão.',
    interests: ['Documentos', 'Direito de resposta', 'Sobrevivência da imprensa'],
    secret: 'Publicou, em 2016, uma matéria sobre o pai que estava parcialmente errada — e nunca corrigiu.',
    baseRelation: 15,
    alignment: 0,
    initialStance: 'Cauteloso. Quer fatos, não discurso.',
    portrait: {
      // Bonner: pele morena clara (tom mais escuro que o restante do cast),
      // cabelo curto castanho-escuro com grisalho nas laterais, rosto
      // alongado e mandíbula definida, barba por fazer muito discreta, terno
      // de apresentador de telejornal, sobrancelhas marcadas.
      skin: '#d9b695',
      hair: '#4a4540',
      hairStyle: 'short',
      faceShape: 'long',
      age: 'middle',
      outfit: 'suit',
      coat: '#1f2733',
      accent: '#b9a15e',
      glasses: false,
      beard: 'short',
      accessory: 'tie',
      brows: 'thick',
    },
  },
  {
    id: 'amaro',
    name: 'André Monteiro',
    role: 'Relator do processo no Tribunal Superior da República',
    faction: 'Tribunal Superior da República',
    bio:
      'Relator do caso Barreto, magistrado de trinta anos de toga conhecido por laconismo proverbial. Presidiu audiências que pararam a campanha inteira e decide com a lentidão de quem sabe que toda pressa vira manchete. Nunca deu entrevista — concedeu três, e todas viraram epígrafe de livros.',
    personality:
      'Enigmático, cortês e terrivelmente lento para quem espera pressa. Não confunde silêncio com complacência: anota tudo, e cobra depois.',
    interests: ['Ritual processual', 'Independência judicial', 'Silêncio'],
    secret:
      'Foi colega de turma de Júlio Barreto na academia — e guardam um desentendimento de 1987 que nenhum dos dois reconhece existir.',
    baseRelation: -65,
    alignment: 0,
    initialStance: 'Distância institucional. Inimigo de pressa.',
    portrait: {
      // Alexandre de Moraes: único personagem completamente careca (sem
      // qualquer fio), rosto arredondado de bochechas cheias, sobrancelhas
      // escuras e espessas, óculos de armação escura, terno escuro e gravata.
      skin: '#eccbb0',
      hair: '#4a4540',
      hairStyle: 'bald',
      faceShape: 'round',
      age: 'senior',
      outfit: 'suit',
      coat: '#221d1d',
      accent: '#7d6a4f',
      glasses: true,
      beard: 'none',
      accessory: 'tie',
      brows: 'thick',
    },
  },
  {
    id: 'vera',
    name: 'Pedro Marques',
    role: 'Estrategista de campanha',
    faction: 'Comitê Barreto',
    bio:
      'Veio de outra campanha que perdeu por 0,3 ponto e não superou o luto. Constrói presença digital como quem constrói estrutura de bairro — grupos, caixas de som e mensagens que parecem manchete — e organiza o dia do candidato em blocos de 15 minutos. Considera "espontaneidade" um crime administrativo.',
    personality: 'Direto, cínico por profissão e leal até o ponto em que a matemática vira derrota.',
    interests: ['Cronograma', 'Mobilização digital', 'Pesquisa interna'],
    secret: 'Guarda gravações de reuniões internas — "por hábito", diz ele.',
    baseRelation: 60,
    alignment: 85,
    initialStance: 'Braço direito. Questiona tudo.',
    portrait: {
      // Marçal: pele clara, cabelo castanho-escuro curto com laterais bem
      // aparadas e topo penteado para trás, barba escura curta e visível,
      // rosto angular de mandíbula marcada, camisa social moderna.
      skin: '#e6c3a0',
      hair: '#2b2320',
      hairStyle: 'back',
      faceShape: 'square',
      age: 'young',
      outfit: 'shirt',
      coat: '#2a3138',
      accent: '#c0654e',
      glasses: false,
      beard: 'short',
      accessory: 'none',
      brows: 'thick',
    },
  },
  {
    id: 'salome',
    name: 'Daniela Bezerra',
    role: 'Advogada-chefe da defesa',
    faction: 'Bezerra & Associados',
    bio:
      'Lidera a defesa do ex-presidente há quatro anos e já ganhou seis incidentes processuais que juraram não ganhar. Fala com a mesma fluência para um desembargador e para uma câmera ligada — e sabe que a segunda audiência acontece antes da primeira. Trabalha 16 horas por dia e considera otimismo uma forma de negligência.',
    personality:
      'Técnica, irônica, intolerante com improviso em sala de audiência e incapaz de ignorar uma câmera que esteja ligada.',
    interests: ['Pedidos de revisão', 'Prova documental', 'Narrativa da defesa'],
    secret: 'Recomendou ao cliente, em 2020, que destruísse um lote de documentos. Ele ouviu — ela nega ter ouvido.',
    baseRelation: 55,
    alignment: 60,
    initialStance: 'Aliada técnica. Exige rigor.',
    portrait: {
      // Deolane: pele clara a média, cabelo longo preto volumoso e bem
      // definido, sobrancelhas marcadas, lábios com maquiagem, brincos
      // discretos e roupa elegante de advogada.
      skin: '#d9ad82',
      hair: '#171310',
      hairStyle: 'long',
      faceShape: 'oval',
      age: 'middle',
      outfit: 'suit',
      coat: '#332b3b',
      accent: '#a68fc4',
      glasses: false,
      beard: 'none',
      accessory: 'earrings',
      lips: 'soft',
    },
  },
  {
    id: 'sandoval',
    name: 'Valdemar Costa',
    role: 'Presidente do PPV',
    faction: 'Partido Popular do Vale',
    bio:
      'Dirigente partidário há três décadas, construiu o Partido Popular do Vale em torno de estradas, cooperativas e um carisma de dono de feira. Apoia vencedores — e quer participar da vitória com cargo e presença. Diz nunca ter apoiado um perdedor: a cronologia discorda, ele não.',
    personality: 'Afável, calculista e generoso apenas com quem devolve na mesma moeda.',
    interests: ['Cargos', 'Obras no Vale', 'Ser ouvido primeiro'],
    secret: 'Negociou, em 2019, com dois candidatos ao mesmo tempo — os dois sabem.',
    baseRelation: 25,
    alignment: 15,
    initialStance: 'Disponível ao melhor lance.',
    portrait: {
      // Costa Neto: pele clara, cabelo curto grisalho penteado de lado,
      // rosto arredondado de testa ampla e traços de idade, bigode grisalho
      // discreto, terno tradicional de dirigente partidário veterano.
      skin: '#e3c4a2',
      hair: '#98928a',
      hairStyle: 'short',
      faceShape: 'round',
      age: 'senior',
      outfit: 'suit',
      coat: '#4c3a26',
      accent: '#c98f3f',
      glasses: false,
      beard: 'mustache',
      accessory: 'tie',
    },
  },
  {
    id: 'lutero',
    name: 'Sílvio Valente',
    role: 'Empresário da comunicação e doador',
    faction: 'Grupo Vaz de Comunicação',
    bio:
      'Começou anunciando vendas em rádio de interior e virou dono de rádios, portais e um iate chamado ironicamente "Orçamento". Reconhecido pelas ruas antes de qualquer político, financia campanhas como quem compra ingresso para a plateia certa — e cobra o assento de volta.',
    personality: 'Cordial, transacional e incapaz de esconder um pedido por mais de cinco minutos.',
    interests: ['Regulações amigáveis', 'Acesso', 'Reputação da casa'],
    secret: 'Tem contrato informal com um parente do adversário — e não vai gostar que isso venha à tona.',
    baseRelation: 50,
    alignment: 35,
    initialStance: 'Apoiador que pode virar cobrador.',
    portrait: {
      // Silvio Santos: cabelo grisalho abundante penteado para trás com
      // volume evidente (nunca careca ou ralo), rosto alongado, sorriso largo
      // e simpático, sem barba, terno bem alinhado e gravata.
      skin: '#f0cfae',
      hair: '#cfc9c1',
      hairStyle: 'back',
      faceShape: 'long',
      age: 'senior',
      outfit: 'suit',
      coat: '#2d2f36',
      accent: '#c8a24b',
      glasses: false,
      beard: 'none',
      accessory: 'tie',
      lips: 'smile',
    },
  },
  {
    id: 'dante',
    name: 'Dante Valverde',
    role: 'Empresário do setor financeiro',
    faction: 'Valverde Participações e Mídias',
    bio:
      'Banco de investimento, fundo de mídia e um agenda de contatos que atravessa indústria, produção audiovisual e política sem que uma área saiba direito o que a outra financia. Aparece quando há projeto bom — e some quando há escândalo ruim, sempre a tempo de não ser fotografado.',
    personality:
      'Cortês, paciente e impossível de impressionar com discurso. Negocia em camadas: primeiro o projeto, depois os juros, depois a influência.',
    interests: ['Projetos com retorno mensurável', 'Acesso a decisores', 'Silêncio contratual'],
    secret:
      'Detém, por holdings intermediárias, participação declarada mas pouco comentada em produtoras de conteúdo político — incluindo projetos que ainda não existem em papel.',
    baseRelation: 10,
    alignment: 5,
    initialStance: 'Interlocutor cordial. Cada proposta vem com um preço.',
    portrait: {
      // Vorcaro: pele clara, cabelo castanho-escuro curto e bem penteado
      // com volume no topo, rosto oval de mandíbula definida, barba curta e
      // aparada, terno executivo moderno e gravata discreta.
      skin: '#e9c9a6',
      hair: '#26221f',
      hairStyle: 'back',
      faceShape: 'oval',
      age: 'middle',
      outfit: 'suit',
      coat: '#232a33',
      accent: '#8ea3b8',
      glasses: false,
      beard: 'short',
      accessory: 'tie',
    },
  },
  {
    id: 'caetano',
    name: 'Caetano Góis',
    role: 'Político experiente e independente',
    faction: 'Movimento Democrático do Centro (sem bancada fixa)',
    bio:
      'Cinco mandatos, duas candidaturas nacionais e nenhuma lealdade permanente. Articula com todos os quadrantes e apoia pautas específicas — reforma aqui, obras ali — sem nunca se tornar aliado fixo de ninguém. Diz que partido é veículo, e veículo se troca.',
    personality:
      'Orador caloroso, planilheiro secreto e jogador de longo prazo. Cumprimenta pelo nome de todo mundo na sala — e lembra de quem o traiu.',
    interests: ['Reforma administrativa', 'Projetos regionais', 'Ser lembrado como razoável'],
    secret:
      'Mantém um financiamento antigo de um grupo empresarial que hoje disputa contrato público — o acordo vence no meio da campanha e ninguém no comitê sabe.',
    baseRelation: 15,
    alignment: -10,
    initialStance: 'Neutro simpático. Avalia pauta por pauta.',
    portrait: {
      // Ciro Gomes: pele clara, cabelo curto grisalho penteado de lado,
      // testa ampla e rosto alongado de expressão intensa (sobrancelhas
      // espessas), sem barba, blazer formal.
      skin: '#e2c6a8',
      hair: '#8a847b',
      hairStyle: 'short',
      faceShape: 'long',
      age: 'senior',
      outfit: 'jacket',
      coat: '#31404f',
      accent: '#c0654e',
      glasses: false,
      beard: 'none',
      accessory: 'none',
      brows: 'thick',
    },
  },
  {
    id: 'tiago',
    name: 'Tiago Farias',
    role: 'Gestor com ambições políticas',
    faction: 'Administração Metropolitana do Vale (sem filiação partidária declarada)',
    bio:
      'Executivo de infraestrutura que virou administrador regional e não esconde o próximo passo: disputar o cargo maior com a carteira de obras na mão. Conhece cada prefeitura do Vale pelo índice de empenho e trata campanha como projeto de gestão. Trabalhou com a ONG de transparência de Fábio Barreto em duas auditorias de obra — e discorda dele em quase tudo, exceto nisso.',
    personality:
      'Pragmático, metódico e falador de indicadores. Não mente: omite, que é pior no debate e melhor no relatório.',
    interests: ['Entrega de obras', 'Eficiência administrativa', 'Próximo cargo'],
    secret:
      'Encomendou, por terceiros, um estudo de viabilidade que coloca a candidatura própria dele em 2030 — o estudo já tem capa e sumário.',
    baseRelation: 65,
    alignment: 25,
    initialStance: 'Cordial e utilitário. Mede tudo.',
    portrait: {
      // Tarcísio: pele clara a média, cabelo curto castanho-escuro com
      // grisalho nas laterais, rosto largo de mandíbula marcada,
      // sobrancelhas espessas, sem barba e camisa social de gestor público.
      skin: '#d4ab84',
      hair: '#33291f',
      hairStyle: 'short',
      faceShape: 'round',
      age: 'middle',
      outfit: 'shirt',
      coat: '#2b3a45',
      accent: '#6fae86',
      glasses: false,
      beard: 'none',
      accessory: 'none',
      brows: 'thick',
    },
  },
];

export const CHARACTER_MAP: Record<CharacterId, CharacterDef> = Object.fromEntries(
  CHARACTERS.map((c) => [c.id, c]),
) as Record<CharacterId, CharacterDef>;

export function character(id: CharacterId): CharacterDef {
  const def = CHARACTER_MAP[id];
  if (!def) throw new Error(`Personagem desconhecido: ${id}`);
  return def;
}
