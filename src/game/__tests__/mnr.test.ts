import { describe, expect, it } from 'vitest';
import { evalAll } from '@/game/conditions';
import { character } from '@/game/data/characters';
import { EVENTS, EVENT_MAP } from '@/game/data/events';
import { mnrOrganization, mnrPosition } from '@/game/data/mnr';
import { MISSION_MAP } from '@/game/data/missions';
import { queueEvent, resolveEvent, rollDailyEvents } from '@/game/events/eventSystem';
import { createCampaignState, INITIAL_RELATIONS } from '@/game/state/initialState';
import type { CampaignState, Effect, EventId, MissionId } from '@/game/types';

function stateAt(day: number, patch: Partial<CampaignState> = {}): CampaignState {
  return {
    ...createCampaignState({ seed: 11, difficulty: 'normal' }),
    phase: 'campaign',
    day,
    ...patch,
  };
}

function withFlags(day: number, flags: Record<string, boolean | number | string>): CampaignState {
  return stateAt(day, { flags: { ...stateAt(day).flags, ...flags } });
}

/** O arco do MNR (Rodada 9) — inclui o rafael_mobiliza reenquadrado. */
const MNR_EVENTS: EventId[] = [
  'mnr_mobilizacao',
  'mnr_negociacao',
  'rafael_mobiliza',
  'mnr_pragonismo',
  'mnr_regional',
  'mnr_bases',
  'contrato_mentoria',
  'mnr_crise_autonomia',
  'mnr_definicao',
];

// ---------------------------------------------------------------------------
// 1. Ficha e identidade: Rafael Sampaio é o líder do MNR, não um influenciador.
// ---------------------------------------------------------------------------
describe('Rafael Sampaio — ficha do líder do MNR', () => {
  it('ficha identifica Rafael como fundador e líder do Movimento Nacional de Renovação', () => {
    const rafael = character('bento');
    expect(rafael.name).toBe('Rafael Sampaio');
    expect(rafael.role).toContain('Fundador e líder do Movimento Nacional de Renovação');
    expect(rafael.faction).toContain('Movimento Nacional de Renovação');
    expect(rafael.faction).toContain('independente');
    // A organização tem estrutura, militância e agenda própria.
    expect(rafael.bio).toContain('núcleos regionais');
    expect(rafael.bio).toContain('militantes');
    expect(rafael.bio).toContain('agenda própria');
    expect(rafael.interests).toContain('Autonomia política');
    expect(rafael.personality.toLowerCase()).toContain('autonomia');
    expect(rafael.initialStance).toContain('Independente');
    // O enquadramento antigo (influenciador/streamer) não sobreviveu.
    const sheet =
      `${rafael.role} ${rafael.faction} ${rafael.bio} ${rafael.personality} ${rafael.initialStance}`.toLowerCase();
    expect(sheet).not.toContain('influenciador');
    expect(sheet).not.toContain('stream');
  });

  it('segredo narrativo permanece: o contrato antigo é condicional, não automático', () => {
    expect(character('bento').secret).toContain('contrato de mentoria');
    expect(character('bento').secret).toContain('antes da campanha');
    // O evento que revela o contrato exige apuração (M4) ou proximidade real.
    const when = EVENT_MAP['contrato_mentoria'].when;
    expect(evalAll(when, stateAt(1))).toBe(false);
    expect(evalAll(when, stateAt(32))).toBe(false); // sem M4 e sem relação 35
    expect(evalAll(when, stateAt(31, { completedMissions: ['m1', 'm4'] }))).toBe(false); // antes do dia
    expect(evalAll(when, stateAt(32, { completedMissions: ['m1', 'm4'] }))).toBe(true);
  });

  it('MNR é distinto do PRN; sem apoio inicial a nenhum candidato', () => {
    expect(character('bento').faction).not.toMatch(/PRN|Partido Renovador/);
    expect(character('rafael').faction).toContain('Partido Renovador Nacional'); // Fábio, o jogador
    // Estado inicial: nenhuma flag do MNR — a posição padrão é independente.
    const s = createCampaignState({ seed: 3, difficulty: 'normal' });
    expect(s.flags['mnrApoio']).toBeUndefined();
    expect(s.flags['mnrEstrutura']).toBeUndefined();
    expect(s.flags['mnrCoesao']).toBeUndefined();
    expect(mnrPosition(s.flags)).toContain('sem apoio a nenhum candidato');
    expect(mnrOrganization(s.flags)).toContain('Núcleos em formação');
    expect(mnrOrganization(s.flags)).toContain('bases coesas');
    // Relação pessoal +10 é afeto pessoal — não apoio eleitoral.
    expect(INITIAL_RELATIONS.bento).toBe(10);
  });

  it('rótulos distinguem diálogo, acordo programático, apoio público e aliança', () => {
    const labels = [
      mnrPosition({}),
      mnrPosition({ mnrApoio: 'dialogo' }),
      mnrPosition({ mnrApoio: 'acordo' }),
      mnrPosition({ mnrApoio: 'apoio' }),
      mnrPosition({ mnrApoio: 'alianca' }),
      mnrPosition({ mnrApoio: 'distante' }),
    ];
    expect(new Set(labels).size).toBe(labels.length);
    expect(labels[0]).toContain('Independente');
    // Diálogo e acordo continuam explicitamente sem apoio eleitoral.
    expect(mnrPosition({ mnrApoio: 'dialogo' })).toContain('sem apoio eleitoral');
    expect(mnrPosition({ mnrApoio: 'acordo' })).toContain('sem apoio eleitoral');
    expect(mnrPosition({ mnrApoio: 'apoio' })).toContain('Apoio público');
    expect(mnrPosition({ mnrApoio: 'alianca' })).toContain('Aliança');
    // A ficha na UI reflete a posição da flag.
    expect(mnrPosition({ mnrApoio: 'acordo' })).toContain('Acordo programático');
    expect(mnrOrganization({ mnrEstrutura: 'nacional', mnrCoesao: 'fragmentada' })).toContain(
      'Rede nacional',
    );
    expect(mnrOrganization({ mnrEstrutura: 'nacional', mnrCoesao: 'fragmentada' })).toContain(
      'bases fragmentadas',
    );
  });
});

