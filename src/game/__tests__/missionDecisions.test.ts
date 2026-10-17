import { describe, expect, it } from 'vitest';
import {
  advanceNode,
  chooseOption,
  concludeMission,
  startMission,
  unlockPass,
} from '@/game/engine/missionEngine';
import { evalAll } from '@/game/conditions';
import { ENDINGS } from '@/game/data/endings';
import { MISSIONS, MISSION_MAP } from '@/game/data/missions';
import { resolveJudicialFate } from '@/game/rules/judgement';
import { loadGame, saveGame } from '@/game/save/saveManager';
import { createCampaignState } from '@/game/state/initialState';
import type { CampaignState, MissionId } from '@/game/types';

function fresh(): CampaignState {
  return createCampaignState({ seed: 7, difficulty: 'normal' });
}

/** Campanha que concluiu a M1 (legado + Planalto) e a M2 (negociou com o PPV). */
function afterM1M2(): CampaignState {
  let s = fresh();
  s = startMission(s, 'm1').state;
  s = advanceNode(s, 'm1').state;
  s = chooseOption(s, 'm1', 'legado').state;
  s = advanceNode(s, 'm1').state;
  s = chooseOption(s, 'm1', 'plc').state;
  s = advanceNode(s, 'm1').state;
  s = concludeMission(s, 'm1').state;

  s = startMission(s, 'm2').state;
  s = advanceNode(s, 'm2').state;
  s = chooseOption(s, 'm2', 'negociar').state;
  s = chooseOption(s, 'm2', 'confirmar').state;
  return concludeMission(s, 'm2').state;
}

/** Entra na Missão 3 e executa um caminho (uma escolha por nó). */
function playM3(base: CampaignState, path: string[]): CampaignState {
  let s = startMission(base, 'm3').state;
  s = advanceNode(s, 'm3').state; // start → relator
  s = advanceNode(s, 'm3').state; // relator → linha
  for (const id of path) {
    const out = chooseOption(s, 'm3', id);
    expect(out.error, `escolha "${id}" não deveria falhar`).toBeUndefined();
    s = out.state;
  }
  return s;
}

/** Conclui M3 (postura cautelosa) e M4 (ignora + nota técnica). */
function afterM4(): CampaignState {
  let s = playM3(afterM1M2(), ['juridica', 'direito', 'incidentes', 'aguardar']);
  s = concludeMission(s, 'm3').state;
  s = startMission(s, 'm4').state;
  s = advanceNode(s, 'm4').state;
  s = chooseOption(s, 'm4', 'ignorar').state;
  s = chooseOption(s, 'm4', 'advogado').state;
  return concludeMission(s, 'm4').state;
}

function choiceNode(state: CampaignState, id: MissionId) {
  const def = MISSION_MAP[id];
  const nodeId = state.missions[id].currentNode ?? def.startNode;
  const node = def.nodes[nodeId];
  if (node.t !== 'choice') return null;
  return node;
}

function visibleChoiceIds(state: CampaignState, id: MissionId = 'm3'): string[] {
  const node = choiceNode(state, id);
  if (!node) return [];
  return node.choices.filter((c) => evalAll(c.requires, state)).map((c) => c.id);
}

function expectOptionsInBand(state: CampaignState, id: MissionId, min = 2, max = 4) {
  const count = visibleChoiceIds(state, id).length;
  const node = state.missions[id].currentNode;
  expect(count, `${id} @ ${node}`).toBeGreaterThanOrEqual(min);
  expect(count, `${id} @ ${node}`).toBeLessThanOrEqual(max);
}

