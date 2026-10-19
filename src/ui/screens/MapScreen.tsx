import { useCampaign } from '@/game/state/campaignStore';
import { REGIONS, regionDef } from '@/game/data/regions';
import { ISSUES } from '@/game/types';
import { RegionMap } from '../components/RegionMap';
import { Meter } from '../components/Meter';

const ISSUE_LABELS: Record<string, string> = {
  economia: 'Economia',
  trabalho: 'Trabalho',
  seguranca: 'Segurança',
  saude: 'Saúde',
  educacao: 'Educação',
  ambiente: 'Ambiente',
  justica: 'Justiça',
  infraestrutura: 'Infraestrutura',
};

export function MapScreen() {
  const state = useCampaign((s) => s.state)!;
  const selected = useCampaign((s) => s.selectedRegion);
  const setSelected = useCampaign((s) => s.setSelectedRegion);
  const def = regionDef(selected);
  const rs = state.regions[selected];

  return (
    <div className="screen">
      <div className="kicker">Mapa eleitoral</div>
      <h2>As cinco regiões da República</h2>
      <p className="muted small">
        Cores indicam equilíbrio: verde para você, vermelho para o adversário. Selecione uma região
        para planejar investimentos e comparar prioridades.
      </p>

      <div className="grid grid-map mt">
        <div>
          <RegionMap state={state} selected={selected} onSelect={setSelected} />
          <div className="row mt small muted">
            <span className="tag green">Verde: seu apoio</span>
            <span className="tag red">Vermelho: adversário</span>
            <span className="tag">Clique para selecionar</span>
          </div>

          <div className="table-wrap mt">
            <table className="table">
              <thead>
                <tr>
                  <th>Região</th>
                  <th className="num">Peso</th>
                  <th className="num">Você</th>
                  <th className="num">Adversário</th>
                  <th className="num">Indecisos</th>
                  <th className="num">Investido</th>
                </tr>
              </thead>
              <tbody>
                {REGIONS.map((r) => {
                  const s = state.regions[r.id];
                  return (
                    <tr key={r.id} onClick={() => setSelected(r.id)} style={{ cursor: 'pointer' }}>
                      <td>
                        <strong>{r.name}</strong> <span className="tiny muted">{r.code}</span>
                      </td>
                      <td className="num">{r.weight}%</td>
                      <td className="num">{Math.round(s.player)}%</td>
                      <td className="num">{Math.round(s.opponent)}%</td>
                      <td className="num">{Math.round(s.undecided)}%</td>
                      <td className="num">{s.investment}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="kicker">{def.code}</div>
            <h3>{def.name}</h3>
            <p className="small muted">{def.profile}</p>
            <Meter label="Seu apoio" value={rs.player} variant="green" />
            <Meter label="Adversário" value={rs.opponent} variant="red" />
            <Meter label="Indecisos" value={rs.undecided} variant="gold" />
            <p className="tiny muted">Eleitorado fictício: {def.voters.toLocaleString('pt-BR')} votos</p>
          </div>

          <div className="card">
            <h3>Prioridades do eleitorado</h3>
            <ul className="list">
              {def.priorities.map((issue, i) => (
                <li key={issue}>
                  <span>
                    {ISSUE_LABELS[issue] ?? issue}
                    {i === 0 && <span className="tag gold" style={{ marginLeft: 8 }}>principal</span>}
                  </span>
                  <span className="muted small">peso {3 - i}/3</span>
                </li>
              ))}
            </ul>
            <p className="tiny muted mt">
              Ações alinhadas às prioridades rendem mais voto. Retornos caem se a região já foi muito
              investida.
            </p>
          </div>

          <div className="card">
            <h3>Alianças locais</h3>
            <Meter label="Alianças favoráveis a você" value={def.playerAlliance} variant="blue" />
            <Meter label="Alianças do adversário" value={def.opponentAlliance} variant="red" />
            <p className="tiny muted">
              Sensibilidade a escândalos desta região: {def.volatility.toFixed(1)}× (quanto maior, mais
              ela reage a boas e más notícias).
            </p>
          </div>
        </div>
      </div>

      <p className="legal-note">
        Simulação fictícia. As regiões, pesos e percentuais não correspondem a nenhuma eleição real.
        Pergunta da noite do debate: {ISSUES.length} pautas monitoradas pelo jogo.
      </p>
    </div>
  );
}