// ---------------------------------------------------------------------------
// 2. Regra de ouro: apoio eleitoral e aliança nunca são automático.
// ---------------------------------------------------------------------------
describe('MNR na campanha — regra de ouro e encadeamento', () => {
  it('apenas mnr_definicao declara apoio ou aliança — e só com histórico que justifica', () => {
    for (const ev of EVENTS) {
      for (const choice of ev.choices) {
        const declares = choice.effects.some(
          (e) =>
            e.t === 'flag' && e.flag === 'mnrApoio' && (e.value === 'apoio' || e.value === 'alianca'),
        );
        if (declares) expect(ev.id, `${ev.id}/${choice.id}`).toBe('mnr_definicao');
      }
    }
    const def = EVENT_MAP['mnr_definicao'];
    // O portão exige acordo programático + relação pessoal + força do movimento.
    expect(def.when).toEqual([
      { t: 'daysGte', value: 40 },
      { t: 'flag', flag: 'mnrApoio', equals: 'acordo' },
      { t: 'relationGte', who: 'bento', value: 45 },
      { t: 'factionGte', faction: 'movimentos', value: 55 },
    ]);
    // Aliança exige ainda mais: relação 80 e movimentos 75.
    const alianca = def.choices.find((c) => c.id === 'alianca');
    expect(alianca?.requires).toEqual([
      { t: 'relationGte', who: 'bento', value: 80 },
      { t: 'factionGte', faction: 'movimentos', value: 75 },
    ]);
    // Apoio é exceção votada: exige relação pessoal ≥ 65 — nunca sai do portão do evento.
    expect(def.choices.find((c) => c.id === 'apoio')?.requires).toEqual([
      { t: 'relationGte', who: 'bento', value: 65 },
    ]);
  });

  it('conversa e acordo programático nunca viram apoio; recusa afasta sem acusação', () => {
    const s0 = queueEvent(stateAt(14), 'mnr_negociacao');
    const aceitar = resolveEvent(s0, 'mnr_negociacao', 'aceitar_pauta').state;
    expect(aceitar.flags['mnrApoio']).toBe('acordo'); // acordo ≠ apoio
    const renegociar = resolveEvent(s0, 'mnr_negociacao', 'renegociar').state;
    expect(renegociar.flags['mnrApoio']).toBe('dialogo');
    const recusar = resolveEvent(s0, 'mnr_negociacao', 'recusar').state;
    expect(recusar.flags['mnrApoio']).toBe('distante');
    expect(recusar.relations.bento).toBeLessThan(s0.relations.bento);
    // Nenhum dos eventos de conversa seta apoio/alianca (regra varrida acima).
    for (const id of ['mnr_mobilizacao', 'mnr_negociacao', 'rafael_mobiliza'] as const) {
      for (const choice of EVENT_MAP[id].choices) {
        const flags = choice.effects.filter(
          (e): e is Extract<Effect, { t: 'flag' }> => e.t === 'flag' && e.flag === 'mnrApoio',
        );
        for (const f of flags) {
          expect(['dialogo', 'acordo', 'distante'], `${id}/${choice.id}`).toContain(f.value);
        }
      }
    }
  });

  it('a estrutura do MNR cresce com a mobilização — em qualquer caminho', () => {
    for (const choiceId of ['ir', 'pauta', 'nao']) {
      const queued = queueEvent(stateAt(8), 'mnr_mobilizacao');
      const out = resolveEvent(queued, 'mnr_mobilizacao', choiceId).state;
      expect(out.flags['mnrEstrutura'], choiceId).toBe('organizada');
    }
    const dialogo = resolveEvent(queueEvent(stateAt(8), 'mnr_mobilizacao'), 'mnr_mobilizacao', 'ir').state;
    expect(dialogo.flags['mnrApoio']).toBe('dialogo');
    const semApoio = resolveEvent(queueEvent(stateAt(8), 'mnr_mobilizacao'), 'mnr_mobilizacao', 'nao').state;
    expect(semApoio.flags['mnrApoio']).toBeUndefined(); // recusa mantém a independência
  });

  it('consequências do MNR só aparecem depois das condições narrativas', () => {
    // Protagonismo e regional exigem núcleos organizados.
    expect(evalAll(EVENT_MAP['mnr_pragonismo'].when, stateAt(22))).toBe(false);
    expect(evalAll(EVENT_MAP['mnr_pragonismo'].when, withFlags(22, { mnrEstrutura: 'organizada' }))).toBe(true);
    expect(evalAll(EVENT_MAP['mnr_regional'].when, stateAt(26))).toBe(false);
    expect(evalAll(EVENT_MAP['mnr_regional'].when, withFlags(26, { mnrEstrutura: 'nacional' }))).toBe(true);
    expect(evalAll(EVENT_MAP['mnr_regional'].when, stateAt(25, { flags: { ...stateAt(25).flags, mnrEstrutura: 'organizada' } }))).toBe(false);

    // Pressão das bases exige compromisso assumido.
    expect(evalAll(EVENT_MAP['mnr_bases'].when, stateAt(30))).toBe(false);
    expect(evalAll(EVENT_MAP['mnr_bases'].when, withFlags(30, { mnrApoio: 'dialogo' }))).toBe(false);
    expect(evalAll(EVENT_MAP['mnr_bases'].when, withFlags(30, { mnrApoio: 'acordo' }))).toBe(true);

    // Definição exige cada peça do portão.
    const definicao = EVENT_MAP['mnr_definicao'].when;
    const full: Partial<CampaignState> = {
      flags: { mnrApoio: 'acordo' },
      relations: { ...stateAt(40).relations, bento: 50 },
      factions: { ...stateAt(40).factions, movimentos: 60 },
    };
    expect(evalAll(definicao, stateAt(40, full))).toBe(true);
    expect(evalAll(definicao, stateAt(39, full))).toBe(false);
    expect(evalAll(definicao, stateAt(40, { ...full, flags: { mnrApoio: 'dialogo' } }))).toBe(false);
    expect(
      evalAll(definicao, stateAt(40, { ...full, relations: { ...stateAt(40).relations, bento: 44 } })),
    ).toBe(false);
    expect(
      evalAll(definicao, stateAt(40, { ...full, factions: { ...stateAt(40).factions, movimentos: 54 } })),
    ).toBe(false);
  });

  it('crise de autonomia: absorção acontece, exceto com aliança formal já fechada', () => {
    const autonomia = EVENT_MAP['mnr_crise_autonomia'].when;
    expect(evalAll(autonomia, stateAt(34))).toBe(true);
    expect(evalAll(autonomia, stateAt(33))).toBe(false);
    expect(evalAll(autonomia, withFlags(40, { mnrApoio: 'alianca' }))).toBe(false);
    // Cooperação limitada não é apoio: o estágio do MNR não muda, só a coesão.
    const dialogoState = stateAt(34, { flags: { ...stateAt(34).flags, mnrApoio: 'dialogo' } });
    const queued = queueEvent(dialogoState, 'mnr_crise_autonomia');
    const out = resolveEvent(queued, 'mnr_crise_autonomia', 'contraproposta').state;
    expect(out.flags['mnrApoio']).toBe('dialogo');
    expect(out.flags['mnrCoesao']).toBe('tensa');
    // Defender autonomia conserta a coesão e melhora a relação com Rafael.
    const defesa = resolveEvent(queued, 'mnr_crise_autonomia', 'autonomia').state;
    expect(defesa.flags['mnrCoesao']).toBe('coesa');
    expect(defesa.relations.bento).toBeGreaterThan(dialogoState.relations.bento);
    expect(defesa.relations.aurelio).toBeLessThan(dialogoState.relations.aurelio);
  });
});

