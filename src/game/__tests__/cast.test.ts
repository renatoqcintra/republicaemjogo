import { describe, expect, it } from 'vitest';
import { CHARACTERS, CHARACTER_MAP, character } from '@/game/data/characters';
import { EVENTS, EVENT_MAP } from '@/game/data/events';
import { MISSION_MAP } from '@/game/data/missions';
import { INITIAL_RELATIONS, createCampaignState } from '@/game/state/initialState';
import { evalAll } from '@/game/conditions';
import { migrateSave, validateSave } from '@/game/save/validate';
import { SAVE_VERSION } from '@/game/constants';
import { EVENT_IDS, type CampaignState } from '@/game/types';

/** Eventos introduzidos junto com a expansão da trama. */
const NEW_EVENTS = [
  'dante_proposta',
  'black_stallion',
  'documentario_republica',
  'dante_conflito',
  'caetano_articulacao',
  'tiago_gestao',
  'andre_tribunal',
  'bastidores_publicados',
  // Rodada 7 — expansão narrativa com arcos por personagem:
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
  // Rodada 9 — Rafael Sampaio e o MNR (organização independente):
  'mnr_mobilizacao',
  'mnr_negociacao',
  'mnr_pragonismo',
  'mnr_regional',
  'mnr_bases',
  'contrato_mentoria',
  'mnr_crise_autonomia',
  'mnr_definicao',
] as const;

describe('elenco atualizado', () => {
  it('16 personagens com ids internos estáveis e únicos', () => {
    expect(CHARACTERS).toHaveLength(16);
    const ids = CHARACTERS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    // Todo personagem tem definição e relação inicial — e vice-versa.
    expect(Object.keys(CHARACTER_MAP).sort()).toEqual([...ids].sort());
    expect(Object.keys(INITIAL_RELATIONS).sort()).toEqual([...ids].sort());
  });

  it('personagens principais renomeados; os preservados seguem iguais', () => {
    expect(character('rafael').name).toBe('Fábio Barreto');
    expect(character('aurelio').name).toBe('Leandro Lacerda');
    expect(character('helio').name).toBe('Júlio Barreto');
    expect(character('zorana').name).toBe('Thomas Walker');
    expect(character('bento').name).toBe('Rafael Sampaio');
    expect(character('camurca').name).toBe('Felipe Azevedo');
    expect(character('amaro').name).toBe('André Monteiro');
    expect(character('amaro').role).toContain('Tribunal Superior da República');
    // Renomeados nesta rodada (ids internos preservados para não quebrar saves):
    expect(character('dulcinea').name).toBe('Gilberto Kaspar');
    expect(character('iris').name).toBe('William Nogueira');
    expect(character('vera').name).toBe('Pedro Marques');
    expect(character('salome').name).toBe('Daniela Bezerra');
    expect(character('sandoval').name).toBe('Valdemar Costa');
    expect(character('lutero').name).toBe('Sílvio Valente');
    // Novos:
    expect(character('dante').name).toBe('Dante Valverde');
    expect(character('caetano').name).toBe('Caetano Góis');
    expect(character('tiago').name).toBe('Tiago Farias');
  });

  it('nenhum texto do elenco cita nomes antigos nem referências reais', () => {
    const proibidos = [
      // Rodadas anteriores:
      'Rafael Bandeira',
      'Aurélio Prado',
      'Hélio Bandeira',
      'Zorana Kalenkov',
      'Bento Luz',
      'Otávio Camurça',
      'Amaro Quintela',
      'Quintela',
      // Renomeados nesta rodada:
      'Dulcinéia',
      'Rocha',
      'Íris Nogueira',
      'Vera Andrade',
      'Salomé Vilar',
      'Vilar',
      'Sandoval Reis',
      'Lutero Vaz',
      // Pessoas reais usadas apenas como inspiração — jamais no elenco:
      'Kassab',
      'Bonner',
      'Marçal',
      'Deolane',
      'Costa Neto',
      'Silvio Santos',
      'Flávio Bolsonaro',
      'Jair Bolsonaro',
      'Donald Trump',
      'Renan Santos',
      'Haddad',
      'Moraes',
      'Ciro Gomes',
      'Tarcísio',
      'Vorcaro',
      'Lula',
    ];
    for (const c of CHARACTERS) {
      for (const nome of proibidos) {
        expect(c.name, `${c.id}/name`).not.toContain(nome);
        expect(c.bio, `${c.id}/bio`).not.toContain(nome);
        expect(c.personality, `${c.id}/personalidade`).not.toContain(nome);
        expect(c.secret, `${c.id}/segredo`).not.toContain(nome);
      }
    }
  });

  it('personagens novos têm retrato, postura e relação inicial coerentes', () => {
    for (const id of ['dante', 'caetano', 'tiago'] as const) {
      const def = character(id);
      expect(def.portrait.hairStyle).toBeTruthy();
      expect(def.initialStance.length).toBeGreaterThan(5);
      expect(def.interests.length).toBeGreaterThan(0);
      expect(INITIAL_RELATIONS[id]).toBeGreaterThanOrEqual(-100);
      expect(INITIAL_RELATIONS[id]).toBeLessThanOrEqual(100);
    }
    // Thomas Walker: penteado loiro-dourado volumoso e gravata vermelha.
    expect(character('zorana').portrait.hairStyle).toBe('swoop');
    expect(character('zorana').portrait.accessory).toBe('tie');
  });
});

