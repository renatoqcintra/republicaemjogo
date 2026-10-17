import { useCampaign } from '@/game/state/campaignStore';
import { EVENT_MAP } from '@/game/data/events';
import { character } from '@/game/data/characters';
import { realCost } from '@/game/engine/missionEngine';
import { evalAll } from '@/game/conditions';
import { playSound } from '@/game/audio/audioManager';
import { Portrait } from './Portrait';

/**
 * Modal global de eventos inesperados: sempre que houver evento pendente na
 * fila, ele bloqueia a campanha até a escolha do jogador.
 */
export function EventModal() {
  const state = useCampaign((s) => s.state);
  const resolve = useCampaign((s) => s.resolveEventChoice);

  if (!state || state.eventQueue.length === 0) return null;
  const event = EVENT_MAP[state.eventQueue[0]];
  if (!event) return null;
  const portrait = event.portrait ? character(event.portrait) : null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={event.title}>
      <div className="modal">
        <div className="kicker">Evento inesperado</div>
        <h3>{event.title}</h3>
        {portrait && (
          <div className="dialogue" style={{ marginBottom: 10 }}>
            <Portrait spec={portrait.portrait} size="md" label={portrait.name} />
            <div className="dialogue-bubble">
              <div className="speaker-label">{portrait.name}</div>
              <p className="small">{event.text}</p>
            </div>
          </div>
        )}
        {!portrait && <p className="small">{event.text}</p>}

        <div className="choice-list">
          {event.choices.map((choice) => {
            const allowed = evalAll(choice.requires, state);
            const cost = realCost(state, choice.cost);
            const affordable = cost.funds === undefined || state.funds >= cost.funds;
            if (!allowed) return null;
            return (
              <button
                key={choice.id}
                className="choice"
                disabled={!affordable}
                onClick={() => {
                  playSound('choice');
                  resolve(choice.id);
                }}
              >
                <strong>{choice.label}</strong>
                {choice.description && <span className="desc">{choice.description}</span>}
                {cost.funds !== undefined && <div className="cost">Custo: R$ {cost.funds} mi</div>}
                {!affordable && <div className="lock">Verba insuficiente.</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