describe('cada decisão oferece alternativas reais', () => {
  it('a M3 nunca fica com uma única alternativa visível (dilema central: 4)', () => {
    const base = afterM1M2();

    expectOptionsInBand(playM3(base, ['juridica']), 'm3'); // nó "imprensa"
    const emSinal = playM3(base, ['juridica', 'direito']);
    expect(visibleChoiceIds(emSinal)).toEqual([
      'incidentes',
      'comunicacao',
      'despoliticar',
      'assessoria',
    ]);
    expectOptionsInBand(playM3(base, ['juridica', 'direito', 'assessoria']), 'm3'); // "protocolo"
    expectOptionsInBand(playM3(base, ['silencio', 'parcial', 'despoliticar']), 'm3');
  });

  it('jornada completa: todo nó de escolha fica entre 2 e 5 alternativas', () => {
    let s = fresh();
    s = startMission(s, 'm1').state;
    s = advanceNode(s, 'm1').state;
    expectOptionsInBand(s, 'm1'); // plenario
    s = chooseOption(s, 'm1', 'legado').state;
    s = advanceNode(s, 'm1').state;
    expectOptionsInBand(s, 'm1', 2, 5); // prioridade (5 regiões)
    s = chooseOption(s, 'm1', 'sle').state;
    s = advanceNode(s, 'm1').state;
    s = concludeMission(s, 'm1').state;

    s = startMission(s, 'm2').state;
    s = advanceNode(s, 'm2').state;
    expectOptionsInBand(s, 'm2'); // mesa
    s = chooseOption(s, 'm2', 'negociar').state;
    expectOptionsInBand(s, 'm2'); // vazamento
    s = chooseOption(s, 'm2', 'confirmar').state;
    s = concludeMission(s, 'm2').state;

    s = playM3(s, ['juridica']); // parado em imprensa
    expectOptionsInBand(s, 'm3');
    s = playM3(afterM1M2(), ['juridica', 'direito', 'incidentes', 'aguardar']);
    expect(s.missions.m3.currentNode).toBe('fim');
    s = concludeMission(s, 'm3').state;

    s = startMission(s, 'm4').state;
    s = advanceNode(s, 'm4').state;
    expectOptionsInBand(s, 'm4'); // reacao
    s = chooseOption(s, 'm4', 'investigar').state;
    expectOptionsInBand(s, 'm4'); // origem
    s = chooseOption(s, 'm4', 'advogado').state;
    s = concludeMission(s, 'm4').state;

    const semana: CampaignState = { ...s, phase: 'finalWeek' };
    s = startMission(unlockPass(semana), 'm5').state;
    s = advanceNode(s, 'm5').state;
    expectOptionsInBand(s, 'm5', 2, 5); // recursos (5 regiões)
    s = chooseOption(s, 'm5', 'plc').state;
    expectOptionsInBand(s, 'm5'); // preparo
    s = chooseOption(s, 'm5', 'leitura').state;
    expectOptionsInBand(s, 'm5'); // debate
    s = chooseOption(s, 'm5', 'defender').state;
    expectOptionsInBand(s, 'm5'); // fechamento (inclui opção do desfecho)
    s = chooseOption(s, 'm5', 'discurso').state;
    s = concludeMission(s, 'm5').state;
    expect(s.completedMissions).toEqual(['m1', 'm2', 'm3', 'm4', 'm5']);
  });

  it('toda alternativa de dilema expõe uma consequência possível (hint)', () => {
    // Escolhas de região já exibem o efeito regional na interface.
    const exempt = new Set(['m1:prioridade', 'm5:recursos']);
    for (const mission of MISSIONS) {
      for (const [nodeId, node] of Object.entries(mission.nodes)) {
        if (node.t !== 'choice') continue;
        if (exempt.has(`${mission.id}:${nodeId}`)) continue;
        for (const choice of node.choices) {
          expect(choice.hint, `${mission.id}:${nodeId}:${choice.id}`).toBeTruthy();
          expect(choice.summary, `${mission.id}:${nodeId}:${choice.id}`).toBeTruthy();
        }
      }
    }
  });
});

