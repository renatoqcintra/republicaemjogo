import { describe, expect, it } from 'vitest';
import {
  advanceNode,
  canAfford,
  chooseOption,
  concludeMission,
  realCost,
  startMission,
} from '@/game/engine/missionEngine';
import { evalAll } from '@/game/conditions';
import { MISSION_MAP } from '@/game/data/missions';
import { createCampaignState } from '@/game/state/initialState';
import type { CampaignState } from '@/game/types';

function fresh(): CampaignState {
  return createCampaignState({ seed: 42, difficulty: 'normal' });
}

/** Executa a missão 1 inteira pelo caminho "legado" + região SLE. */
function playMission1(state: CampaignState): CampaignState {
  let s = startMission(state, 'm1').state; // nó "start" (diálogo)
  s = advanceNode(s, 'm1').state; // → "plenario" (escolha)
  s = chooseOption(s, 'm1', 'legado').state; // → "dulcinea" (diálogo)
  s = advanceNode(s, 'm1').state; // → "prioridade" (escolha)
  s = chooseOption(s, 'm1', 'sle').state; // → "reflexao" (diálogo)
  s = advanceNode(s, 'm1').state; // → "fim" (end)
  return concludeMission(s, 'm1').state;
}

describe('custos e limites', () => {
  it('multiplica custos pela dificuldade', () => {
    const facil = createCampaignState({ seed: 1, difficulty: 'facil' });
    const dificil = createCampaignState({ seed: 1, difficulty: 'dificil' });
    expect(realCost(facil, { funds: 10 }).funds).toBe(8);
    expect(realCost(dificil, { funds: 10 }).funds).toBe(13);
  });

  it('recusa escolha com verba insuficiente', () => {
    let s = startMission(fresh(), 'm1').state;
    s = advanceNode(s, 'm1').state;
    s = { ...s, funds: 0 };
    const outcome = chooseOption(s, 'm1', 'legado');
    expect(outcome.error).toBeUndefined(); // essa escolha não custa verba
    expect(canAfford({ ...s, funds: 0 }, { funds: 10 })).toBe(false);
    expect(canAfford({ ...s, funds: 50 }, { funds: 10 })).toBe(true);
  });

  it('rejeita escolha que não existe', () => {
    let s = startMission(fresh(), 'm1').state;
    s = advanceNode(s, 'm1').state;
    const outcome = chooseOption(s, 'm1', 'inexistente');
    expect(outcome.error).toMatch(/inexistente/i);
  });

  it('impede avançar diálogo em nó de escolha', () => {
    let s = startMission(fresh(), 'm1').state;
    s = advanceNode(s, 'm1').state;
    const outcome = advanceNode(s, 'm1');
    expect(outcome.error).toBeTruthy();
  });
});

