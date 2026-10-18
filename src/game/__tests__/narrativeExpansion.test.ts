import { describe, expect, it } from 'vitest';
import { evalAll } from '@/game/conditions';
import { CHARACTERS } from '@/game/data/characters';
import { EVENTS, EVENT_MAP } from '@/game/data/events';
import { eligibleEvents, queueEvent, resolveEvent, rollDailyEvents } from '@/game/events/eventSystem';
import { MISSIONS, MISSION_MAP } from '@/game/data/missions';
import { createCampaignState } from '@/game/state/initialState';
import type { CampaignState, CharacterId, EventId, MissionId } from '@/game/types';

/** Os 18 eventos da expansão narrativa (Rodada 7). */
const ARC_EVENTS = [
  'pacote_economico',
  'debate_economico',
  'crise_orcamentaria',
  'caetano_critica',
  'caetano_exigencias',
  'tiago_contato',
  'tiago_ascensao',
  'dante_credito',
  'dante_divida',
  'diretorio_partido',
  'silvio_oferta',
  'pedro_pesquisa',
  'daniela_parecer',
  'rafael_mobiliza',
  'valdemar_cobranca',
  'karsavia_contrapartida',
  'gilberto_fechamento',
  'equipe_abalada',
] as const;

function stateAt(day: number, patch: Partial<CampaignState> = {}): CampaignState {
  return {
    ...createCampaignState({ seed: 5, difficulty: 'normal' }),
    phase: 'campaign',
    day,
    ...patch,
  };
}

function withFlags(day: number, flags: Record<string, boolean | number | string>): CampaignState {
  return stateAt(day, { flags: { ...stateAt(day).flags, ...flags } });
}

