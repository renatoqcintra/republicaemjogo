import { useCampaign } from '@/game/state/campaignStore';
import { ACHIEVEMENTS } from '@/game/data/achievements';

export function AchievementsScreen() {
  const meta = useCampaign((s) => s.meta);
  const setView = useCampaign((s) => s.setView);
  const hasCampaign = useCampaign((s) => s.state !== null && s.state.phase !== 'ended');

  return (
    <div className="screen">
      <div className="kicker">Conquistas</div>
      <h2>Marcos da campanha</h2>
      <p className="muted small">
        {meta.achievements.length} de {ACHIEVEMENTS.length} conquistas desbloqueadas. Conquistas são
        salvas permanentemente neste dispositivo, mesmo quando você inicia outra campanha.
      </p>

      <div className="grid grid-2 mt">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = meta.achievements.includes(a.id);
          return (
            <div className="card" key={a.id}>
              <div className="row-between">
                <h3 style={{ margin: 0 }}>{unlocked ? a.name : 'Conquista oculta'}</h3>
                <span className={`tag ${unlocked ? 'gold' : ''}`}>{unlocked ? 'desbloqueada' : 'bloqueada'}</span>
              </div>
              <p className="small muted">{a.description}</p>
            </div>
          );
        })}
      </div>

      <div className="btn-row">
        <button className="btn" onClick={() => setView(hasCampaign ? 'painel' : 'menu')}>
          {hasCampaign ? 'Voltar ao painel' : 'Voltar ao menu'}
        </button>
      </div>
    </div>
  );
}