describe('Missão 3 — o processo: postura, não veredito', () => {
  it('o nó "sinal" tem quatro posturas e nenhuma decide o desfecho sozinha', () => {
    const node = MISSION_MAP['m3'].nodes['sinal'];
    expect(node.t).toBe('choice');
    if (node.t !== 'choice') return;
    for (const choice of node.choices) {
      const setsFate = choice.effects?.some((e) => e.t === 'flag' && e.flag === 'fathersFate');
      expect(setsFate, choice.id).toBeFalsy();
    }
  });

  it('cada reação ao sinal registra postura, histórico e deixa o veredito em aberto', () => {
    const base = afterM1M2();
    const cases = [
      ['incidentes', 'incidentes'],
      ['comunicacao', 'comunicacao'],
      ['despoliticar', 'despoliticar'],
      ['assessoria', 'assessoria'],
    ] as const;
    for (const [choiceId, posture] of cases) {
      const s = playM3(base, ['juridica', 'direito', choiceId, 'aguardar']);
      expect(s.flags['casePosture'], choiceId).toBe(posture);
      expect(s.flags['fathersFate'], choiceId).toBeUndefined();
      expect(s.missions.m3.currentNode, choiceId).toBe('fim');
      expect(s.missions.m3.completedObjectives).toContain('o4');
      const decisions = s.decisions.filter((d) => d.mission === 'm3');
      expect(decisions.length, choiceId).toBeGreaterThanOrEqual(3);
      expect(decisions.every((d) => d.consequences.length > 0), choiceId).toBe(true);
    }
  });

  it('o caminho protocolar só aparece para linha jurídica + postura cautelosa', () => {
    const base = afterM1M2();
    const comParecer = playM3(base, ['juridica', 'direito', 'assessoria']);
    expect(visibleChoiceIds(comParecer)).toContain('requerer');

    const semBase = playM3(base, ['silencio', 'parcial', 'despoliticar']);
    expect(visibleChoiceIds(semBase)).not.toContain('requerer');
    expect(visibleChoiceIds(semBase).length).toBeGreaterThanOrEqual(2);
  });
});

describe('efeito atrasado — o desfecho judicial chega depois', () => {
  function m3Concluida(): CampaignState {
    return concludeMission(
      playM3(afterM1M2(), ['juridica', 'direito', 'incidentes', 'aguardar']),
      'm3',
    ).state;
  }

  it('não resolve antes da Missão 4 terminar ou da última semana começar', () => {
    const s = m3Concluida();
    const out = resolveJudicialFate(s);
    expect(out.state).toBe(s);
    expect(out.fate).toBeUndefined();
    expect(out.notice).toBeUndefined();
  });

  it('resolve quando a Missão 4 termina e registra aviso + histórico', () => {
    const base = m3Concluida();
    const ready: CampaignState = { ...base, completedMissions: [...base.completedMissions, 'm4'] };
    const out = resolveJudicialFate(ready);
    expect(out.fate).toBe('revisao_ganha'); // linha jurídica + resposta nos autos + cautela
    expect(out.notice).toMatch(/tribunal/i);
    expect(out.state.log[0]?.text).toMatch(/revisão/i);
    expect(out.state.flags['fathersFate']).toBe('revisao_ganha');
  });

  it('é determinística e idempotente', () => {
    const base = m3Concluida();
    const ready: CampaignState = { ...base, completedMissions: [...base.completedMissions, 'm4'] };
    const first = resolveJudicialFate(ready);
    const second = resolveJudicialFate(first.state);
    expect(second.state).toBe(first.state);
    expect(second.notice).toBeUndefined();
    const again = resolveJudicialFate(ready);
    expect(again.fate).toBe(first.fate);
    expect(again.state.log).toEqual(first.state.log);
  });

  it('nunca sobrescreve um desfecho já fixado (ex.: falha da M3)', () => {
    const base = m3Concluida();
    const fixed: CampaignState = {
      ...base,
      completedMissions: [...base.completedMissions, 'm4'],
      flags: { ...base.flags, fathersFate: 'revisao_negada' },
    };
    const out = resolveJudicialFate(fixed);
    expect(out.state).toBe(fixed);
    expect(out.fate).toBeUndefined();
  });

  it('agrega decisões: negar documentos com confiança baixa termina em revisão negada', () => {
    const base = m3Concluida();
    const state: CampaignState = {
      ...base,
      completedMissions: [...base.completedMissions, 'm4'],
      flags: { ...base.flags, casePosture: 'assessoria', docsPosition: 'negar' },
      attributes: { ...base.attributes, institutionalTrust: 45 },
      relations: { ...base.relations, amaro: 20 },
    };
    expect(resolveJudicialFate(state).fate).toBe('revisao_negada');
  });

  it('agrega decisões: postura política com confiança desmoronada termina em revisão negada', () => {
    const base = m3Concluida();
    const state: CampaignState = {
      ...base,
      completedMissions: [...base.completedMissions, 'm4'],
      flags: { ...base.flags, casePosture: 'despoliticar', docsPosition: 'parcial' },
      attributes: { ...base.attributes, institutionalTrust: 30 },
    };
    expect(resolveJudicialFate(state).fate).toBe('revisao_negada');
  });

  it('o requerimento protocolado com margem ainda vira acolhimento', () => {
    const base = m3Concluida();
    const state: CampaignState = {
      ...base,
      completedMissions: [...base.completedMissions, 'm4'],
      flags: {
        ...base.flags,
        casePosture: 'assessoria',
        docsPosition: 'direito',
        reviewRequested: true,
      },
      attributes: { ...base.attributes, institutionalTrust: 45 },
    };
    expect(resolveJudicialFate(state).fate).toBe('revisao_ganha');
  });

  it('o conjunto de decisões muda o final da campanha', () => {
    const base = fresh();
    const endingIdFor = (fate: string) =>
      ENDINGS.find((e) =>
        evalAll(e.when, { ...base, flags: { ...base.flags, electionWon: true, fathersFate: fate } }),
      )?.id;

    const solida = resolveJudicialFate({
      ...base,
      completedMissions: ['m3', 'm4'],
      flags: { casePosture: 'assessoria', docsPosition: 'direito' },
      attributes: { ...base.attributes, institutionalTrust: 50 },
      relations: { ...base.relations, amaro: 10 },
    });
    const fragil = resolveJudicialFate({
      ...base,
      completedMissions: ['m3', 'm4'],
      flags: { casePosture: 'despoliticar', docsPosition: 'negar' },
      attributes: { ...base.attributes, institutionalTrust: 30 },
    });

    expect(solida.fate).toBe('revisao_ganha');
    expect(fragil.fate).toBe('revisao_negada');
    expect(endingIdFor(solida.fate!)).toBe('vitoria_julgamento_limpo');
    expect(endingIdFor(fragil.fate!)).toBe('vitoria_processo_aberto');
  });
});

