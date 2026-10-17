import { useCampaign } from '@/game/state/campaignStore';
import { GAME_FICTION_NOTICE, GAME_SUBTITLE, GAME_TITLE } from '@/game/constants';
import { playSound } from '@/game/audio/audioManager';

export function MainMenuScreen() {
  const setView = useCampaign((s) => s.setView);
  const continueGame = useCampaign((s) => s.continueGame);
  const saveAvailable = useCampaign((s) => s.saveAvailable);

  return (
    <div className="screen hero">
      <h1>{GAME_TITLE}</h1>
      <div className="tagline">{GAME_SUBTITLE}</div>

      <div className="hero-menu">
        <button
          className="btn btn-primary"
          onClick={() => {
            playSound('click');
            setView('novaCampanha');
          }}
        >
          Nova campanha
        </button>
        <button
          className="btn"
          disabled={!saveAvailable}
          onClick={() => {
            playSound('click');
            continueGame();
          }}
        >
          Continuar campanha
        </button>
        <button className="btn" onClick={() => setView('galeria')}>
          Galeria de finais
        </button>
        <button className="btn" onClick={() => setView('conquistas')}>
          Conquistas
        </button>
        <button className="btn" onClick={() => setView('config')}>
          Configurações
        </button>
        <button className="btn btn-ghost" onClick={() => setView('creditos')}>
          Créditos
        </button>
      </div>

      {!saveAvailable && (
        <p className="small muted" style={{ marginTop: 14 }}>
          Nenhuma campanha salva neste dispositivo.
        </p>
      )}

      <p className="legal-note">
        {GAME_FICTION_NOTICE} Esta é uma simulação de estratégia política para entretenimento. O progresso
        fica salvo apenas neste navegador ou dispositivo — não há sincronização em nuvem.
      </p>
    </div>
  );
}
