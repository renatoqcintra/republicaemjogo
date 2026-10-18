import type { MissionDef } from '../types';

/**
 * As cinco missões iniciais, conectadas e jogáveis.
 *
 * Cada missão é GRAFRO DE NÓS interpretado pelo motor (engine/missionEngine):
 * o mesmo motor serve para qualquer novo capítulo futuro. Nenhuma missão é
 * texto estático — todas têm escolhas verificáveis no estado da partida.
 *
 * Trilha: m1 (lançamento) → m2 (aliança) → m3 (processo judicial) →
 * m4 (crise de narrativa) → m5 (última semana) → apuração.
 */

export const MISSIONS: MissionDef[] = [
  // =========================================================================
  // MISSÃO 1 — O SOBRENOME PESA
  // =========================================================================
  {
    id: 'm1',
    phase: 1,
    title: 'O sobrenome pesa',
    tagline: 'A candidatura nasce com uma pergunta pendurada no ar.',
    intro: [
      'A manchete da véspera resume o problema: "Filho de Júlio Barreto lança candidatura e promete limpar o nome da família".',
      'Três anos de ONG, um curso de Direito inexplorado e um sobrenome que ainda abre portas — e fecha outras.',
      'Hoje é o dia da coletiva. Depois dela, a campanha terá a primeira decisão que ninguém revoga.',
    ],
    context:
      'Sua equipe montou um palanque improvisado no saguão de um centro de convenções. A imprensa nacional está presente — e também dois deputados que vêm medir seu pulso.',
    characters: ['vera', 'iris', 'dulcinea'],
    objectives: [
      { id: 'o1', text: 'Escolha a estratégia inicial da campanha', completeWhen: [{ t: 'flag', flag: 'initialStrategy' }] },
      { id: 'o2', text: 'Defina a região prioritária dos primeiros dias', completeWhen: [{ t: 'flag', flag: 'priorityRegion' }] },
      {
        id: 'o3',
        text: 'Mantenha a lealdade dos aliados em 55 ou mais',
        optional: true,
        completeWhen: [{ t: 'attrGte', attr: 'loyalty', value: 55 }],
      },
    ],
    unlock: [],
    startNode: 'start',
    nodes: {
      start: {
        t: 'dialogue',
        speaker: 'vera',
        text:
          'Última checagem, candidato. Três blocos: abertura curta, anúncio e perguntas. Se perguntarem sobre o seu pai, eu tóssico duas vezes e você responde "o julgamento segue o seu curso". Combinado?',
        next: 'plenario',
      },
      plenario: {
        t: 'choice',
        speaker: 'iris',
        prompt:
          'A primeira pergunta vem antes do primeiro microfone estar no lugar: "O senhor é apenas o sobrenome do pai?"',
        choices: [
          {
            id: 'legado',
            label: 'Assumir o legado de frente',
            description: '"Sim, é meu sobrenome. E é exatamente por isso que vim limpar isso aqui de dentro."',
            effects: [
              { t: 'attr', attr: 'popularity', amount: 6 },
              { t: 'attr', attr: 'reputation', amount: -3 },
              { t: 'attr', attr: 'loyalty', amount: 4 },
              { t: 'faction', faction: 'prn', amount: 6 },
              { t: 'flag', flag: 'initialStrategy', value: 'legado' },
            ],
            summary: 'Assumiu publicamente o sobrenome como bandeira da campanha.',
            hint: 'Popularidade e aliados fiéis; a reputação fica exposta à pergunta de sempre.',
            next: 'dulcinea',
          },
          {
            id: 'pagina',
            label: 'Virar a página e falar de currículo próprio',
            description: '"Meu pai tem um julgamento. Eu tenho um projeto. São processos distintos."',
            effects: [
              { t: 'attr', attr: 'influence', amount: 4 },
              { t: 'attr', attr: 'reputation', amount: 3 },
              { t: 'attr', attr: 'popularity', amount: -2 },
              { t: 'faction', faction: 'imprensa', amount: 4 },
              { t: 'flag', flag: 'initialStrategy', value: 'pagina' },
            ],
            summary: 'Afastou a campanha da figura do pai e apostou em currículo próprio.',
            hint: 'Compra seriedade com a imprensa; o eleitor que quer emoção sai da sala.',
            next: 'dulcinea',
          },
          {
            id: 'ataque',
            label: 'Ataque preventivo ao adversário',
            description: '"A pergunta certa é sobre quem julgou meu pai — e em que prazo."',
            effects: [
              { t: 'attr', attr: 'influence', amount: 6 },
              { t: 'attr', attr: 'popularity', amount: 2 },
              { t: 'attr', attr: 'reputation', amount: -2 },
              { t: 'relation', who: 'aurelio', amount: -15 },
              { t: 'faction', faction: 'imprensa', amount: -4 },
              { t: 'flag', flag: 'initialStrategy', value: 'ataque' },
            ],
            summary: 'Abriu a campanha com ataque preventivo ao adversário.',
            hint: 'Ganha a semana de notícias; o adversário e as redações cobram depois.',
            next: 'dulcinea',
          },
          {
            id: 'aval_partido',
            label: 'Deixar Gilberto Kaspar anunciar o aval do partido antes',
            description:
              'O presidente do PRN lê a nota de respaldo ao seu lado — e a pergunta sobre o sobrenome perde força no ar.',
            effects: [
              { t: 'faction', faction: 'prn', amount: 8 },
              { t: 'attr', attr: 'influence', amount: 3 },
              { t: 'attr', attr: 'popularity', amount: -2 },
              { t: 'relation', who: 'dulcinea', amount: 8 },
              { t: 'flag', flag: 'initialStrategy', value: 'aval' },
            ],
            summary: 'Antecipou o aval público do partido com Gilberto Kaspar ao lado na coletiva.',
            hint: 'Estrutura e legenda nas suas costas desde o primeiro dia — a candidatura nasce amarrada ao partido.',
            next: 'dulcinea',
          },
        ],
      },
      dulcinea: {
        t: 'dialogue',
        speaker: 'dulcinea',
        text:
          'Discurso aceitável. Agora a parte chata: campanha sem centro de gravidade é panfleto. Escolha onde seus primeiros R$ milhões vão virar voto.',
        next: 'prioridade',
      },
      prioridade: {
        t: 'choice',
        speaker: 'vera',
        prompt: 'O comitê aguarda a palavra-chave da semana: qual região recebe o esforço inicial?',
        choices: [
          {
            id: 'sle',
            label: 'Serra do Leste — emprego e sindicatos',
            description: 'Território duro do adversário, mas o discurso de trabalho cabe no seu perfil.',
            effects: [
              { t: 'region', region: 'sle', player: 6 },
              { t: 'attr', attr: 'loyalty', amount: 2 },
              { t: 'flag', flag: 'priorityRegion', value: 'sle' },
            ],
            summary: 'Priorizou a Serra do Leste nos primeiros dias de campanha.',
            next: 'reflexao',
          },
          {
            id: 'vam',
            label: 'Vale do Amanhã — economia e estradas',
            description: 'Base natural do partido. Mais fácil, menos heroico.',
            effects: [
              { t: 'region', region: 'vam', player: 6 },
              { t: 'faction', faction: 'mercado', amount: 5 },
              { t: 'flag', flag: 'priorityRegion', value: 'vam' },
            ],
            summary: 'Priorizou o Vale do Amanhã, apostando na base histórica.',
            next: 'reflexao',
          },
          {
            id: 'cvm',
            label: 'Costa Vermelha — ambiente e juventude',
            description: 'Região cara e volátil. Requer coragem e dinheiro.',
            effects: [
              { t: 'region', region: 'cvm', player: 6 },
              { t: 'faction', faction: 'movimentos', amount: 6 },
              { t: 'flag', flag: 'priorityRegion', value: 'cvm' },
            ],
            summary: 'Priorizou a Costa Vermelha, apostando em pauta ambiental.',
            next: 'reflexao',
          },
          {
            id: 'plc',
            label: 'Planalto Central — instituições',
            description: 'Eleitorado técnico. Onde a sua história jurídica pode virar vantagem.',
            effects: [
              { t: 'region', region: 'plc', player: 6 },
              { t: 'attr', attr: 'institutionalTrust', amount: 5 },
              { t: 'flag', flag: 'priorityRegion', value: 'plc' },
            ],
            summary: 'Priorizou o Planalto Central, apostando em pauta institucional.',
            next: 'reflexao',
          },
          {
            id: 'isb',
            label: 'Ilhas de Santa Brígida — saúde e rádio comunitária',
            description: 'Pequena, volátil e apaixonada por quem aparece.',
            effects: [
              { t: 'region', region: 'isb', player: 6 },
              { t: 'attr', attr: 'popularity', amount: 2 },
              { t: 'flag', flag: 'priorityRegion', value: 'isb' },
            ],
            summary: 'Priorizou as Ilhas de Santa Brígida e suas rádios comunitárias.',
            next: 'reflexao',
          },
        ],
      },
      reflexao: {
        t: 'dialogue',
        text:
          'Ao sair, você passa pelo espelho do corredor e vê um candidato com o mesmo sobrenome de sempre — agora com um plano escrito. A campanha começou.',
        next: 'fim',
      },
      fim: {
        t: 'end',
        text: 'A candidatura está lançada. O comitê trabalha, a imprensa especula e o pai manda um bilhete da cela: "não vacile".',
      },
    },
    completion: {
      summary:
        'A candidatura de Fábio Barreto foi lançada: estratégia definida e região prioritária escolhida.',
      effects: [
        { t: 'attr', attr: 'influence', amount: 2 },
        { t: 'unlockMission', mission: 'm2' },
        { t: 'achievement', id: 'primeiro_passo' },
      ],
    },
    next: ['m2'],
  },

  // =========================================================================
  // MISSÃO 2 — O PREÇO DO APOIO
  // =========================================================================
  {
    id: 'm2',
    phase: 2,
    title: 'O preço do apoio',
    tagline: 'Nenhum partido apoia por esporte. Todos cobram pela entrada.',
    intro: [
      'Valdemar Costa, presidente do Partido Popular do Vale, pediu uma reunião de quatro paredes — expressão que, no Vale, significa seis pessoas e um gravador desligado.',
      'O PPV tem bancada em quatro das cinco regiões, rádios amigas e um caixa de comícios. Também tem um preço, anunciado com a delicadeza de um boleto.',
    ],
    context:
      'O encontro acontece em um restaurante sem placa, num bairro onde ninguém fotografaria ninguém por acaso.',
    characters: ['sandoval', 'vera', 'iris', 'lutero', 'dulcinea', 'caetano', 'tiago'],
    objectives: [
      { id: 'o1', text: 'Defina os termos do apoio do PPV', completeWhen: [{ t: 'flag', flag: 'ppvDecision' }] },
      {
        id: 'o2',
        text: 'Mantenha a verba em caixa acima de R$ 40 mi',
        optional: true,
        completeWhen: [{ t: 'fundsGte', value: 40 }],
      },
    ],
    unlock: [{ t: 'missionDone', mission: 'm1' }],
    startNode: 'start',
    nodes: {
      start: {
        t: 'dialogue',
        speaker: 'sandoval',
        text:
          'Fábio, eu apoio quem devolve. Meu partido entrega comício, rádio e um palanque no Vale inteiro. Em troca, quero presença real no seu primeiro ano — e um nome meu em pasta importante. Nada de vice decorativo.',
        next: 'caetano',
      },
      caetano: {
        t: 'dialogue',
        speaker: 'caetano',
        text:
          'Caetano Góis observa da ponta da mesa, cinco mandatos de experiência acumulada no olhar. "Eu já vi acordo de Vale ser feito e desfeito na mesma tarde, Fábio. A pergunta não é se o PPV merece confiança — é se você pode governar sem eles. Meu conselho: negocie o que for possível, mas não entregue o primeiro ano de mão beijada."',
        next: 'tiago',
      },
      tiago: {
        t: 'dialogue',
        speaker: 'tiago',
        text:
          'Tiago Farias abre uma planilha no tablet como quem consulta um orçamento doméstico. "Do lado técnico, o PPV entrega três regiões e uma malha de cooperativas que funcionam. Mas cada acordo com partido regional vem com um custo de governabilidade — eu já calculei o impacto no PPA. Se aceitar, prepare-se para negociar obra por obra, não mais."',
        next: 'mesa',
      },
      mesa: {
        t: 'choice',
        speaker: 'vera',
        prompt: 'Pedro cruza os braços: você tem trinta segundos antes que isso vire manchete.',
        choices: [
          {
            id: 'aceitar',
            label: 'Aceitar tudo, como proposto',
            description: 'Verba e estrutura agora; a dívida é para depois da posse.',
            effects: [
              { t: 'funds', amount: 20 },
              { t: 'faction', faction: 'ppv', amount: 18 },
              { t: 'attr', attr: 'loyalty', amount: -6 },
              { t: 'relation', who: 'sandoval', amount: 12 },
              { t: 'flag', flag: 'promisedMinistry', value: true },
              { t: 'flag', flag: 'ppvDecision', value: 'aceitar' },
            ],
            summary: 'Aceitou integralmente o acordo do PPV, incluindo indicação ministerial.',
            hint: 'Verba e estrutura imediatas; o partido inteiro entra no seu primeiro ano de governo.',
            next: 'vazamento',
          },
          {
            id: 'negociar',
            label: 'Negociar metade do apoio sem cargos',
            description: 'Aceita estrutura, recusa a pasta. Negociação dura, saudável.',
            effects: [
              { t: 'funds', amount: 10 },
              { t: 'faction', faction: 'ppv', amount: 10 },
              { t: 'attr', attr: 'influence', amount: 4 },
              { t: 'relation', who: 'sandoval', amount: 4 },
              { t: 'flag', flag: 'ppvDecision', value: 'negociar' },
            ],
            summary: 'Negociou apoio do PPV sem concessão de cargos.',
            hint: 'Metade do apoio sem depender de pasta: negociação dura, caixa menor, autonomia preservada.',
            next: 'vazamento',
          },
          {
            id: 'auditoria',
            label: 'Exigir auditoria do caixa do partido',
            description: 'Transparência como contrapartida. Custa clima, compra credibilidade.',
            requires: [{ t: 'attrGte', attr: 'influence', value: 30 }],
            effects: [
              { t: 'attr', attr: 'institutionalTrust', amount: 4 },
              { t: 'attr', attr: 'influence', amount: 3 },
              { t: 'faction', faction: 'ppv', amount: 8 },
              { t: 'relation', who: 'sandoval', amount: -2 },
              { t: 'flag', flag: 'ppvDecision', value: 'auditoria' },
            ],
            summary: 'Exigiu auditoria independente do caixa do PPV como condição do apoio.',
            hint: 'Credibilidade difícil de atacar; clima duro com a direção do partido.',
            next: 'vazamento',
          },
          {
            id: 'recusar',
            label: 'Recusar e seguir sem o PPV',
            description: 'Autonomia total — e um partido contra você.',
            effects: [
              { t: 'faction', faction: 'ppv', amount: -14 },
              { t: 'attr', attr: 'reputation', amount: 5 },
              { t: 'attr', attr: 'loyalty', amount: 4 },
              { t: 'relation', who: 'sandoval', amount: -20 },
              { t: 'flag', flag: 'ppvDecision', value: 'recusar' },
              { t: 'flag', flag: 'refusedFathersDeal', value: true },
            ],
            summary: 'Recusou o acordo do PPV e assumiu a campanha sem esse apoio.',
            hint: 'Autonomia total e reputação; um partido inteiro vira oposição interna.',
            next: 'vazamento',
          },
        ],
      },
      vazamento: {
        t: 'choice',
        speaker: 'iris',
        prompt:
          'Às 21h, dois portais publicam a mesma frase: "Barreto negociou acordo com partido regional". Sua versão vai ao ar agora ou amanhã?',
        choices: [
          {
            id: 'confirmar',
            label: 'Confirmar abertamente o que foi negociado',
            description: 'Tira a pauta da sombra e doa a narrativa ao seu controle.',
            effects: [
              { t: 'faction', faction: 'imprensa', amount: 6 },
              { t: 'attr', attr: 'reputation', amount: 3 },
              { t: 'attr', attr: 'popularity', amount: -2 },
              { t: 'faction', faction: 'ppv', amount: 4 },
            ],
            summary: 'Confirmou publicamente a negociação com o PPV.',
            hint: 'Você assume a narrativa antes que os portais assumam por você.',
            next: 'fim',
          },
          {
            id: 'suavizar',
            label: 'Confirmar apenas "conversas produtivas"',
            description: 'Meia verdade: todo mundo entende, ninguém assina.',
            effects: [
              { t: 'attr', attr: 'reputation', amount: -2 },
              { t: 'faction', faction: 'ppv', amount: -2 },
              { t: 'attr', attr: 'influence', amount: 1 },
            ],
            summary: 'Suavizou o vazamento com formulação ambígua.',
            hint: 'Diz o suficiente para segurar a manchete; ninguém fica convencido.',
            next: 'fim',
          },
          {
            id: 'negar',
            label: 'Negar a negociação',
            description: 'Valdemar tem o áudio. Ele não vai esperar você negar duas vezes.',
            effects: [
              { t: 'faction', faction: 'ppv', amount: -10 },
              { t: 'attr', attr: 'reputation', amount: -5 },
              { t: 'faction', faction: 'imprensa', amount: -6 },
              { t: 'relation', who: 'sandoval', amount: -12 },
            ],
            summary: 'Negou publicamente uma negociação que ocorreu.',
            hint: 'Barato agora, caro no dia em que o áudio aparecer.',
            next: 'fim',
          },
          {
            id: 'silvio_cobertura',
            label: 'Pedir a Sílvio Valente cobertura isonômica no Grupo Vaz',
            description:
              'O dono do grupo responde a telefonemas de candidatos — e a de portais também. Uma ligação e a pauta vira contexto.',
            requires: [{ t: 'relationGte', who: 'lutero', value: 40 }],
            effects: [
              { t: 'relation', who: 'lutero', amount: 8 },
              { t: 'faction', faction: 'imprensa', amount: 4 },
              { t: 'faction', faction: 'ppv', amount: -2 },
              { t: 'attr', attr: 'influence', amount: 2 },
            ],
            summary: 'Acionou Sílvio Valente para cobertura isonômica do grupo durante o vazamento.',
            hint: 'A mídia do doador neutraliza o portali — e a dívida com Sílvio aparece na conta depois.',
            next: 'fim',
          },
        ],
      },
      fim: {
        t: 'end',
        text: 'O acordo — ou o não acordo — vira assunto de país por 48 horas. Pedro marca reunião de crise para a manhã seguinte, antes das manchetes.',
      },
    },
    completion: {
      summary: 'Os termos do apoio regional foram definidos e publicizados.',
      effects: [{ t: 'unlockMission', mission: 'm3' }],
    },
    next: ['m3'],
  },

  // =========================================================================
  // MISSÃO 3 — O PROCESSO
  // =========================================================================
  {
    id: 'm3',
    phase: 3,
    title: 'O processo',
    tagline: 'A Justiça não acompanha o calendário da sua campanha.',
    intro: [
      'Quinta-feira, 6h40: a equipe jurídica recebe, por determinação judicial, um lote adicional de documentos no processo de Júlio Barreto.',
      'Parte do material já está vazando. O pai liga três vezes seguidas. Daniela Bezerra pede reunião às 8h — com ou sem café, diz ela.',
      'Ganhar a eleição não resolve nada aqui. Perder o ritmo deste processo, também não.',
    ],
    context:
      'O escritório Bezerra & Associados ocupa um andar inteiro de um prédio sem letreiro. Ninguém tira foto na entrada — por método.',
    characters: ['salome', 'iris', 'amaro', 'helio', 'camurca'],
    objectives: [
      { id: 'o1', text: 'Escolha a linha de defesa do caso', completeWhen: [{ t: 'flag', flag: 'defenseLine' }] },
      { id: 'o2', text: 'Defina a posição sobre a autenticidade dos documentos', completeWhen: [{ t: 'flag', flag: 'docsPosition' }] },
      {
        id: 'o4',
        text: 'Defina a postura da campanha diante do sinal do tribunal',
        completeWhen: [{ t: 'flag', flag: 'casePosture' }],
      },
      {
        id: 'o3',
        text: 'Preserve reputação e confiança institucional acima de 40',
        optional: true,
        completeWhen: [
          { t: 'attrGte', attr: 'reputation', value: 40 },
          { t: 'attrGte', attr: 'institutionalTrust', value: 40 },
        ],
      },
    ],
    unlock: [{ t: 'missionDone', mission: 'm2' }],
    startNode: 'start',
    failWhen: [{ t: 'attrLte', attr: 'institutionalTrust', value: 12 }],
    onFail: {
      text: 'A crise institucional consumiu a defesa: o escritório suspende coletivas e a campanha perde o eixo.',
      effects: [
        { t: 'attr', attr: 'popularity', amount: -6 },
        { t: 'attr', attr: 'loyalty', amount: -8 },
        { t: 'flag', flag: 'fathersFate', value: 'revisao_negada' },
        { t: 'relation', who: 'salome', amount: -15 },
      ],
    },
    nodes: {
      start: {
        t: 'dialogue',
        speaker: 'salome',
        text:
          'O lote novo tem 1.200 páginas. Metade é papel de 2018 que ninguém lembra; a outra metade é exatamente o que a acusação queria. A pergunta não é se o pai é inocente. A pergunta é qual jogo vamos jogar.',
        next: 'relator',
      },
      relator: {
        t: 'dialogue',
        speaker: 'amaro',
        text:
          'Na audiência de instrução, o relator André Monteiro fala baixo e obrigou a sala inteira a silenciar: "Este tribunal não ajusta calendário a palanque nem a manchete. Apresentem a defesa no rito, e o rito dirá. Quem tentar encurtar o caminho pagará o pedágio dobrado." Daniela anota tudo. Você percebe que ele não falou com ninguém dos dois lados depois.',
        next: 'camurca',
      },
      camurca: {
        t: 'dialogue',
        speaker: 'camurca',
        text:
          'Felipe Azevedo, Ministro da Economia, aparece na porta do escritório com a expressão de quem viu o mesmo filme. "Eu não vim advogar por ninguém, Fábio. Vim porque o mercado lê processo como risco — e risco vira dólar. Se o seu pai virar pauta de PL, o seu governo nasce com o câmbio contra. A decisão é sua, mas o impacto é meu para administrar." Sai deixando o cheiro de café e planilha.',
        next: 'linha',
      },
      linha: {
        t: 'choice',
        speaker: 'salome',
        prompt: 'Escolha a linha de defesa. Cada uma tem consequências diferentes — jurídicas, políticas e familiares.',
        choices: [
          {
            id: 'juridica',
            label: 'Linha jurídica estrita: impugnar cada documento',
            description: 'Recurso formal, perícia item a item, nada de público.',
            cost: { funds: 8 },
            effects: [
              { t: 'attr', attr: 'institutionalTrust', amount: 5 },
              { t: 'attr', attr: 'influence', amount: 3 },
              { t: 'relation', who: 'salome', amount: 12 },
              { t: 'relation', who: 'amaro', amount: 5 },
              { t: 'flag', flag: 'defenseLine', value: 'juridica' },
            ],
            summary: 'Adotou linha jurídica estrita no processo do pai.',
            hint: 'Confiança e clima com o relator; mantém o caso fora da pauta e custa verba.',
            next: 'imprensa',
          },
          {
            id: 'tecnica',
            label: 'Comissão técnica de revisão com nomes independentes',
            description: 'Custa caro e tempo. É a opção que os tribunais levam a sério.',
            cost: { funds: 12 },
            requires: [{ t: 'attrGte', attr: 'influence', value: 40 }],
            effects: [
              { t: 'attr', attr: 'institutionalTrust', amount: 8 },
              { t: 'attr', attr: 'influence', amount: 4 },
              { t: 'attr', attr: 'reputation', amount: 3 },
              { t: 'relation', who: 'salome', amount: 6 },
              { t: 'flag', flag: 'defenseLine', value: 'tecnica' },
            ],
            summary: 'Criou comissão técnica independente para revisar o processo.',
            hint: 'O caminho que os tribunais levam a sério — e o mais caro da missão.',
            next: 'imprensa',
          },
          {
            id: 'politica',
            label: 'Linha política: transformar o processo em pauta de campanha',
            description: 'Palanque, indignação e um eleitorado que entende de paixão.',
            effects: [
              { t: 'attr', attr: 'popularity', amount: 6 },
              { t: 'attr', attr: 'institutionalTrust', amount: -6 },
              { t: 'attr', attr: 'reputation', amount: -4 },
              { t: 'relation', who: 'amaro', amount: -20 },
              { t: 'faction', faction: 'judiciario', amount: -8 },
              { t: 'flag', flag: 'defenseLine', value: 'politica' },
            ],
            summary: 'Transformou o processo do pai em pauta política de campanha.',
            hint: 'Popularidade agora; atrito com o tribunal e com o relator adiante.',
            next: 'imprensa',
          },
          {
            id: 'silencio',
            label: 'Silêncio estratégico: nenhum comentário',
            description: 'Sem custo imediato, sem defesa narrativa.',
            effects: [
              { t: 'attr', attr: 'influence', amount: -2 },
              { t: 'attr', attr: 'institutionalTrust', amount: 1 },
              { t: 'flag', flag: 'defenseLine', value: 'silencio' },
            ],
            summary: 'Manteve silêncio estratégico sobre o avanço do processo.',
            hint: 'Barato e discreto — e deixa a narrativa do processo com o outro lado.',
            next: 'imprensa',
          },
        ],
      },
      imprensa: {
        t: 'choice',
        speaker: 'iris',
        prompt:
          'Na coletiva seguinte, a pergunta é seca: "São autênticos os documentos, candidato?" A resposta será reproduzida por uma semana.',
        choices: [
          {
            id: 'parcial',
            label: '"Parte é autêntica. O contexto não."',
            description: 'Honestidade técnica: custa popularidade, compra crédito com tribunais.',
            effects: [
              { t: 'attr', attr: 'reputation', amount: 5 },
              { t: 'attr', attr: 'popularity', amount: -4 },
              { t: 'faction', faction: 'imprensa', amount: 6 },
              { t: 'flag', flag: 'docsPosition', value: 'parcial' },
            ],
            summary: 'Admitiu parcial autenticidade dos documentos, questionando o contexto.',
            hint: 'Compra crédito com tribunais e imprensa; perde o eleitor apressado.',
            next: 'sinal',
          },
          {
            id: 'negar',
            label: '"Nada disso é autêntico."',
            description: 'A perícia já circula. Se contradisserem você, o custo é dobrado.',
            effects: [
              { t: 'attr', attr: 'reputation', amount: -7 },
              { t: 'attr', attr: 'institutionalTrust', amount: -3 },
              { t: 'faction', faction: 'imprensa', amount: -10 },
              { t: 'flag', flag: 'docsPosition', value: 'negar' },
            ],
            summary: 'Negou a autenticidade integral dos documentos do processo.',
            hint: 'Se a perícia desmentir, o custo dobra — e a revisão do processo fica mais difícil.',
            next: 'sinal',
          },
          {
            id: 'direito',
            label: '"Responderei no processo, não nos portais."',
            description: 'Cansa a plateia, respeita o rito.',
            cost: { funds: 4 },
            effects: [
              { t: 'attr', attr: 'institutionalTrust', amount: 3 },
              { t: 'attr', attr: 'influence', amount: 2 },
              { t: 'relation', who: 'amaro', amount: 8 },
              { t: 'flag', flag: 'docsPosition', value: 'direito' },
            ],
            summary: 'Respondeu à pergunta sobre autenticidade remetendo tudo ao processo.',
            hint: 'Preserva o clima com o relator; entedia o horário nobre e não acalma ninguém.',
            next: 'sinal',
          },
          {
            id: 'ppv_responde',
            label: 'Deixar a estrutura do PPV responder pelos fatos',
            description:
              'Você não fala: a bancada e as rádios amigas falam por você. A dívida do acordo da Missão 2 começa a vencer.',
            requires: [{ t: 'flag', flag: 'ppvDecision', equals: 'aceitar' }],
            cost: { funds: 3 },
            effects: [
              { t: 'attr', attr: 'popularity', amount: 3 },
              { t: 'faction', faction: 'ppv', amount: 6 },
              { t: 'attr', attr: 'institutionalTrust', amount: -4 },
              { t: 'attr', attr: 'reputation', amount: -3 },
              { t: 'relation', who: 'sandoval', amount: 6 },
              { t: 'flag', flag: 'docsPosition', value: 'delegada' },
            ],
            summary: 'Delegou à estrutura do PPV a resposta pública sobre os documentos.',
            hint: 'Descansa a sua voz e ativa o apoio comprado — a tutela do partido aparece na conta.',
            next: 'sinal',
          },
        ],
      },
      sinal: {
        t: 'choice',
        speaker: 'salome',
        prompt:
          'Dias depois, o relator André Monteiro marca audiência de instrução e nega, por unanimidade, o pedido liminar da acusação. É um sinal — e a sua equipe discute o que fazer com ele. Ninguém aqui promete o que o tribunal vai decidir: a pergunta é de postura.',
        choices: [
          {
            id: 'incidentes',
            label: 'Manter a cautela e tratar apenas dos incidentes em curso',
            description: 'Nenhum pedido novo, nenhum palanque: o rito segue no ritmo do tribunal.',
            effects: [
              { t: 'attr', attr: 'institutionalTrust', amount: 4 },
              { t: 'attr', attr: 'influence', amount: 2 },
              { t: 'relation', who: 'salome', amount: 6 },
              { t: 'relation', who: 'amaro', amount: 6 },
              { t: 'faction', faction: 'judiciario', amount: 3 },
              { t: 'flag', flag: 'casePosture', value: 'incidentes' },
            ],
            summary: 'Reagiu ao sinal do tribunal mantendo apenas os incidentes processuais em curso.',
            hint: 'Abdica da pauta da semana e compra margem com o relator e com o tribunal.',
            next: 'protocolo',
          },
          {
            id: 'comunicacao',
            label: 'Comunicação pública cuidadosa com os fatos do despacho',
            description:
              'Nota à imprensa diz o que o despacho disse — e o que ele não disse. Nada de apresentar decisão judicial como prova de inocência ou de culpa.',
            cost: { funds: 4 },
            effects: [
              { t: 'attr', attr: 'reputation', amount: 5 },
              { t: 'attr', attr: 'popularity', amount: 2 },
              { t: 'faction', faction: 'imprensa', amount: 6 },
              { t: 'attr', attr: 'institutionalTrust', amount: -2 },
              { t: 'relation', who: 'iris', amount: 8 },
              { t: 'flag', flag: 'casePosture', value: 'comunicacao' },
            ],
            summary: 'Respondeu ao sinal do tribunal com nota pública cuidadosa sobre os fatos do despacho.',
            hint: 'Ganha pauta e público; a tese de independência em relação ao processo enfraquece um ponto.',
            next: 'protocolo',
          },
          {
            id: 'despoliticar',
            label: 'Reorganizar a campanha para não depender do processo',
            description: 'Tira o julgamento do centro do discurso e devolve a pauta ao projeto.',
            effects: [
              { t: 'attr', attr: 'loyalty', amount: 5 },
              { t: 'attr', attr: 'influence', amount: 4 },
              { t: 'attr', attr: 'popularity', amount: -4 },
              { t: 'faction', faction: 'prn', amount: 6 },
              { t: 'relation', who: 'helio', amount: -5 },
              { t: 'relation', who: 'salome', amount: 4 },
              { t: 'flag', flag: 'casePosture', value: 'despoliticar' },
            ],
            summary: 'Reorganizou a campanha para reduzir a dependência em relação ao processo.',
            hint: 'Custa calor imediato e irrita o pai; reduz o risco de virar refém da próxima notícia.',
            next: 'protocolo',
          },
          {
            id: 'assessoria',
            label: 'Consultar a equipe jurídica sobre medidas legítimas e riscos',
            description:
              'Parecer formal do que pode ser feito — e do que pode ser mal interpretado — antes de qualquer protocolo.',
            cost: { funds: 6, days: 1 },
            effects: [
              { t: 'attr', attr: 'institutionalTrust', amount: 6 },
              { t: 'attr', attr: 'influence', amount: 3 },
              { t: 'relation', who: 'salome', amount: 10 },
              { t: 'relation', who: 'amaro', amount: 8 },
              { t: 'flag', flag: 'casePosture', value: 'assessoria' },
            ],
            summary: 'Consultou a equipe jurídica sobre medidas processuais legítimas e seus riscos.',
            hint:
              'Custa um dia de campanha e verba; abre caminho para medidas futuras e para um parecer no debate final.',
            next: 'protocolo',
          },
        ],
      },
      protocolo: {
        t: 'choice',
        speaker: 'salome',
        prompt:
          'Daniela leva o parecer à mesa: existe um caminho protocolar — requerer a revisão — e existe o caminho de não criar expectativa. O que a equipe faz com o que foi mapeado?',
        choices: [
          {
            id: 'requerer',
            label: 'Protocolar requerimento de revisão com o parecer em mãos',
            description:
              'Medida legítima e risco calculado: o tribunal pode acolher o pedido — ou ler o protocolo como pressão sobre o relator.',
            requires: [
              {
                t: 'any',
                of: [
                  { t: 'flag', flag: 'casePosture', equals: 'incidentes' },
                  { t: 'flag', flag: 'casePosture', equals: 'assessoria' },
                ],
              },
              {
                t: 'any',
                of: [
                  { t: 'flag', flag: 'defenseLine', equals: 'juridica' },
                  { t: 'flag', flag: 'defenseLine', equals: 'tecnica' },
                ],
              },
              { t: 'attrGte', attr: 'institutionalTrust', value: 45 },
              { t: 'attrGte', attr: 'influence', value: 35 },
            ],
            cost: { funds: 4 },
            effects: [
              { t: 'flag', flag: 'reviewRequested', value: true },
              { t: 'attr', attr: 'institutionalTrust', amount: -3 },
              { t: 'attr', attr: 'reputation', amount: 4 },
              { t: 'attr', attr: 'popularity', amount: -3 },
              { t: 'relation', who: 'amaro', amount: -10 },
              { t: 'relation', who: 'helio', amount: 10 },
              { t: 'faction', faction: 'judiciario', amount: -4 },
            ],
            summary: 'Protocolou requerimento de revisão do processo do pai com base no parecer da equipe.',
            hint:
              'Desgasta a margem com o relator — mas é o caminho com maior chance de reverter o processo. Nada é garantido.',
            next: 'fim',
          },
          {
            id: 'aguardar',
            label: 'Acompanhar o rito em silêncio, sem novo protocolo',
            description: 'O que vier do tribunal vem sem pedido em cima dele.',
            effects: [
              { t: 'attr', attr: 'institutionalTrust', amount: 2 },
              { t: 'relation', who: 'salome', amount: 6 },
              { t: 'relation', who: 'helio', amount: -3 },
            ],
            summary: 'Optou por acompanhar o rito processual sem protocolar novas medidas.',
            hint: 'Preserva o clima com o tribunal; mais uma vez, o pai fica sem resposta.',
            next: 'fim',
          },
          {
            id: 'anunciar',
            label: 'Anunciar que a equipe avalia medidas legítimas',
            description: 'Sinal para a base de que existe plano — sem dizer qual.',
            effects: [
              { t: 'attr', attr: 'popularity', amount: 3 },
              { t: 'faction', faction: 'imprensa', amount: 4 },
              { t: 'attr', attr: 'institutionalTrust', amount: -3 },
              { t: 'relation', who: 'amaro', amount: -6 },
            ],
            summary: 'Anunciou publicamente que a equipe avalia medidas processuais legítimas.',
            hint: 'Mantém a pauta quente e a expectativa alta; o relator lê como teatro.',
            next: 'fim',
          },
          {
            id: 'clareza',
            label: 'Requerer esclarecimentos formais sobre o alcance do despacho',
            description:
              'Pedido protocolado nos autos, respondido no rito: a equipe pergunta o que o despacho cobre — e o que ele não cobre.',
            requires: [{ t: 'relationGte', who: 'amaro', value: -55 }],
            cost: { funds: 3, days: 1 },
            effects: [
              { t: 'attr', attr: 'institutionalTrust', amount: 3 },
              { t: 'attr', attr: 'influence', amount: 2 },
              { t: 'attr', attr: 'reputation', amount: 2 },
              { t: 'relation', who: 'amaro', amount: 10 },
              { t: 'relation', who: 'salome', amount: 5 },
              { t: 'faction', faction: 'judiciario', amount: 4 },
              { t: 'flag', flag: 'clarezaRequest', value: true },
            ],
            summary: 'Requereu esclarecimentos formais nos autos sobre o alcance do despacho do relator.',
            hint:
              'Ritual impecável que fortalece o clima com André Monteiro — exige relação já construída e custa um dia de campanha.',
            next: 'clareza',
          },
        ],
      },
      clareza: {
        t: 'dialogue',
        speaker: 'amaro',
        text:
          'O despacho é devolvido com um parágrafo de esclarecimento, redigido com a economia de quem não quer ser citado fora do processo: "A liminar foi negada; nada além disso foi decidido. Não leiam sentença onde há trâmite — de nenhum lado." Monteiro encerra a audiência sobre a mão do processo: "Eu relato; o colegiado decide; entre os dois há o rito." De volta ao escritório, Daniela resume: ele não prometeu nada — e também não fechou porta nenhuma.',
        next: 'fim',
      },
      fim: {
        t: 'end',
        text:
          'O pai mandou um bilhete: "Você escolheu a estrada certa, mesmo que a estrada seja feia." Pela primeira vez em anos, o bilhete não veio com pedido.',
      },
    },
    completion: {
      summary:
        'A campanha definiu sua postura diante do tribunal: o desfecho do processo do pai virá nos próximos dias — e seguirá independente da eleição.',
      effects: [
        { t: 'unlockMission', mission: 'm4' },
        { t: 'achievement', id: 'sobrevivente_judicial' },
      ],
    },
    next: ['m4'],
  },

  // =========================================================================
  // MISSÃO 4 — A GUERRA DAS NARRATIVAS
  // =========================================================================
  {
    id: 'm4',
    phase: 4,
    title: 'A guerra das narrativas',
    tagline: 'Um vídeo de 47 segundos pode valer mais que dez comícios.',
    intro: [
      'Às 19h12, um vídeo de campanha do adversário sobe para as redes: montagem cirúrgica, trilha dramática e uma legenda — "o que ele não quer que você lembre".',
      'Em três horas, 11 milhões de visualizações e uma pergunta que circula em toda redação do país.',
      'Sua equipe tem até o amanhã para decidir se corre, responde, investiga ou ignora.',
    ],
    context: 'O comitê trabalha em modo noturno. Café, projeção e um televisor com o som no mínimo.',
    characters: ['vera', 'iris', 'bento', 'aurelio', 'zorana', 'dante'],
    objectives: [
      { id: 'o1', text: 'Escolha a reação imediata ao vídeo', completeWhen: [{ t: 'flag', flag: 'videoReaction' }] },
      { id: 'o2', text: 'Defina a narrativa sobre o conteúdo do vídeo', completeWhen: [{ t: 'flag', flag: 'videoNarrative' }] },
      {
        id: 'o3',
        text: 'Descubra a origem do vídeo antes de reagir',
        optional: true,
        completeWhen: [{ t: 'flag', flag: 'videoSourceFound' }],
      },
    ],
    unlock: [{ t: 'missionDone', mission: 'm3' }],
    startNode: 'start',
    nodes: {
      start: {
        t: 'dialogue',
        speaker: 'vera',
        text:
          'Vídeo autoral, produção cara, distribuição coordenada. Não é espontaneidade: é mídia paga disfarçada de descoberta do povo. Ainda assim, funciona.',
        effects: [{ t: 'flag', flag: 'videoCrisis', value: true }],
        next: 'zorana',
      },
      zorana: {
        t: 'dialogue',
        speaker: 'zorana',
        text:
          "Thomas Walker, presidente da Federação de Karsavia, aparece por vídeo-chamada com um tabuleiro de xadrez ao fundo. \"Fábio, meu amigo, eu vi o vídeo. Na Karsavia, nós chamamos isso de 'operação de domingo de manhã' — quando o impacto é grande demais para ser acidente. Meu conselho: não responda com raiva, responda com fato. E se precisar de apoio diplomático, eu conheço pessoas que conhecem pessoas.\" Sorri como quem não disse nada.",
        next: 'dante',
      },
      dante: {
        t: 'dialogue',
        speaker: 'dante',
        text:
          'Dante Valverde, do Grupo Valverde, manda uma mensagem de três linhas: "O vídeo já está sendo traduzido para seis idiomas e circulando em fundos de investimento. Se a sua campanha não controlar a narrativa em 48 horas, o mercado vai controlar por você. Eu não estou dizendo o que fazer — estou dizendo o que acontece se você não fizer."',
        next: 'reacao',
      },
      reacao: {
        t: 'choice',
        speaker: 'bento',
        prompt:
          'Rafael Sampaio, pela transmissão do MNR, resume o dilema: "Ou vocês correm atrás do vídeo, ou o vídeo correra atrás de vocês por uma semana."',
        choices: [
          {
            id: 'esclarecer',
            label: 'Nota imediata esclarecendo os fatos',
            description: 'Rápido e barato. Funciona melhor com reputação sólida.',
            requires: [{ t: 'attrGte', attr: 'reputation', value: 40 }],
            effects: [
              { t: 'attr', attr: 'influence', amount: 4 },
              { t: 'attr', attr: 'reputation', amount: 3 },
              { t: 'attr', attr: 'popularity', amount: 2 },
              { t: 'faction', faction: 'imprensa', amount: 4 },
              { t: 'flag', flag: 'videoReaction', value: 'esclarecer' },
            ],
            summary: 'Respondeu ao vídeo com nota imediata de esclarecimento.',
            hint: 'Resposta rápida enquanto a reputação aguenta o ritmo da pergunta.',
            next: 'origem',
          },
          {
            id: 'investigar',
            label: 'Investigar a origem do vídeo antes de responder',
            description: 'Custa tempo e verba. Pode revelar quem pagou a produção.',
            cost: { funds: 8, days: 2 },
            requires: [{ t: 'attrGte', attr: 'influence', value: 25 }],
            effects: [
              { t: 'attr', attr: 'influence', amount: 3 },
              { t: 'flag', flag: 'videoReaction', value: 'investigar' },
              { t: 'event', event: 'jornalista_descobre' },
            ],
            summary: 'Investigou a origem do vídeo antes de reagir publicamente.',
            hint: 'Custa dois dias e verba; pode revelar quem financiou a montagem — a tempo de usar.',
            next: 'origem',
          },
          {
            id: 'entrevista',
            label: 'Conceder entrevista explicando tudo ao vivo',
            description: 'Alto risco de pergunta inesperada, alto retorno de humanidade.',
            requires: [{ t: 'relationGte', who: 'iris', value: 15 }],
            effects: [
              { t: 'attr', attr: 'influence', amount: 6 },
              { t: 'attr', attr: 'popularity', amount: 3 },
              { t: 'faction', faction: 'imprensa', amount: 8 },
              { t: 'relation', who: 'iris', amount: 10 },
              { t: 'flag', flag: 'videoReaction', value: 'entrevista' },
            ],
            summary: 'Concedeu entrevista ao vivo para explicar o conteúdo do vídeo.',
            hint: 'Humanidade em tempo real — e uma pergunta que você não pode desligar.',
            next: 'origem',
          },
          {
            id: 'ignorar',
            label: 'Ignorar e manter a agenda',
            description: 'A agenda continua; o vídeo também.',
            effects: [
              { t: 'attr', attr: 'popularity', amount: -6 },
              { t: 'attr', attr: 'reputation', amount: -3 },
              { t: 'faction', faction: 'imprensa', amount: -5 },
              { t: 'flag', flag: 'videoReaction', value: 'ignorar' },
            ],
            summary: 'Ignorou o vídeo crítico e manteve a agenda da campanha.',
            hint: 'A agenda segue; o vídeo também, sozinho, por uma semana.',
            next: 'origem',
          },
        ],
      },
      origem: {
        t: 'choice',
        speaker: 'iris',
        prompt:
          'Independentemente da tese do vídeo — dinheiro do pai em paraísos fictícios —, a pergunta que sobra é como vocês vão se posicionar diante do conteúdo.',
        choices: [
          {
            id: 'auditoria',
            label: 'Publicar auditoria das contas da campanha',
            description: 'Transparência radical: caro, chato e muito difícil de atacar depois.',
            cost: { funds: 10 },
            effects: [
              { t: 'attr', attr: 'reputation', amount: 7 },
              { t: 'attr', attr: 'institutionalTrust', amount: 4 },
              { t: 'faction', faction: 'mercado', amount: -3 },
              { t: 'flag', flag: 'videoNarrative', value: 'auditoria' },
            ],
            summary: 'Publicou auditoria independente das contas de campanha.',
            hint: 'Custa verba; torna o seu caixa difícil de atacar pelo resto do ciclo.',
            next: 'fim',
          },
          {
            id: 'contra',
            label: 'Contratacar expondo a produção do vídeo',
            description: 'Volta o holofote para o adversário — e para a guerra de bastidores.',
            effects: [
              { t: 'attr', attr: 'influence', amount: 5 },
              { t: 'relation', who: 'aurelio', amount: -12 },
              { t: 'attr', attr: 'reputation', amount: -3 },
              { t: 'faction', faction: 'imprensa', amount: 3 },
              { t: 'flag', flag: 'videoNarrative', value: 'contra' },
            ],
            summary: 'Contratacou expondo a produção e o financiamento do vídeo crítico.',
            hint: 'Devolve o holofote ao adversário — e entra na guerra de bastidores com ele.',
            next: 'fim',
          },
          {
            id: 'advogado',
            label: 'Nota técnica de assessores jurídicos',
            description: 'Protocolo, linguagem de contrato, zero emoção.',
            effects: [
              { t: 'attr', attr: 'institutionalTrust', amount: 2 },
              { t: 'attr', attr: 'popularity', amount: -3 },
              { t: 'flag', flag: 'videoNarrative', value: 'advogado' },
            ],
            summary: 'Respondeu ao vídeo com nota técnica de assessores jurídicos.',
            hint: 'Clareza jurídica, zero emoção: protege quem lê, entedia quem assiste.',
            next: 'fim',
          },
          {
            id: 'publicar_fonte',
            label: 'Publicar a origem apurada do vídeo',
            description:
              'A equipe encontrou quem pagou a produção. Tornar isso público vira a notícia do dia — e um alvo nas costas.',
            requires: [{ t: 'flag', flag: 'videoSourceFound' }],
            cost: { funds: 6 },
            effects: [
              { t: 'attr', attr: 'influence', amount: 6 },
              { t: 'attr', attr: 'reputation', amount: 4 },
              { t: 'faction', faction: 'imprensa', amount: 3 },
              { t: 'relation', who: 'aurelio', amount: -15 },
              { t: 'flag', flag: 'videoNarrative', value: 'fonte' },
            ],
            summary: 'Tornou pública a origem apurada do vídeo crítico.',
            hint: 'Sua apuração vira manchete — e o adversário passa a responder na mesma moeda.',
            next: 'fim',
          },
          {
            id: 'resposta_paga',
            label: 'Bancar a resposta com a verba contratada de Dante',
            description:
              'Dinheiro declarado e contratado: saturar a mídia com a versão da campanha até o vídeo perder força.',
            requires: [
              {
                t: 'any',
                of: [
                  { t: 'flag', flag: 'danteDeal', equals: 'transparente' },
                  { t: 'flag', flag: 'danteDeal', equals: 'opaco' },
                ],
              },
            ],
            cost: { funds: 8 },
            effects: [
              { t: 'attr', attr: 'influence', amount: 5 },
              { t: 'attr', attr: 'popularity', amount: 3 },
              { t: 'attr', attr: 'reputation', amount: -3 },
              { t: 'relation', who: 'dante', amount: 5 },
              { t: 'flag', flag: 'videoNarrative', value: 'paga' },
            ],
            summary: 'Financiou a resposta ao vídeo crítico com a verba contratada de Dante Valverde.',
            hint: 'Alcance imediato e dívida assumida com o financiador — a página três do contrato cobra depois.',
            next: 'fim',
          },
        ],
      },
      fim: {
        t: 'end',
        text:
          'O vídeo sai das manchetes na terça. O que fica é a pergunta de sempre, em outra roupagem: quem é este candidato, e o que ele faz quando ninguém está olhando.',
      },
    },
    completion: {
      summary: 'A campanha sobreviveu à guerra das narrativas e definiu sua versão dos fatos.',
      effects: [
        { t: 'attr', attr: 'influence', amount: 2 },
        { t: 'achievement', id: 'caçador_de_fontes' },
      ],
    },
    next: ['m5'],
  },

  // =========================================================================
  // MISSÃO 5 — A ÚLTIMA SEMANA
  // =========================================================================
  {
    id: 'm5',
    phase: 5,
    title: 'A última semana',
    tagline: 'Sete dias, uma verba finita e um debate que decide manchetes.',
    intro: [
      'Segunda-feira da última semana. Pedro projetou um quadro de recursos: o que sobrou é o que existe. Não haverá segundo orçamento.',
      'Há três frentes: o empurrão regional final, o debate da quinta-feira e o fechamento de sábado.',
      'O pai, da cela, mandou o bilhete mais curto de todos: "Não perca por pressa."',
    ],
    context: 'Reunião de guerra às 7h da manhã, com as persianas fechadas e o mapa do país na parede.',
    characters: ['vera', 'dulcinea', 'aurelio'],
    objectives: [
      { id: 'o1', text: 'Defina o empurrão final de campanha', completeWhen: [{ t: 'flag', flag: 'finalPush' }] },
      { id: 'o2', text: 'Prepare e execute o debate final', completeWhen: [{ t: 'flag', flag: 'debateFinalScore' }] },
      {
        id: 'o3',
        text: 'Termine a campanha com verba em caixa',
        optional: true,
        completeWhen: [{ t: 'fundsGte', value: 10 }],
      },
    ],
    unlock: [
      { t: 'phase', value: 'finalWeek' },
      {
        t: 'any',
        of: [{ t: 'missionDone', mission: 'm4' }, { t: 'missionFailed', mission: 'm4' }],
      },
    ],
    startNode: 'start',
    nodes: {
      start: {
        t: 'dialogue',
        speaker: 'vera',
        text:
          'Cinco dias de estrada, um debate e um sábado de fechamento. Escolha onde os últimos R$ milhões viram voto — depois disso, é oração e apuração.',
        next: 'recursos',
      },
      recursos: {
        t: 'choice',
        speaker: 'vera',
        prompt: 'Empurrão final: uma região recebe a maior parte da verba restante.',
        choices: [
          {
            id: 'sle',
            label: 'Serra do Leste — fechar com sindicatos e obras',
            cost: { funds: 10 },
            effects: [
              { t: 'region', region: 'sle', player: 7 },
              { t: 'attr', attr: 'loyalty', amount: 2 },
              { t: 'flag', flag: 'finalPush', value: 'sle' },
            ],
            summary: 'Concentrou o empurrão final na Serra do Leste.',
            next: 'preparo',
          },
          {
            id: 'vam',
            label: 'Vale do Amanhã — turnê de cooperativas',
            cost: { funds: 10 },
            effects: [
              { t: 'region', region: 'vam', player: 7 },
              { t: 'faction', faction: 'mercado', amount: 4 },
              { t: 'flag', flag: 'finalPush', value: 'vam' },
            ],
            summary: 'Concentrou o empurrão final no Vale do Amanhã.',
            next: 'preparo',
          },
          {
            id: 'cvm',
            label: 'Costa Vermelha — juventude e praia',
            cost: { funds: 10 },
            effects: [
              { t: 'region', region: 'cvm', player: 7 },
              { t: 'faction', faction: 'movimentos', amount: 5 },
              { t: 'flag', flag: 'finalPush', value: 'cvm' },
            ],
            summary: 'Concentrou o empurrão final na Costa Vermelha.',
            next: 'preparo',
          },
          {
            id: 'plc',
            label: 'Planalto Central — pauta institucional',
            cost: { funds: 10 },
            effects: [
              { t: 'region', region: 'plc', player: 7 },
              { t: 'attr', attr: 'institutionalTrust', amount: 3 },
              { t: 'flag', flag: 'finalPush', value: 'plc' },
            ],
            summary: 'Concentrou o empurrão final no Planalto Central.',
            next: 'preparo',
          },
          {
            id: 'isb',
            label: 'Ilhas de Santa Brígida — rádios e ferry',
            cost: { funds: 10 },
            effects: [
              { t: 'region', region: 'isb', player: 7 },
              { t: 'attr', attr: 'popularity', amount: 2 },
              { t: 'flag', flag: 'finalPush', value: 'isb' },
            ],
            summary: 'Concentrou o empurrão final nas Ilhas de Santa Brígida.',
            next: 'preparo',
          },
        ],
      },
      preparo: {
        t: 'choice',
        speaker: 'vera',
        prompt: 'Quinta-feira tem debate nacional ao vivo. Como você se prepara nos dois dias anteriores?',
        choices: [
          {
            id: 'simulado',
            label: 'Simulado completo com equipe e réplicas duras',
            description: 'O jeito sério: assessor faz o papel do adversário até você xingar o sofá.',
            cost: { funds: 6, days: 1 },
            effects: [{ t: 'debateSkill', amount: 10 }],
            summary: 'Fez simulado completo de debate com a equipe.',
            hint: 'O caminho mais caro e mais completo: preparo alto, verba e um dia a menos de rua.',
            next: 'debate',
          },
          {
            id: 'leitura',
            label: 'Briefing de números e descanso',
            description: 'Menos adrenalina, mais planilha.',
            effects: [
              { t: 'debateSkill', amount: 5 },
              { t: 'attr', attr: 'influence', amount: 2 },
            ],
            summary: 'Preparou briefing de números e priorizou o descanso.',
            hint: 'Preparo moderado e custo zero: a equipe dorme, os números ficam na cabeça.',
            next: 'debate',
          },
          {
            id: 'improviso',
            label: 'Confiar no improviso de campanha',
            description: 'Você aprendeu a falar com público. Televisão é outro animal.',
            effects: [
              { t: 'debateSkill', amount: 2 },
              { t: 'attr', attr: 'popularity', amount: 3 },
            ],
            summary: 'Apostou no improviso para o debate final.',
            hint: 'Preparo quase nulo; o que sobra é carisma de comício — televisão é outro animal.',
            next: 'debate',
          },
          {
            id: 'parecer',
            label: 'Fechar o que pode (e o que não pode) ser dito sobre o processo',
            description:
              'Só quem montou linha técnica ou consultou a equipe jurídica leva parecer fechado para o estúdio.',
            requires: [
              {
                t: 'any',
                of: [
                  { t: 'flag', flag: 'casePosture', equals: 'assessoria' },
                  { t: 'flag', flag: 'defenseLine', equals: 'tecnica' },
                ],
              },
            ],
            cost: { funds: 4 },
            effects: [
              { t: 'debateSkill', amount: 6 },
              { t: 'attr', attr: 'institutionalTrust', amount: 2 },
              { t: 'attr', attr: 'loyalty', amount: 1 },
            ],
            summary: 'Revisou com a equipe jurídica o que poderia ser dito sobre o processo antes do debate.',
            hint: 'Você entra no ar sabendo exatamente onde o processo pode — e não pode — ser usado.',
            next: 'debate',
          },
          {
            id: 'pauta_economica',
            label: 'Transformar os números do debate com Felipe em fichas',
            description:
              'Os dados que você já disputou com o ministro da Economia viram preparo para a noite de quinta.',
            requires: [
              {
                t: 'any',
                of: [
                  { t: 'flag', flag: 'debateEconomico', equals: 'aceito' },
                  { t: 'flag', flag: 'debateEconomico', equals: 'preparado' },
                  { t: 'flag', flag: 'debateEconomico', equals: 'revanche' },
                ],
              },
            ],
            effects: [
              { t: 'debateSkill', amount: 6 },
              { t: 'attr', attr: 'institutionalTrust', amount: 1 },
              { t: 'attr', attr: 'influence', amount: 1 },
            ],
            summary: 'Converteu em fichas de debate os números já disputados com Felipe Azevedo.',
            hint: 'Preparo técnico herdado de uma decisão anterior — sem custo novo de verba nem de dia.',
            next: 'debate',
          },
        ],
      },
      debate: {
        t: 'choice',
        speaker: 'aurelio',
        prompt:
          'O debate abre com a pergunta sobre o seu pai — o moderador cita André Monteiro e a frase do tribunal sobre "campanha que não ajusta o rito" — e fecha com a sobre o imposto rural. Você tem um minuto e meio para definir o tom da noite.',
        choices: [
          {
            id: 'atacar',
            label: 'Atacar com números do adversário',
            description: 'Só funciona se o seu preparo for alto — caso contrário, vira gafe.',
            requires: [{ t: 'attrGte', attr: 'influence', value: 30 }],
            effects: [
              { t: 'attr', attr: 'popularity', amount: 4 },
              { t: 'relation', who: 'aurelio', amount: -10 },
              { t: 'flag', flag: 'debateFinalScore', value: 74 },
              { t: 'flag', flag: 'debateWon', value: true },
              { t: 'regionAll', opponent: -1.5 },
            ],
            summary: 'Atacou o adversário com números no debate final e saiu vencedor da noite.',
            hint: 'Noite vencida se os números fecharem; gafe garantida se não fecharem.',
            next: 'fechamento',
          },
          {
            id: 'defender',
            label: 'Defender o projeto e o processo com frieza',
            description: 'Jogo seguro: sem brilho, sem buraco.',
            effects: [
              { t: 'flag', flag: 'debateFinalScore', value: 58 },
              { t: 'flag', flag: 'debateWon', value: false },
              { t: 'attr', attr: 'reputation', amount: 2 },
            ],
            summary: 'Fez defesa fria do projeto no debate final.',
            hint: 'Sem brilho e sem buraco: o mínimo que um debate pode devolver.',
            next: 'fechamento',
          },
          {
            id: 'emocionar',
            label: 'Discurso emocional sobre família e futuro',
            description: 'Depende de popularidade alta para colar.',
            requires: [{ t: 'attrGte', attr: 'popularity', value: 45 }],
            effects: [
              { t: 'attr', attr: 'popularity', amount: 6 },
              { t: 'flag', flag: 'debateFinalScore', value: 63 },
              { t: 'flag', flag: 'debateWon', value: true },
              { t: 'attr', attr: 'loyalty', amount: 3 },
            ],
            summary: 'Fechou o debate com discurso emocional sobre família e futuro.',
            hint: 'Só cola se o público já gostar de você — senão vira teatro.',
            next: 'fechamento',
          },
          {
            id: 'sobreviver',
            label: 'Sobreviver à noite sem danos',
            description: 'Quando tudo falha, não derrubar o estúdio já é vitória.',
            effects: [
              { t: 'flag', flag: 'debateFinalScore', value: 46 },
              { t: 'flag', flag: 'debateWon', value: false },
              { t: 'attr', attr: 'popularity', amount: -2 },
            ],
            summary: 'Sobreviveu ao debate final sem brilho e sem danos.',
            hint: 'Perde a noite, não perde a campanha.',
            next: 'fechamento',
          },
          {
            id: 'conta_governo',
            label: 'Atacar com a conta do pacote econômico do governo',
            description:
              'Os números que a sua equipe apurou sobre o pacote de Felipe Azevedo entram na noite com nome e data.',
            requires: [{ t: 'flag', flag: 'pacoteEconomico' }],
            effects: [
              { t: 'flag', flag: 'debateFinalScore', value: 70 },
              { t: 'flag', flag: 'debateWon', value: true },
              { t: 'attr', attr: 'popularity', amount: 3 },
              { t: 'attr', attr: 'influence', amount: 2 },
              { t: 'relation', who: 'aurelio', amount: -8 },
            ],
            summary: 'Atacou o adversário no debate final com a conta do pacote econômico do governo.',
            hint: 'Noite vencida com a munição econômica que você mesmo trouxe à pauta — e o ministro vira alvo junto.',
            next: 'fechamento',
          },
        ],
      },
      fechamento: {
        t: 'choice',
        speaker: 'dulcinea',
        prompt: 'Sábado, 19h: o último comício. O país inteiro vai assistir aos três minutos do seu discurso de encerramento.',
        choices: [
          {
            id: 'discurso',
            label: 'Discurso nacional de síntese',
            description: 'Sem ataques, sem novidades: apenas o que você promete governar.',
            effects: [
              { t: 'regionAll', player: 2 },
              { t: 'attr', attr: 'popularity', amount: 3 },
              { t: 'attr', attr: 'loyalty', amount: 2 },
            ],
            summary: 'Encerrou a campanha com discurso nacional de síntese.',
            hint: 'Risco quase zero de manchete ruim — e quase zero de virada de humor na véspera.',
            next: 'fim',
          },
          {
            id: 'familia',
            label: 'Fotografia de família no palco',
            description: 'Apoio emocional garantido; o custo político é inevitável.',
            effects: [
              { t: 'attr', attr: 'loyalty', amount: 5 },
              { t: 'attr', attr: 'popularity', amount: -2 },
              { t: 'flag', flag: 'familyPublic', value: true },
            ],
            summary: 'Encerrou a campanha com a família no palco.',
            hint: 'Lealdade da base sobe; a oposição ganha exatamente a foto que queria.',
            next: 'fim',
          },
          {
            id: 'descanso',
            label: 'Cancelar agenda e descansar até a apuração',
            description: 'O país comenta; a sua equipe dorme.',
            effects: [
              { t: 'attr', attr: 'reputation', amount: 2 },
              { t: 'attr', attr: 'influence', amount: 1 },
            ],
            summary: 'Cancelou a agenda final para descansar antes da apuração.',
            hint: 'Recupera a equipe e some da pauta na véspera da urna.',
            next: 'fim',
          },
          {
            id: 'despacho_favoravel',
            label: 'Abrir o comício com a notícia do despacho favorável',
            description:
              'A semana do processo vira o clímax da noite — dito com cuidado, sem exagero sobre a Justiça.',
            requires: [{ t: 'flag', flag: 'fathersFate', equals: 'revisao_ganha' }],
            effects: [
              { t: 'attr', attr: 'institutionalTrust', amount: 6 },
              { t: 'attr', attr: 'popularity', amount: 5 },
              { t: 'faction', faction: 'judiciario', amount: 5 },
              { t: 'faction', faction: 'prn', amount: 3 },
              { t: 'relation', who: 'helio', amount: 8 },
            ],
            summary: 'Abriu o discurso de encerramento com o despacho favorável no processo do pai.',
            hint: 'Transforma a semana do processo em voto — se o tom não soar triunfal demais.',
            next: 'fim',
          },
          {
            id: 'revés_digno',
            label: 'Assumir a negativa e responder pela família com dignidade',
            description:
              'Sem vitimismo: o revés é dito em voz alta e a campanha não pede desculpa por existir.',
            requires: [{ t: 'flag', flag: 'fathersFate', equals: 'revisao_negada' }],
            effects: [
              { t: 'attr', attr: 'reputation', amount: 5 },
              { t: 'attr', attr: 'loyalty', amount: 4 },
              { t: 'attr', attr: 'popularity', amount: -2 },
              { t: 'attr', attr: 'institutionalTrust', amount: 2 },
              { t: 'relation', who: 'helio', amount: 6 },
            ],
            summary: 'Assumiu no discurso final a negativa da revisão do processo do pai.',
            hint: 'Custa popularidade na véspera; compra credibilidade com quem já desconfia de você.',
            next: 'fim',
          },
        ],
      },
      fim: {
        t: 'end',
        text:
          'Às 23h59, o comitê desliga as luzes do salão. Amanhã é dia de urna, boletim e suspense. Pela primeira vez em semanas, não há nada a decidir — apenas a colher.',
      },
    },
    completion: {
      summary: 'A campanha foi até o fim: empurrão final aplicado e debate executado.',
      effects: [{ t: 'log', text: 'A apuração eleitoral será divulgada em seguida.', tone: 'story' }],
    },
    next: [],
  },
];

export const MISSION_MAP: Record<string, MissionDef> = Object.fromEntries(
  MISSIONS.map((m) => [m.id, m]),
);
