import { useCampaign } from '@/game/state/campaignStore';
import { ENDINGS } from '@/game/data/endings';

export function GalleryScreen() {
  const meta = useCampaign((s) => s.meta);
  const setView = useCampaign((s) => s.setView);
  const hasCampaign = useCampaign((s) => s.state !== null && s.state.phase !== 'ended');

  return (
    <div className="screen">
      <div className="kicker">Galeria de finais</div>
      <h2>Os desfechos possíveis da República</h2>
      <p className="muted small">
        {meta.endings.length} de {ENDINGS.length} finais desbloqueados. Finais são combinações do
        resultado eleitoral com o desfecho do processo judicial — ganhar a eleição não resolve o
        julgamento do pai.
      </p>

      <div className="grid grid-2 mt">
        {ENDINGS.map((ending) => {
          const unlocked = meta.endings.includes(ending.id);
          return (
            <div className="card" key={ending.id}>
              <div className="row-between">
                <h3 style={{ margin: 0 }}>{unlocked ? ending.title : 'Final não revelado'}</h3>
                <span
                  className={`tag ${ending.tone === 'vitoria' ? 'green' : ending.tone === 'derrota' ? 'red' : 'gold'}`}
                >
                  {ending.tone}
                </span>
              </div>
              {unlocked ? (
                <>
                  <p className="small muted">{ending.text[0]}</p>
                  {ending.electoralSummary && <p className="tiny muted">{ending.electoralSummary}</p>}
                </>
              ) : (
                <p className="small muted">
                  Continue campanhas para revelar este desfecho. Pistas: alianças, reputação,
                  confiança institucional e o desfecho do processo.
                </p>
              )}
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