describe('arcos narrativos — elegibilidade e encadeamento', () => {
  it('arco de Felipe Azevedo: pacote → debate → crise, com portas de resgate', () => {
    // Abertura acessível: pacote econômico no dia 6, sem pré-requisito obscuro.
    expect(evalAll(EVENT_MAP['pacote_economico'].when, stateAt(6))).toBe(true);
    expect(evalAll(EVENT_MAP['pacote_economico'].when, stateAt(5))).toBe(false);

    // Debate: aparece cedo para quem já viu o pacote, e mesmo sem ele a partir do dia 26.
    expect(evalAll(EVENT_MAP['debate_economico'].when, withFlags(16, { pacoteEconomico: 'critica' }))).toBe(true);
    expect(evalAll(EVENT_MAP['debate_economico'].when, stateAt(16))).toBe(false);
    expect(evalAll(EVENT_MAP['debate_economico'].when, stateAt(26))).toBe(true);

    // Crise orçamentária: consequência atrasada com o mesmo desenho.
    expect(evalAll(EVENT_MAP['crise_orcamentaria'].when, withFlags(30, { pacoteEconomico: 'critica' }))).toBe(true);
    expect(evalAll(EVENT_MAP['crise_orcamentaria'].when, stateAt(30))).toBe(false);
    expect(evalAll(EVENT_MAP['crise_orcamentaria'].when, stateAt(38))).toBe(true);
  });

  it('Dante: cada caminho do contrato tem sua consequência atrasada — e só a sua', () => {
    // 'opaco' já é cobrado pelo evento dante_conflito (dia 30).
    expect(evalAll(EVENT_MAP['dante_conflito'].when, withFlags(30, { danteDeal: 'opaco' }))).toBe(true);
    expect(evalAll(EVENT_MAP['dante_credito'].when, withFlags(32, { danteDeal: 'opaco' }))).toBe(false);
    expect(evalAll(EVENT_MAP['dante_divida'].when, withFlags(32, { danteDeal: 'opaco' }))).toBe(false);

    // 'transparente' compra crédito (observatório) — nunca a retaliação.
    expect(evalAll(EVENT_MAP['dante_credito'].when, withFlags(32, { danteDeal: 'transparente' }))).toBe(true);
    expect(evalAll(EVENT_MAP['dante_divida'].when, withFlags(32, { danteDeal: 'transparente' }))).toBe(false);

    // 'recusado' encontra o dinheiro do outro lado — nunca o observatório.
    expect(evalAll(EVENT_MAP['dante_divida'].when, withFlags(32, { danteDeal: 'recusado' }))).toBe(true);
    expect(evalAll(EVENT_MAP['dante_credito'].when, withFlags(32, { danteDeal: 'recusado' }))).toBe(false);

    // Sem acordo nenhum, nenhum dos dois ecoa.
    expect(evalAll(EVENT_MAP['dante_credito'].when, stateAt(34))).toBe(false);
    expect(evalAll(EVENT_MAP['dante_divida'].when, stateAt(34))).toBe(false);
  });

  it('Caetano: crítica acessível cedo; cobrança só para quem aceitou apoio', () => {
    expect(evalAll(EVENT_MAP['caetano_critica'].when, stateAt(14))).toBe(true);

    const exigencias = EVENT_MAP['caetano_exigencias'].when;
    expect(evalAll(exigencias, withFlags(40, { caetanoSupport: 'sim' }))).toBe(true);
    expect(evalAll(exigencias, withFlags(40, { caetanoSupport: 'limitado' }))).toBe(true);
    expect(evalAll(exigencias, withFlags(40, { caetanoSupport: 'nao' }))).toBe(false);
    expect(evalAll(exigencias, stateAt(40))).toBe(false);
  });

  it('Tiago: dados acessíveis cedo; ascensão só para quem pegou a rede', () => {
    expect(evalAll(EVENT_MAP['tiago_contato'].when, stateAt(18))).toBe(true);

    const ascensao = EVENT_MAP['tiago_ascensao'].when;
    expect(evalAll(ascensao, withFlags(42, { tiagoRede: 'estrutura' }))).toBe(true);
    expect(evalAll(ascensao, withFlags(42, { tiagoRede: 'dados' }))).toBe(true);
    expect(evalAll(ascensao, withFlags(42, { tiagoRede: 'nao' }))).toBe(false);
    expect(evalAll(ascensao, stateAt(42))).toBe(false);
  });

  it('Valdemar cobra a pasta prometida; Walker cobra a contrapartida acordada', () => {
    expect(evalAll(EVENT_MAP['valdemar_cobranca'].when, withFlags(26, { promisedMinistry: true }))).toBe(true);
    expect(evalAll(EVENT_MAP['valdemar_cobranca'].when, stateAt(26))).toBe(false);

    const walker = EVENT_MAP['karsavia_contrapartida'].when;
    expect(evalAll(walker, withFlags(30, { backchannelKarsavia: true }))).toBe(true);
    expect(evalAll(walker, withFlags(30, { karsaviaDeal: true }))).toBe(true);
    expect(evalAll(walker, stateAt(30))).toBe(false);
  });

  it('crise de lealdade exige lealdade realmente abalada', () => {
    const crise = EVENT_MAP['equipe_abalada'].when;
    expect(evalAll(crise, stateAt(38, { attributes: { ...stateAt(38).attributes, loyalty: 45 } }))).toBe(true);
    expect(evalAll(crise, stateAt(38, { attributes: { ...stateAt(38).attributes, loyalty: 46 } }))).toBe(false);
  });

  it('todo arco abre em uma partida normal: nenhum evento exige combinação obscura', () => {
    // Aberturas de arco: elegíveis com o estado limpo da campanha.
    const openers: Array<[EventId, number]> = [
      ['pacote_economico', 6],
      ['diretorio_partido', 8],
      ['silvio_oferta', 10],
      ['pedro_pesquisa', 12],
      ['caetano_critica', 14],
      ['daniela_parecer', 16],
      ['debate_economico', 26],
      ['tiago_contato', 18],
      ['rafael_mobiliza', 20],
      ['crise_orcamentaria', 38],
      ['gilberto_fechamento', 50],
    ];
    for (const [id, day] of openers) {
      expect(evalAll(EVENT_MAP[id].when, stateAt(day)), id).toBe(true);
    }
  });
});