describe('nenhuma escolha executa repetidamente', () => {
  it('a segunda chamada da mesma escolha é recusada e nada muda', () => {
    let s = startMission(afterM1M2(), 'm3').state;
    s = advanceNode(s, 'm3').state; // start → relator
    s = advanceNode(s, 'm3').state; // relator → linha
    const first = chooseOption(s, 'm3', 'juridica');
    expect(first.error).toBeUndefined();
    const again = chooseOption(first.state, 'm3', 'juridica');
    expect(again.error).toMatch(/inexistente/i);
    expect(again.state).toBe(first.state);
    expect(again.state.attributes.institutionalTrust).toBe(
      first.state.attributes.institutionalTrust,
    );
  });

  it('missão concluída não pode ser reiniciada para acumular benefícios', () => {
    const s = concludeMission(
      playM3(afterM1M2(), ['juridica', 'direito', 'incidentes', 'aguardar']),
      'm3',
    ).state;
    const out = startMission(s, 'm3');
    expect(out.error).toMatch(/indisponível/i);
    expect(out.state).toBe(s);
  });

  it('escolha condicional é recusada mesmo chamada diretamente', () => {
    const emProtocolo = playM3(afterM1M2(), ['silencio', 'parcial', 'despoliticar']);
    const out = chooseOption(emProtocolo, 'm3', 'requerer');
    expect(out.error).toMatch(/requisitos/i);
    expect(out.state.flags['reviewRequested']).toBeUndefined();
  });

  it('escolha acima da verba é recusada sem descontar nada', () => {
    const emSinal = playM3(afterM1M2(), ['juridica', 'direito']);
    const broke: CampaignState = { ...emSinal, funds: 0 };
    const out = chooseOption(broke, 'm3', 'comunicacao');
    expect(out.error).toMatch(/verba insuficiente/i);
    expect(out.state).toBe(broke);
    expect(out.state.funds).toBe(0);
  });
});