describe('retratos dos 16 personagens', () => {
  it('todo retrato tem os parâmetros novos (rosto, idade, vestuário) em faixa válida', () => {
    const faces = new Set<string>();
    const hairs = new Set<string>();
    const outfits = new Set<string>();
    for (const c of CHARACTERS) {
      const p = c.portrait;
      expect(p.faceShape, c.id).toBeTruthy();
      expect(p.age, c.id).toBeTruthy();
      expect(p.outfit, c.id).toBeTruthy();
      expect(p.hair, c.id).toMatch(/^#[0-9a-f]{6}$/i);
      expect(p.skin, c.id).toMatch(/^#[0-9a-f]{6}$/i);
      faces.add(p.faceShape);
      hairs.add(p.hairStyle);
      outfits.add(p.outfit);
    }
    // Variedade real: sem "cópias" do mesmo rosto/cabelo/vestuário.
    // (Vestuário: o guia visual pede terno para quase todos — a variedade
    // mínima aceita é terno + blazer casual + camisa social.)
    expect(faces.size).toBeGreaterThanOrEqual(4);
    expect(hairs.size).toBeGreaterThanOrEqual(5);
    expect(outfits.size).toBeGreaterThanOrEqual(3);
  });

  it('silhuetas femininas (long/bun) só são usadas por personagens femininas', () => {
    for (const c of CHARACTERS) {
      const fem = c.portrait.hairStyle === 'long' || c.portrait.hairStyle === 'bun';
      if (fem) expect(c.id, c.id).toBe('salome');
    }
    expect(character('salome').portrait.lips).toBe('soft');
    expect(character('salome').portrait.beard).toBe('none');
    expect(character('salome').portrait.accessory).toBe('earrings');
  });

  it('profissões distintas ganham vestuário e acessórios coerentes', () => {
    // Terno para candidato/ministro/comunicador; blazer casual para o
    // influenciador e o político independente; camisa social para o
    // estrategista e o gestor público.
    expect(character('rafael').portrait.outfit).toBe('suit');
    expect(character('bento').portrait.outfit).toBe('jacket');
    expect(character('caetano').portrait.outfit).toBe('jacket');
    expect(character('vera').portrait.outfit).toBe('shirt');
    expect(character('tiago').portrait.outfit).toBe('shirt');
    expect(character('sandoval').portrait.beard).toBe('mustache');
    // Nenhum personagem com boné ou auscência auditiva decorativa.
    expect(CHARACTERS.every((c) => c.portrait.hairStyle !== 'cap')).toBe(true);
    expect(CHARACTERS.every((c) => c.portrait.accessory !== 'earpiece')).toBe(true);
  });

  it('guia visual: traços de reconhecimento por personagem', () => {
    // André Monteiro: único personagem completamente careca, óculos escuros,
    // rosto arredondado e terno.
    const bald = CHARACTERS.filter((c) => c.portrait.hairStyle === 'bald');
    expect(bald.map((c) => c.id)).toEqual(['amaro']);
    expect(character('amaro').portrait.glasses).toBe(true);
    expect(character('amaro').portrait.outfit).toBe('suit');
    expect(character('amaro').portrait.brows).toBe('thick');
    // Os outros 15 têm cabelo claramente visível.
    expect(
      CHARACTERS.filter((c) => c.id !== 'amaro').every((c) => c.portrait.hairStyle !== 'bald'),
    ).toBe(true);
    // Leandro Lacerda: barba e bigode grisalhos cheios + sorriso expressivo.
    expect(character('aurelio').portrait.beard).toBe('full');
    expect(character('aurelio').portrait.hair).toBe('#a39d94');
    expect(character('aurelio').portrait.lips).toBe('smile');
    // Thomas Walker: penteado loiro-dourado volumoso, sem barba, gravata vermelha.
    expect(character('zorana').portrait.hairStyle).toBe('swoop');
    expect(character('zorana').portrait.beard).toBe('none');
    expect(character('zorana').portrait.accent).toBe('#b3402f');
    // Sílvio Valente: cabelo grisalho abundante penteado para trás (nunca
    // careca nem ralo) e sorriso largo.
    expect(character('lutero').portrait.hairStyle).toBe('back');
    expect(character('lutero').portrait.lips).toBe('smile');
    expect(character('lutero').portrait.beard).toBe('none');
    // Fábio: aparência bem barbeada (sem barba volumosa).
    expect(character('rafael').portrait.beard).toBe('none');
    // Óculos: apenas Felipe Azevedo e André Monteiro.
    expect(
      CHARACTERS.filter((c) => c.portrait.glasses)
        .map((c) => c.id)
        .sort(),
    ).toEqual(['amaro', 'camurca']);
  });

  it('correções de retrato: sem barbas pedidas e pele mais escura de William', () => {
    // Felipe Azevedo, Caetano Góis e Tiago Farias sem barba (pedido do jogador).
    expect(character('camurca').portrait.beard).toBe('none');
    expect(character('caetano').portrait.beard).toBe('none');
    expect(character('tiago').portrait.beard).toBe('none');
    // William Nogueira com a pele um tom mais escura que os demais do cast.
    const william = character('iris').portrait.skin;
    expect(william).toBe('#d9b695');
    const asNumeric = (hex: string) =>
      [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const [r, g, b] = asNumeric(william);
    // Mais escura que o tom antigo (#e2c6a8) e mais escura que a média do cast.
    const avg = (hex: string) => asNumeric(hex).reduce((a, v) => a + v, 0) / 3;
    expect((r + g + b) / 3).toBeLessThan(avg('#e2c6a8'));
    const castAvg =
      CHARACTERS.reduce((sum, c) => sum + avg(c.portrait.skin), 0) / CHARACTERS.length;
    expect((r + g + b) / 3).toBeLessThan(castAvg);
  });
});

describe('eventos da expansão', () => {
  it('EVENT_IDS, EVENTS e EVENT_MAP permanecem consistentes (46 eventos)', () => {
    expect(EVENTS).toHaveLength(46);
    expect(EVENTS.map((e) => e.id).sort()).toEqual([...EVENT_IDS].sort());
    expect(Object.keys(EVENT_MAP).sort()).toEqual([...EVENT_IDS].sort());
  });

  it('eventos novos têm escolhas reais, resumo e condições legíveis', () => {
    for (const id of NEW_EVENTS) {
      const event = EVENT_MAP[id];
      expect(event, `evento ${id}`).toBeDefined();
      expect(event.when.length).toBeGreaterThan(0);
      expect(event.choices.length).toBeGreaterThanOrEqual(2);
      for (const choice of event.choices) {
        expect(choice.summary, `${id}/${choice.id}`).toBeTruthy();
        expect(choice.effects.length, `${id}/${choice.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('nenhum evento novo dispara no primeiro dia (condições legíveis)', () => {
    const day1 = createCampaignState({ seed: 77, difficulty: 'normal' });
    for (const id of NEW_EVENTS) {
      expect(evalAll(EVENT_MAP[id].when, day1), id).toBe(false);
    }
  });
});

describe('arco de André Monteiro na Missão 3', () => {
  it('abertura com o relator antes da escolha da linha de defesa', () => {
    const m3 = MISSION_MAP['m3'];
    expect(m3.nodes['start']).toMatchObject({ next: 'relator' });
    const relator = m3.nodes['relator'];
    expect(relator.t).toBe('dialogue');
    if (relator.t === 'dialogue') {
      expect(relator.speaker).toBe('amaro');
      expect(relator.next).toBe('camurca');
    }
    expect(m3.characters).toContain('amaro');
  });

  it('opção "clareza" exige relação com o relator e não promete resultado judicial', () => {
    const m3 = MISSION_MAP['m3'];
    const protocolo = m3.nodes['protocolo'];
    if (protocolo.t !== 'choice') throw new Error('protocolo deveria ser nó de escolha');
    const clareza = protocolo.choices.find((c) => c.id === 'clareza');
    expect(clareza).toBeDefined();
    expect(clareza!.requires).toEqual([{ t: 'relationGte', who: 'amaro', value: -55 }]);
    expect(clareza!.hint).toBeTruthy();
    expect(clareza!.summary).toBeTruthy();
    expect(clareza!.next).toBe('clareza');
    // Nenhuma escolha de postura define o desfecho do processo.
    const defineFate = (clareza!.effects ?? []).some(
      (e) => e.t === 'flag' && e.flag === 'fathersFate',
    );
    expect(defineFate).toBe(false);

    const clarezaNode = m3.nodes['clareza'];
    expect(clarezaNode.t).toBe('dialogue');
    if (clarezaNode.t === 'dialogue') {
      expect(clarezaNode.speaker).toBe('amaro');
      expect(clarezaNode.next).toBe('fim');
    }

    const base = createCampaignState({ seed: 4, difficulty: 'normal' });
    // Base atual de André é -65: escondida no estado inicial.
    const relacaoRuim: CampaignState = { ...base, relations: { ...base.relations, amaro: -65 } };
    const relacaoBoa: CampaignState = { ...base, relations: { ...base.relations, amaro: -45 } };
    expect(evalAll(clareza!.requires ?? [], relacaoRuim)).toBe(false);
    expect(evalAll(clareza!.requires ?? [], relacaoBoa)).toBe(true);
  });
});

describe('migração de salvamentos antigos', () => {
  it('salvamento sem os personagens novos ganha as relações iniciais', () => {
    const state = createCampaignState({ seed: 9, difficulty: 'normal' });
    const oldRelations = { ...state.relations };
    delete (oldRelations as Record<string, number>)['dante'];
    delete (oldRelations as Record<string, number>)['caetano'];
    delete (oldRelations as Record<string, number>)['tiago'];

    const out = validateSave({ version: SAVE_VERSION, savedAt: '2026-01-01T00:00:00.000Z', state: { ...state, relations: oldRelations } });
    expect(out.error).toBeUndefined();
    expect(out.state).not.toBeNull();
    expect(out.state!.relations['dante']).toBe(INITIAL_RELATIONS.dante);
    expect(out.state!.relations['caetano']).toBe(INITIAL_RELATIONS.caetano);
    expect(out.state!.relations['tiago']).toBe(INITIAL_RELATIONS.tiago);
    // Relações já existentes são preservadas sem tocar em nada.
    expect(out.state!.relations['salome']).toBe(state.relations['salome']);
    expect(out.state!.relations['amaro']).toBe(state.relations['amaro']);
  });

  it('migração de versão passada preenche os personagens novos', () => {
    const state = createCampaignState({ seed: 11, difficulty: 'facil' });
    const out = migrateSave({ version: 0, state });
    expect(out.error).toBeUndefined();
    expect(out.state!.relations['dante']).toBe(INITIAL_RELATIONS.dante);
    expect(out.warnings.some((w) => /migrado/i.test(w))).toBe(true);
  });

  it('saves antigos mantêm suas relações salvas sem rebalanceamento forçado', () => {
    const state = createCampaignState({ seed: 21, difficulty: 'normal' });
    const saved = { ...state, relations: { ...state.relations, aurelio: -12, amaro: -30 } };
    const out = validateSave({ version: SAVE_VERSION, savedAt: '2026-01-01T00:00:00.000Z', state: saved });
    expect(out.error).toBeUndefined();
    expect(out.state!.relations['aurelio']).toBe(-12);
    expect(out.state!.relations['amaro']).toBe(-30);
  });

  it('valores padrão legados são rebalanceados; valores do jogador são preservados', () => {
    const state = createCampaignState({ seed: 23, difficulty: 'normal' });
    // Save antigo carregando os padrões pré-rebalanceamento exatos
    // (Felipe +40, Lacerda +5) — o caso real relatado pelo jogador.
    const stale = { ...state, relations: { ...state.relations, camurca: 40, aurelio: 5 } };
    const out = validateSave({
      version: SAVE_VERSION,
      savedAt: '2026-01-01T00:00:00.000Z',
      state: stale,
    });
    expect(out.error).toBeUndefined();
    expect(out.state!.relations['camurca']).toBe(-40);
    expect(out.state!.relations['aurelio']).toBe(-55);
    expect(out.warnings.some((w) => /Felipe Azevedo/.test(w))).toBe(true);
    expect(out.warnings.some((w) => /Leandro Lacerda/.test(w))).toBe(true);

    // Relação que o jogador já moveu (não é o legado exato) fica intocada.
    const played = { ...state, relations: { ...state.relations, camurca: 20, aurelio: -12 } };
    const out2 = validateSave({
      version: SAVE_VERSION,
      savedAt: '2026-01-01T00:00:00.000Z',
      state: played,
    });
    expect(out2.state!.relations['camurca']).toBe(20);
    expect(out2.state!.relations['aurelio']).toBe(-12);
    expect(out2.warnings.some((w) => /balanceamento/.test(w))).toBe(false);

    // Nova campanha já nasce rebalanceada — a migração não dispara.
    const fresh = validateSave({ version: SAVE_VERSION, savedAt: '2026-01-01T00:00:00.000Z', state });
    expect(fresh.state!.relations['camurca']).toBe(-40);
    expect(fresh.warnings.some((w) => /balanceamento/.test(w))).toBe(false);
  });
});

describe('partidos, cargos e governo', () => {
  it('estrutura de governo, oposição e filiações consistentes', () => {
    // Governo: presidente em exercício (FPT) e ministro da Economia (FPT).
    expect(character('aurelio').role).toContain('Presidente em exercício');
    expect(character('aurelio').faction).toBe('Frente Popular Trabalhista (FPT)');
    expect(character('camurca').role).toContain('Ministro da Economia');
    expect(character('camurca').faction).toBe('Frente Popular Trabalhista (FPT)');
    // PRN: candidato e presidente do partido.
    expect(character('rafael').faction).toContain('Partido Renovador Nacional');
    expect(character('dulcinea').role).toContain('Presidente do PRN');
    expect(character('dulcinea').faction).toContain('Partido Renovador Nacional');
    // Demais estruturas:
    expect(character('sandoval').role).toContain('Presidente do PPV');
    expect(character('sandoval').faction).toContain('Partido Popular do Vale');
    expect(character('caetano').faction).toContain('Movimento Democrático do Centro');
    expect(character('tiago').faction).toContain('sem filiação partidária declarada');
    // MNR de Rafael Sampaio: organização independente, distinta do PRN.
    expect(character('bento').role).toContain('Fundador e líder do Movimento Nacional de Renovação');
    expect(character('bento').faction).toContain('Movimento Nacional de Renovação');
    expect(character('bento').faction).toContain('independente');
    expect(character('bento').faction).not.toMatch(/PRN|FPT|PPV|Partido/);
    // Sem filiação partidária brasileira automática:
    expect(character('zorana').faction).not.toMatch(/PRN|FPT|PPV|Partido/);
    expect(character('dante').faction).not.toMatch(/PRN|FPT|PPV|Partido/);
    // Não políticos:
    expect(character('iris').faction).toBe('Jornal Diáfano');
    expect(character('vera').faction).toBe('Comitê Barreto');
    expect(character('salome').faction).toBe('Bezerra & Associados');
    expect(character('lutero').faction).toBe('Grupo Vaz de Comunicação');
    expect(character('amaro').faction).toBe('Tribunal Superior da República');
  });
});

describe('relações iniciais e alinhamento político', () => {
  it('tabela de balanceamento aplicada nas relações de Fábio', () => {
    expect(INITIAL_RELATIONS.helio).toBe(80);
    expect(INITIAL_RELATIONS.tiago).toBe(65);
    expect(INITIAL_RELATIONS.zorana).toBe(55);
    expect(INITIAL_RELATIONS.vera).toBe(60);
    expect(INITIAL_RELATIONS.dulcinea).toBe(45);
    expect(INITIAL_RELATIONS.dante).toBe(10);
    expect(INITIAL_RELATIONS.aurelio).toBe(-55);
    expect(INITIAL_RELATIONS.camurca).toBe(-40);
    expect(INITIAL_RELATIONS.amaro).toBe(-65);
    // Personagens sem valor de tabela: base coerente e inalterada.
    expect(INITIAL_RELATIONS.bento).toBe(10);
    expect(INITIAL_RELATIONS.iris).toBe(15);
    expect(INITIAL_RELATIONS.salome).toBe(55);
    expect(INITIAL_RELATIONS.sandoval).toBe(25);
    expect(INITIAL_RELATIONS.lutero).toBe(50);
    expect(INITIAL_RELATIONS.caetano).toBe(15);
  });

  it('todo personagem tem alinhamento estático em faixa e coerente com o perfil', () => {
    for (const c of CHARACTERS) {
      expect(typeof c.alignment, c.id).toBe('number');
      expect(c.alignment, c.id).toBeGreaterThanOrEqual(-100);
      expect(c.alignment, c.id).toBeLessThanOrEqual(100);
    }
    expect(character('rafael').alignment).toBe(100);
    expect(character('aurelio').alignment).toBeLessThan(0);
    expect(character('camurca').alignment).toBeLessThan(0);
    expect(character('iris').alignment).toBe(0); // imprensa independente
    expect(character('amaro').alignment).toBe(0); // institucional, acima de partidos
  });

  it('relação pessoal ≠ alinhamento: mesmo partido pode divergir e imprensa não é aliada', () => {
    // Mesmo partido (PRN), mas relação apenas positiva — não lealdade absoluta.
    expect(character('rafael').faction).toContain('Partido Renovador Nacional');
    expect(character('dulcinea').faction).toContain('Partido Renovador Nacional');
    expect(INITIAL_RELATIONS.dulcinea).toBeLessThan(INITIAL_RELATIONS.helio);
    // Jornalista do mesmo universo ideológico, porém sem alinhamento (0) e relação baixa (15).
    expect(character('iris').alignment).toBe(0);
    expect(INITIAL_RELATIONS.iris).toBeLessThan(20);
    // Ministro do governo adversário: mesma casa de governo do presidente, relação negativa.
    expect(character('camurca').faction).toBe(character('aurelio').faction);
    expect(INITIAL_RELATIONS.camurca).toBeLessThan(0);
  });
});

describe('consequências das relações', () => {
  it('clareza (M3) só aparece quando o clima com o relator foi construído', () => {
    const protocolo = MISSION_MAP['m3'].nodes['protocolo'];
    if (protocolo.t !== 'choice') throw new Error('protocolo deveria ser nó de escolha');
    const clareza = protocolo.choices.find((c) => c.id === 'clareza');
    expect(clareza).toBeDefined();
    const base = createCampaignState({ seed: 2, difficulty: 'normal' });
    // Estado inicial (-65): escondida. Caminho cuidoso (jurídica + direito +
    // assessoria = +21 → -44): visível.
    expect(evalAll(clareza!.requires ?? [], base)).toBe(false);
    const cuidadoso: CampaignState = {
      ...base,
      relations: { ...base.relations, amaro: -44 },
    };
    expect(evalAll(clareza!.requires ?? [], cuidadoso)).toBe(true);
  });

  it('escolhas condicionais dos eventos dependem de relação construída', () => {
    const base = createCampaignState({ seed: 3, difficulty: 'normal' });

    // Black Stallion: negociar com Dante exige ter aceitado algum acordo com ele.
    const stallion = EVENT_MAP['black_stallion'].choices.find((c) => c.id === 'dante_negocia');
    expect(stallion).toBeDefined();
    expect(evalAll(stallion!.requires ?? [], base)).toBe(false); // dante = 10
    expect(
      evalAll(stallion!.requires ?? [], {
        ...base,
        relations: { ...base.relations, dante: 30 },
      }),
    ).toBe(true);

    // André Monteiro: manifestar nos autos exige clima construído na Missão 3.
    const escrita = EVENT_MAP['andre_tribunal'].choices.find((c) => c.id === 'escrita');
    expect(escrita).toBeDefined();
    expect(evalAll(escrita!.requires ?? [], base)).toBe(false); // amaro = -65
    expect(
      evalAll(escrita!.requires ?? [], {
        ...base,
        relations: { ...base.relations, amaro: -45 },
      }),
    ).toBe(true);

    // Walker: o pacto energético fica visível por padrão (55) e some após "condenar" (35).
    const acordo = EVENT_MAP['crise_diplomatica'].choices.find((c) => c.id === 'acordo');
    expect(acordo).toBeDefined();
    expect(evalAll(acordo!.requires ?? [], base)).toBe(true);
    expect(
      evalAll(acordo!.requires ?? [], {
        ...base,
        relations: { ...base.relations, zorana: 35 },
      }),
    ).toBe(false);
  });

  it('todo evento novo mantém ao menos uma escolha sempre disponível', () => {
    for (const id of NEW_EVENTS) {
      const event = EVENT_MAP[id];
      const sempre = event.choices.filter((c) => (c.requires ?? []).length === 0);
      expect(sempre.length, id).toBeGreaterThanOrEqual(1);
      expect(event.choices.length, id).toBeGreaterThanOrEqual(2);
    }
  });

  it('evento de bastidores integra as duas produções e a apuração jornalística', () => {
    const event = EVENT_MAP['bastidores_publicados'];
    expect(event.when).toEqual([
      { t: 'flag', flag: 'productionsInvestigated' },
      { t: 'daysGte', value: 40 },
    ]);
    expect(event.portrait).toBe('iris');
    expect(event.choices.map((c) => c.id).sort()).toEqual(['arma', 'endossar', 'prudencia']);
    const day1 = createCampaignState({ seed: 5, difficulty: 'normal' });
    expect(evalAll(event.when, day1)).toBe(false);
  });
});