describe('consequências diferem de verdade entre escolhas', () => {
  it('pacote econômico: elogiar e criticar movem o mercado em sentidos opostos', () => {
    const base = queueEvent(stateAt(8), 'pacote_economico');
    const elogio = resolveEvent(base, 'pacote_economico', 'tecnica').state;
    const critica = resolveEvent(base, 'pacote_economico', 'critica').state;

    expect(elogio.factions.mercado).toBeGreaterThan(base.factions.mercado);
    expect(critica.factions.mercado).toBeLessThan(base.factions.mercado);
    expect(elogio.regions.sle.player).toBe(base.regions.sle.player);
    expect(critica.regions.sle.player).toBeGreaterThan(base.regions.sle.player);
    expect(elogio.flags['pacoteEconomico']).toBe('tecnica');
    expect(critica.flags['pacoteEconomico']).toBe('critica');
    // O ministro reage: aproximação técnica x desgaste por crítica.
    expect(elogio.relations.camurca).toBeGreaterThan(base.relations.camurca);
    expect(critica.relations.camurca).toBeLessThan(base.relations.camurca);
  });

  it('evento resolvido não repete nem volta à fila', () => {
    let s = queueEvent(stateAt(20), 'rafael_mobiliza');
    const out = resolveEvent(s, 'rafael_mobiliza', 'ir');
    expect(out.error).toBeUndefined();
    s = out.state;
    expect(s.firedEvents).toContain('rafael_mobiliza');
    expect(s.eventQueue).not.toContain('rafael_mobiliza');
    // Não é mais elegível nem pode ser resolvido de novo.
    expect(eligibleEvents(s).map((e) => e.id)).not.toContain('rafael_mobiliza');
    const again = resolveEvent(s, 'rafael_mobiliza', 'ir');
    expect(again.error).toBeTruthy();
    expect(again.state).toBe(s);
  });

  it('escolhas que exigem recurso continuam ocultas quando o recurso falta', () => {
    // Debater com o ministro ao vivo exige influência; sem ela, some da lista.
    const semInfluencia = queueEvent(stateAt(18), 'debate_economico');
    const semVerba = { ...semInfluencia, funds: 0 };
    expect(resolveEvent(semVerba, 'debate_economico', 'preparar').error).toMatch(/verba/i);
    const semRelacao = queueEvent(stateAt(12), 'silvio_oferta');
    const semClima: CampaignState = { ...semRelacao, relations: { ...semRelacao.relations, lutero: 30 } };
    expect(resolveEvent(semClima, 'silvio_oferta', 'condicional').error).toMatch(/requisitos/i);
  });
});

describe('presença distribuída do elenco', () => {
  it('todos os 15 personagens jogáveis/apresentados aparecem em missões ou eventos', () => {
    const appearances = new Map<CharacterId, number>();
    const count = (id: CharacterId | undefined) => {
      if (id) appearances.set(id, (appearances.get(id) ?? 0) + 1);
    };
    for (const mission of MISSIONS) {
      for (const c of mission.characters) count(c);
      for (const node of Object.values(mission.nodes)) {
        if (node.t === 'dialogue' || node.t === 'choice') count(node.speaker);
      }
    }
    for (const event of EVENTS) count(event.portrait);

    for (const c of CHARACTERS) {
      if (c.id === 'rafael') continue; // Fábio Barreto é o próprio jogador.
      expect(appearances.get(c.id) ?? 0, `${c.name} (${c.id}) deve ter ao menos 2 aparições`)
        .toBeGreaterThanOrEqual(2);
    }
  });

  it('os quatro arcos pedidos pelo jogador ganharam peso real', () => {
    const countPortraits = (who: CharacterId) => EVENTS.filter((e) => e.portrait === who).length;
    expect(countPortraits('camurca')).toBeGreaterThanOrEqual(3); // Felipe: 4 eventos
    expect(countPortraits('caetano')).toBeGreaterThanOrEqual(3); // Caetano: 3 eventos
    expect(countPortraits('tiago')).toBeGreaterThanOrEqual(3); // Tiago: 3 eventos
    expect(countPortraits('dante')).toBeGreaterThanOrEqual(4); // Dante: 4 eventos
    // André Monteiro preservado, sem novos eventos: sua fatia relativa diminui.
    expect(countPortraits('amaro')).toBe(1);
  });

  it('distribuição temporal: início, meio e reta final cobertos', () => {
    const minDay = (id: EventId) => {
      const days = EVENT_MAP[id].when.filter((c): c is { t: 'daysGte'; value: number } => c.t === 'daysGte');
      return Math.min(...days.map((c) => c.value));
    };
    // Início: três eventos novos até o dia 12.
    expect(ARC_EVENTS.filter((id) => minDay(id) <= 12).length).toBeGreaterThanOrEqual(3);
    // Segundo tempo: pelo menos 6 eventos novos a partir do dia 30.
    expect(ARC_EVENTS.filter((id) => minDay(id) >= 30).length).toBeGreaterThanOrEqual(6);
    // Reta final: pelo menos 4 eventos novos a partir do dia 38.
    expect(ARC_EVENTS.filter((id) => minDay(id) >= 38).length).toBeGreaterThanOrEqual(4);
    // Nenhum evento novo antes do dia 6 (a campanha começa com a M1).
    expect(Math.min(...ARC_EVENTS.map(minDay))).toBeGreaterThanOrEqual(6);
  });
});