describe('decisões anteriores abrem caminhos posteriores', () => {
  it('M2 → M3: só quem aceitou o PPV usa a estrutura do partido na coletiva', () => {
    const emImprensa = playM3(afterM1M2(), ['juridica']); // ppvDecision = negociar
    expect(visibleChoiceIds(emImprensa)).not.toContain('ppv_responde');
    const comAcordo: CampaignState = {
      ...emImprensa,
      flags: { ...emImprensa.flags, ppvDecision: 'aceitar' },
    };
    expect(visibleChoiceIds(comAcordo)).toContain('ppv_responde');
  });

  it('M4: publicar a origem do vídeo exige tê-la descoberto', () => {
    let s = playM3(afterM1M2(), ['juridica', 'direito', 'incidentes', 'aguardar']);
    s = concludeMission(s, 'm3').state;
    s = startMission(s, 'm4').state;
    s = advanceNode(s, 'm4').state;
    s = chooseOption(s, 'm4', 'investigar').state; // encomenda a apuração (evento na fila)
    expect(visibleChoiceIds(s, 'm4')).not.toContain('publicar_fonte');

    const achou: CampaignState = { ...s, flags: { ...s.flags, videoSourceFound: true } };
    expect(visibleChoiceIds(achou, 'm4')).toContain('publicar_fonte');
    expectOptionsInBand(achou, 'm4');
  });

  it('M3 → M5: o parecer jurídico vira preparo de debate', () => {
    const preparo = atM5Node('preparo');
    expect(visibleChoiceIds(preparo, 'm5')).not.toContain('parecer');
    const consultou: CampaignState = {
      ...preparo,
      flags: { ...preparo.flags, casePosture: 'assessoria' },
    };
    expect(visibleChoiceIds(consultou, 'm5')).toContain('parecer');
  });

  it('desfecho judicial vira escolha no comício final, com caminhos exclusivos', () => {
    const fechamento = atM5Node('fechamento');
    const bom: CampaignState = {
      ...fechamento,
      flags: { ...fechamento.flags, fathersFate: 'revisao_ganha' },
    };
    expect(visibleChoiceIds(bom, 'm5')).toContain('despacho_favoravel');
    expect(visibleChoiceIds(bom, 'm5')).not.toContain('revés_digno');

    const ruim: CampaignState = {
      ...fechamento,
      flags: { ...fechamento.flags, fathersFate: 'revisao_negada' },
    };
    expect(visibleChoiceIds(ruim, 'm5')).toContain('revés_digno');
    expect(visibleChoiceIds(ruim, 'm5')).not.toContain('despacho_favoravel');
    expectOptionsInBand(ruim, 'm5');
  });
});

/** Estado posicionado em um nó específico da Missão 5. */
function atM5Node(target: 'preparo' | 'fechamento'): CampaignState {
  const semana: CampaignState = { ...afterM4(), phase: 'finalWeek' };
  let s = startMission(unlockPass(semana), 'm5').state;
  s = advanceNode(s, 'm5').state; // → recursos
  s = chooseOption(s, 'm5', 'plc').state; // → preparo
  if (target === 'preparo') return s;
  s = chooseOption(s, 'm5', 'leitura').state; // → debate
  s = chooseOption(s, 'm5', 'defender').state; // → fechamento
  return s;
}

describe('salvamento preserva decisões e efeitos', () => {
  it('flags novas, histórico e nó atual sobrevivem ao ciclo salvar/carregar', () => {
    const emProtocolo = playM3(afterM1M2(), ['juridica', 'direito', 'comunicacao']);
    expect(emProtocolo.missions.m3.currentNode).toBe('protocolo');

    saveGame(emProtocolo);
    const loaded = loadGame();
    expect(loaded.error).toBeFalsy();
    const state = loaded.game?.state;
    expect(state).toBeTruthy();
    if (!state) return;

    expect(state.flags['casePosture']).toBe('comunicacao');
    expect(state.flags['defenseLine']).toBe('juridica');
    expect(state.flags['docsPosition']).toBe('direito');
    expect(state.flags['ppvDecision']).toBe('negociar');
    expect(state.missions.m3.currentNode).toBe('protocolo');
    expect(state.missions.m3.status).toBe('active');
    expect(state.decisions).toEqual(emProtocolo.decisions);
    expect(state.log).toEqual(emProtocolo.log);
  });

  it('um desfecho já resolvido também volta intacto do salvamento', () => {
    const base = concludeMission(
      playM3(afterM1M2(), ['juridica', 'direito', 'incidentes', 'aguardar']),
      'm3',
    ).state;
    const ready: CampaignState = { ...base, completedMissions: [...base.completedMissions, 'm4'] };
    const decided = resolveJudicialFate(ready).state;
    expect(decided.flags['fathersFate']).toBe('revisao_ganha');

    saveGame(decided);
    const loaded = loadGame();
    expect(loaded.game?.state.flags['fathersFate']).toBe('revisao_ganha');
    expect(loaded.game?.state.log).toEqual(decided.log);
  });
});
