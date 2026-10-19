import { useCampaign } from '@/game/state/campaignStore';
import { CHARACTERS } from '@/game/data/characters';
import { mnrOrganization, mnrPosition } from '@/game/data/mnr';
import { FACTION_LABELS } from './helpers';
import { Meter } from '../components/Meter';
import { formatMoney } from '@/game/rules/numbers';
import { realCost } from '@/game/engine/missionEngine';
import { evalAll } from '@/game/conditions';
import { playSound } from '@/game/audio/audioManager';

export function AlliancesScreen() {
  const state = useCampaign((s) => s.state)!;
  const performAction = useCampaign((s) => s.performAction);
  const setView = useCampaign((s) => s.setView);

  const pacto = realCost(state, { funds: 10, days: 1 });
  const pactoAllowed = evalAll([{ t: 'relationGte', who: 'sandoval', value: 20 }], state);
  const pactoAffordable = state.funds >= (pacto.funds ?? 0);

  return (
    <div className="screen">
      <div className="kicker">Alianças e negociações</div>
      <h2>Quem sustenta a sua campanha</h2>

      <div className="grid grid-2 mt">
        <div className="card">
          <h3>Facções</h3>
          {Object.entries<number>(state.factions).map(([faction, value]) => (
            <Meter
              key={faction}
              label={FACTION_LABELS[faction] ?? faction}
              value={value}
              variant={value >= 60 ? 'green' : value >= 40 ? 'gold' : 'red'}
              hint={
                faction === 'movimentos'
                  ? 'Disposição dos movimentos sociais à sua campanha (0–100). Organizações independentes como o MNR decidem por conta própria — a posição oficial do MNR está no cartão abaixo.'
                  : 'Apoio da facção à sua candidatura (0–100).'
              }
            />
          ))}
          <p className="tiny muted mt">
            Facções com apoio baixo podem desertar em eventos. Ajudas de campanha da praça custam
            reputação, não só dinheiro.
          </p>
        </div>

        <div className="card">
          <h3>Relações pessoais</h3>
          <ul className="list">
            {CHARACTERS.filter((c) => c.id !== 'rafael').map((c) => {
              const rel = state.relations[c.id] ?? 0;
              return (
                <li key={c.id}>
                  <button className="btn btn-ghost" onClick={() => setView('personagens')}>
                    {c.name}
                  </button>
                  <span
                    className="small"
                    style={{ color: rel >= 40 ? 'var(--green-3)' : rel <= -15 ? 'var(--red-2)' : 'var(--muted)' }}
                  >
                    {rel > 0 ? '+' : ''}
                    {rel}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="tiny muted mt">
            Relação pessoal mede histórico e afeto entre pessoas — não é apoio eleitoral nem aliança
            política.
          </p>
        </div>
      </div>

      <div className="card">
        <h3>Movimento Nacional de Renovação (MNR)</h3>
        <ul className="list">
          <li>
            <span className="muted">Posição do MNR</span>
            <strong>{mnrPosition(state.flags)}</strong>
          </li>
          <li>
            <span className="muted">Organização do movimento</span>
            <strong>{mnrOrganization(state.flags)}</strong>
          </li>
          <li>
            <span className="muted">Relação pessoal com Rafael Sampaio</span>
            <strong>
              {(state.relations['bento'] ?? 0) > 0 ? '+' : ''}
              {state.relations['bento'] ?? 0}
            </strong>
          </li>
        </ul>
        <p className="tiny muted mt">
          O MNR começa a campanha independente, sem apoio a nenhum candidato. Conversa, acordo de
          pauta ou boa relação pessoal não viram apoio eleitoral: só uma decisão pública do movimento
          muda essa posição.
        </p>
      </div>

      <div className="card">
        <h3>Mesa de negociação</h3>
        <p className="small muted">
          Pactos com lideranças regionais do Partido Popular do Vale movem voto na região alvo — e
          incomodam sua própria bancada.
        </p>
        <div className="row-between">
          <span className="small">
            <strong>{formatMoney(pacto.funds ?? 0)}</strong> · 1 dia · alvo regional
          </span>
          <button
            className="btn btn-primary"
            disabled={!pactoAllowed || !pactoAffordable || state.phase === 'ended'}
            onClick={() => {
              playSound('choice');
              performAction('pacto_local');
            }}
          >
            Firmar pacto local
          </button>
        </div>
        {!pactoAllowed && (
          <p className="tiny mt">
            Requisito: relação com Valdemar Costa ≥ 20. Missões e eventos podem melhorar essa relação.
          </p>
        )}
        {!pactoAffordable && pactoAllowed && (
          <p className="tiny mt" style={{ color: 'var(--red-2)' }}>
            Verba insuficiente.
          </p>
        )}
      </div>
    </div>
  );
}
