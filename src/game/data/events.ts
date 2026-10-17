import type { EventDef } from '../types';

/**
 * Eventos inesperados.
 * Nenhum evento é "sorte pura": todos têm condições legíveis no estado e
 * pistas no texto, e nenhum bloqueia permanentemente a progressão.
 */
export const EVENTS: EventDef[] = [
  {
    id: 'aliado_vira',
    title: 'O aliado que muda de posição',
    text:
      'O presidente do Partido Popular do Vale concedeu uma entrevista elogiando "a seriedade do governo" — o mesmo governo que seu partido diz enfrentar. Sua equipe detecta que a virada não foi acidental: houve uma conversa fechada na madrugada de ontem.',
    portrait: 'sandoval',
    when: [{ t: 'any', of: [{ t: 'daysGte', value: 15 }, { t: 'attrLte', attr: 'loyalty', value: 60 }] }],
    priority: 60,
    once: true,
    choices: [
      {
        id: 'ligar',
        label: 'Ligar pessoalmente e cobrar a lealdade pactuada',
        description: 'Conversa franca de duas horas. Nada oficial, mas nada fica esquecido.',
        cost: { funds: 2, days: 1 },
        requires: [{ t: 'relationGte', who: 'sandoval', value: 15 }],
        effects: [
          { t: 'relation', who: 'sandoval', amount: 8 },
          { t: 'attr', attr: 'loyalty', amount: 5 },
          { t: 'faction', faction: 'ppv', amount: 4 },
        ],
        summary: 'Cobrou pessoalmente a lealdade do aliado desertor.',
      },
      {
        id: 'confrontar',
        label: 'Exigir retratação pública',
        description: 'Bancada reunida, nota dura e ameaça de romper a aliança.',
        effects: [
          { t: 'attr', attr: 'loyalty', amount: -3 },
          { t: 'attr', attr: 'influence', amount: 3 },
          { t: 'relation', who: 'sandoval', amount: -12 },
          { t: 'faction', faction: 'ppv', amount: -6 },
        ],
        summary: 'Confrontou publicamente o aliado desertor.',
      },
      {
        id: 'ignorar',
        label: 'Ignorar e seguir a agenda',
        description: 'Silêncio estratégico. Custa menos hoje.',
        effects: [
          { t: 'attr', attr: 'loyalty', amount: -6 },
          { t: 'faction', faction: 'ppv', amount: -4 },
        ],
        summary: 'Ignorou a virada do aliado e pagou o preço na organização.',
      },
    ],
  },
  {
    id: 'documento_contradiz',
    title: 'O documento que contradiz você',
    text:
      'Uma ata de reunião de 2019 foi digitalizada por um arquivista distraído e circula em dois portais. Nela, você escreveu exatamente o contrário do que disse na véspera sobre o financiamento da campanha anterior. O trecho é real.',
    portrait: 'iris',
    when: [{ t: 'daysGte', value: 18 }],
    priority: 75,
    once: true,
    choices: [
      {
        id: 'reconhecer',
        label: 'Reconhecer o erro publicamente',
        description: 'Nota curta, sem advogado: "eu escrevi isso, e estava errado".',
        effects: [
          { t: 'attr', attr: 'reputation', amount: 5 },
          { t: 'attr', attr: 'popularity', amount: -5 },
          { t: 'attr', attr: 'institutionalTrust', amount: 2 },
          { t: 'flag', flag: 'admittedMistake', value: true },
        ],
        summary: 'Reconheceu publicamente uma contradição documental.',
      },
      {
        id: 'tecnica',
        label: 'Corrigir por nota técnica ("fora de contexto")',
        description: 'Advogados explicam o contexto. Ninguém entende, mas protege.',
        effects: [
          { t: 'attr', attr: 'institutionalTrust', amount: 3 },
          { t: 'attr', attr: 'popularity', amount: -2 },
          { t: 'attr', attr: 'reputation', amount: -1 },
        ],
        summary: 'Respondeu à contradição com nota técnica de assessores.',
      },
      {
        id: 'negar',
        label: 'Negar a autenticidade do documento',
        description: 'Alto risco: a perícia já circula entre redações.',
        effects: [
          { t: 'attr', attr: 'popularity', amount: 3 },
          { t: 'attr', attr: 'reputation', amount: -8 },
          { t: 'attr', attr: 'institutionalTrust', amount: -4 },
          { t: 'faction', faction: 'imprensa', amount: -8 },
        ],
        summary: 'Negou a autenticidade de um documento verdadeiro.',
      },
    ],
  },
  {
    id: 'entrevista_bomba',
    title: 'A entrevista que ninguém pediu',
    text:
      'William Nogueira, editor investigativo, avisou por bilhete: "vou ao ar com o que tenho sobre o seu pai na quinta. Prefiro ouvir você antes." A redação está dividida entre quem chama isso de isonomia e quem chama de armadilha.',
    portrait: 'iris',
    when: [{ t: 'daysGte', value: 24 }, { t: 'attrGte', attr: 'reputation', value: 30 }],
    priority: 70,
    once: true,
    choices: [
      {
        id: 'longa',
        label: 'Aceitar entrevista longa, sem prévia de perguntas',
        description: 'Se sua reputação estiver sólida, o público interpreta como transparência.',
        effects: [
          { t: 'relation', who: 'iris', amount: 15 },
          { t: 'attr', attr: 'influence', amount: 6 },
          { t: 'faction', faction: 'imprensa', amount: 8 },
          { t: 'flag', flag: 'longInterview', value: true },
        ],
        summary: 'Concedeu entrevista investigativa longa e sem roteiro.',
      },
      {
        id: 'curta',
        label: 'Aceitar entrevista curta, com temas combinados',
        description: 'Menos risco, menos retorno.',
        effects: [
          { t: 'relation', who: 'iris', amount: 6 },
          { t: 'attr', attr: 'influence', amount: 2 },
          { t: 'faction', faction: 'imprensa', amount: 3 },
        ],
        summary: 'Concedeu entrevista curta com temas previamente combinados.',
      },
      {
        id: 'recusar',
        label: 'Recusar e enviar apenas nota escrita',
        description: 'A emissora vai ao ar sem você.',
        effects: [
          { t: 'relation', who: 'iris', amount: -12 },
          { t: 'faction', faction: 'imprensa', amount: -6 },
          { t: 'attr', attr: 'popularity', amount: -2 },
        ],
        summary: 'Recusou a entrevista investigativa e enviou nota escrita.',
      },
    ],
  },
  {
    id: 'empresario_sai',
    title: 'O empresário que retira o apoio',
    text:
      'Sílvio Valente, dono de um grupo de comunicação do Vale, anunciou que "não patrocinará campanhas com controvérsia jurídica pendente". Traduzido: ele queria uma garantia que você não pode dar.',
    portrait: 'lutero',
    when: [{ t: 'daysGte', value: 20 }],
    priority: 65,
    once: true,
    choices: [
      {
        id: 'renegociar',
        label: 'Renegociar o apoio com cláusulas brandas',
        description: 'Menos dinheiro, mais independência — e uma dívida simbólica.',
        cost: { funds: 6 },
        effects: [
          { t: 'faction', faction: 'mercado', amount: 8 },
          { t: 'relation', who: 'lutero', amount: 6 },
          { t: 'attr', attr: 'reputation', amount: -1 },
        ],
        summary: 'Renegociou o apoio do empresário com cláusulas brandas.',
      },
      {
        id: 'perder',
        label: 'Aceitar a perda com dignidade',
        description: 'Dói no caixa, melhora o discurso.',
        effects: [
          { t: 'funds', amount: -8 },
          { t: 'attr', attr: 'reputation', amount: 4 },
          { t: 'flag', flag: 'cleanMoney', value: true },
        ],
        summary: 'Aceitou a retirada do apoio empresarial e bancou a independência.',
      },
      {
        id: 'expor',
        label: 'Expor as condições que ele exigiu',
        description: 'Vazar a lista de pedidos do empresário para a imprensa.',
        effects: [
          { t: 'attr', attr: 'influence', amount: 4 },
          { t: 'faction', faction: 'mercado', amount: -8 },
          { t: 'relation', who: 'lutero', amount: -25 },
          { t: 'attr', attr: 'reputation', amount: -3 },
        ],
        summary: 'Expôs publicamente as condições exigidas pelo empresário.',
      },
    ],
  },
  {
    id: 'jornalista_descobre',
    title: 'A redação descobre a origem do vazamento',
    text:
      'Dois repórteres independentes rastrearam o primeiro a publicar o vídeo crítico da campanha: uma produtora com contrato recorrente com o marketing do adversário. A matéria sai amanhã, com ou sem a sua versão.',
    portrait: 'iris',
    when: [{ t: 'daysGte', value: 16 }, { t: 'flag', flag: 'videoCrisis' }],
    priority: 80,
    once: true,
    choices: [
      {
        id: 'versao',
        label: 'Divulgar sua versão antes da matéria',
        description: 'Antecipa o fato e coloca sua equipe no controle do timing.',
        effects: [
          { t: 'attr', attr: 'influence', amount: 4 },
          { t: 'faction', faction: 'imprensa', amount: 4 },
          { t: 'flag', flag: 'videoSourceFound', value: true },
          { t: 'relation', who: 'aurelio', amount: -8 },
        ],
        summary: 'Antecipou a revelação da origem do vídeo crítico.',
      },
      {
        id: 'deixar',
        label: 'Deixar a imprensa trabalhar sozinha',
        description: 'Sem custo de reputação, mas sem controle da narrativa.',
        effects: [
          { t: 'faction', faction: 'imprensa', amount: 2 },
          { t: 'attr', attr: 'influence', amount: 1 },
        ],
        summary: 'Deixou a imprensa revelar sozinha a origem do vídeo.',
      },
    ],
  },
  {
    id: 'crise_diplomatica',
    title: 'A súbita amiga do norte',
    text:
      'Thomas Walker, presidente da Federação de Karsavia, declarou em cadeia nacional que admira "a clareza conservadora" do seu discurso — e prometeu "cooperação energética sem moralismos". Sua equipe tem dez minutos para reagir antes das manchetes.',
    portrait: 'zorana',
    when: [{ t: 'daysGte', value: 26 }],
    priority: 70,
    guaranteed: true, // abertura da cadeia de Walker (jusante: contrapartida)
    once: true,
    choices: [
      {
        id: 'condenar',
        label: 'Rejeitar a homenagem publicamente',
        description: 'Custa um aliado estrangeiro, ganha credibilidade doméstica.',
        effects: [
          { t: 'relation', who: 'zorana', amount: -20 },
          { t: 'attr', attr: 'popularity', amount: 4 },
          { t: 'faction', faction: 'movimentos', amount: 5 },
          { t: 'attr', attr: 'reputation', amount: 2 },
        ],
        summary: 'Rejeitou publicamente a homenagem do líder estrangeiro.',
      },
      {
        id: 'canal',
        label: 'Acionar canal diplomático discreto',
        description: 'Explica o mal-entendido sem humilhar ninguém.',
        effects: [
          { t: 'attr', attr: 'influence', amount: 5 },
          { t: 'attr', attr: 'popularity', amount: -3 },
          { t: 'relation', who: 'zorana', amount: 5 },
          { t: 'flag', flag: 'backchannelKarsavia', value: true },
        ],
        summary: 'Usou canal diplomático discreto para neutralizar a crise.',
      },
      {
        id: 'acordo',
        label: 'Aceitar a pauta de cooperação energética com contrapartidas públicas',
        description:
          'Vantagem estratégica imediata — e uma foto que a oposição vai usar por um mês. Exige relação boa com Walker.',
        requires: [{ t: 'relationGte', who: 'zorana', value: 50 }],
        effects: [
          { t: 'attr', attr: 'influence', amount: 6 },
          { t: 'attr', attr: 'popularity', amount: 2 },
          { t: 'faction', faction: 'mercado', amount: 5 },
          { t: 'relation', who: 'zorana', amount: 8 },
          { t: 'flag', flag: 'karsaviaDeal', value: true },
        ],
        summary: 'Aceitou a proposta de cooperação energética de Thomas Walker com contrapartidas públicas.',
      },
      {
        id: 'silencio',
        label: 'Não comentar',
        description: 'A frase fica circulando por três dias.',
        effects: [
          { t: 'attr', attr: 'popularity', amount: -1 },
          { t: 'attr', attr: 'reputation', amount: -2 },
        ],
        summary: 'Manteve silêncio sobre a crise diplomática.',
      },
    ],
  },
  {
    id: 'revelacao_antiga',
    title: 'A revelação de vinte anos atrás',
    text:
      'Um ex-auditor do governo de seu pai afirma, sob câmera, que existia uma "lista de favoritos" arquivada em fundo de armário. Ele não tem provas documentais — mas tem memória afiada e uma entrevista marcada.',
    portrait: 'helio',
    when: [{ t: 'daysGte', value: 32 }],
    priority: 72,
    once: true,
    choices: [
      {
        id: 'antecipar',
        label: 'Antecipar a revelação com versão própria',
        description: 'Dores ao rosto: custa popularidade, compra credibilidade.',
        effects: [
          { t: 'attr', attr: 'reputation', amount: 6 },
          { t: 'attr', attr: 'popularity', amount: -6 },
          { t: 'flag', flag: 'preemptedStory', value: true },
        ],
        summary: 'Antecipou a revelação sobre o passado do pai.',
      },
      {
        id: 'judicial',
        label: 'Responder na esfera judicial',
        description: 'Direito de resposta e medida limpa. Institucionalmente correto.',
        cost: { funds: 6 },
        effects: [
          { t: 'attr', attr: 'institutionalTrust', amount: 4 },
          { t: 'attr', attr: 'influence', amount: 2 },
          { t: 'faction', faction: 'judiciario', amount: 3 },
        ],
        summary: 'Respondeu à revelação antiga na esfera judicial.',
      },
      {
        id: 'atacar',
        label: 'Atacar a credibilidade do ex-auditor',
        description: 'Funciona com parte do eleitorado. Não com todos.',
        effects: [
          { t: 'attr', attr: 'popularity', amount: 3 },
          { t: 'attr', attr: 'reputation', amount: -9 },
          { t: 'attr', attr: 'institutionalTrust', amount: -3 },
        ],
        summary: 'Atacou a credibilidade do ex-auditor que pretendia falar.',
      },
    ],
  },
  {
    id: 'negocia_imprevisto',
    title: 'A condição inesperada da mesa',
    text:
      'Valdemar Costa aceita fechar a aliança — mas pede, por escrito, indicação de um nome para a pasta da Fazenda no primeiro ano de governo. A mesa ficou em silêncio por tempo demais.',
    portrait: 'sandoval',
    when: [{ t: 'factionGte', faction: 'ppv', value: 20 }, { t: 'daysGte', value: 12 }],
    priority: 78,
    once: true,
    choices: [
      {
        id: 'aceitar',
        label: 'Aceitar a condição escrita',
        description: 'Ganha estrutura, perde autonomia — e cria um compromisso público futuro.',
        effects: [
          { t: 'faction', faction: 'ppv', amount: 18 },
          { t: 'attr', attr: 'loyalty', amount: -6 },
          { t: 'relation', who: 'sandoval', amount: 10 },
          { t: 'flag', flag: 'promisedMinistry', value: true },
        ],
        summary: 'Aceitou indicar um nome para a Fazenda em troca do apoio do PPV.',
      },
      {
        id: 'contrapropor',
        label: 'Contrapropor um acordo sem cargos',
        description: 'Negociação dura: metade do apoio, nenhuma pasta.',
        effects: [
          { t: 'faction', faction: 'ppv', amount: 8 },
          { t: 'attr', attr: 'influence', amount: 4 },
          { t: 'relation', who: 'sandoval', amount: -4 },
        ],
        summary: 'Recusou cargos e negociou apoio político sem contrapartida ministerial.',
      },
      {
        id: 'sair',
        label: 'Levantar-se da mesa',
        description: 'A bancada vai lembrar disso por um tempo.',
        effects: [
          { t: 'faction', faction: 'ppv', amount: -10 },
          { t: 'attr', attr: 'reputation', amount: 3 },
          { t: 'relation', who: 'sandoval', amount: -15 },
        ],
        summary: 'Saiu da mesa de negociação sem fechar aliança.',
      },
    ],
  },
  {
    id: 'greve_nacional',
    title: 'Greve geral de 48 horas',
    text:
      'Sindicatos da Serra do Leste anunciaram greve geral por 48 horas por causa do reajuste atrasado. Portos, transporte e escolas param. Cada candidato tem exatamente uma chance de parecer sério.',
    portrait: 'camurca',
    when: [{ t: 'daysGte', value: 22 }],
    priority: 68,
    once: true,
    choices: [
      {
        id: 'apoiar',
        label: 'Apoiar a pauta da greve',
        description: 'Sindicato aplaude, mercado treme.',
        effects: [
          { t: 'attr', attr: 'popularity', amount: 6 },
          { t: 'faction', faction: 'movimentos', amount: 8 },
          { t: 'faction', faction: 'mercado', amount: -10 },
          { t: 'region', region: 'sle', player: 4 },
        ],
        summary: 'Apoiou publicamente a pauta da greve geral.',
      },
      {
        id: 'mediador',
        label: 'Se oferecer como mediador',
        description: 'Papão chato de adulto responsável.',
        effects: [
          { t: 'attr', attr: 'institutionalTrust', amount: 5 },
          { t: 'attr', attr: 'influence', amount: 3 },
          { t: 'attr', attr: 'popularity', amount: -2 },
        ],
        summary: 'Se ofereceu como mediador na crise da greve.',
      },
      {
        id: 'criticar',
        label: 'Criticar o paraliso do país',
        description: 'Agrada quem trabalha e incomoda quem organiza.',
        effects: [
          { t: 'attr', attr: 'popularity', amount: -5 },
          { t: 'faction', faction: 'mercado', amount: 8 },
          { t: 'faction', faction: 'movimentos', amount: -8 },
        ],
        summary: 'Criticou publicamente o paraliso nacional.',
      },
    ],
  },
  {
    id: 'apagao_midia',
    title: 'O buraco no jornal das oito',
    text:
      'Na madrugada, o maior grupo de comunicação do país sofreu um apagão de sistemas e perdeu a programação eleitoral das 18h às 22h. A oposição chama de censura; o governo chama de coincidência; os técnicos chamam de ransomware.',
    portrait: 'bento',
    when: [{ t: 'daysGte', value: 38 }],
    priority: 66,
    once: true,
    choices: [
      {
        id: 'proprio',
        label: 'Cobrir o buraco com transmissão própria',
        description: 'Live improvisada, alcance limitado, custo controlado.',
        cost: { funds: 6 },
        effects: [
          { t: 'attr', attr: 'influence', amount: 4 },
          { t: 'attr', attr: 'popularity', amount: 2 },
        ],
        summary: 'Cobriu o apagão de mídia com transmissão própria.',
      },
      {
        id: 'censura',
        label: 'Denunciar censura institucionalizada',
        description: 'Discurso forte; se houver investigação depois, você fica exposto.',
        effects: [
          { t: 'attr', attr: 'popularity', amount: 4 },
          { t: 'attr', attr: 'institutionalTrust', amount: -5 },
        ],
        summary: 'Denunciou censura institucional diante do apagão de mídia.',
      },
      {
        id: 'seguir',
        label: 'Seguir a agenda normal',
        description: 'Ninguém nota o silêncio... até notarem.',
        effects: [{ t: 'attr', attr: 'influence', amount: 1 }],
        summary: 'Manteve a agenda normal durante o apagão de mídia.',
      },
    ],
  },
  {
    id: 'vazamento_familiar',
    title: 'A gravação da mesa de Natal',
    text:
      'Uma gravação amadora da última reunião de família circula em grupos fechados: seu pai, de pijama, sugere "resolver o problema dos documentos" com um telefonema. Fora de contexto — mas a voz é dele.',
    portrait: 'helio',
    when: [{ t: 'daysGte', value: 28 }, { t: 'relationGte', who: 'helio', value: 50 }],
    priority: 74,
    once: true,
    choices: [
      {
        id: 'familia',
        label: 'Reunir a família e fechar fileiras',
        description: 'Ninguém fala. Ninguém grava. Custa popularidade, salva a sanidade.',
        effects: [
          { t: 'attr', attr: 'loyalty', amount: 6 },
          { t: 'attr', attr: 'popularity', amount: -3 },
          { t: 'flag', flag: 'familyUnited', value: true },
        ],
        summary: 'Reuniu a família e fechou fileiras após o vazamento.',
      },
      {
        id: 'processar',
        label: 'Identificar e processar o responsável',
        description: 'Investigação particular cara e impopular.',
        cost: { funds: 8 },
        effects: [
          { t: 'relation', who: 'helio', amount: -15 },
          { t: 'attr', attr: 'reputation', amount: -4 },
          { t: 'attr', attr: 'influence', amount: 3 },
        ],
        summary: 'Abriu investigação particular contra o vazamento familiar.',
      },
      {
        id: 'publicar',
        label: 'Publicar a versão completa da conversa',
        description: 'O trecho seguinte mostra o pai brincando. Nem todos vão rir.',
        effects: [
          { t: 'attr', attr: 'popularity', amount: 2 },
          { t: 'attr', attr: 'reputation', amount: -3 },
          { t: 'faction', faction: 'imprensa', amount: 4 },
        ],
        summary: 'Publicou o contexto integral da gravação familiar.',
      },
    ],
  },
  {
    id: 'debate_ultimato',
    title: 'O desafio de véspera',
    text:
      'Faltando 96 horas para a eleição, seu adversário desafiou você para um debate extra, ao vivo, sem intervalo e sem tema definido. Sua equipe estima que ele está apostando na pressão do cansaço.',
    portrait: 'aurelio',
    when: [{ t: 'phase', value: 'finalWeek' }, { t: 'daysGte', value: 52 }],
    priority: 90,
    once: true,
    choices: [
      {
        id: 'aceitar',
        label: 'Aceitar o debate extra ao vivo',
        description: 'Alto risco e alto retorno. Depende do seu preparo.',
        effects: [
          { t: 'debateSkill', amount: 4 },
          { t: 'attr', attr: 'popularity', amount: 3 },
          { t: 'flag', flag: 'extraDebate', value: true },
        ],
        summary: 'Aceitou o debate extra proposto na véspera.',
      },
      {
        id: 'foco',
        label: 'Recusar e fazer turnê de fechamento',
        description: 'Estratégia de segurança: base, rádio e comícios curtos.',
        effects: [
          { t: 'attr', attr: 'influence', amount: 2 },
          { t: 'attr', attr: 'popularity', amount: 2 },
          { t: 'regionAll', player: 1 },
        ],
        summary: 'Recusou o debate extra e fez turnê de fechamento.',
      },
      {
        id: 'condicionar',
        label: 'Aceitar, mas impondo tema e formato',
        description: 'Você dita o formato. Ganha controle e um pouco de admiração.',
        requires: [{ t: 'attrGte', attr: 'influence', value: 45 }],
        effects: [
          { t: 'debateSkill', amount: 3 },
          { t: 'attr', attr: 'influence', amount: 3 },
          { t: 'flag', flag: 'extraDebate', value: true },
        ],
        summary: 'Aceitou o debate extra impondo tema e formato próprios.',
      },
    ],
  },
  // --------------------------------------------------------------------------
  // Trama financeira e audiovisual (Dante Valverde, Black Stallion,
  // O Homem da República) — informações reveladas progressivamente.
  // --------------------------------------------------------------------------
  {
    id: 'dante_proposta',
    title: 'A proposta de Dante Valverde',
    text:
      'Dante Valverde pede café no comitê e entrega uma pasta: um fundo privado de comunicação quer bancar um hub de conteúdo da campanha — produções, edits e distribuição. Ele é direto sobre os juros: "Não compro opinião; compro qualidade de produção e contabilidade aberta a quem eu escolher." O contrato existe, está escrito, e cabe em duas páginas — a terceira é que ele prefere não divulgar.',
    portrait: 'dante',
    when: [{ t: 'missionDone', mission: 'm2' }, { t: 'daysGte', value: 22 }],
    priority: 65,
    guaranteed: true, // abertura do arco Dante (jusante: conflito/crédito/divida)
    once: true,
    choices: [
      {
        id: 'transparencia',
        label: 'Aceitar com cláusula pública de transparência',
        description: 'O contrato inteiro vai a público — inclusive a taxa que ele preferia manter privada.',
        effects: [
          { t: 'funds', amount: 24 },
          { t: 'attr', attr: 'reputation', amount: 4 },
          { t: 'attr', attr: 'influence', amount: 2 },
          { t: 'faction', faction: 'mercado', amount: 4 },
          { t: 'relation', who: 'dante', amount: 15 },
          { t: 'flag', flag: 'danteDeal', value: 'transparente' },
        ],
        summary: 'Aceitou o financiamento de Dante Valverde com cláusula pública de transparência.',
      },
      {
        id: 'restrito',
        label: 'Aceitar sem detalhar os termos na íntegra',
        description: 'Verba maior e silêncio sobre a página três. Todo mundo assina; ninguém expõe.',
        effects: [
          { t: 'funds', amount: 36 },
          { t: 'attr', attr: 'reputation', amount: -6 },
          { t: 'attr', attr: 'institutionalTrust', amount: -3 },
          { t: 'faction', faction: 'imprensa', amount: -4 },
          { t: 'relation', who: 'dante', amount: 20 },
          { t: 'flag', flag: 'danteDeal', value: 'opaco' },
        ],
        summary: 'Aceitou o financiamento de Dante Valverde sem divulgar todos os termos.',
      },
      {
        id: 'recusar',
        label: 'Recusar e transformar a recusa em transparência',
        description: 'Nenhuma verba. A campanha usa a recusa como argumento de campanha.',
        effects: [
          { t: 'attr', attr: 'reputation', amount: 5 },
          { t: 'attr', attr: 'influence', amount: 2 },
          { t: 'faction', faction: 'movimentos', amount: 4 },
          { t: 'relation', who: 'dante', amount: -15 },
          { t: 'flag', flag: 'danteDeal', value: 'recusado' },
        ],
        summary: 'Recusou o financiamento de Dante Valverde e exibiu a recusa como bandeira.',
      },
    ],
  },
  {
    id: 'black_stallion',
    title: 'Black Stallion chega ao corte final',
    text:
      'A cinebiografia "Black Stallion" — a trajetória de Júlio Barreto do comício de 1990 à cela de Santa Brígida — fecha o primeiro corte. A produtora convida você para depoimento. Nos créditos financeiros consta um fundo ligado à Valverde Participações: participação declarada em registro societário, sem entrevista e sem fala no roteiro. O diretor diz que o filme é "sobre memória, não sobre campanha".',
    portrait: 'helio',
    when: [{ t: 'missionDone', mission: 'm3' }, { t: 'daysGte', value: 26 }],
    priority: 68,
    guaranteed: true, // Black Stallion: dinheiro de Valverde nos créditos
    once: true,
    choices: [
      {
        id: 'depoimento',
        label: 'Aceitar o depoimento e contar a versão da família',
        description: 'Presença total no filme sobre o pai — com tudo o que isso arrasta para a pauta.',
        effects: [
          { t: 'attr', attr: 'popularity', amount: 4 },
          { t: 'attr', attr: 'reputation', amount: -2 },
          { t: 'relation', who: 'helio', amount: 10 },
          { t: 'relation', who: 'dante', amount: 8 },
          { t: 'flag', flag: 'stallion', value: 'depoimento' },
        ],
        summary: 'Aceitou depoimento na cinebiografia Black Stallion.',
      },
      {
        id: 'recusar',
        label: 'Recusar e denunciar a politização da biografia',
        description: 'Discurso de bastidor: o filme é propaganda de memória alheia.',
        effects: [
          { t: 'attr', attr: 'reputation', amount: 3 },
          { t: 'attr', attr: 'popularity', amount: -3 },
          { t: 'faction', faction: 'prn', amount: 4 },
          { t: 'relation', who: 'helio', amount: -8 },
          { t: 'relation', who: 'dante', amount: -6 },
          { t: 'flag', flag: 'stallion', value: 'recusa' },
        ],
        summary: 'Recusou participação em Black Stallion criticando a politização do filme.',
      },
      {
        id: 'calado',
        label: 'Recusar sem comentário e seguir a campanha',
        description: 'Nem apoia nem ataca: o filme roda longe do seu calendário.',
        effects: [
          { t: 'attr', attr: 'influence', amount: 2 },
          { t: 'attr', attr: 'reputation', amount: 1 },
          { t: 'relation', who: 'dante', amount: 5 },
          { t: 'flag', flag: 'stallion', value: 'calado' },
        ],
        summary: 'Deixou Black Stallion correr sem participação e sem crítica pública.',
      },
      {
        id: 'dante_negocia',
        label: 'Ligar para Dante e renegociar os créditos do filme',
        description:
          'Intermediação pessoal: seu aval público em troca de crédito de produtor independente e ressalva contratual.',
        requires: [{ t: 'relationGte', who: 'dante', value: 25 }],
        cost: { funds: 4, days: 1 },
        effects: [
          { t: 'attr', attr: 'reputation', amount: 3 },
          { t: 'attr', attr: 'influence', amount: 3 },
          { t: 'faction', faction: 'mercado', amount: 3 },
          { t: 'relation', who: 'dante', amount: 8 },
          { t: 'relation', who: 'iris', amount: 4 },
          { t: 'flag', flag: 'stallion', value: 'negociado' },
        ],
        summary: 'Intermediou com Dante Valverde uma ressalva de créditos em Black Stallion.',
      },
    ],
  },
  {
    id: 'documentario_republica',
    title: 'O Homem da República tem data',
    text:
      'O documentário "O Homem da República", sobre a trajetória de Leandro Lacerda, ganha data de estreia. William Nogueira apurou o que é documento: os créditos das duas produções — o documentário e a cinebiografia sobre o seu pai — passam por fundos que se cruzam, incluindo o de Dante Valverde. O que ainda é inferência: o que isso significa. William pede autorização para cruzar os contratos com a campanha.',
    portrait: 'iris',
    when: [{ t: 'missionDone', mission: 'm4' }, { t: 'daysGte', value: 34 }],
    priority: 66,
    guaranteed: true, // investigação jornalística de William: porta dos bastidores
    once: true,
    choices: [
      {
        id: 'investigar',
        label: 'Autorizar a apuração cruzada dos contratos',
        description: 'A jornalista vai aos documentos: o que vier, vem com nome e data.',
        cost: { funds: 4 },
        effects: [
          { t: 'attr', attr: 'reputation', amount: 3 },
          { t: 'faction', faction: 'imprensa', amount: 6 },
          { t: 'relation', who: 'iris', amount: 12 },
          { t: 'relation', who: 'dante', amount: -5 },
          { t: 'flag', flag: 'productionsInvestigated', value: true },
        ],
        summary: 'Autorizou William Nogueira a cruzar contratos das produções com a campanha.',
      },
      {
        id: 'entrevista',
        label: 'Conceder entrevista sobre transparência da campanha',
        description: 'Você fala primeiro: sua verba, suas regras — sem entrar nos filmes dos outros.',
        effects: [
          { t: 'attr', attr: 'influence', amount: 4 },
          { t: 'faction', faction: 'imprensa', amount: 6 },
          { t: 'relation', who: 'iris', amount: 8 },
          { t: 'attr', attr: 'reputation', amount: 2 },
          { t: 'flag', flag: 'republicaDoc', value: 'entrevista' },
        ],
        summary: 'Concedeu entrevista sobre transparência do financiamento de campanha.',
      },
      {
        id: 'atacar',
        label: 'Denunciar o documentário como propaganda disfarçada',
        description: 'Ataque frontal ao filme do adversário — sem esperar a apuração terminar.',
        effects: [
          { t: 'attr', attr: 'popularity', amount: 3 },
          { t: 'attr', attr: 'reputation', amount: -5 },
          { t: 'faction', faction: 'imprensa', amount: -6 },
          { t: 'relation', who: 'aurelio', amount: -10 },
          { t: 'relation', who: 'iris', amount: -8 },
          { t: 'flag', flag: 'republicaDoc', value: 'ataque' },
        ],
        summary: 'Denunciou O Homem da República como propaganda disfarçada antes de provar algo.',
      },
    ],
  },
  {
    id: 'dante_conflito',
    title: 'A página três vira manchete',
    text:
      'Dois portais recebem, na mesma hora, o contrato que você assinou sem divulgar integralmente. Documento: o valor e o fundo, confirmados. Alegação: que a taxa da página três "compra acesso" — ninguém apresentou prova de troca. Dante Valverde, em nota curta, diz que tudo é "regular, declarado e boring". A pergunta no comitê é uma só: o que você publica até amanhã?',
    portrait: 'dante',
    when: [{ t: 'flag', flag: 'danteDeal', equals: 'opaco' }, { t: 'daysGte', value: 30 }],
    priority: 80,
    guaranteed: true, // consequência do caminho opaco
    once: true,
    choices: [
      {
        id: 'prestar_contas',
        label: 'Publicar o contrato integralmente, antes de cobranças',
        description: 'Tudo a público: valor, taxa e cláusulas. O escândalo vira procedimento.',
        cost: { funds: 6 },
        effects: [
          { t: 'attr', attr: 'reputation', amount: 6 },
          { t: 'attr', attr: 'institutionalTrust', amount: 3 },
          { t: 'faction', faction: 'imprensa', amount: 6 },
          { t: 'relation', who: 'dante', amount: -20 },
          { t: 'flag', flag: 'danteDeal', value: 'regularizado' },
        ],
        summary: 'Publicou integralmente o contrato com o fundo de Dante Valverde ao vivo.',
      },
      {
        id: 'rebater',
        label: 'Rebater como ataque pessoal do adversário',
        description: 'Contra-ofensiva: quem vazou o contrato tem nome e agenda.',
        effects: [
          { t: 'attr', attr: 'popularity', amount: 4 },
          { t: 'attr', attr: 'reputation', amount: -6 },
          { t: 'faction', faction: 'imprensa', amount: -8 },
          { t: 'relation', who: 'dante', amount: 5 },
          { t: 'relation', who: 'aurelio', amount: -6 },
          { t: 'flag', flag: 'danteScandal', value: 'rebateu' },
        ],
        summary: 'Rebateu a divulgação parcial do contrato como ataque pessoal.',
      },
      {
        id: 'reserva',
        label: 'Silêncio jurídico: nenhum comentário até perícia',
        description: 'O escritório responde no prazo; a campanha, por enquanto, não.',
        effects: [
          { t: 'attr', attr: 'influence', amount: -2 },
          { t: 'attr', attr: 'reputation', amount: -2 },
          { t: 'attr', attr: 'institutionalTrust', amount: 1 },
          { t: 'relation', who: 'dante', amount: -5 },
          { t: 'flag', flag: 'danteScandal', value: 'silencio' },
        ],
        summary: 'Manteve silêncio jurídico diante da vazamento do contrato com Dante Valverde.',
      },
    ],
  },
  // --------------------------------------------------------------------------
  // Repercussões do tribunal e articulação política (André Monteiro,
  // Caetano Góis, Tiago Farias).
  // --------------------------------------------------------------------------
  {
    id: 'andre_tribunal',
    title: 'O desfecho do processo vira pauta nacional',
    text:
      'O desfecho do processo de Júlio Barreto saiu do sigilo e virou a pauta do país: metade do país lê vitória, a outra metade lê trâmite adiado — e ambos citam o relator André Monteiro, que não concedeu entrevista nenhuma. Em nota de duas linhas, o tribunal lembra que "a decisão pertence ao colegiado, não à campanha". Pedro pergunta o que a equipe vai dizer sobre aquilo que ninguém pode mudar.',
    portrait: 'amaro',
    when: [{ t: 'flag', flag: 'fathersFate' }, { t: 'daysGte', value: 30 }],
    priority: 85,
    once: true,
    choices: [
      {
        id: 'institucional',
        label: 'Manter o discurso do rito: processo na Justiça, voto na urna',
        description: 'Sem celebração nem denúncia — a campanha devolve o assunto às instituições.',
        effects: [
          { t: 'attr', attr: 'institutionalTrust', amount: 6 },
          { t: 'attr', attr: 'reputation', amount: 4 },
          { t: 'faction', faction: 'judiciario', amount: 6 },
          { t: 'relation', who: 'amaro', amount: 10 },
          { t: 'attr', attr: 'popularity', amount: -2 },
          { t: 'flag', flag: 'tribunalPostura', value: 'institucional' },
        ],
        summary: 'Respondeu ao desfecho judicial reforçando a separação entre processo e eleição.',
      },
      {
        id: 'campanha',
        label: 'Usar o desfecho como vitória de campanha',
        description: 'Palanque, manchete e o relator virando personagem da sua biografia.',
        effects: [
          { t: 'attr', attr: 'popularity', amount: 6 },
          { t: 'attr', attr: 'institutionalTrust', amount: -5 },
          { t: 'attr', attr: 'reputation', amount: -3 },
          { t: 'faction', faction: 'judiciario', amount: -6 },
          { t: 'relation', who: 'amaro', amount: -15 },
          { t: 'flag', flag: 'tribunalPostura', value: 'campanha' },
        ],
        summary: 'Transformou o desfecho do processo em argumento de campanha.',
      },
      {
        id: 'reserva',
        label: 'Pedir reserva total à equipe e não comentar',
        description: 'Nenhum satélite fala do processo. A pauta migra sozinha em 48 horas.',
        effects: [
          { t: 'attr', attr: 'institutionalTrust', amount: 2 },
          { t: 'attr', attr: 'influence', amount: -2 },
          { t: 'relation', who: 'amaro', amount: 4 },
          { t: 'relation', who: 'vera', amount: 4 },
          { t: 'flag', flag: 'tribunalPostura', value: 'reserva' },
        ],
        summary: 'Impôs reserva absoluta sobre o desfecho do processo para a campanha.',
      },
      {
        id: 'escrita',
        label: 'Responder por escrito, nos autos, antes de falar em público',
        description:
          'Manifestação protocolada no processo: o rito vira tribuna — e o relator responde quem ele ainda não descartou. Exige clima construído com André Monteiro.',
        requires: [{ t: 'relationGte', who: 'amaro', value: -45 }],
        effects: [
          { t: 'attr', attr: 'institutionalTrust', amount: 5 },
          { t: 'faction', faction: 'judiciario', amount: 5 },
          { t: 'relation', who: 'amaro', amount: 6 },
          { t: 'relation', who: 'salome', amount: 5 },
          { t: 'attr', attr: 'reputation', amount: 3 },
          { t: 'attr', attr: 'popularity', amount: -1 },
          { t: 'flag', flag: 'tribunalPostura', value: 'escrita' },
        ],
        summary: 'Respondeu ao desfecho judicial por manifestação protocolada nos autos.',
      },
    ],
  },
  {
    id: 'caetano_articulacao',
    title: 'Caetano Góis quer conversar por pauta',
    text:
      'Caetano Góis aparece no comitê sem convite e sem bandeira: "Não sou do seu partido nem do seu contrato. Sou da reforma administrativa, e vocês precisam de gente que sabe contar voto no corredor." Ele oferece articulação real — ligações, agendas, PREFEITOS — desde que a pauta dele entre no seu primeiro ano. Apoia a proposta; ainda não decidiu sobre você.',
    portrait: 'caetano',
    when: [
      { t: 'any', of: [{ t: 'missionDone', mission: 'm4' }, { t: 'missionFailed', mission: 'm4' }] },
      { t: 'daysGte', value: 32 },
    ],
    priority: 62,
    guaranteed: true, // abertura do arco Caetano (jusante: exigências)
    once: true,
    choices: [
      {
        id: 'aceitar',
        label: 'Aceitar o apoio público e a agenda da pauta dele',
        description: 'Ele entrega a articulação — e cobra a votação da reforma no seu primeiro ano.',
        effects: [
          { t: 'faction', faction: 'prn', amount: 6 },
          { t: 'attr', attr: 'influence', amount: 4 },
          { t: 'attr', attr: 'popularity', amount: 2 },
          { t: 'relation', who: 'caetano', amount: 15 },
          { t: 'flag', flag: 'caetanoSupport', value: 'sim' },
        ],
        summary: 'Aceitou apoio público de Caetano Góis com compromisso da agenda administrativa.',
      },
      {
        id: 'limites',
        label: 'Aceitar apenas apoio sem endosso nominal',
        description: 'Ele trabalha nos bastidores; o nome dele não entra no material.',
        effects: [
          { t: 'faction', faction: 'prn', amount: 3 },
          { t: 'attr', attr: 'influence', amount: 2 },
          { t: 'attr', attr: 'loyalty', amount: 2 },
          { t: 'relation', who: 'caetano', amount: 8 },
          { t: 'flag', flag: 'caetanoSupport', value: 'limitado' },
        ],
        summary: 'Limitou o apoio de Caetano Góis a articulação sem endosso público.',
      },
      {
        id: 'recusar',
        label: 'Recusar: independência acima de articulação',
        description: 'Sem dívidas de agenda. Você perde a rede de contato dele na reta final.',
        effects: [
          { t: 'attr', attr: 'loyalty', amount: 4 },
          { t: 'attr', attr: 'influence', amount: -2 },
          { t: 'relation', who: 'caetano', amount: -10 },
          { t: 'flag', flag: 'caetanoSupport', value: 'nao' },
        ],
        summary: 'Recusou o apoio de Caetano Góis para preservar independência de agenda.',
      },
    ],
  },
  {
    id: 'tiago_gestao',
    title: 'Tiago Farias empresta a máquina',
    text:
      'Tiago Farias, da Administração Metropolitana do Vale, oferece o que ninguém tem: uma rede de gestores e técnicos que conhece cada bairro por número de empenho. "Não quero cargo nem verba sua. Quero que, quando você ganhar, gestão não vire narrativa." A condição estrutural: a rede entra com estrutura própria, e ele fica visível nela.',
    portrait: 'tiago',
    when: [{ t: 'missionDone', mission: 'm4' }, { t: 'daysGte', value: 36 }],
    priority: 60,
    guaranteed: true, // abertura do arco Tiago (jusante: ascensão)
    once: true,
    choices: [
      {
        id: 'rede',
        label: 'Aceitar a rede de gestores com Tiago visível',
        description: 'Estrutura pronta no Vale — e um gestor ambicioso dentro da foto da campanha.',
        cost: { funds: 6 },
        effects: [
          { t: 'regionAll', player: 3 },
          { t: 'attr', attr: 'influence', amount: 3 },
          { t: 'attr', attr: 'loyalty', amount: -3 },
          { t: 'faction', faction: 'prn', amount: 4 },
          { t: 'relation', who: 'tiago', amount: 15 },
          { t: 'flag', flag: 'tiagoRede', value: 'estrutura' },
        ],
        summary: 'Aceitou a rede de gestores de Tiago Farias com presença estrutural dele.',
      },
      {
        id: 'dados',
        label: 'Aceitar só os dados e a cartografia do Vale',
        description: 'Informação sem estrutura partidária alheia: metade do benefício, nenhuma foto.',
        effects: [
          { t: 'regionAll', player: 2 },
          { t: 'attr', attr: 'loyalty', amount: 2 },
          { t: 'attr', attr: 'influence', amount: 1 },
          { t: 'relation', who: 'tiago', amount: 6 },
          { t: 'flag', flag: 'tiagoRede', value: 'dados' },
        ],
        summary: 'Aceitou apenas dados e cartografia regional de Tiago Farias.',
      },
      {
        id: 'recusar',
        label: 'Recusar: a campanha não deve máquina a gestor algum',
        description: 'Autonomia integral e um gestor com ambição própria do lado de fora.',
        effects: [
          { t: 'attr', attr: 'loyalty', amount: 4 },
          { t: 'attr', attr: 'influence', amount: -1 },
          { t: 'relation', who: 'tiago', amount: -12 },
          { t: 'flag', flag: 'tiagoRede', value: 'nao' },
        ],
        summary: 'Recusou a máquina de gestores de Tiago Farias para manter autonomia.',
      },
    ],
  },
  {
    id: 'bastidores_publicados',
    title: 'Os contratos cruzados viram matéria de capa',
    text:
      'William Nogueira publicou a apuração: os créditos de "Black Stallion" e de "O Homem da República" passam por fundos que se cruzam — o documento do fundo de Dante Valverde está lá, declarado; a conclusão de que "um lado comprou o outro" não. A matéria pede resposta das duas campanhas, e Rafael Sampaio anunciou que o MNR vai lê-la nos canais do movimento, integra por integra.',
    portrait: 'iris',
    when: [{ t: 'flag', flag: 'productionsInvestigated' }, { t: 'daysGte', value: 40 }],
    priority: 78,
    guaranteed: true, // consequência da apuração autorizada
    once: true,
    choices: [
      {
        id: 'endossar',
        label: 'Endossar a apuração e oferecer as fontes da campanha',
        description: 'Transparência total como bandeira — Dante não vai agradecer.',
        effects: [
          { t: 'faction', faction: 'imprensa', amount: 8 },
          { t: 'relation', who: 'iris', amount: 10 },
          { t: 'attr', attr: 'reputation', amount: 4 },
          { t: 'attr', attr: 'influence', amount: 3 },
          { t: 'relation', who: 'dante', amount: -8 },
          { t: 'flag', flag: 'bastidores', value: 'endossou' },
        ],
        summary: 'Endossou publicamente a apuração de William Nogueira sobre as produções.',
      },
      {
        id: 'prudencia',
        label: 'Pedir prudência: publicar é papel da imprensa, não da campanha',
        description: 'A campanha não vira braço de editoria — e William anota a distância.',
        effects: [
          { t: 'attr', attr: 'institutionalTrust', amount: 4 },
          { t: 'attr', attr: 'reputation', amount: 3 },
          { t: 'relation', who: 'iris', amount: 4 },
          { t: 'attr', attr: 'influence', amount: -1 },
          { t: 'flag', flag: 'bastidores', value: 'prudencia' },
        ],
        summary: 'Manteve distância institucional da matéria sobre as produções.',
      },
      {
        id: 'arma',
        label: 'Usar a matéria como arma contra o documentário do adversário',
        description: 'O cruzamento vira slogan — e a manchete vira acusação sem prova.',
        effects: [
          { t: 'attr', attr: 'popularity', amount: 5 },
          { t: 'faction', faction: 'imprensa', amount: -6 },
          { t: 'relation', who: 'aurelio', amount: -8 },
          { t: 'relation', who: 'iris', amount: -6 },
          { t: 'attr', attr: 'reputation', amount: -4 },
          { t: 'flag', flag: 'bastidores', value: 'arma' },
        ],
        summary: 'Usou a matéria sobre as produções como arma de campanha.',
      },
    ],
  },
  // =========================================================================
  // EXPANSÃO NARRATIVA (Rodada 7) — arcos próprios por personagem, com
  // apresentação cedo, negociação no meio e consequência atrasada no fim.
  // =========================================================================
  // --------------------------------------------------------------------------
  // Arco de Felipe Azevedo (ministro da Economia do governo adversário):
  // pacote econômico → debate de propostas → crise orçamentária regional.
  // --------------------------------------------------------------------------
  {
    id: 'pacote_economico',
    title: 'O pacote do ministro muda a pauta',
    text:
      'Felipe Azevedo anunciou, com gráficos e dois horas de imprensa, um pacote econômico do governo: juros do financiamento regional, alívio para a indústria da Serra do Leste e um corte de imposto que os mercados já estão comemorando. Leandro Lacerda apareceu ao lado, sorridente, no momento exato da manchete. Sua equipe pergunta uma coisa: você critica a conta, elogia a técnica ou chega com um plano próprio?',
    portrait: 'camurca',
    when: [{ t: 'daysGte', value: 6 }],
    priority: 72,
    once: true,
    choices: [
      {
        id: 'tecnica',
        label: 'Elogiar a técnica e deslocar a discussão para a execução',
        description: 'Concordar com o diagnóstico e disputar o mérito sem parecer pequeno.',
        effects: [
          { t: 'attr', attr: 'reputation', amount: 3 },
          { t: 'attr', attr: 'institutionalTrust', amount: 2 },
          { t: 'attr', attr: 'popularity', amount: -1 },
          { t: 'relation', who: 'camurca', amount: 6 },
          { t: 'faction', faction: 'mercado', amount: 4 },
          { t: 'flag', flag: 'pacoteEconomico', value: 'tecnica' },
        ],
        summary: 'Elogiou a técnica do pacote econômico do governo e disputou a execução.',
      },
      {
        id: 'critica',
        label: 'Criticar a conta que o pacote deixa para as regiões',
        description: 'A indústria da Serra aplaude; o Tesouro é quem paga a nota no fim.',
        effects: [
          { t: 'attr', attr: 'popularity', amount: 4 },
          { t: 'faction', faction: 'movimentos', amount: 4 },
          { t: 'faction', faction: 'mercado', amount: -6 },
          { t: 'region', region: 'sle', player: 3 },
          { t: 'relation', who: 'camurca', amount: -8 },
          { t: 'flag', flag: 'pacoteEconomico', value: 'critica' },
        ],
        summary: 'Criticou a conta regional do pacote econômico do governo.',
      },
      {
        id: 'contraproposta',
        label: 'Apresentar contraproposta própria com estudo de custos',
        description: 'Caro e trabalhoso: a campanha disputa a pauta com números na mesa.',
        requires: [{ t: 'attrGte', attr: 'influence', value: 35 }],
        cost: { funds: 5 },
        effects: [
          { t: 'attr', attr: 'influence', amount: 4 },
          { t: 'attr', attr: 'reputation', amount: 3 },
          { t: 'attr', attr: 'institutionalTrust', amount: 3 },
          { t: 'faction', faction: 'mercado', amount: 2 },
          { t: 'attr', attr: 'popularity', amount: -2 },
          { t: 'relation', who: 'camurca', amount: 3 },
          { t: 'flag', flag: 'pacoteEconomico', value: 'contraproposta' },
        ],
        summary: 'Apresentou contraproposta econômica própria com estudo de custos publicado.',
      },
    ],
  },
  {
    id: 'debate_economico',
    title: 'O ministro desvia para você',
    text:
      'Felipe Azevedo propôs, ao vivo e sem avisar, um debate econômico nacional entre as duas propostas — e citou seu nome sete vezes em quatro minutos. Ele é rápido com números, protege o governo com dados e não costuma errar um jargão. A redação que organizou o encontro já reservou o estúdio para quinta-feira. A sua equipe tem um dia para decidir o que fazer com o convite.',
    portrait: 'camurca',
    when: [
      { t: 'daysGte', value: 16 },
      {
        t: 'any',
        of: [{ t: 'flag', flag: 'pacoteEconomico' }, { t: 'daysGte', value: 26 }],
      },
    ],
    priority: 76,
    once: true,
    choices: [
      {
        id: 'aceitar',
        label: 'Aceitar o debate ao vivo, sem medo dos números',
        description: 'Horário nobre, plateia grande e um ministro que estuda planilha.',
        requires: [{ t: 'attrGte', attr: 'influence', value: 30 }],
        effects: [
          { t: 'debateSkill', amount: 8 },
          { t: 'attr', attr: 'popularity', amount: 4 },
          { t: 'attr', attr: 'influence', amount: 3 },
          { t: 'relation', who: 'camurca', amount: 6 },
          { t: 'faction', faction: 'imprensa', amount: 4 },
          { t: 'flag', flag: 'debateEconomico', value: 'aceito' },
        ],
        summary: 'Aceitou o debate econômico ao vivo contra Felipe Azevedo.',
      },
      {
        id: 'preparar',
        label: 'Aceitar apenas com estudo técnico completo antes',
        description: 'Um dia a menos de rua, dobro de planilha — e nenhum número pela metade.',
        cost: { funds: 7, days: 1 },
        effects: [
          { t: 'debateSkill', amount: 12 },
          { t: 'attr', attr: 'institutionalTrust', amount: 3 },
          { t: 'attr', attr: 'reputation', amount: 2 },
          { t: 'faction', faction: 'mercado', amount: 2 },
          { t: 'relation', who: 'camurca', amount: 3 },
          { t: 'flag', flag: 'debateEconomico', value: 'preparado' },
        ],
        summary: 'Aceitou o debate econômico depois de estudo técnico completo com a equipe.',
      },
      {
        id: 'recusar',
        label: 'Recusar: a agenda é do projeto, não do adversário',
        description: 'O ministro debate sozinho com o espelho; você segue a estrada.',
        effects: [
          { t: 'attr', attr: 'popularity', amount: -3 },
          { t: 'attr', attr: 'influence', amount: -2 },
          { t: 'faction', faction: 'imprensa', amount: -4 },
          { t: 'relation', who: 'camurca', amount: -6 },
          { t: 'flag', flag: 'debateEconomico', value: 'recusado' },
        ],
        summary: 'Recusou o debate econômico proposto por Felipe Azevedo.',
      },
      {
        id: 'confronto',
        label: 'Aceitar e transformar o debate em julgamento do governo',
        description: 'Você vai para a estação disputando o país que o governo entregou.',
        effects: [
          { t: 'attr', attr: 'popularity', amount: 5 },
          { t: 'attr', attr: 'reputation', amount: -3 },
          { t: 'attr', attr: 'institutionalTrust', amount: -3 },
          { t: 'relation', who: 'aurelio', amount: -8 },
          { t: 'relation', who: 'camurca', amount: -4 },
          { t: 'faction', faction: 'imprensa', amount: 2 },
          { t: 'flag', flag: 'debateEconomico', value: 'confronto' },
        ],
        summary: 'Aceitou o debate econômico como julgamento público do governo.',
      },
      {
        id: 'revanche',
        label: 'Rebater na estação os números do pacote que você já criticou',
        description: 'Só quem já colocou os números do pacote na mesa entra com a réplica pronta.',
        requires: [{ t: 'flag', flag: 'pacoteEconomico', equals: 'critica' }],
        effects: [
          { t: 'debateSkill', amount: 7 },
          { t: 'attr', attr: 'popularity', amount: 3 },
          { t: 'attr', attr: 'influence', amount: 2 },
          { t: 'relation', who: 'camurca', amount: -5 },
          { t: 'flag', flag: 'debateEconomico', value: 'revanche' },
        ],
        summary: 'Usou a crítica anterior ao pacote econômico como munição no debate com o ministro.',
      },
    ],
  },
  {
    id: 'crise_orcamentaria',
    title: 'A conta do governo vira crise fiscal',
    text:
      'Felipe Azevedo reconheceu, em nota de madrugada, que o pacote econômico não fecha sem um ajuste orçamentário — e o ajuste começa pelos repasses da Serra do Leste. Os portos falam em calendário de greve; o mercado exige definição até sexta. O ministro avisou, por telefone seco, que "quem quiser contraproposta será ouvido". A sua equipe espera um gesto — qualquer gesto — antes das manchetes.',
    portrait: 'camurca',
    when: [
      { t: 'daysGte', value: 30 },
      {
        t: 'any',
        of: [{ t: 'flag', flag: 'pacoteEconomico' }, { t: 'daysGte', value: 38 }],
      },
    ],
    priority: 80,
    once: true,
    choices: [
      {
        id: 'pacto',
        label: 'Fechar pacto orçamentário com o governo',
        description: 'Roubo de agenda imediato em troca de clima institucional com quem governa.',
        cost: { funds: 5 },
        effects: [
          { t: 'attr', attr: 'institutionalTrust', amount: 4 },
          { t: 'faction', faction: 'mercado', amount: 6 },
          { t: 'faction', faction: 'movimentos', amount: -4 },
          { t: 'region', region: 'sle', player: 3 },
          { t: 'relation', who: 'camurca', amount: 10 },
          { t: 'attr', attr: 'popularity', amount: -3 },
          { t: 'flag', flag: 'criseOrcamentaria', value: 'pacto' },
        ],
        summary: 'Fechou pacto orçamentário com o governo durante a crise fiscal.',
      },
      {
        id: 'denuncia',
        label: 'Denunciar o cálculo político por trás da conta',
        description: 'O ajuste foi escolhido — não decorrido. Dizer isso tem preço e retorno.',
        effects: [
          { t: 'attr', attr: 'popularity', amount: 5 },
          { t: 'faction', faction: 'imprensa', amount: 5 },
          { t: 'faction', faction: 'mercado', amount: -4 },
          { t: 'relation', who: 'camurca', amount: -10 },
          { t: 'region', region: 'sle', player: 2 },
          { t: 'flag', flag: 'criseOrcamentaria', value: 'denuncia' },
        ],
        summary: 'Denunciou o cálculo político do ajuste orçamentário anunciado por Felipe Azevedo.',
      },
      {
        id: 'regional',
        label: 'Enfrentar a crise onde ela dói: plano para a Serra do Leste',
        description: 'Verba nova, anúncio regional e um pedágio político que só você paga.',
        cost: { funds: 8 },
        effects: [
          { t: 'region', region: 'sle', player: 7 },
          { t: 'attr', attr: 'loyalty', amount: 2 },
          { t: 'attr', attr: 'influence', amount: 3 },
          { t: 'faction', faction: 'movimentos', amount: 3 },
          { t: 'flag', flag: 'criseOrcamentaria', value: 'regional' },
        ],
        summary: 'Lancou plano próprio para a Serra do Leste diante da crise orçamentária.',
      },
    ],
  },
  // --------------------------------------------------------------------------
  // Arco de Caetano Góis (terceira posição): crítica às duas propostas →
  // cobrança da agenda da reforma com troca regional.
  // --------------------------------------------------------------------------
  {
    id: 'caetano_critica',
    title: 'Caetano Góis critica os dois lados',
    text:
      'Caetano Góis deu uma entrevista nacional que ninguém pediu e todo mundo reproduziu: chamou o pacote do governo de "contabilidade criativa com coragem de anúncio" e a plataforma da sua campanha de "boa intenção sem régua de execução". Ele fechou com o diagnóstico de sempre: "Eu apoio ideia, não adesão. Quem quiser conversar, que chegue com número."',
    portrait: 'caetano',
    when: [{ t: 'daysGte', value: 14 }],
    priority: 68,
    once: true,
    choices: [
      {
        id: 'resposta',
        label: 'Responder na pauta dele, com número na mão',
        description: 'Ele respeita quem discute mérito — e cobra quem só faz nota de repúdio.',
        effects: [
          { t: 'attr', attr: 'influence', amount: 4 },
          { t: 'relation', who: 'caetano', amount: 10 },
          { t: 'faction', faction: 'imprensa', amount: 3 },
          { t: 'flag', flag: 'caetanoCritica', value: 'resposta' },
        ],
        summary: 'Respondeu à crítica de Caetano Góis na pauta dele, com números.',
      },
      {
        id: 'ignorar',
        label: 'Ignorar e manter a agenda da semana',
        description: 'A crítica vira pauta de analistas por dois dias e some.',
        effects: [
          { t: 'attr', attr: 'influence', amount: -2 },
          { t: 'faction', faction: 'prn', amount: -3 },
          { t: 'attr', attr: 'popularity', amount: 1 },
          { t: 'flag', flag: 'caetanoCritica', value: 'ignorou' },
        ],
        summary: 'Ignorou a crítica pública de Caetano Góis e manteve a agenda.',
      },
      {
        id: 'confronto',
        label: 'Confrontá-lo no próximo bloco, ao vivo',
        description: 'Espetáculo garantido; o independente vira adversário no ar.',
        effects: [
          { t: 'attr', attr: 'popularity', amount: 4 },
          { t: 'relation', who: 'caetano', amount: -12 },
          { t: 'faction', faction: 'imprensa', amount: 4 },
          { t: 'attr', attr: 'reputation', amount: -2 },
          { t: 'flag', flag: 'caetanoCritica', value: 'confronto' },
        ],
        summary: 'Confrontou Caetano Góis ao vivo depois da crítica às propostas.',
      },
      {
        id: 'dialogo',
        label: 'Reconhecer o que a crítica tem de razão e abrir diálogo',
        description: 'Humildade pública com quem discorda — o jogo que ele sabe jogar.',
        effects: [
          { t: 'attr', attr: 'reputation', amount: 4 },
          { t: 'attr', attr: 'influence', amount: 3 },
          { t: 'relation', who: 'caetano', amount: 14 },
          { t: 'attr', attr: 'popularity', amount: -3 },
          { t: 'faction', faction: 'prn', amount: 2 },
          { t: 'flag', flag: 'caetanoCritica', value: 'dialogo' },
        ],
        summary: 'Reconheceu parte da razão de Caetano Góis e abriu diálogo programático.',
      },
    ],
  },
  {
    id: 'caetano_exigencias',
    title: 'A agenda que Caetano cobra por escrito',
    text:
      'Caetano Góis manda um documento de sete páginas pelo mensageiro que nunca fala com ninguém: o calendário da reforma administrativa que ele quer ver votado no primeiro ano. Em troca, ele mantém a articulação nos corredores das regiões onde tem prefeitos. "Não é venda", escreve na última linha. "É compromisso com a própria ideia que vocês dizem perseguir."',
    portrait: 'caetano',
    when: [
      { t: 'daysGte', value: 40 },
      {
        t: 'any',
        of: [
          { t: 'flag', flag: 'caetanoSupport', equals: 'sim' },
          { t: 'flag', flag: 'caetanoSupport', equals: 'limitado' },
        ],
      },
    ],
    priority: 76,
    guaranteed: true, // quem aceitou o apoio de Caetano é cobrado
    once: true,
    choices: [
      {
        id: 'aceita',
        label: 'Assumir a agenda da reforma no primeiro ano',
        description: 'Ele entrega os prefeitos; você entrega a votação da proposta dele.',
        effects: [
          { t: 'region', region: 'plc', player: 4 },
          { t: 'faction', faction: 'prn', amount: 5 },
          { t: 'relation', who: 'caetano', amount: 12 },
          { t: 'attr', attr: 'loyalty', amount: -3 },
          { t: 'flag', flag: 'caetanoAgenda', value: 'aceita' },
        ],
        summary: 'Assumiu o compromisso com a agenda da reforma administrativa de Caetano Góis.',
      },
      {
        id: 'parcial',
        label: 'Assumir apenas o capítulo de transparência',
        description: 'Meio caminho honesto: o essencial da proposta, sem o calendário alheio.',
        effects: [
          { t: 'region', region: 'plc', player: 2 },
          { t: 'attr', attr: 'influence', amount: 3 },
          { t: 'attr', attr: 'reputation', amount: 2 },
          { t: 'relation', who: 'caetano', amount: 5 },
          { t: 'flag', flag: 'caetanoAgenda', value: 'parcial' },
        ],
        summary: 'Assumiu apenas o capítulo de transparência da reforma proposta por Caetano Góis.',
      },
      {
        id: 'recusa',
        label: 'Recusar: a agenda da campanha é da campanha',
        description: 'A articulação dele continua — mas com entusiasmo menor.',
        effects: [
          { t: 'attr', attr: 'loyalty', amount: 3 },
          { t: 'relation', who: 'caetano', amount: -10 },
          { t: 'attr', attr: 'influence', amount: -2 },
          { t: 'faction', faction: 'prn', amount: -2 },
          { t: 'flag', flag: 'caetanoAgenda', value: 'recusa' },
        ],
        summary: 'Recusou a agenda da reforma exigida por Caetano Góis em troca da articulação.',
      },
    ],
  },
  // --------------------------------------------------------------------------
  // Arco de Tiago Farias (gestor com projeto próprio): dados do Vale →
  // uso da visibilidade para fortalecer o próprio nome.
  // --------------------------------------------------------------------------
  {
    id: 'tiago_contato',
    title: 'Tiago entrega a cartografia do Vale',
    text:
      'Tiago Farias mandou, por canal próprio, o que nenhuma consultoria vende: a cartografia do Vale do Amanhã bairro a bairro, com número de empenho, prazo de obra e reclamação recorrente. A missiva termina sem pedido: "Use como quiser. Se citar meu nome, use com precisão — gestão não é narrativa, é número." A sua equipe espera a ordem sobre o que fazer com o material.',
    portrait: 'tiago',
    when: [{ t: 'daysGte', value: 18 }],
    priority: 66,
    once: true,
    choices: [
      {
        id: 'credito',
        label: 'Usar a cartografia com crédito nominal a ele',
        description: 'Dados melhores, foto do gestor na campanha e uma dívida visível.',
        effects: [
          { t: 'region', region: 'vam', player: 4 },
          { t: 'attr', attr: 'influence', amount: 2 },
          { t: 'attr', attr: 'loyalty', amount: -2 },
          { t: 'relation', who: 'tiago', amount: 10 },
          { t: 'flag', flag: 'tiagoContato', value: 'credito' },
        ],
        summary: 'Usou a cartografia regional de Tiago Farias com crédito nominal dele.',
      },
      {
        id: 'interno',
        label: 'Usar os dados internamente, sem foto',
        description: 'Melhor planejamento de rua, nenhuma dívida pública.',
        effects: [
          { t: 'region', region: 'vam', player: 3 },
          { t: 'relation', who: 'tiago', amount: 4 },
          { t: 'attr', attr: 'loyalty', amount: 1 },
          { t: 'flag', flag: 'tiagoContato', value: 'interno' },
        ],
        summary: 'Usou os dados de Tiago Farias apenas no planejamento interno da campanha.',
      },
      {
        id: 'recusar',
        label: 'Recusar: a campanha não deve máquina a gestor algum',
        description: 'Autonomia integral — e um gestor competente do lado de fora.',
        effects: [
          { t: 'attr', attr: 'loyalty', amount: 2 },
          { t: 'relation', who: 'tiago', amount: -8 },
          { t: 'flag', flag: 'tiagoContato', value: 'recusada' },
        ],
        summary: 'Recusou os dados regionais oferecidos por Tiago Farias.',
      },
    ],
  },
  {
    id: 'tiago_ascensao',
    title: 'O gestor usa a crise para o projeto próprio',
    text:
      'Nas duas últimas semanas, Tiago Farias deu cinco entrevistas — nenhuma citou a sua campanha diretamente, e todas terminaram com a frase "gestão não é narrativa". Ele virou referência nacional de administrador e os editoriais já especulam sobre "a terceira via da próxima legislatura". Pedro resume o problema sem drama: enquanto a sua campanha disputa a eleição, o nome dele já disputa o pós.',
    portrait: 'tiago',
    when: [
      { t: 'daysGte', value: 42 },
      {
        t: 'any',
        of: [
          { t: 'flag', flag: 'tiagoRede', equals: 'estrutura' },
          { t: 'flag', flag: 'tiagoRede', equals: 'dados' },
        ],
      },
    ],
    priority: 76,
    guaranteed: true, // quem pegou a rede de Tiago acompanha a ascensão
    once: true,
    choices: [
      {
        id: 'conteve',
        label: 'Contê-lo publicamente e redesenhar os papéis',
        description: 'Nota dura, papéis definidos e um gestor ambicioso transformado em problema.',
        effects: [
          { t: 'relation', who: 'tiago', amount: -12 },
          { t: 'attr', attr: 'loyalty', amount: 3 },
          { t: 'attr', attr: 'influence', amount: -2 },
          { t: 'faction', faction: 'prn', amount: -2 },
          { t: 'flag', flag: 'tiagoAscensao', value: 'conteve' },
        ],
        summary: 'Contou publicamente a ascensão de Tiago Farias e redefiniu os papéis.',
      },
      {
        id: 'absorveu',
        label: 'Absorbê-lo como parceiro declarado de governo',
        description: 'A ambição dele vira estrutura sua — e pesa na lealdade da casa.',
        effects: [
          { t: 'relation', who: 'tiago', amount: 12 },
          { t: 'attr', attr: 'influence', amount: 4 },
          { t: 'attr', attr: 'loyalty', amount: -4 },
          { t: 'faction', faction: 'prn', amount: 3 },
          { t: 'flag', flag: 'tiagoAscensao', value: 'absorveu' },
        ],
        summary: 'Absorveu Tiago Farias como parceiro declarado do projeto de governo.',
      },
      {
        id: 'ignorar',
        label: 'Ignorar: a campanha é maior que o orgulho de um gestor',
        description: 'Silêncio estratégico — o editorialista preenche o espaço com o nome dele.',
        effects: [
          { t: 'attr', attr: 'influence', amount: -1 },
          { t: 'attr', attr: 'loyalty', amount: -1 },
          { t: 'faction', faction: 'prn', amount: 1 },
          { t: 'flag', flag: 'tiagoAscensao', value: 'ignorou' },
        ],
        summary: 'Ignorou a ascensão pública de Tiago Farias durante a reta final.',
      },
    ],
  },
  // --------------------------------------------------------------------------
  // Consequências atrasadas do arco de Dante Valverde — os dois caminhos
  // que ainda não tinham eco: transparência compra crédito; a recusa vira
  // estrutura para o adversário.
  // --------------------------------------------------------------------------
  {
    id: 'dante_credito',
    title: 'A cláusula de transparência rende dividendos',
    text:
      'O contrato que você publicou por inteiro virou referência em duas faculdades e em um editorial do Jornal Diáfano. Dante Valverde, sem cerimônia, propõe o seguinte: um observatório de contratos da campanha, com auditoria independente escolhida em comum acordo, financiado pelo fundo dele e aberto a quem quiser ler. "Quem não deve não teme fiscal", diz. "E fiscalização cara é bom para os dois lados."',
    portrait: 'dante',
    when: [
      { t: 'daysGte', value: 32 },
      { t: 'flag', flag: 'danteDeal', equals: 'transparente' },
    ],
    priority: 74,
    guaranteed: true, // consequência do caminho transparente
    once: true,
    choices: [
      {
        id: 'observatorio',
        label: 'Aceitar o observatório com auditoria independente',
        description: 'Verba do fundo, regras públicas e um fiscal que você não controla.',
        cost: { funds: 3 },
        effects: [
          { t: 'funds', amount: 8 },
          { t: 'attr', attr: 'institutionalTrust', amount: 5 },
          { t: 'attr', attr: 'reputation', amount: 4 },
          { t: 'relation', who: 'dante', amount: 10 },
          { t: 'relation', who: 'iris', amount: 6 },
          { t: 'flag', flag: 'danteCredito', value: 'observatorio' },
        ],
        summary: 'Aceitou o observatório de contratos financiado por Dante Valverde, com auditoria independente.',
      },
      {
        id: 'vitrine',
        label: 'Usar a parceria como vitrine de transparência',
        description: 'Bandeira de campanha primeiro; a auditoria organiza depois.',
        effects: [
          { t: 'attr', attr: 'influence', amount: 4 },
          { t: 'attr', attr: 'reputation', amount: 2 },
          { t: 'relation', who: 'dante', amount: -4 },
          { t: 'faction', faction: 'imprensa', amount: 4 },
          { t: 'flag', flag: 'danteCredito', value: 'vitrine' },
        ],
        summary: 'Transformou a parceria transparente com Dante Valverde em bandeira de campanha.',
      },
      {
        id: 'neutro',
        label: 'Agradecer sem criar vínculo novo',
        description: 'Cordialidade sem contrato: o crédito moral já foi colhido.',
        effects: [
          { t: 'attr', attr: 'reputation', amount: 2 },
          { t: 'relation', who: 'dante', amount: 2 },
          { t: 'flag', flag: 'danteCredito', value: 'neutro' },
        ],
        summary: 'Agradeceu a proposta de Dante Valverde sem firmar vínculo novo.',
      },
    ],
  },
  {
    id: 'dante_divida',
    title: 'O dinheiro recusado encontra outro dono',
    text:
      'Dois portais apuraram, com documentação, que a Valverde Participações realocou para o ciclo eleitoral do adversário parte da verba que seria da sua campanha — legal, declarado e cirúrgico. Dante, em nota de três linhas, repete a fórmula de sempre: "Capital procura eficiência; não procuro discussão." A sua equipe pergunta se a recusa do começo virou estratégia do outro lado.',
    portrait: 'dante',
    when: [
      { t: 'daysGte', value: 32 },
      { t: 'flag', flag: 'danteDeal', equals: 'recusado' },
    ],
    priority: 74,
    guaranteed: true, // consequência do caminho recusado
    once: true,
    choices: [
      {
        id: 'denuncia',
        label: 'Denunciar a virada do dinheiro no ar',
        description: 'Transparência como arma: o capital declarado vira argumento de palanque.',
        effects: [
          { t: 'attr', attr: 'influence', amount: 4 },
          { t: 'attr', attr: 'reputation', amount: 3 },
          { t: 'faction', faction: 'imprensa', amount: 4 },
          { t: 'relation', who: 'dante', amount: -12 },
          { t: 'faction', faction: 'mercado', amount: -6 },
          { t: 'flag', flag: 'danteRetaliacao', value: 'denuncia' },
        ],
        summary: 'Denunciou publicamente a realocação da verba de Dante Valverde para o adversário.',
      },
      {
        id: 'negociar',
        label: 'Negociar uma saída honrosa com Dante',
        description: 'Custa verba e um pouco de dignidade; compra paz financeira na reta final.',
        cost: { funds: 6 },
        effects: [
          { t: 'faction', faction: 'mercado', amount: 6 },
          { t: 'relation', who: 'dante', amount: 8 },
          { t: 'attr', attr: 'popularity', amount: -2 },
          { t: 'flag', flag: 'danteRetaliacao', value: 'negociou' },
        ],
        summary: 'Negociou com Dante Valverde uma saída honrosa da disputa financeira.',
      },
      {
        id: 'ignorar',
        label: 'Ignorar e seguir a campanha',
        description: 'O dinheiro do adversário compra espaço que você não vai disputar.',
        effects: [
          { t: 'region', region: 'vam', opponent: 3 },
          { t: 'attr', attr: 'popularity', amount: -2 },
          { t: 'faction', faction: 'mercado', amount: -4 },
          { t: 'attr', attr: 'influence', amount: -1 },
          { t: 'flag', flag: 'danteRetaliacao', value: 'ignorou' },
        ],
        summary: 'Ignorou a realocação financeira de Dante Valverde e seguiu a campanha.',
      },
    ],
  },
  // --------------------------------------------------------------------------
  // Presença distribuída do elenco: Gilberto Kaspar (direção), Sílvio
  // Valente (mídia), Pedro Marques (pesquisa arriscada), Daniela Bezerra
  // (parecer fora da M3), Rafael Sampaio (mobilização), Valdemar Costa
  // (cobrança da promessa), Thomas Walker (contrapartida internacional),
  // crise de lealdade e fechamento de alianças.
  // --------------------------------------------------------------------------
  {
    id: 'diretorio_partido',
    title: 'A direção do partido quer espaço',
    text:
      'Gilberto Kaspar convocou a direção do PRN para uma reunião que durou cinco horas e terminou com um documento: o partido quer participação na definição de pauta e presença nas decisões que afetam a legenda. "Eu assinei a candidatura", diz ele, com a voz de quem conta um crédito, "e a direção quer saber o que vai ser feito com ela."',
    portrait: 'dulcinea',
    when: [{ t: 'daysGte', value: 8 }],
    priority: 64,
    once: true,
    choices: [
      {
        id: 'abrir',
        label: 'Abrir a estratégia para a direção do partido',
        description: 'Estrutura, aliados e um partido que passa a decidir junto.',
        effects: [
          { t: 'faction', faction: 'prn', amount: 8 },
          { t: 'attr', attr: 'loyalty', amount: 3 },
          { t: 'attr', attr: 'influence', amount: -2 },
          { t: 'relation', who: 'dulcinea', amount: 10 },
          { t: 'flag', flag: 'diretorioAval', value: 'aberto' },
        ],
        summary: 'Abriu a estratégia da campanha para a direção do partido.',
      },
      {
        id: 'autonomia',
        label: 'Manter a autonomia total da campanha',
        description: 'A campanha manda; o partido organiza a base e conta os votos.',
        effects: [
          { t: 'attr', attr: 'loyalty', amount: 4 },
          { t: 'faction', faction: 'prn', amount: -6 },
          { t: 'relation', who: 'dulcinea', amount: -10 },
          { t: 'attr', attr: 'reputation', amount: 2 },
          { t: 'flag', flag: 'diretorioAval', value: 'autonomia' },
        ],
        summary: 'Manteve a autonomia total da campanha diante da direção do partido.',
      },
      {
        id: 'dividido',
        label: 'Dividir: campanha conduz a pauta, partido organiza a base',
        description: 'Papéis claros, sem cargo negociado — se a casa estiver unida.',
        requires: [{ t: 'attrGte', attr: 'loyalty', value: 50 }],
        effects: [
          { t: 'faction', faction: 'prn', amount: 4 },
          { t: 'attr', attr: 'loyalty', amount: 1 },
          { t: 'attr', attr: 'influence', amount: 2 },
          { t: 'relation', who: 'dulcinea', amount: 4 },
          { t: 'flag', flag: 'diretorioAval', value: 'dividido' },
        ],
        summary: 'Dividiu papéis: campanha conduz a pauta e partido organiza a base.',
      },
    ],
  },
  {
    id: 'silvio_oferta',
    title: 'Sílvio oferece a mídia com cláusula',
    text:
      'Sílvio Valente compareceu sem avisar e propôs o que nenhum doador oferece até agora: um pacote de mídia do Grupo Vaz com tarifa de amigo — e, em troca, condição escrita de "tratamento respeitoso da controvérsia jurídica pendente", que traduzido significa o direito de pautar ou não o processo do seu pai. Ele é cordial o suficiente para deixar a página em branco.',
    portrait: 'lutero',
    when: [{ t: 'daysGte', value: 10 }],
    priority: 66,
    once: true,
    choices: [
      {
        id: 'aceitar',
        label: 'Aceitar o pacote de mídia com a cláusula dele',
        description: 'Verba de propaganda barata e um editor de ressalva sobre o seu pai.',
        effects: [
          { t: 'funds', amount: 12 },
          { t: 'attr', attr: 'reputation', amount: -3 },
          { t: 'faction', faction: 'mercado', amount: 5 },
          { t: 'relation', who: 'lutero', amount: 12 },
          { t: 'flag', flag: 'silvioOferta', value: 'aceita' },
        ],
        summary: 'Aceitou o pacote de mídia do Grupo Vaz com a cláusula editorial de Sílvio Valente.',
      },
      {
        id: 'condicional',
        label: 'Aceitar apenas com garantia de isonomia editorial',
        description: 'A tarifa de amigo continua; a cláusula sobre o processo cai da página.',
        requires: [{ t: 'relationGte', who: 'lutero', value: 45 }],
        effects: [
          { t: 'funds', amount: 6 },
          { t: 'attr', attr: 'reputation', amount: 3 },
          { t: 'faction', faction: 'imprensa', amount: 4 },
          { t: 'relation', who: 'lutero', amount: 4 },
          { t: 'flag', flag: 'silvioOferta', value: 'condicional' },
        ],
        summary: 'Aceitou a mídia do Grupo Vaz exigindo isonomia editorial sobre o processo.',
      },
      {
        id: 'recusar',
        label: 'Recusar: campanha não compra cobertura',
        description: 'Dói no alcance, compra independência de pauta para o resto do ciclo.',
        effects: [
          { t: 'attr', attr: 'reputation', amount: 4 },
          { t: 'faction', faction: 'imprensa', amount: 5 },
          { t: 'faction', faction: 'mercado', amount: -4 },
          { t: 'relation', who: 'lutero', amount: -15 },
          { t: 'flag', flag: 'silvioOferta', value: 'recusada' },
        ],
        summary: 'Recusou o pacote de mídia de Sílvio Valente para preservar independência de pauta.',
      },
    ],
  },
  {
    id: 'pedro_pesquisa',
    title: 'O dossiê que Pedro não deveria ter trazido',
    text:
      'Pedro Marques entra no comitê com uma pasta fechada e um aviso: a pesquisa interna mostra margem, e a pasta mostra mais. Doações do adversário a fundos que ninguém auditou, um contrato assinado às pressas, três nomes. "É legal", diz ele, colocando a pasta na mesa como quem coloca uma arma. "Mas ninguém aplaude o cara que vaza processo — aplaude o resultado."',
    portrait: 'vera',
    when: [{ t: 'daysGte', value: 12 }],
    priority: 70,
    once: true,
    choices: [
      {
        id: 'usar',
        label: 'Usar o material contra o adversário',
        description: 'A oposição responde com a mesma arma; a imprensa anota quem começou.',
        effects: [
          { t: 'attr', attr: 'influence', amount: 5 },
          { t: 'attr', attr: 'popularity', amount: 3 },
          { t: 'attr', attr: 'reputation', amount: -4 },
          { t: 'faction', faction: 'imprensa', amount: -6 },
          { t: 'relation', who: 'aurelio', amount: -10 },
          { t: 'flag', flag: 'pesquisaRisco', value: 'arma' },
        ],
        summary: 'Usou o dossiê de bastidores trazido por Pedro Marques contra o adversário.',
      },
      {
        id: 'numeros',
        label: 'Publicar apenas os números da pesquisa',
        description: 'A margem vira manchete; a pasta fica na gaveta.',
        effects: [
          { t: 'attr', attr: 'influence', amount: 3 },
          { t: 'attr', attr: 'reputation', amount: 2 },
          { t: 'faction', faction: 'imprensa', amount: 3 },
          { t: 'flag', flag: 'pesquisaRisco', value: 'numeros' },
        ],
        summary: 'Publicou apenas os números da pesquisa interna, sem usar o dossiê.',
      },
      {
        id: 'descartar',
        label: 'Descartar o dossiê e manter a campanha limpa',
        description: 'Pedro guarda a pasta com cara de quem perdeu uma aposta.',
        effects: [
          { t: 'attr', attr: 'reputation', amount: 3 },
          { t: 'attr', attr: 'loyalty', amount: 2 },
          { t: 'attr', attr: 'influence', amount: -1 },
          { t: 'relation', who: 'vera', amount: 6 },
          { t: 'flag', flag: 'pesquisaRisco', value: 'descartada' },
        ],
        summary: 'Descartou o dossiê de bastidores e manteve a campanha limpa.',
      },
    ],
  },
  {
    id: 'daniela_parecer',
    title: 'Daniela avisa antes que a pauta vire problema',
    text:
      'Daniela Bezerra mandou um parecer de duas páginas com o título seco "Sobre a próxima manchete": um portal prepara peça sobre o financiamento da campanha, e a forma de responder define se o assunto morre ou vira série. Ela lista três caminhos — resposta formal documentada, resposta política no palanque ou silêncio — e avisa, no rodapé: "Se houver linha de defesa definida na Missão 3, aplique-a."',
    portrait: 'salome',
    when: [{ t: 'daysGte', value: 16 }],
    priority: 66,
    once: true,
    choices: [
      {
        id: 'formal',
        label: 'Seguir o parecer: resposta formal e documentada',
        description: 'Protocolo, anexos e linguagem de contrato — chato e inatacável.',
        cost: { funds: 4 },
        effects: [
          { t: 'attr', attr: 'institutionalTrust', amount: 4 },
          { t: 'attr', attr: 'influence', amount: 2 },
          { t: 'relation', who: 'salome', amount: 8 },
          { t: 'faction', faction: 'judiciario', amount: 3 },
          { t: 'flag', flag: 'danielaParecer', value: 'formal' },
        ],
        summary: 'Respondeu à manchete prevista com o parecer formal de Daniela Bezerra.',
      },
      {
        id: 'politica',
        label: 'Responder no palanque, na moeda da política',
        description: 'A audiência entende; o rito acha que a campanha esqueceu onde está.',
        effects: [
          { t: 'attr', attr: 'popularity', amount: 3 },
          { t: 'attr', attr: 'institutionalTrust', amount: -4 },
          { t: 'relation', who: 'salome', amount: -8 },
          { t: 'faction', faction: 'imprensa', amount: 3 },
          { t: 'flag', flag: 'danielaParecer', value: 'politica' },
        ],
        summary: 'Respondeu à manchete com resposta política no palanque, contra o parecer.',
      },
      {
        id: 'silencio',
        label: 'Não responder e deixar o tempo passar',
        description: 'Silêncio custa uma semana de pauta e um pouco de clima com a equipe jurídica.',
        effects: [
          { t: 'attr', attr: 'influence', amount: -1 },
          { t: 'attr', attr: 'reputation', amount: -1 },
          { t: 'attr', attr: 'institutionalTrust', amount: 1 },
          { t: 'relation', who: 'salome', amount: -2 },
          { t: 'flag', flag: 'danielaParecer', value: 'silencio' },
        ],
        summary: 'Optou por não responder à manchete e deixar o tempo passar.',
      },
      {
        id: 'parecer_linha',
        label: 'Aplicar a linha de defesa escolhida no processo',
        description: 'Só quem definiu a linha na Missão 3 tem o roteiro pronto para a pauta.',
        requires: [
          {
            t: 'any',
            of: [
              { t: 'flag', flag: 'defenseLine', equals: 'juridica' },
              { t: 'flag', flag: 'defenseLine', equals: 'tecnica' },
            ],
          },
        ],
        effects: [
          { t: 'attr', attr: 'institutionalTrust', amount: 3 },
          { t: 'debateSkill', amount: 3 },
          { t: 'relation', who: 'salome', amount: 5 },
          { t: 'faction', faction: 'judiciario', amount: 2 },
          { t: 'flag', flag: 'danielaParecer', value: 'linha' },
        ],
        summary: 'Aplicou a linha de defesa definida na Missão 3 para responder a nova pauta.',
      },
    ],
  },
  {
    id: 'rafael_mobiliza',
    title: 'Rafael Sampaio convoca os núcleos do MNR — e você',
    text:
      'Rafael Sampaio convocou os núcleos regionais do MNR para um ato nacional no mesmo sábado e reservou meia hora da transmissão do movimento para ouvir candidato — "sem cortar, sem roteiro e sem bandido". Sua equipe avisa: quem vai ao ato cresce com a militância; quem falta, explica por três dias para uma base que ele organiza, mas não controla.',
    portrait: 'bento',
    when: [{ t: 'daysGte', value: 20 }],
    priority: 68,
    guaranteed: true, // abertura central do arco do MNR (Rodada 9)
    once: true,
    choices: [
      {
        id: 'ir',
        label: 'Ir ao ato e abraçar a pauta da mobilização',
        description: 'Base aquecida, mercado incomodado e um anfitrião que não deixa passar nada.',
        effects: [
          { t: 'attr', attr: 'popularity', amount: 5 },
          { t: 'attr', attr: 'influence', amount: 3 },
          { t: 'relation', who: 'bento', amount: 10 },
          { t: 'faction', faction: 'movimentos', amount: 6 },
          { t: 'faction', faction: 'mercado', amount: -3 },
          { t: 'attr', attr: 'reputation', amount: -2 },
          { t: 'flag', flag: 'rafaelLive', value: 'vai' },
        ],
        summary: 'Aceitou o convite de Rafael Sampaio e abraçou a pauta da mobilização do MNR.',
      },
      {
        id: 'recado',
        label: 'Enviar recado escrito com os números do projeto',
        description: 'Sem câmera, sem risco — e sem o calor de quem aparece.',
        requires: [{ t: 'attrGte', attr: 'influence', value: 35 }],
        effects: [
          { t: 'attr', attr: 'influence', amount: 3 },
          { t: 'attr', attr: 'institutionalTrust', amount: 2 },
          { t: 'attr', attr: 'reputation', amount: 2 },
          { t: 'relation', who: 'bento', amount: 4 },
          { t: 'flag', flag: 'rafaelLive', value: 'recado' },
        ],
        summary: 'Enviou recado escrito com os números do projeto para a mobilização do MNR.',
      },
      {
        id: 'falta',
        label: 'Faltar ao ato e manter a agenda',
        description: 'A base que marcou o ato fica sabendo que você não foi.',
        effects: [
          { t: 'attr', attr: 'popularity', amount: -3 },
          { t: 'relation', who: 'bento', amount: -12 },
          { t: 'faction', faction: 'movimentos', amount: -5 },
          { t: 'flag', flag: 'rafaelLive', value: 'falta' },
        ],
        summary: 'Recusou o ato do MNR de Rafael Sampaio e manteve a agenda da campanha.',
      },
    ],
  },
  {
    id: 'valdemar_cobranca',
    title: 'A pasta prometida vence o prazo',
    text:
      'Valdemar Costa deu entrevista citando, com nomes e datas, a indicação ministerial pactuada meses atrás — "combinado é combinado, e combinado se cumpre depois da posse, não antes da eleição". A bancada do PPV replicou em coro. Você tem até a próxima coletiva para dizer se a pasta prometida existe mesmo, se ela adia ou se ela morreu.',
    portrait: 'sandoval',
    when: [
      { t: 'daysGte', value: 26 },
      { t: 'flag', flag: 'promisedMinistry' },
    ],
    priority: 74,
    guaranteed: true, // consequência da promessa feita na M2
    once: true,
    choices: [
      {
        id: 'confirmar',
        label: 'Confirmar publicamente a indicação prometida',
        description: 'O partido inteiro apoia com entusiasmo de quem já escolheu a sala.',
        effects: [
          { t: 'faction', faction: 'ppv', amount: 12 },
          { t: 'attr', attr: 'loyalty', amount: -6 },
          { t: 'relation', who: 'sandoval', amount: 10 },
          { t: 'attr', attr: 'popularity', amount: -2 },
          { t: 'flag', flag: 'valdemarPromessa', value: 'confirmou' },
        ],
        summary: 'Confirmou publicamente a indicação ministerial prometida ao PPV.',
      },
      {
        id: 'adiar',
        label: 'Adiar a definição para depois da apuração',
        description: 'Meia verdade organizada: o partido espera, a campanha respira.',
        effects: [
          { t: 'faction', faction: 'ppv', amount: 3 },
          { t: 'attr', attr: 'loyalty', amount: -2 },
          { t: 'relation', who: 'sandoval', amount: -6 },
          { t: 'attr', attr: 'influence', amount: 1 },
          { t: 'flag', flag: 'valdemarPromessa', value: 'adiou' },
        ],
        summary: 'Adiou para a apuração a definição da pasta prometida ao PPV.',
      },
      {
        id: 'romper',
        label: 'Anunciar que não haverá pasta negociada',
        description: 'Autonomia declarada no horário nobre — e um partido inteiro virando oposição.',
        effects: [
          { t: 'faction', faction: 'ppv', amount: -14 },
          { t: 'attr', attr: 'loyalty', amount: 6 },
          { t: 'attr', attr: 'reputation', amount: 4 },
          { t: 'relation', who: 'sandoval', amount: -18 },
          { t: 'attr', attr: 'influence', amount: 2 },
          { t: 'flag', flag: 'valdemarPromessa', value: 'rompeu' },
        ],
        summary: 'Rompeu publicamente a promessa de ministério negociada com o PPV.',
      },
    ],
  },
  {
    id: 'karsavia_contrapartida',
    title: 'Walker cobra o que prometeu em silêncio',
    text:
      'Thomas Walker, em transmissão direta da capital da Federação de Karsavia, anunciou que a "cooperação energética sem moralismos" agora exige contrapartida concreta: um contrato de importação com preço fixado e cláusula de exclusividade regional. Ele citou você nominalmente como "o único interlocutor sério do continente". Sua equipe tem até o fim do dia antes que o anúncio vire pauta de oposição.',
    portrait: 'zorana',
    when: [
      { t: 'daysGte', value: 30 },
      {
        t: 'any',
        of: [
          { t: 'flag', flag: 'backchannelKarsavia' },
          { t: 'flag', flag: 'karsaviaDeal' },
        ],
      },
    ],
    priority: 72,
    guaranteed: true, // consequência do canal aberto com Walker
    once: true,
    choices: [
      {
        id: 'concessao',
        label: 'Conceder o contrato de cooperação energética',
        description: 'Verba e geopolítica no caixa; a foto com Walker custa um ciclo de manchetes.',
        effects: [
          { t: 'funds', amount: 10 },
          { t: 'faction', faction: 'mercado', amount: 6 },
          { t: 'attr', attr: 'popularity', amount: -3 },
          { t: 'relation', who: 'zorana', amount: 12 },
          { t: 'flag', flag: 'karsaviaContrapartida', value: 'concessao' },
        ],
        summary: 'Concedeu o contrato de cooperação energética pedido por Thomas Walker.',
      },
      {
        id: 'negociada',
        label: 'Conceder apenas com cláusulas de transparência pública',
        description: 'O contrato anda; a cláusula de publicidade impede a foto fechada.',
        cost: { funds: 2 },
        effects: [
          { t: 'attr', attr: 'influence', amount: 4 },
          { t: 'attr', attr: 'reputation', amount: 3 },
          { t: 'relation', who: 'zorana', amount: 6 },
          { t: 'faction', faction: 'imprensa', amount: 3 },
          { t: 'flag', flag: 'karsaviaContrapartida', value: 'negociada' },
        ],
        summary: 'Concedeu a cooperação com Karsavia exigindo cláusulas públicas de transparência.',
      },
      {
        id: 'recusa',
        label: 'Recusar e explicar os limites institucionais',
        description: 'Nada de contrato de exclusividade em véspera de eleição.',
        effects: [
          { t: 'attr', attr: 'institutionalTrust', amount: 4 },
          { t: 'attr', attr: 'reputation', amount: 2 },
          { t: 'relation', who: 'zorana', amount: -15 },
          { t: 'faction', faction: 'movimentos', amount: 4 },
          { t: 'flag', flag: 'karsaviaContrapartida', value: 'recusa' },
        ],
        summary: 'Recusou a contrapartida de contrato pedido por Thomas Walker.',
      },
    ],
  },
  {
    id: 'gilberto_fechamento',
    title: 'Gilberto quer saber o que a vitória reserva',
    text:
      'Gilberto Kaspar marcou café sem pauta e chegou no assunto com a delicadeza de quem negocia o fim do mês: a direção do partido quer saber o que a vitória reserva — times de governo, pastas, presença no primeiro ano. "Não é troca", diz ele, girando a xícara, "é que ninguém organiza base com promessa indefinida." A apuração já cheira no ar; a resposta define quem continua no palanque até o fim.',
    portrait: 'dulcinea',
    when: [
      { t: 'daysGte', value: 44 },
      {
        t: 'any',
        of: [
          { t: 'missionDone', mission: 'm4' },
          { t: 'missionFailed', mission: 'm4' },
          { t: 'daysGte', value: 50 },
        ],
      },
    ],
    priority: 78,
    once: true,
    choices: [
      {
        id: 'cargos',
        label: 'Prometer times de governo ao partido e aos aliados',
        description: 'Base mobilizada agora; a dívida tem data de vencimento na posse.',
        effects: [
          { t: 'attr', attr: 'loyalty', amount: 6 },
          { t: 'faction', faction: 'prn', amount: 8 },
          { t: 'relation', who: 'dulcinea', amount: 8 },
          { t: 'flag', flag: 'gilbertoFechamento', value: 'cargos' },
        ],
        summary: 'Prometeu times de governo ao partido e aos aliados na reta final.',
      },
      {
        id: 'programa',
        label: 'Fechar pelo programa, sem promessa de cargo',
        description: 'A direção entende; a base trabalha com menos café.',
        effects: [
          { t: 'attr', attr: 'reputation', amount: 4 },
          { t: 'faction', faction: 'prn', amount: 3 },
          { t: 'attr', attr: 'loyalty', amount: -3 },
          { t: 'relation', who: 'dulcinea', amount: -4 },
          { t: 'attr', attr: 'popularity', amount: 1 },
          { t: 'flag', flag: 'gilbertoFechamento', value: 'programa' },
        ],
        summary: 'Fechou com o partido pelo programa, sem promessa de cargos.',
      },
      {
        id: 'adiar',
        label: 'Adiar qualquer definição para a apuração',
        description: 'Nim nem: ninguém fica bravo hoje; todos ficam no domingo.',
        effects: [
          { t: 'attr', attr: 'influence', amount: 2 },
          { t: 'attr', attr: 'loyalty', amount: -5 },
          { t: 'relation', who: 'dulcinea', amount: -8 },
          { t: 'flag', flag: 'gilbertoFechamento', value: 'adiar' },
        ],
        summary: 'Adiou para a apuração qualquer definição de times de governo.',
      },
    ],
  },
  {
    id: 'equipe_abalada',
    title: 'A casa começa a tremer',
    text:
      'Pedro Marques entra sem bater e fecha a porta: dois coordenadores regionais ameaçam sair, um deles já falou com a direção do partido, e o grupo de WhatsApp do comitê virou forum de apuração de deslealdade. "Não é crise de verba", diz ele, "é crise de sensação de vitória. Eles não acreditam que dá para ganhar — e gente que não acredita vaza."',
    portrait: 'vera',
    when: [
      { t: 'daysGte', value: 38 },
      { t: 'attrLte', attr: 'loyalty', value: 45 },
    ],
    priority: 82,
    once: true,
    choices: [
      {
        id: 'redistribuir',
        label: 'Redistribuir lideranças e ouvir os coordenadores',
        description: 'Custa verba e orgulho; devolve gente para a estrada.',
        cost: { funds: 4 },
        effects: [
          { t: 'attr', attr: 'loyalty', amount: 8 },
          { t: 'attr', attr: 'influence', amount: -2 },
          { t: 'relation', who: 'vera', amount: 6 },
          { t: 'flag', flag: 'equipeCrise', value: 'redistribuiu' },
        ],
        summary: 'Redistribuiu lideranças da campanha para conter a crise de lealdade.',
      },
      {
        id: 'disciplina',
        label: 'Impor disciplina e coerência de mensagem',
        description: 'A casa para de falar; a campanha para de sorrir.',
        effects: [
          { t: 'attr', attr: 'loyalty', amount: -4 },
          { t: 'attr', attr: 'influence', amount: 4 },
          { t: 'attr', attr: 'reputation', amount: 2 },
          { t: 'relation', who: 'vera', amount: -8 },
          { t: 'flag', flag: 'equipeCrise', value: 'disciplina' },
        ],
        summary: 'Impôs disciplina interna diante da crise de lealdade da equipe.',
      },
      {
        id: 'escuta',
        label: 'Ouvir a crítica e mudar um eixo da campanha',
        description: 'Os coordenadores ficam; a pauta ganha um giro no meio da estrada.',
        requires: [{ t: 'relationGte', who: 'vera', value: 40 }],
        effects: [
          { t: 'attr', attr: 'loyalty', amount: 5 },
          { t: 'attr', attr: 'popularity', amount: -2 },
          { t: 'regionAll', player: 1 },
          { t: 'flag', flag: 'equipeCrise', value: 'escuta' },
        ],
        summary: 'Ouviu a crítica da equipe e girou um eixo da campanha.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Rodada 9 — Rafael Sampaio e o Movimento Nacional de Renovação (MNR).
  // O MNR é uma organização independente, com núcleos regionais, militância e
  // agenda própria — não é o PRN nem braço de candidatura alguma. Rafael não
  // apoia Fábio nem Leandro no início: os quatro estágios da relação do MNR
  // com a campanha são narrativos (flags mnrApoio: dialogo → acordo →
  // apoio/alianca, ou distante) e NÃO se confundem com relação pessoal
  // (relations.bento) nem com alinhamento programático (alignment 45).
  // 'apoio' e 'alianca' só podem ser definidos por mnr_definicao, e apenas
  // depois de acerto programático, relação e força do movimento justificarem.
  // ---------------------------------------------------------------------------
  {
    id: 'mnr_mobilizacao',
    title: 'O Movimento Nacional de Renovação quer ato',
    text:
      'Rafael Sampaio mandou a proposta por escrito: os núcleos regionais do MNR querem um ato nacional em três cidades no mesmo sábado — militância de rua, som próprio, camiseta e pauta do movimento. Não é apoio, é convite: o candidato fala na praça dele, com as regras dele. "O MNR é terceira via: não apoia Fábio nem Leandro e não vira palanque de ninguém", escreve ele. "Mas quem tem o que dizer pode falar onde a gente está."',
    portrait: 'bento',
    when: [{ t: 'daysGte', value: 8 }],
    priority: 72,
    guaranteed: true, // abertura do arco do MNR: inicia em qualquer campanha
    once: true,
    choices: [
      {
        id: 'ir',
        label: 'Aceitar o convite e falar com as regras do movimento',
        description: 'Palanque do MNR, pauta do MNR: você entra no jogo deles como eles entrariam no seu.',
        effects: [
          { t: 'attr', attr: 'popularity', amount: 4 },
          { t: 'attr', attr: 'influence', amount: 3 },
          { t: 'relation', who: 'bento', amount: 8 },
          { t: 'faction', faction: 'movimentos', amount: 7 },
          { t: 'faction', faction: 'mercado', amount: -2 },
          { t: 'flag', flag: 'mnrApoio', value: 'dialogo' },
          { t: 'flag', flag: 'mnrEstrutura', value: 'organizada' },
        ],
        summary: 'Aceitou o ato nacional do MNR e falou nas praças do movimento — diálogo, sem apoio eleitoral.',
      },
      {
        id: 'pauta',
        label: 'Negociar a pauta do ato antes de aceitar',
        description: 'Mesmos palcos, tema acordado — conversa franca, sem declarar apoio nenhum.',
        effects: [
          { t: 'attr', attr: 'influence', amount: 2 },
          { t: 'attr', attr: 'institutionalTrust', amount: 1 },
          { t: 'relation', who: 'bento', amount: 4 },
          { t: 'faction', faction: 'movimentos', amount: 4 },
          { t: 'flag', flag: 'mnrApoio', value: 'dialogo' },
          { t: 'flag', flag: 'mnrEstrutura', value: 'organizada' },
        ],
        summary: 'Negociou a pauta do ato do MNR antes de aceitar — conversa sem apoio eleitoral.',
      },
      {
        id: 'nao',
        label: 'Recusar: campanha não pede palanque a movimento algum',
        description: 'Sua equipe dorme tranquila; os núcleos do MNR seguem marcando o ato sem você.',
        effects: [
          { t: 'attr', attr: 'popularity', amount: -2 },
          { t: 'relation', who: 'bento', amount: -10 },
          { t: 'faction', faction: 'movimentos', amount: -4 },
          { t: 'flag', flag: 'mnrEstrutura', value: 'organizada' },
        ],
        summary: 'Recusou o ato do MNR: o movimento se organiza sozinho, sem a campanha.',
      },
    ],
  },
  {
    id: 'mnr_negociacao',
    title: 'Rafael leva a agenda do MNR à mesa',
    text:
      'Rafael Sampaio pede reunião — e manda a pauta antes: segurança pública, teto de mandatos e fim do orçamento secreto. A nota não é só com você: a mesma pauta foi enviada às duas campanhas, e ele diz em público que mede candidato pela resposta, não pela simpatia. "Acordo de pauta não é apoio", ele abre a conversa. "Apoio eu declaro se e quando achar que vale a pena — e até lá o MNR é do MNR, de ninguém mais."',
    portrait: 'bento',
    when: [{ t: 'daysGte', value: 14 }],
    priority: 70,
    guaranteed: true, // Rafael negocia com os dois candidatos — acontece sempre
    once: true,
    choices: [
      {
        id: 'aceitar_pauta',
        label: 'Assumir os três pontos por escrito',
        description: 'Acordo programático completo, com nota explícita: sem apoio eleitoral declarado.',
        effects: [
          { t: 'attr', attr: 'institutionalTrust', amount: 3 },
          { t: 'attr', attr: 'influence', amount: 3 },
          { t: 'relation', who: 'bento', amount: 6 },
          { t: 'faction', faction: 'movimentos', amount: 5 },
          { t: 'flag', flag: 'mnrApoio', value: 'acordo' },
        ],
        summary: 'Assumiu a agenda do MNR por escrito — acordo programático, sem apoio eleitoral.',
      },
      {
        id: 'renegociar',
        label: 'Contraproposta: aceita um ponto, discute dois',
        description: 'Volta com um ponto assinado e prazo aberto para os outros dois.',
        requires: [{ t: 'attrGte', attr: 'influence', value: 30 }],
        effects: [
          { t: 'attr', attr: 'influence', amount: 2 },
          { t: 'attr', attr: 'institutionalTrust', amount: 1 },
          { t: 'relation', who: 'bento', amount: 3 },
          { t: 'faction', faction: 'movimentos', amount: 3 },
          { t: 'flag', flag: 'mnrApoio', value: 'dialogo' },
        ],
        summary: 'Renegociou a agenda do MNR: um ponto fechado, dois em estudo — sem apoio eleitoral.',
      },
      {
        id: 'recusar',
        label: 'Recusar: a agenda da campanha é da campanha',
        description: 'Ele compara com a resposta de Leandro e anota a distância.',
        effects: [
          { t: 'attr', attr: 'institutionalTrust', amount: -1 },
          { t: 'relation', who: 'bento', amount: -8 },
          { t: 'faction', faction: 'movimentos', amount: -5 },
          { t: 'flag', flag: 'mnrApoio', value: 'distante' },
        ],
        summary: 'Recusou a agenda do MNR e afastou o movimento da campanha.',
      },
    ],
  },
  {
    id: 'mnr_pragonismo',
    title: 'Os núcleos querem distância dos partidos',
    text:
      'Coordenadores regionais do MNR publicaram nota sem consultar Rafael: "O movimento não é reserva de ninguém." Estão falando da proximidade que sua campanha vem criando com o MNR — e da conversa sobre pauta. Rafael mandou os dois áudios mais calmos do ano e pede que você saiba da conversa antes da militância.',
    portrait: 'bento',
    when: [
      { t: 'daysGte', value: 22 },
      {
        t: 'any',
        of: [
          { t: 'flag', flag: 'mnrEstrutura', equals: 'organizada' },
          { t: 'flag', flag: 'mnrEstrutura', equals: 'nacional' },
        ],
      },
    ],
    priority: 74,
    guaranteed: true, // consequência da organização dos núcleos
    once: true,
    choices: [
      {
        id: 'defender',
        label: 'Defender publicamente a autonomia do MNR',
        description: 'O movimento é dele; sua campanha respeita sem adotar.',
        effects: [
          { t: 'attr', attr: 'popularity', amount: -1 },
          { t: 'relation', who: 'bento', amount: 7 },
          { t: 'faction', faction: 'movimentos', amount: 6 },
          { t: 'flag', flag: 'mnrCoesao', value: 'coesa' },
        ],
        summary: 'Defendeu publicamente a autonomia do MNR e preservou a coesão das bases.',
      },
      {
        id: 'aprofundar',
        label: 'Propor cooperação maior — sem filiação nenhuma',
        description: 'Aproxima estruturas; as bases do movimento ficam olhando de lado.',
        requires: [{ t: 'flag', flag: 'mnrApoio', equals: 'acordo' }],
        effects: [
          { t: 'attr', attr: 'influence', amount: 3 },
          { t: 'relation', who: 'bento', amount: 2 },
          { t: 'faction', faction: 'movimentos', amount: -3 },
          { t: 'flag', flag: 'mnrCoesao', value: 'tensa' },
        ],
        summary: 'Propôs cooperação maior com o MNR sem filiação — e tensionou as bases.',
      },
      {
        id: 'silencio',
        label: 'Não comentar: conflito entre eles é deles',
        description: 'Neutralidade de fachada; a tensão das bases fica onde está.',
        effects: [
          { t: 'relation', who: 'bento', amount: -2 },
          { t: 'flag', flag: 'mnrCoesao', value: 'tensa' },
        ],
        summary: 'Ficou neutro na disputa interna do MNR — a tensão das bases permaneceu.',
      },
    ],
  },
  {
    id: 'mnr_regional',
    title: 'Os núcleos regionais se movem sozinhos',
    text:
      'Núcleos do MNR em três estados marcaram debates de bairro no mesmo fim de semana — sem candidatos confirmados e com pauta própria. Os coordenadores perguntam se sua campanha entra como convidado ou como assunto. Em Costa Vermelha, onde o movimento é mais forte, a praça já está reservada.',
    portrait: 'bento',
    when: [
      { t: 'daysGte', value: 26 },
      {
        t: 'any',
        of: [
          { t: 'flag', flag: 'mnrEstrutura', equals: 'organizada' },
          { t: 'flag', flag: 'mnrEstrutura', equals: 'nacional' },
        ],
      },
    ],
    priority: 76,
    guaranteed: true, // consequência da rede regional organizada
    once: true,
    choices: [
      {
        id: 'debatos',
        label: 'Entrar como convidado nos debates — sem bandeira da campanha',
        description: 'Presença sem co-branding: o movimento mantém a pauta, você ganha o microfone.',
        requires: [
          {
            t: 'any',
            of: [
              { t: 'flag', flag: 'mnrApoio', equals: 'dialogo' },
              { t: 'flag', flag: 'mnrApoio', equals: 'acordo' },
            ],
          },
        ],
        effects: [
          { t: 'attr', attr: 'influence', amount: 3 },
          { t: 'relation', who: 'bento', amount: 4 },
          { t: 'faction', faction: 'movimentos', amount: 5 },
          { t: 'region', region: 'cvm', player: 2, undecided: -1 },
        ],
        summary: 'Participou dos debates regionais do MNR como convidado, sem bandeira da campanha.',
      },
      {
        id: 'bancar',
        label: 'Bancar a logística dos atos com verba da campanha',
        description: 'Dinheiro de campanha em ato de movimento: a imprensa vai perguntar quem pagou.',
        cost: { funds: 6 },
        effects: [
          { t: 'attr', attr: 'popularity', amount: 2 },
          { t: 'attr', attr: 'influence', amount: 2 },
          { t: 'attr', attr: 'reputation', amount: -2 },
          { t: 'relation', who: 'bento', amount: 5 },
          { t: 'faction', faction: 'movimentos', amount: 7 },
          { t: 'flag', flag: 'mnrEstrutura', value: 'nacional' },
        ],
        summary: 'Bancou a logística dos atos regionais do MNR com verba da campanha.',
      },
      {
        id: 'ignorar',
        label: 'Ignorar: a agenda da semana é da campanha',
        description: 'Os debates acontecem sem você — com a pauta deles.',
        effects: [
          { t: 'relation', who: 'bento', amount: -6 },
          { t: 'faction', faction: 'movimentos', amount: -4 },
        ],
        summary: 'Ignorou os debates regionais do MNR e afastou as lideranças do movimento.',
      },
    ],
  },
  {
    id: 'mnr_bases',
    title: 'As bases do MNR cobram satisfação',
    text:
      'Militantes do MNR leram o acordo de pauta que você assinou e não gostaram do que sobrou dele: "Assinou com um lado e agora quem manda aqui?" Lideranças regionais pedem que Rafael explique a direção do movimento; três núcleos ameaçam suspender a agenda comum.',
    portrait: 'bento',
    when: [
      { t: 'daysGte', value: 30 },
      {
        t: 'any',
        of: [
          { t: 'flag', flag: 'mnrApoio', equals: 'acordo' },
          { t: 'flag', flag: 'mnrApoio', equals: 'apoio' },
          { t: 'flag', flag: 'mnrApoio', equals: 'alianca' },
        ],
      },
    ],
    priority: 78,
    guaranteed: true, // consequência dos compromissos assumidos com o movimento
    once: true,
    choices: [
      {
        id: 'deixar',
        label: 'Deixar Rafael resolver com as bases dele',
        description: 'Autonomia respeitada: a decisão do movimento é do movimento.',
        effects: [
          { t: 'relation', who: 'bento', amount: 6 },
          { t: 'faction', faction: 'movimentos', amount: 4 },
          { t: 'flag', flag: 'mnrCoesao', value: 'coesa' },
        ],
        summary: 'Deixou o MNR resolver a cobrança das bases internamente — coesão preservada.',
      },
      {
        id: 'pressao',
        label: 'Pressionar: acordo é acordo e a campanha não recua',
        description: 'Sua equipe cobra; as bases leem como subordinação.',
        effects: [
          { t: 'attr', attr: 'reputation', amount: -1 },
          { t: 'relation', who: 'bento', amount: -9 },
          { t: 'faction', faction: 'movimentos', amount: -6 },
          { t: 'flag', flag: 'mnrCoesao', value: 'fragmentada' },
        ],
        summary: 'Pressionou as bases do MNR pelo cumprimento do acordo e fraturou o movimento.',
      },
      {
        id: 'media',
        label: 'Propor revisão pública do acordo com cláusula de saída',
        description: 'Papel assinado salva os dois lados — e tira a disputa da praça.',
        requires: [{ t: 'attrGte', attr: 'influence', value: 40 }],
        effects: [
          { t: 'attr', attr: 'institutionalTrust', amount: 2 },
          { t: 'attr', attr: 'influence', amount: 2 },
          { t: 'relation', who: 'bento', amount: 3 },
          { t: 'faction', faction: 'movimentos', amount: 3 },
          { t: 'flag', flag: 'mnrCoesao', value: 'coesa' },
        ],
        summary: 'Revisou publicamente o acordo com o MNR, com cláusula de saída — bases coesas.',
      },
    ],
  },
  {
    id: 'contrato_mentoria',
    title: 'O contrato antigo de Rafael à vista',
    text:
      'O Jornal Diáfano apurou: antes da campanha, Rafael Sampaio assinou contrato de mentoria com uma produtora que hoje presta serviços ao marketing da campanha de Leandro. Documento real, datado, com valor. A inferência que ninguém pode provar — de que por isso o MNR pende para um lado — é o que corre nas redes. William pergunta se publica como está, ou se fala antes com Rafael.',
    portrait: 'iris',
    when: [
      { t: 'daysGte', value: 32 },
      {
        t: 'any',
        of: [
          { t: 'missionDone', mission: 'm4' },
          { t: 'relationGte', who: 'bento', value: 35 },
        ],
      },
    ],
    priority: 80,
    guaranteed: true, // consequência da apuração de William ou da proximidade com Rafael
    once: true,
    choices: [
      {
        id: 'falar',
        label: 'Falar com Rafael antes de qualquer publicação',
        description: 'Ele abre a pasta, explica o contrato e responde com a versão dele na matéria.',
        requires: [{ t: 'relationGte', who: 'bento', value: 30 }],
        effects: [
          { t: 'relation', who: 'bento', amount: 5 },
          { t: 'faction', faction: 'movimentos', amount: 3 },
          { t: 'faction', faction: 'imprensa', amount: 2 },
          { t: 'attr', attr: 'reputation', amount: 1 },
          { t: 'flag', flag: 'contratoRafael', value: 'explicado' },
        ],
        summary: 'Confrontou Rafael sobre o contrato antigo antes da publicação — e ele explicou tudo.',
      },
      {
        id: 'publicar',
        label: 'Deixar a imprensa publicar como está',
        description: 'Transparência sem intermediário: Rafael responde por si, e a denúncia perde o fio.',
        effects: [
          { t: 'faction', faction: 'imprensa', amount: 5 },
          { t: 'attr', attr: 'reputation', amount: 1 },
          { t: 'relation', who: 'bento', amount: -14 },
          { t: 'faction', faction: 'movimentos', amount: -6 },
          { t: 'flag', flag: 'contratoRafael', value: 'publicado' },
        ],
        summary: 'Deixou o contrato de Rafael ser publicado sem intermediação — e a relação pagou o preço.',
      },
      {
        id: 'usar',
        label: 'Guardar a informação para usar na hora certa',
        description: 'Não vaza: fica na gaveta até convenir — e pesa na relação se descobrirem.',
        effects: [
          { t: 'attr', attr: 'influence', amount: 2 },
          { t: 'attr', attr: 'reputation', amount: -3 },
          { t: 'relation', who: 'bento', amount: -4 },
          { t: 'flag', flag: 'contratoRafael', value: 'uso' },
        ],
        summary: 'Guardou o contrato de Rafael na gaveta para uso futuro — reputação abalada.',
      },
    ],
  },
  {
    id: 'mnr_crise_autonomia',
    title: 'Querem tragar o MNR',
    text:
      'A campanha de Leandro Lacerda mandou proposta formal ao MNR: estrutura, verba e horário em cadeia — em troca dos núcleos virarem braço de base da candidatura. A oferta chegou por escrito, com prazo. Rafael leu duas vezes e perguntou, sem ironia desta vez, o que você acha que ele deve fazer — e o que a sua campanha ofereceria para o mesmo fim.',
    portrait: 'bento',
    when: [
      { t: 'daysGte', value: 34 },
      { t: 'not', of: { t: 'flag', flag: 'mnrApoio', equals: 'alianca' } },
    ],
    priority: 76,
    guaranteed: true, // crise de autonomia: Leandro tenta incorporar o MNR
    once: true,
    choices: [
      {
        id: 'autonomia',
        label: 'Defender a autonomia do MNR — e dizer isso em público',
        description: 'Você defende o direito do movimento de não ser absorvido; Leandro perde o braço de base.',
        effects: [
          { t: 'relation', who: 'bento', amount: 8 },
          { t: 'relation', who: 'aurelio', amount: -3 },
          { t: 'faction', faction: 'movimentos', amount: 6 },
          { t: 'attr', attr: 'popularity', amount: 1 },
          { t: 'flag', flag: 'mnrCoesao', value: 'coesa' },
        ],
        summary: 'Defendeu publicamente a autonomia do MNR contra a tentativa de absorção de Leandro.',
      },
      {
        id: 'contraproposta',
        label: 'Oferecer cooperação limitada — quatro palcos, nenhuma estrutura',
        description: 'Sem filiação e sem verba cedida; as bases ficam de olho no combinado.',
        requires: [
          {
            t: 'any',
            of: [
              { t: 'flag', flag: 'mnrApoio', equals: 'dialogo' },
              { t: 'flag', flag: 'mnrApoio', equals: 'acordo' },
            ],
          },
        ],
        effects: [
          { t: 'attr', attr: 'influence', amount: 4 },
          { t: 'relation', who: 'bento', amount: 2 },
          { t: 'faction', faction: 'movimentos', amount: 2 },
          { t: 'flag', flag: 'mnrCoesao', value: 'tensa' },
        ],
        summary: 'Ofereceu cooperação limitada ao MNR sem estrutura cedida — bases atentas.',
      },
      {
        id: 'neutro',
        label: 'Não interferir: a decisão é do movimento',
        description: 'Respeito formal, relação morna — e Rafael decide sozinho.',
        effects: [
          { t: 'relation', who: 'bento', amount: -3 },
          { t: 'faction', faction: 'movimentos', amount: -1 },
        ],
        summary: 'Ficou neutro na tentativa de Leandro de incorporar o MNR — relação morna.',
      },
    ],
  },
  {
    id: 'mnr_definicao',
    title: 'Rafael decide o que o MNR vai ser até o fim',
    text:
      'Rafael Sampaio marcou encontro fechado com a direção do MNR. Pauta única: o movimento manter a recusa de apoio até o fim — ou, exceção votada pela direção, declarar apoio público a você ou formalizar aliança com programa e cláusulas. As bases já avisaram que vão cobrar qualquer ballotada. Ele abre dizendo: "O MNR não decide por carinho. Decide por conta."',
    portrait: 'bento',
    when: [
      { t: 'daysGte', value: 40 },
      { t: 'flag', flag: 'mnrApoio', equals: 'acordo' },
      { t: 'relationGte', who: 'bento', value: 45 },
      { t: 'factionGte', faction: 'movimentos', value: 55 },
    ],
    priority: 82,
    guaranteed: true, // desfecho do arco: só com histórico que justifica a definição
    once: true,
    choices: [
      {
        id: 'apoio',
        label: 'Convencê-lo: apoio público excepcional, sem estrutura cedida',
        description:
          'Para uma direção que recusa apoio a candidato algum, é uma exceção votada: nota de apoio eleitoral dos núcleos ao seu nome; o movimento mantém agenda e estrutura próprias.',
        requires: [{ t: 'relationGte', who: 'bento', value: 65 }],
        effects: [
          { t: 'flag', flag: 'mnrApoio', value: 'apoio' },
          { t: 'attr', attr: 'popularity', amount: 5 },
          { t: 'attr', attr: 'influence', amount: 4 },
          { t: 'relation', who: 'bento', amount: 5 },
          { t: 'faction', faction: 'movimentos', amount: 7 },
        ],
        summary: 'Conquistou o apoio eleitoral público do MNR — movimento mantém estrutura própria.',
      },
      {
        id: 'alianca',
        label: 'Propor aliança formal: acordo político com programa e cláusulas',
        description: 'Nível máximo: MNR e campanha dividem pauta e calendário — ainda sem filiação partidária.',
        requires: [
          { t: 'relationGte', who: 'bento', value: 80 },
          { t: 'factionGte', faction: 'movimentos', value: 75 },
        ],
        effects: [
          { t: 'flag', flag: 'mnrApoio', value: 'alianca' },
          { t: 'attr', attr: 'popularity', amount: 6 },
          { t: 'attr', attr: 'influence', amount: 5 },
          { t: 'relation', who: 'bento', amount: 6 },
          { t: 'faction', faction: 'movimentos', amount: 8 },
        ],
        summary: 'Fechou aliança política formal com o MNR, com programa e cláusulas — sem filiação partidária.',
      },
      {
        id: 'independente',
        label: 'Aceitar que o MNR siga independente até o fim',
        description: 'Sem apoio declarado; a relação fica boa do mesmo jeito.',
        effects: [
          { t: 'attr', attr: 'influence', amount: 1 },
          { t: 'relation', who: 'bento', amount: 4 },
          { t: 'faction', faction: 'movimentos', amount: 3 },
          { t: 'flag', flag: 'mnrCoesao', value: 'coesa' },
        ],
        summary: 'Aceitou que o MNR siga independente até o fim — relação preservada, sem apoio declarado.',
      },
    ],
  },
];

export const EVENT_MAP: Record<string, EventDef> = Object.fromEntries(
  EVENTS.map((e) => [e.id, e]),
);