describe('escolhas novas nas missões conectam arcos de eventos', () => {
  const m1 = MISSION_MAP['m1'];
  const m2 = MISSION_MAP['m2'];
  const m4 = MISSION_MAP['m4'];
  const m5 = MISSION_MAP['m5'];

  function choiceOf(mission: typeof m1, nodeId: string, choiceId: string) {
    const node = mission.nodes[nodeId];
    if (node.t !== 'choice') throw new Error(`${nodeId} deveria ser nó de escolha`);
    const choice = node.choices.find((c) => c.id === choiceId);
    if (!choice) throw new Error(`escolha ${choiceId} não encontrada em ${nodeId}`);
    return choice;
  }

  it('M1: aval de Gilberto Kaspar é uma quarta estratégia legítima', () => {
    const choice = choiceOf(m1, 'plenario', 'aval_partido');
    expect(evalAll(choice.requires ?? [], stateAt(1))).toBe(true);
    expect(choice.hint).toBeTruthy();
    expect(choice.summary).toBeTruthy();
    expect(choice.next).toBe('dulcinea');
    expect(choice.effects?.some((e) => e.t === 'flag' && e.flag === 'initialStrategy')).toBe(true);
    // Faixa preservada: 4 alternativas no plenário.
    expect(m1.nodes['plenario'].t === 'choice' && m1.nodes['plenario'].choices).toHaveLength(4);
  });

  it('M2: cobertura de Sílvio só com clima construído com ele', () => {
    const choice = choiceOf(m2, 'vazamento', 'silvio_cobertura');
    const comClima = stateAt(8);
    const semClima: CampaignState = { ...comClima, relations: { ...comClima.relations, lutero: 30 } };
    expect(evalAll(choice.requires ?? [], comClima)).toBe(true); // base 50
    expect(evalAll(choice.requires ?? [], semClima)).toBe(false);
    expect(m2.characters).toContain('lutero');
  });

  it('M4: resposta paga só existe para quem fechou acordo com Dante', () => {
    const choice = choiceOf(m4, 'origem', 'resposta_paga');
    expect(evalAll(choice.requires ?? [], stateAt(20))).toBe(false);
    expect(evalAll(choice.requires ?? [], withFlags(20, { danteDeal: 'transparente' }))).toBe(true);
    expect(evalAll(choice.requires ?? [], withFlags(20, { danteDeal: 'opaco' }))).toBe(true);
    expect(evalAll(choice.requires ?? [], withFlags(20, { danteDeal: 'recusado' }))).toBe(false);
    expect(choice.effects?.some((e) => e.t === 'flag' && e.flag === 'videoNarrative')).toBe(true);
  });

  it('M5: quem debateu com Felipe leva munição ao preparo e ao debate final', () => {
    const preparo = choiceOf(m5, 'preparo', 'pauta_economica');
    expect(evalAll(preparo.requires ?? [], stateAt(50))).toBe(false);
    expect(evalAll(preparo.requires ?? [], withFlags(50, { debateEconomico: 'aceito' }))).toBe(true);
    expect(evalAll(preparo.requires ?? [], withFlags(50, { debateEconomico: 'recusado' }))).toBe(false);

    const debate = choiceOf(m5, 'debate', 'conta_governo');
    expect(evalAll(debate.requires ?? [], stateAt(52))).toBe(false);
    expect(evalAll(debate.requires ?? [], withFlags(52, { pacoteEconomico: 'tecnica' }))).toBe(true);
    // Toda saída do debate define a noite (objetivo o2 da M5).
    expect(debate.effects?.some((e) => e.t === 'flag' && e.flag === 'debateFinalScore')).toBe(true);
    expect(debate.effects?.some((e) => e.t === 'flag' && e.flag === 'debateWon')).toBe(true);
  });

  it('nenhuma escolha nova é a única saída visível de um nó', () => {
    const touched: Array<[typeof m1, string]> = [
      [m1, 'plenario'],
      [m2, 'vazamento'],
      [m4, 'origem'],
      [m5, 'preparo'],
      [m5, 'debate'],
    ];
    for (const [mission, nodeId] of touched) {
      const node = mission.nodes[nodeId];
      if (node.t !== 'choice') throw new Error(`${nodeId} deveria ser nó de escolha`);
      // Com o estado limpo, o nó sempre mostra 2+ alternativas — a nova é opcional.
      const visible = node.choices.filter((c) => evalAll(c.requires ?? [], stateAt(10)));
      expect(visible.length, `${mission.id}:${nodeId}`).toBeGreaterThanOrEqual(2);
      expect(visible.length, `${mission.id}:${nodeId}`).toBeLessThanOrEqual(5);
    }
  });
});

