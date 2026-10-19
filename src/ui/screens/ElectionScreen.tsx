import { useCampaign } from '@/game/state/campaignStore';
import { ENDING_MAP } from '@/game/data/endings';
import { formatMoney } from '@/game/rules/numbers';
import { playSound } from '@/game/audio/audioManager';
import { EmptyState } from './helpers';

export function ElectionScreen() {
  const state = useCampaign((s) => s.state)!;
  const setView = useCampaign((s) => s.setView);
  const result = state.electionResult;

  if (!result) {
    return (
      <div className="screen">
        <EmptyState
          title="Ainda não há apuração"
          message="A apuração é calculada ao final da campanha — na última semana ou quando você decidir encerrar."
          action={
            <button className="btn btn-primary" onClick={() => setView('painel')}>
              Voltar ao painel
            </button>
          }
        />
      </div>
    );
  }

  const ending = state.ending ? ENDING_MAP[state.ending] : null;

  return (
    <div className="screen">
      <div className="kicker">Apuração eleitoral simulada</div>
      <div className="result-hero">
        <div className="small muted">Resultado nacional (simulação fictícia)</div>
        <div className="big">
          {result.playerPct.toFixed(1)}% × {result.opponentPct.toFixed(1)}%
        </div>
        <div>
          {result.winner === 'player' ? (
            <span className="tag green">Fábio Barreto vence a simulação</span>
          ) : result.winner === 'opponent' ? (
            <span className="tag red">Leandro Lacerda vence a simulação</span>
          ) : (
            <span className="tag gold">Impasse: apuração complementar</span>
          )}
        </div>
        <div className="bar-compare" aria-hidden>
          <div className="p" style={{ width: `${result.playerPct}%` }}>
            {result.playerPct.toFixed(1)}%
          </div>
          <div className="o" style={{ width: `${result.opponentPct}%` }}>
            {result.opponentPct.toFixed(1)}%
          </div>
        </div>
        <div className="tiny muted">
          Participação simulada: {(result.participation * 100).toFixed(1)}% · Votos fictícios:{' '}
          {result.totalVotes.toLocaleString('pt-BR')}
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3>Resultado por região</h3>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Região</th>
                  <th className="num">Você</th>
                  <th className="num">Adversário</th>
                  <th className="num">Part.</th>
                </tr>
              </thead>
              <tbody>
                {result.regions.map((r) => (
                  <tr key={r.region}>
                    <td>
                      <strong>{r.name}</strong>
                      <div className="tiny muted">peso {r.weight}%</div>
                    </td>
                    <td className="num">{r.playerPct.toFixed(1)}%</td>
                    <td className="num">{r.opponentPct.toFixed(1)}%</td>
                    <td className="num">{(r.turnout * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>Fatores que mais influenciaram</h3>
          <ul className="list">
            {result.topFactors.map((f, i) => (
              <li key={i}>
                <span>{f.label}</span>
                <strong style={{ color: f.delta >= 0 ? 'var(--green-3)' : 'var(--red-2)' }}>
                  {f.delta > 0 ? '+' : ''}
                  {f.delta}
                </strong>
              </li>
            ))}
          </ul>
          <p className="tiny muted mt">
            Valores agregados em pontos percentuais ponderados pelo peso regional.
          </p>

          <h3 className="mt">Detalhe da região selecionada</h3>
          <RegionDetail />
        </div>
      </div>

      <div className="card">
        <h3>Fechamento da campanha</h3>
        <ul className="list small">
          <li>
            <span className="muted">Verba final em caixa</span>
            <strong>{formatMoney(state.funds)}</strong>
          </li>
          <li>
            <span className="muted">Missões concluídas</span>
            <strong>{state.completedMissions.length} de 5</strong>
          </li>
          <li>
            <span className="muted">Desfecho judicial do pai</span>
            <strong>
              {state.flags['fathersFate'] === 'revisao_ganha'
                ? 'Revisão acolhida'
                : state.flags['fathersFate'] === 'revisao_negada'
                  ? 'Revisão negada'
                  : 'Indefinido'}
            </strong>
          </li>
        </ul>
        <p className="tiny muted mt">{result.disclaimer}</p>
        <div className="btn-row">
          <button
            className="btn btn-gold"
            onClick={() => {
              playSound('ending');
              setView('fim');
            }}
          >
            Ver desfecho da campanha
          </button>
          <button className="btn" onClick={() => setView('galeria')}>
            Galeria de finais
          </button>
        </div>
      </div>

      {ending && (
        <p className="tiny muted mt">
          Final atribuído: <strong>{ending.title}</strong>.
        </p>
      )}
    </div>
  );
}

function RegionDetail() {
  const state = useCampaign((s) => s.state)!;
  const selectedRegion = useCampaign((s) => s.selectedRegion);
  const result = state.electionResult;
  const region = selectedRegion;
  if (!result) return null;
  const detail = result.regions.find((r) => r.region === region);
  if (!detail) return null;
  return (
    <div>
      <p className="small">
        <strong>{detail.name}</strong> — você {detail.playerPct.toFixed(1)}%, adversário{' '}
        {detail.opponentPct.toFixed(1)}%.
      </p>
      <ul className="list tiny">
        {detail.factors.slice(0, 4).map((f, i) => (
          <li key={i}>
            <span>{f.label}</span>
            <strong>{f.delta > 0 ? '+' : ''}{f.delta}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