// ---------------------------------------------------------------------------
// 3. Alcançabilidade, acessibilidade e não-repetição.
// ---------------------------------------------------------------------------
describe('MNR — alcançabilidade em campanha normal', () => {
  it('todo evento do MNR: portão legível, garantido e com saídas sempre visíveis', () => {
    for (const id of MNR_EVENTS) {
      const def = EVENT_MAP[id];
      expect(def.when.length, id).toBeGreaterThan(0);
      expect(def.once, id).toBe(true);
      // O arco não depende do sorteio diário (mesma correção do bug do Dante).
      expect(def.guaranteed, id).toBe(true);
      expect(def.choices.length, id).toBeGreaterThanOrEqual(2);
      const livres = def.choices.filter((c) => (c.requires ?? []).length === 0);
      expect(livres.length, id).toBeGreaterThanOrEqual(2);
      for (const c of def.choices) {
        expect(c.summary, `${id}/${c.id}`).toBeTruthy();
        expect(c.effects.length, `${id}/${c.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('nenhum evento do MNR dispara antes do dia 6; e não duplica depois de resolvido', () => {
    const day1 = createCampaignState({ seed: 9, difficulty: 'normal' });
    for (const id of MNR_EVENTS) {
      expect(evalAll(EVENT_MAP[id].when, day1), id).toBe(false);
    }
    // Não duplica na fila e não volta depois de resolvido.
    const s = queueEvent(stateAt(8), 'mnr_mobilizacao');
    const double = rollDailyEvents(s);
    expect(double.eventQueue.filter((x) => x === 'mnr_mobilizacao')).toHaveLength(1);
    const resolved = resolveEvent(s, 'mnr_mobilizacao', 'ir').state;
    expect(resolved.firedEvents).toContain('mnr_mobilizacao');
    const after = rollDailyEvents({ ...resolved, day: resolved.day + 1 });
    expect(after.eventQueue).not.toContain('mnr_mobilizacao');
  });

  it('o enquadramento do MNR aparece nos textos reescritos', () => {
    // Atos do movimento, não lives de streamer.
    expect(EVENT_MAP['rafael_mobiliza'].text).toContain('MNR');
    expect(EVENT_MAP['rafael_mobiliza'].text.toLowerCase()).not.toContain('ao vivo');
    expect(EVENT_MAP['bastidores_publicados'].text).toContain('MNR');
    // A fala de Rafael na M4 já fala do movimento.
    const reacao = MISSION_MAP['m4'].nodes['reacao'];
    expect(reacao.t === 'choice' && reacao.prompt).toContain('MNR');
  });

  it('campanhas simuladas sempre encontram o arco completo do MNR', () => {
    // 25 campanhas com ritmo típico de missões e escolha padrão: o arco do
    // MNR — da abertura ao desfecho — precisa disparar inteiro em todas.
    const N = 25;
    const firedPerSeed: Array<Set<string>> = [];
    for (let seed = 1; seed <= N; seed++) {
      let s: CampaignState = {
        ...createCampaignState({ seed, difficulty: 'normal' }),
        phase: 'campaign',
      };
      const m2 = 5 + (seed % 5);
      const m3 = m2 + 5 + (seed % 4);
      const m4 = m3 + 7 + (seed % 5);
      const fired = new Set<string>();
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
      firedPerSeed.push(fired);
    }
    for (const fired of firedPerSeed) {
      for (const id of MNR_EVENTS) {
        expect(fired.has(id), `${id} deveria disparar em toda campanha simulada`).toBe(true);
      }
    }
  });
});
