import { describe, expect, it } from 'vitest';
import { eligibleEvents, nextPendingEvent, queueEvent, resolveEvent, rollDailyEvents } from '@/game/events/eventSystem';
import { createCampaignState } from '@/game/state/initialState';
import { EVENTS, EVENT_MAP } from '@/game/data/events';
import type { CampaignState } from '@/game/types';

function fresh(day = 1): CampaignState {
  const base = createCampaignState({ seed: 77, difficulty: 'normal' });
  return { ...base, day, phase: 'campaign' };
}

describe('eventos inesperados', () => {
  it('todo evento tem escolhas e condições', () => {
    for (const event of EVENTS) {
      expect(event.choices.length).toBeGreaterThan(0);
      expect(event.when.length).toBeGreaterThan(0);
      expect(event.text.length).toBeGreaterThan(20);
    }
  });

  it('só eventos elegíveis entram na fila', () => {
    const early = fresh(1);
    const eligible = eligibleEvents(early);
    expect(eligible.every((e) => !e.when.some((c) => c.t === 'daysGte' && c.value > 1))).toBe(true);
  });

  it('fila é disciplinada: resolver remove o evento e impede repetição', () => {
    let s = queueEvent(fresh(30), 'documento_contradiz');
    expect(nextPendingEvent(s)?.id).toBe('documento_contradiz');
    const outcome = resolveEvent(s, 'documento_contradiz', 'reconhecer');
    expect(outcome.error).toBeUndefined();
    expect(outcome.state.eventQueue).toHaveLength(0);
    expect(outcome.state.firedEvents).toContain('documento_contradiz');
    expect(outcome.state.attributes.reputation).toBeGreaterThan(s.attributes.reputation);
  });

  it('recusa escolha indisponível ou evento já resolvido', () => {
    const s = queueEvent(fresh(30), 'documento_contradiz');
    const wrong = resolveEvent(s, 'documento_contradiz', 'nao_existe');
    expect(wrong.error).toBeTruthy();
    const resolved = resolveEvent(s, 'documento_contradiz', 'reconhecer').state;
    const again = resolveEvent(resolved, 'documento_contradiz', 'reconhecer');
    expect(again.error).toBeTruthy();
  });

  it('verifica custo de verba antes de resolver', () => {
    let s = queueEvent(fresh(30), 'empresario_sai');
    s = { ...s, funds: 0 };
    const outcome = resolveEvent(s, 'empresario_sai', 'renegociar');
    expect(outcome.error).toMatch(/Verba insuficiente/i);
  });

  it('sorteio diário é determinístico pela semente', () => {
    const a = rollDailyEvents(fresh(20));
    const b = rollDailyEvents(fresh(20));
    expect(a.eventQueue).toEqual(b.eventQueue);
  });

  it('escolhas produzem consequências distintas', () => {
    const s = queueEvent(fresh(30), 'documento_contradiz');
    const deny = resolveEvent(s, 'documento_contradiz', 'negar').state;
    const admit = resolveEvent(s, 'documento_contradiz', 'reconhecer').state;
    expect(deny.attributes.reputation).toBeLessThan(admit.attributes.reputation);
  });

  it('evento definido inexistente é tratado', () => {
    expect(resolveEvent(fresh(), 'nao_existe' as never, 'x').error).toBeTruthy();
    expect(EVENT_MAP['aliado_vira']).toBeDefined();
  });
});
