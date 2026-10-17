import { useCampaign } from '@/game/state/campaignStore';
import { MISSIONS } from '@/game/data/missions';
import { character } from '@/game/data/characters';
import { evalAll } from '@/game/conditions';
import { playSound } from '@/game/audio/audioManager';
import { MISSION_STATUS_LABELS } from './helpers';
import { Portrait } from '../components/Portrait';

export function MissionsScreen() {
  const state = useCampaign((s) => s.state)!;
  const startMission = useCampaign((s) => s.startMission);
  const setView = useCampaign((s) => s.setView);

  return (
    <div className="screen">
      <div className="kicker">Missões</div>
      <h2>Agenda da campanha</h2>
      <p className="muted small">
        Missões conectam a narrativa ao gerenciamento: cada escolha altera atributos, alianças e o
        desfecho judicial.
      </p>

      <div className="grid grid-2 mt">
        {MISSIONS.map((mission) => {
          const progress = state.missions[mission.id];
          const status = progress.status;
          const unlockOk = evalAll(mission.unlock, state);
          return (
            <div className="card" key={mission.id}>
              <div className="row-between">
                <div className="kicker">Missão {mission.id.toUpperCase()} · Fase {mission.phase}</div>
                <span
                  className={`tag ${
                    status === 'done' ? 'green' : status === 'active' ? 'gold' : status === 'failed' ? 'red' : ''
                  }`}
                >
                  {MISSION_STATUS_LABELS[status]}
                </span>
              </div>
              <h3>{mission.title}</h3>
              <p className="small muted">{mission.tagline}</p>

              <div className="row" style={{ gap: 8 }}>
                {mission.characters.slice(0, 4).map((c) => (
                  <Portrait key={c} spec={character(c).portrait} size="sm" label={character(c).name} />
                ))}
              </div>

              <ul className="list small mt">
                {mission.objectives.map((o) => {
                  const done = progress.completedObjectives.includes(o.id);
                  return (
                    <li key={o.id}>
                      <span className={done ? 'muted' : ''}>
                        {done ? '✓ ' : '· '}
                        {o.text}
                        {o.optional && <span className="tag" style={{ marginLeft: 6 }}>opcional</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="btn-row">
                {status === 'available' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      playSound('choice');
                      startMission(mission.id);
                    }}
                  >
                    Iniciar missão
                  </button>
                )}
                {status === 'active' && (
                  <button
                    className="btn btn-gold"
                    onClick={() => {
                      playSound('click');
                      setView('missao');
                    }}
                  >
                    Continuar missão
                  </button>
                )}
                {status === 'locked' && (
                  <span className="small muted">
                    {unlockOk
                      ? 'Aguarde o desbloqueio automático.'
                      : 'Desbloqueie concluindo as missões anteriores.'}
                  </span>
                )}
                {(status === 'done' || status === 'failed') && (
                  <span className="small muted">Missão encerrada. Consulte o histórico.</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