describe('fluxo entre missões', () => {
  it('missão 1 inicia disponível e conclui desbloqueando a 2', () => {
    const start = fresh();
    expect(start.missions.m1.status).toBe('available');
    const end = playMission1(start);
    expect(end.completedMissions).toContain('m1');
    expect(end.missions.m1.status).toBe('done');
    expect(end.missions.m2.status).toBe('available');
  });

  it('aplica consequências das escolhas no estado', () => {
    const end = playMission1(fresh());
    expect(end.flags['initialStrategy']).toBe('legado');
    expect(end.flags['priorityRegion']).toBe('sle');
    expect(end.regions.sle.player).toBeGreaterThan(31);
    expect(end.attributes.popularity).toBeGreaterThan(38);
  });

  it('registra decisão no histórico com missão e dia', () => {
    const end = playMission1(fresh());
    const decision = end.decisions.find((d) => d.mission === 'm1');
    expect(decision).toBeDefined();
    expect(decision?.text).toContain('sobrenome');
  });

  it('objetivos marcados conforme as escolhas', () => {
    const end = playMission1(fresh());
    const progress = end.missions.m1;
    expect(progress.completedObjectives).toContain('o1');
    expect(progress.completedObjectives).toContain('o2');
  });

  it('cadeia completa: m1 → m2 → m3 → m4 → m5', () => {
    let s = playMission1(fresh());

    // Missão 2: negocia com o PPV
    s = startMission(s, 'm2').state; // "start"
    s = advanceNode(s, 'm2').state; // → "mesa"
    s = chooseOption(s, 'm2', 'negociar').state; // → "vazamento"
    s = chooseOption(s, 'm2', 'confirmar').state; // → "fim"
    s = concludeMission(s, 'm2').state;
    expect(s.completedMissions).toContain('m2');
    expect(s.missions.m3.status).toBe('available');

    // Missão 3: linha jurídica + postura cautelosa diante do sinal
    s = startMission(s, 'm3').state; // "start"
    s = advanceNode(s, 'm3').state; // → "relator"
    s = advanceNode(s, 'm3').state; // → "camurca"
    s = advanceNode(s, 'm3').state; // → "linha"
    s = chooseOption(s, 'm3', 'juridica').state; // → "imprensa"
    s = chooseOption(s, 'm3', 'direito').state; // → "sinal"
    s = chooseOption(s, 'm3', 'incidentes').state; // → "protocolo"
    s = chooseOption(s, 'm3', 'aguardar').state; // → "fim"
    s = concludeMission(s, 'm3').state;
    // A postura foi registrada, mas o veredito NÃO é decidido por esta escolha:
    expect(s.flags['casePosture']).toBe('incidentes');
    expect(s.flags['fathersFate']).toBeUndefined();
    expect(s.missions.m4.status).toBe('available');

    // Missão 4: investiga e publica auditoria
    s = startMission(s, 'm4').state; // "start"
    s = advanceNode(s, 'm4').state; // → "zorana"
    s = advanceNode(s, 'm4').state; // → "dante"
    s = advanceNode(s, 'm4').state; // → "reacao"
    s = chooseOption(s, 'm4', 'investigar').state; // → "origem"
    s = chooseOption(s, 'm4', 'auditoria').state; // → "fim"
    s = concludeMission(s, 'm4').state;
    expect(s.completedMissions).toContain('m4');
    // Efeito atrasado: concluir a Missão 4 revela o desfecho judicial.
    expect(s.flags['fathersFate']).toBe('revisao_ganha');
  });

  it('missão 5 só desbloqueia na última semana e após a missão 4', () => {
    const s = playMission1(fresh());
    expect(s.missions.m5.status).toBe('locked');
    const finalWeek: CampaignState = { ...s, phase: 'finalWeek' };
    // Última semana, mas m4 pendente: continua bloqueada.
    expect(evalAll(MISSION_MAP['m5'].unlock, finalWeek)).toBe(false);
    // Concluindo (ou falhando) m4, a missão final libera.
    const withDone: CampaignState = { ...finalWeek, completedMissions: [...s.completedMissions, 'm4'] };
    expect(evalAll(MISSION_MAP['m5'].unlock, withDone)).toBe(true);
    const withFailed: CampaignState = { ...finalWeek, failedMissions: ['m4'] };
    expect(evalAll(MISSION_MAP['m5'].unlock, withFailed)).toBe(true);
    expect(evalAll(MISSION_MAP['m5'].unlock, fresh())).toBe(false);
  });

  it('escolha com requisito não atendido é recusada', () => {
    let s = startMission(fresh(), 'm1').state;
    s = advanceNode(s, 'm1').state;
    const outcome = chooseOption(s, 'm1', 'tecnica'); // inexistente no nó atual
    expect(outcome.error).toBeTruthy();
  });
});

describe('falha de missão', () => {
  it('missão 3 falha se confiança institucional desmoronar', () => {
    let s = playMission1(fresh());
    s = startMission(s, 'm2').state;
    s = advanceNode(s, 'm2').state; // start → mesa
    s = chooseOption(s, 'm2', 'negociar').state;
    s = chooseOption(s, 'm2', 'confirmar').state;
    s = concludeMission(s, 'm2').state;
    s = { ...s, attributes: { ...s.attributes, institutionalTrust: 10 } };
    let started = startMission(s, 'm3');
    started = { ...started, state: advanceNode(started.state, 'm3').state };
    started = { ...started, state: advanceNode(started.state, 'm3').state };
    started = { ...started, state: advanceNode(started.state, 'm3').state };
    expect(started.state.failedMissions).toContain('m3');
    // Falha não bloqueia progressão: a missão 4 continua acessível via conclusões anteriores.
    expect(started.state.flags['fathersFate']).toBe('revisao_negada');
  });
});
