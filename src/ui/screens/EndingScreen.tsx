import { useCampaign } from '@/game/state/campaignStore';
import { ENDING_MAP } from '@/game/data/endings';
import { GAME_FICTION_NOTICE } from '@/game/constants';
import { playSound } from '@/game/audio/audioManager';
import { EmptyState } from './helpers';

export function EndingScreen() {
  const state = useCampaign((s) => s.state)!;
  const meta = useCampaign((s) => s.meta);
  const setView = useCampaign((s) => s.setView);
  const newGame = useCampaign((s) => s.newGame);
  const restartSameSeed = useCampaign((s) => s.restartSameSeed);

  if (!state.ending) {
    return (
      <div className="screen">
        <EmptyState
          title="Campanha em andamento"
          message="Esta tela aparece quando a campanha termina."
          action={
            <button className="btn btn-primary" onClick={() => setView('painel')}>
              Voltar ao painel
            </button>
          }
        />
      </div>
    );
  }

  const ending = ENDING_MAP[state.ending];

  return (
    <div className="screen">
      <div className="result-hero">
        <div className="kicker">Fim de campanha</div>
        <h2 style={{ fontSize: '2rem' }}>{ending.title}</h2>
        <span className={`tag ${ending.tone === 'vitoria' ? 'green' : ending.tone === 'derrota' ? 'red' : 'gold'}`}>
          {ending.tone === 'vitoria' ? 'Vitória' : ending.tone === 'derrota' ? 'Derrota' : 'Desfecho alternativo'}
        </span>
        {ending.electoralSummary && <p className="small muted mt">{ending.electoralSummary}</p>}
      </div>

      <div className="card">
        {ending.text.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
        <p className="tiny muted mt">{GAME_FICTION_NOTICE}</p>
      </div>

      <div className="card">
        <h3>Resumo da campanha</h3>
        <ul className="list small">
          <li>
            <span className="muted">Dificuldade</span>
            <strong>{state.difficulty}</strong>
          </li>
          <li>
            <span className="muted">Dias jogados</span>
            <strong>{state.day} de 84</strong>
          </li>
          <li>
            <span className="muted">Missões concluídas</span>
            <strong>{state.completedMissions.length} de 5</strong>
          </li>
          <li>
            <span className="muted">Decisões registradas</span>
            <strong>{state.decisions.length}</strong>
          </li>
          <li>
            <span className="muted">Finais desbloqueados</span>
            <strong>{meta.endings.length} de {Object.keys(ENDING_MAP).length}</strong>
          </li>
        </ul>
      </div>

      <div className="btn-row">
        <button
          className="btn btn-primary"
          onClick={() => {
            playSound('click');
            newGame(state.difficulty);
          }}
        >
          Nova campanha
        </button>
        <button
          className="btn"
          onClick={() => {
            playSound('click');
            restartSameSeed();
          }}
        >
          Jogar de novo com a mesma semente
        </button>
        <button className="btn" onClick={() => setView('galeria')}>
          Galeria de finais
        </button>
        <button className="btn btn-ghost" onClick={() => setView('menu')}>
          Menu principal
        </button>
      </div>
    </div>
  );
}
