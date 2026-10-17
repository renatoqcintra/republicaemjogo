import { useState } from 'react';
import { useCampaign } from '@/game/state/campaignStore';
import { EmptyState } from './helpers';

type ToneFilter = 'todos' | 'story' | 'good' | 'bad' | 'neutral';

export function HistoryScreen() {
  const state = useCampaign((s) => s.state)!;
  const [filter, setFilter] = useState<ToneFilter>('todos');

  const log = state.log.filter((e) => filter === 'todos' || e.tone === filter);
  const decisions = [...state.decisions].reverse();

  return (
    <div className="screen">
      <div className="kicker">Histórico</div>
      <h2>Decisões e acontecimentos</h2>

      <div className="grid grid-2 mt">
        <div className="card">
          <div className="card-title">
            <h3>Decisões importantes</h3>
            <span className="tag">{decisions.length} registro(s)</span>
          </div>
          {decisions.length === 0 && (
            <EmptyState title="Nenhuma decisão registrada" message="Suas escolhas em missões e eventos aparecem aqui." />
          )}
          {decisions.map((d) => (
            <div key={d.id} className="log-entry story">
              <strong>{d.text}</strong>
              {d.consequences.length > 0 && (
                <ul className="list tiny">
                  {d.consequences.map((c, i) => (
                    <li key={i}>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="meta">
                Dia {d.day}
                {d.missionTitle ? ` · ${d.missionTitle}` : ' · Ação livre'}
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">
            <h3>Linha do tempo</h3>
            <div className="pill-group">
              {(['todos', 'story', 'good', 'bad', 'neutral'] as ToneFilter[]).map((t) => (
                <button key={t} aria-pressed={filter === t} onClick={() => setFilter(t)}>
                  {t === 'todos' ? 'Tudo' : t === 'story' ? 'História' : t === 'good' ? 'Bom' : t === 'bad' ? 'Ruim' : 'Neutro'}
                </button>
              ))}
            </div>
          </div>
          {log.length === 0 && <p className="muted small">Nenhum acontecimento com este filtro.</p>}
          {log.map((entry) => (
            <div key={entry.id} className={`log-entry ${entry.tone}`}>
              {entry.text}
              <div className="meta">
                Dia {entry.day} · {entry.source}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