// ---------------------------------------------------------------------------
// Eventos de arco garantidos — a correção do bug "Dante nunca apareceu":
// aberturas e consequências condicionais entram na fila no primeiro dia
// elegível, sem depender do sorteio diário (que antes olhava só os 3
// maiores de 38 eventos e sufocava os demais).
// ---------------------------------------------------------------------------
const GUARANTEED = EVENTS.filter((e) => e.guaranteed).map((e) => e.id);

describe('eventos de arco garantidos chegam sempre', () => {
  const ARC_QUEUE_CASES: Array<{
    id: EventId;
    day: number;
    patch: Partial<CampaignState>;
  }> = [
    { id: 'dante_proposta', day: 22, patch: { completedMissions: ['m1', 'm2'] } },
    { id: 'dante_conflito', day: 30, patch: { flags: { danteDeal: 'opaco' } } },
    { id: 'dante_credito', day: 32, patch: { flags: { danteDeal: 'transparente' } } },
    { id: 'dante_divida', day: 32, patch: { flags: { danteDeal: 'recusado' } } },
    { id: 'caetano_articulacao', day: 32, patch: { completedMissions: ['m1', 'm4'] } },
    { id: 'caetano_exigencias', day: 40, patch: { flags: { caetanoSupport: 'sim' } } },
    { id: 'tiago_gestao', day: 36, patch: { completedMissions: ['m1', 'm4'] } },
    { id: 'tiago_ascensao', day: 42, patch: { flags: { tiagoRede: 'estrutura' } } },
    { id: 'documentario_republica', day: 34, patch: { completedMissions: ['m1', 'm4'] } },
    { id: 'bastidores_publicados', day: 40, patch: { flags: { productionsInvestigated: true } } },
    { id: 'black_stallion', day: 26, patch: { completedMissions: ['m1', 'm3'] } },
    { id: 'crise_diplomatica', day: 26, patch: {} },
    { id: 'valdemar_cobranca', day: 26, patch: { flags: { promisedMinistry: true } } },
    { id: 'karsavia_contrapartida', day: 30, patch: { flags: { backchannelKarsavia: true } } },
  ];

  it('todo evento marcado como garantido tem portão de arco condicional', () => {
    // 14 eventos de arco: aberturas de arco + consequências de decisões.
    expect(GUARANTEED.length).toBeGreaterThanOrEqual(12);
    for (const id of GUARANTEED) {
      const def = EVENT_MAP[id];
      expect(def.once, id).toBe(true);
      expect(def.when.length, id).toBeGreaterThan(0);
      expect(def.choices.length, id).toBeGreaterThanOrEqual(2);
    }
  });

  it.each(ARC_QUEUE_CASES)('$id entra na fila no dia $day (sem sorteio)', ({ id, day, patch }) => {
    const base = stateAt(day, patch);
    // Demais garantidos já disparados: este é o único garantido elegível.
    const prepared: CampaignState = {
      ...base,
      firedEvents: [...base.firedEvents, ...GUARANTEED.filter((g) => g !== id)],
    };
    const rolled = rollDailyEvents(prepared);
    expect(rolled.eventQueue, `${id} deveria entrar na fila`).toContain(id);
  });

  it('antes das condições, o garantido nunca aparece', () => {
    // Dia 21 (antes do portão de Dante) e sem M2: dante_proposta fora da fila.
    const rolled = rollDailyEvents(stateAt(21, { completedMissions: ['m1', 'm2'] }));
    expect(rolled.eventQueue).not.toContain('dante_proposta');
    const rolled2 = rollDailyEvents(stateAt(22));
    expect(rolled2.eventQueue).not.toContain('dante_proposta');
  });

  it('não duplica na fila e não volta depois de resolvido', () => {
    const s = queueEvent(stateAt(22, { completedMissions: ['m1', 'm2'] }), 'dante_proposta');
    const double = rollDailyEvents(s);
    expect(double.eventQueue.filter((x) => x === 'dante_proposta')).toHaveLength(1);
    const resolved = resolveEvent(s, 'dante_proposta', 'recusar').state;
    const after = rollDailyEvents({ ...resolved, day: resolved.day + 1 });
    expect(after.eventQueue).not.toContain('dante_proposta');
    expect(resolved.firedEvents).toContain('dante_proposta');
  });

  it('sorteio ordinário alcança eventos de prioridade baixa (antes: nunca)', () => {
    // No dia 10 o pool é pequeno e aliado_vira (p60) é o último do ranking —
    // com o antigo "só os 3 maiores", ele nunca era candidato em 100 sementes.
    // A abertura garantida do MNR (dia 8) já aconteceu: mede-se o sorteio puro.
    let draws = 0;
    for (let seed = 1; seed <= 100; seed++) {
      const base: CampaignState = {
        ...createCampaignState({ seed, difficulty: 'normal' }),
        phase: 'campaign',
        day: 10,
        firedEvents: ['mnr_mobilizacao'],
      };
      if (rollDailyEvents(base).eventQueue.includes('aliado_vira')) draws++;
    }
    expect(draws).toBeGreaterThanOrEqual(2);
  });

  it('campanhas simuladas sempre encontram os arcos-chave', () => {
    // 40 campanhas com ritmo típico de missões: o arco do Dante, do Caetano,
    // do Tiago e a investigação de William precisam disparar em todas.
    const N = 40;
    const fired = new Set<string>();
    for (let seed = 1; seed <= N; seed++) {
      let s: CampaignState = {
        ...createCampaignState({ seed, difficulty: 'normal' }),
        phase: 'campaign',
      };
      const m2 = 5 + (seed % 5);
      const m3 = m2 + 5 + (seed % 4);
      const m4 = m3 + 7 + (seed % 5);
      for (let day = 1; day <= 84; day++) {
        const done: MissionId[] = ['m1'];
        if (day >= m2) done.push('m2');
        if (day >= m3) done.push('m3');
        if (day >= m4) done.push('m4');
        s = { ...s, day, completedMissions: done };
        s = rollDailyEvents(s);
        let guard = 0;
        while (s.eventQueue.length > 0 && guard++ < 40) {
          const evId = s.eventQueue[0];
          const def = EVENT_MAP[evId];
          const choice =
            def.choices.find((c) => evalAll(c.requires, s) && (c.cost?.funds ?? 0) <= s.funds) ??
            def.choices[0];
          const out = resolveEvent(s, evId, choice.id);
          if (out.error) break;
          s = out.state;
          fired.add(evId);
        }
      }
    }
    for (const id of [
      'dante_proposta',
      'dante_credito',
      'caetano_articulacao',
      'caetano_exigencias',
      'tiago_gestao',
      'tiago_ascensao',
      'documentario_republica',
      'bastidores_publicados',
      'black_stallion',
      'valdemar_cobranca',
    ]) {
      expect(fired.has(id), `${id} deveria disparar em toda campanha simulada`).toBe(true);
    }
  });
});
