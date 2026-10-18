import { useState } from 'react';
import { useCampaign } from '@/game/state/campaignStore';
import { STRATEGIC_ACTIONS } from '@/game/data/actions';
import { regionDef } from '@/game/data/regions';
import { realCost } from '@/game/engine/missionEngine';
import { evalAll } from '@/game/conditions';
import { formatMoney } from '@/game/rules/numbers';
import { playSound } from '@/game/audio/audioManager';
import { ConfirmDialog } from '../components/Modal';
import type { StrategicActionDef } from '@/game/types';

const CATEGORIES: { id: StrategicActionDef['category']; label: string }[] = [
  { id: 'campanha', label: 'Campanha' },
  { id: 'financas', label: 'Finanças' },
  { id: 'aliancas', label: 'Alianças' },
  { id: 'institucional', label: 'Institucional' },
  { id: 'debate', label: 'Debate' },
];

export function FinanceScreen() {
  const state = useCampaign((s) => s.state)!;
  const performAction = useCampaign((s) => s.performAction);
  const selectedRegion = useCampaign((s) => s.selectedRegion);
  const setView = useCampaign((s) => s.setView);
  const [filter, setFilter] = useState<StrategicActionDef['category'] | 'todas'>('todas');
  const [pending, setPending] = useState<StrategicActionDef | null>(null);

  const list = STRATEGIC_ACTIONS.filter((a) => filter === 'todas' || a.category === filter);

  const execute = (action: StrategicActionDef) => {
    playSound('choice');
    performAction(action.id);
    setPending(null);
  };

  return (
    <div className="screen">
      <div className="kicker">Gerenciamento</div>
      <h2>Ações estratégicas e finanças</h2>
      <div className="row-between mt">
        <div className="row">
          <span className="topbar-chip">
            Caixa <strong>{formatMoney(state.funds)}</strong>
          </span>
          <span className="topbar-chip">
            Dia <strong>{state.day}/56</strong>
          </span>
          <span className="topbar-chip">
            Alvo <strong>{regionDef(selectedRegion).name}</strong>
          </span>
        </div>
        <button className="btn btn-ghost" onClick={() => setView('mapa')}>
          Trocar região alvo
        </button>
      </div>

      <div className="row mt">
        <div className="pill-group">
          <button aria-pressed={filter === 'todas'} onClick={() => setFilter('todas')}>
            Todas
          </button>
          {CATEGORIES.map((c) => (
            <button key={c.id} aria-pressed={filter === c.id} onClick={() => setFilter(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-2 mt">
        {list.map((action) => {
          const cost = realCost(state, action.cost);
          const allowed = evalAll(action.requires, state);
          const affordable = cost.funds === undefined || state.funds >= cost.funds;
          return (
            <div className="card" key={action.id}>
              <div className="row-between">
                <h3 style={{ margin: 0 }}>{action.name}</h3>
                <span className="tag">{action.category}</span>
              </div>
              <p className="small muted">{action.description}</p>
              <ul className="list tiny">
                {action.preview.map((p, i) => (
                  <li key={i}>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <div className="row-between mt">
                <span className="small">
                  <strong>{cost.funds !== undefined ? formatMoney(cost.funds) : 'sem custo'}</strong>
                  {cost.days ? ` · ${cost.days} dia(s)` : ''}
                  {action.requiresRegion ? ` · alvo: ${regionDef(selectedRegion).name}` : ''}
                </span>
                <button
                  className={`btn ${affordable && allowed ? 'btn-primary' : ''}`}
                  disabled={!affordable || !allowed || state.phase === 'ended' || state.day >= 56}
                  onClick={() => {
                    if ((cost.funds ?? 0) >= 15) setPending(action);
                    else execute(action);
                  }}
                >
                  Executar
                </button>
              </div>
              {!allowed && <p className="tiny mt">Requisito: atributos insuficientes para esta ação.</p>}
              {!affordable && allowed && (
                <p className="tiny mt" style={{ color: 'var(--red-2)' }}>
                  Verba insuficiente. Ações de arrecadação podem ajudar.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {pending && (
        <ConfirmDialog
          title={`Confirmar: ${pending.name}`}
          message={`Esta ação custa ${formatMoney(realCost(state, pending.cost).funds ?? 0)}${
            pending.cost.days ? ` e ${pending.cost.days} dia(s)` : ''
          }. Confirma a execução?`}
          confirmLabel="Executar ação"
          onConfirm={() => execute(pending)}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}
