import { useCampaign, activeMissionId, nextRecommendedMission } from '@/game/state/campaignStore';
import { CAMPAIGN_DAYS, FINAL_WEEK_START, DIFFICULTY } from '@/game/constants';
import { ATTRIBUTES } from '@/game/types';
import { missionDef } from '@/game/engine/missionEngine';
import { nextPendingEvent } from '@/game/events/eventSystem';
import { REGIONS, regionDef } from '@/game/data/regions';
import { formatMoney } from '@/game/rules/numbers';
import { playSound } from '@/game/audio/audioManager';
import { Meter } from '../components/Meter';
import { ATTR_HINTS, ATTR_LABELS } from './helpers';
import { ConfirmDialog } from '../components/Modal';
import { useState } from 'react';

export function PanelScreen() {
  const state = useCampaign((s) => s.state)!;
  const setView = useCampaign((s) => s.setView);
  const startMission = useCampaign((s) => s.startMission);
  const advanceDays = useCampaign((s) => s.advanceDays);
  const finishElection = useCampaign((s) => s.finishElection);
  const withdraw = useCampaign((s) => s.withdraw);
  const setSelectedRegion = useCampaign((s) => s.setSelectedRegion);
  const selectedRegion = useCampaign((s) => s.selectedRegion);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);

  const active = activeMissionId(state);
  const recommended = nextRecommendedMission(state);
  const pendingEvent = nextPendingEvent(state);
  const inFinalWeek = state.phase === 'finalWeek' || state.day >= FINAL_WEEK_START;
  const m5Status = state.missions.m5.status;
  const campaignOver = state.day >= CAMPAIGN_DAYS;
  const canFinish = campaignOver || m5Status === 'done';
  const finishHint =
    campaignOver
      ? 'A campanha chegou ao fim. Encerre a apuração para ver o resultado.'
      : m5Status === 'done'
        ? 'A apuração simulada está disponível. Sua campanha está fechada — apure quando quiser.'
        : m5Status === 'available' || m5Status === 'active'
          ? 'A apuração simulada está disponível. Conclua a missão "A última semana" para maximizar seus números — ou apure agora.'
          : 'A apuração simulada está disponível. Complete as missões pendentes para maximizar seus números — ou apure agora.';

  return (
    <div className="screen">
      <div className="kicker">
        Painel estratégico · {DIFFICULTY[state.difficulty].label} · dia {state.day} de {CAMPAIGN_DAYS}
      </div>
      <h2>Comitê Barreto</h2>

      <div className="grid grid-panel mt">
        <div>
          <div className="card">
            <div className="card-title">
              <h3>Indicadores da campanha</h3>
              <button className="btn btn-ghost" onClick={() => setView('historico')}>
                Histórico
              </button>
            </div>
            {ATTRIBUTES.map((attr) => (
              <Meter
                key={attr}
                label={ATTR_LABELS[attr]}
                value={state.attributes[attr]}
                hint={ATTR_HINTS[attr]}
                variant={attr === 'institutionalTrust' ? 'gold' : attr === 'loyalty' ? 'blue' : 'green'}
              />
            ))}
            <div className="row mt">
              <span className="topbar-chip">
                Verba <strong>{formatMoney(state.funds)}</strong>
              </span>
              <span className="topbar-chip">
                Debate <strong>{Math.round(state.debateSkill)}/100</strong>
              </span>
              <span className="topbar-chip">
                Fase <strong>{state.phase === 'finalWeek' ? 'Semana final' : 'Campanha'}</strong>
              </span>
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <h3>Missões</h3>
              <button className="btn btn-ghost" onClick={() => setView('missoes')}>
                Ver todas
              </button>
            </div>
            {active && (
              <p className="small">
                <span className="tag gold">Em andamento</span> {missionDef(active).title} —{' '}
                <button className="btn btn-ghost" onClick={() => setView('missao')}>
                  Retomar
                </button>
              </p>
            )}
            {recommended && (
              <p className="small">
                <span className="tag green">Disponível</span> {missionDef(recommended).title}
                <button
                  className="btn btn-primary"
                  style={{ marginLeft: 10 }}
                  onClick={() => {
                    playSound('choice');
                    startMission(recommended);
                  }}
                >
                  Iniciar missão
                </button>
              </p>
            )}
            {!active && !recommended && (
              <p className="muted small">Nenhuma missão disponível agora. Continue a campanha pelo painel.</p>
            )}
          </div>

          <div className="card">
            <h3>Últimos acontecimentos</h3>
            {state.log.length === 0 && <p className="muted small">Nada registrado ainda.</p>}
            {state.log.slice(0, 5).map((entry) => (
              <div key={entry.id} className={`log-entry ${entry.tone}`}>
                {entry.text}
                <div className="meta">
                  Dia {entry.day} · {entry.source}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="card">
            <h3>Ações rápidas</h3>
            <div className="stack">
              <button className="btn" onClick={() => { playSound('click'); advanceDays(1); }} disabled={campaignOver}>
                Avançar 1 dia
              </button>
              <button className="btn" onClick={() => { playSound('click'); advanceDays(3); }} disabled={campaignOver}>
                Avançar 3 dias
              </button>
              <button className="btn" onClick={() => setView('financas')} disabled={campaignOver}>
                Ações estratégicas
              </button>
              <button className="btn" onClick={() => setView('mapa')}>
                Mapa eleitoral
              </button>
            </div>
            <p className="tiny muted mt">
              Avançar o tempo pode disparar eventos inesperados. Toda aleatoriedade usa a semente da
              partida — o mesmo dia pode ser reproduzido.
            </p>
          </div>

          <div className="card">
            <h3>Regiões em destaque</h3>
            <ul className="list">
              {[...REGIONS]
                .sort((a, b) => state.regions[b.id].player - state.regions[a.id].player)
                .slice(0, 5)
                .map((r) => (
                  <li key={r.id}>
                    <button
                      className="btn btn-ghost"
                      onClick={() => {
                        setSelectedRegion(r.id);
                        setView('mapa');
                      }}
                    >
                      {r.name}
                    </button>
                    <strong>{Math.round(state.regions[r.id].player)}%</strong>
                  </li>
                ))}
            </ul>
            <p className="tiny muted">
              Região selecionada para ações: <strong>{regionDef(selectedRegion).name}</strong>
            </p>
          </div>

          {(inFinalWeek || campaignOver) && (
            <div className="card">
              <h3>{campaignOver ? 'Fim de campanha' : 'Semana final'}</h3>
              <p className="small muted">{finishHint}</p>
              <div className="stack">
                {canFinish ? (
                  <button className="btn btn-gold" onClick={() => setConfirmFinish(true)}>
                    {campaignOver ? 'Apurar resultado' : 'Encerrar campanha e apurar'}
                  </button>
                ) : (
                  <p className="tiny muted">
                    A apuração será liberada no último dia da campanha (dia {CAMPAIGN_DAYS}) ou ao
                    concluir a missão "A última semana".
                  </p>
                )}
                <button className="btn btn-danger" onClick={() => setConfirmWithdraw(true)}>
                  Retirar candidatura
                </button>
              </div>
            </div>
          )}

          {pendingEvent && (
            <div className="card">
              <h3>Evento pendente</h3>
              <p className="small">{pendingEvent.title}</p>
              <p className="tiny muted">Resolva o evento antes de continuar a campanha.</p>
            </div>
          )}
        </div>
      </div>

      {confirmFinish && (
        <ConfirmDialog
          title="Encerrar a campanha e apurar?"
          message="A apuração eleitoral simulada é calculada agora e o resultado é definitivo para esta partida: o desfecho é gravado e não há como voltar atrás."
          confirmLabel="Apurar agora"
          onConfirm={() => {
            setConfirmFinish(false);
            playSound('ending');
            finishElection();
          }}
          onCancel={() => setConfirmFinish(false)}
        />
      )}

      {confirmWithdraw && (
        <ConfirmDialog
          title="Retirar a candidatura?"
          message="Você encerra a campanha antes da apuração e assume o final de recuo honroso. Não há como voltar atrás nesta partida."
          confirmLabel="Confirmar retirada"
          danger
          onConfirm={() => {
            setConfirmWithdraw(false);
            withdraw();
          }}
          onCancel={() => setConfirmWithdraw(false)}
        />
      )}
    </div>
  );
}
