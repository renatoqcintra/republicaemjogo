import { useRef } from 'react';
import { useCampaign, activeMissionId } from '@/game/state/campaignStore';
import { missionDef } from '@/game/engine/missionEngine';
import { evalAll } from '@/game/conditions';
import { character } from '@/game/data/characters';
import { regionDef } from '@/game/data/regions';
import { playSound } from '@/game/audio/audioManager';
import { Portrait } from '../components/Portrait';
import { ATTR_LABELS, EmptyState, MISSION_STATUS_LABELS } from './helpers';
import type { MissionChoice, MissionDef, MissionNode } from '@/game/types';
import { realCost } from '@/game/engine/missionEngine';

function costLabel(cost: ReturnType<typeof realCost>): string | null {
  const parts: string[] = [];
  if (cost.funds) parts.push(`R$ ${cost.funds} mi`);
  if (cost.days) parts.push(`${cost.days} ${cost.days === 1 ? 'dia' : 'dias'}`);
  return parts.length ? parts.join(' · ') : null;
}

/**
 * Verdadeiro quando o clique seguinte pode cair num botão de decisão recém
 * renderizado (nó de escolha → nó de escolha, ou diálogo → escolha). Nessas
 * transições um clique duplo tomaria uma decisão sem o jogador perceber.
 */
function leadsToChoice(def: MissionDef, node: MissionNode): boolean {
  if (node.t === 'choice') {
    return node.choices.some((c) => c.next !== undefined && def.nodes[c.next]?.t === 'choice');
  }
  if (node.t === 'dialogue') return def.nodes[node.next]?.t === 'choice';
  return false;
}

const CHOICE_KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];

function ChoiceButton({
  choice,
  state,
  index,
  onPick,
}: {
  choice: MissionChoice;
  state: Parameters<typeof evalAll>[1];
  index: number;
  onPick: (id: string) => void;
}) {
  const visible = evalAll(choice.requires, state);
  const cost = realCost(state, choice.cost);
  const affordable = cost.funds === undefined || state.funds >= cost.funds;
  if (!visible) return null;

  const regionEffect = choice.effects?.find((e) => e.t === 'region');
  const regionText = regionEffect && regionEffect.t === 'region' ? ` em ${regionDef(regionEffect.region).name}` : '';

  return (
    <button
      className="choice"
      disabled={!affordable}
      onClick={() => {
        playSound('choice');
        onPick(choice.id);
      }}
    >
      <span className="choice-head">
        <span className="key" aria-hidden="true">
          {CHOICE_KEYS[index] ?? index + 1}
        </span>
        <strong>{choice.label}</strong>
      </span>
      {choice.description && <span className="desc">{choice.description}</span>}
      {regionText && <span className="desc"> Efeito regional{regionText}.</span>}
      {choice.hint && <span className="hint">→ {choice.hint}</span>}
      {costLabel(cost) && <div className="cost">Custo: {costLabel(cost)}</div>}
      {!affordable && <div className="lock">Verba insuficiente para esta escolha.</div>}
    </button>
  );
}

export function MissionScreen() {
  const state = useCampaign((s) => s.state)!;
  const advance = useCampaign((s) => s.advance);
  const choose = useCampaign((s) => s.choose);
  const conclude = useCampaign((s) => s.conclude);
  const setView = useCampaign((s) => s.setView);

  // Trava de clique duplo: como alguns nós de escolha levam direto a outro
  // nó de escolha, dois cliques rápidos tomariam duas decisões sem o jogador
  // perceber. A trava libera sozinha em 400ms (ou quando o clique é aceito).
  const lockRef = useRef(false);
  const lockTimerRef = useRef<number | null>(null);

  /** Trava curta que libera sozinha: é a janela de um clique duplo acidental. */
  const engageLock = () => {
    lockRef.current = true;
    if (lockTimerRef.current !== null) window.clearTimeout(lockTimerRef.current);
    lockTimerRef.current = window.setTimeout(() => {
      lockRef.current = false;
      lockTimerRef.current = null;
    }, 400);
  };

  /**
   * Engata a trava só quando o clique seguinte poderia cair num botão de
   * decisão recém-renderizado (escolha→escolha ou diálogo→escolha). Transições
   * para diálogos/fim não travam, para não atrasar cliques legítimos.
   */
  const guardTransition = () => {
    const id = activeMissionId(state);
    if (!id) return;
    const defNow = missionDef(id);
    const nodeNow = defNow.nodes[state.missions[id].currentNode ?? defNow.startNode];
    if (nodeNow && leadsToChoice(defNow, nodeNow)) engageLock();
  };

  const handleAdvance = () => {
    if (lockRef.current) return;
    guardTransition();
    advance();
  };

  const handlePick = (choiceId: string) => {
    if (lockRef.current) return;
    guardTransition();
    choose(choiceId);
  };

  const activeId = activeMissionId(state);

  if (!activeId) {
    return (
      <div className="screen">
        <EmptyState
          title="Nenhuma missão em andamento"
          message="Abra a lista de missões para começar a próxima etapa da campanha."
          action={
            <button className="btn btn-primary" onClick={() => setView('missoes')}>
              Ver missões
            </button>
          }
        />
      </div>
    );
  }

  const def = missionDef(activeId);
  const progress = state.missions[activeId];
  const nodeId = progress.currentNode ?? def.startNode;
  const node: MissionNode = def.nodes[nodeId];
  const speakerId = node.t === 'dialogue' || node.t === 'choice' ? node.speaker : undefined;
  const speaker = speakerId ? character(speakerId) : null;

  return (
    <div className="screen">
      <div className="row-between">
        <div>
          <div className="kicker">
            Missão {def.id.toUpperCase()} · Fase {def.phase} · {MISSION_STATUS_LABELS[progress.status]}
          </div>
          <h2>{def.title}</h2>
          <p className="muted small">{def.tagline}</p>
        </div>
        <button className="btn btn-ghost" onClick={() => setView('missoes')}>
          Sair para a lista
        </button>
      </div>

      <div className="grid grid-map mt">
        <div>
          <div className="card">
            {node.t === 'dialogue' && (
              <>
                <div className="dialogue">
                  {speaker && <Portrait spec={speaker.portrait} size="md" label={speaker.name} />}
                  <div className="dialogue-bubble">
                    {speaker && <div className="speaker-label">{speaker.name}</div>}
                    <p>{node.text}</p>
                  </div>
                </div>
                <div className="btn-row">
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      playSound('click');
                      handleAdvance();
                    }}
                  >
                    Continuar
                  </button>
                </div>
              </>
            )}

            {node.t === 'choice' && (
              <>
                <div className="dialogue">
                  {speaker && <Portrait spec={speaker.portrait} size="md" label={speaker.name} />}
                  <div className="dialogue-bubble">
                    {speaker && <div className="speaker-label">{speaker.name}</div>}
                    <p>{node.prompt}</p>
                  </div>
                </div>
                <div className="choice-list">
                  {node.choices
                    .filter((choice) => evalAll(choice.requires, state))
                    .map((choice, index) => (
                      <ChoiceButton
                        key={choice.id}
                        choice={choice}
                        state={state}
                        index={index}
                        onPick={handlePick}
                      />
                    ))}
                </div>
              </>
            )}

            {node.t === 'end' && (
              <>
                <p>{node.text}</p>
                <div className="btn-row">
                  <button
                    className="btn btn-gold"
                    onClick={() => {
                      playSound('success');
                      conclude();
                    }}
                  >
                    Concluir missão
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div>
          <div className="card">
            <h3>Contexto</h3>
            <p className="small muted">{def.context}</p>
            <h3 className="mt">Objetivos</h3>
            {def.objectives.map((o) => {
              const done = progress.completedObjectives.includes(o.id);
              return (
                <div key={o.id} className={`objective ${done ? 'done' : ''}`}>
                  <span className="mark" aria-hidden>
                    {done ? '✓' : '·'}
                  </span>
                  <span className="obj-text">
                    {o.text}
                    {o.optional && <span className="tag" style={{ marginLeft: 6 }}>opcional</span>}
                  </span>
                </div>
              );
            })}
            <p className="tiny muted mt">
              Escolhas exigem recursos: verba e dias são verificados antes de cada ação.
            </p>
          </div>

          <div className="card">
            <h3>Seu estado</h3>
            <ul className="list small">
              <li>
                <span className="muted">Verba</span>
                <strong>R$ {state.funds} mi</strong>
              </li>
              <li>
                <span className="muted">Dia</span>
                <strong>{state.day}/84</strong>
              </li>
              {Object.entries(state.attributes).map(([k, v]) => (
                <li key={k}>
                  <span className="muted">{ATTR_LABELS[k] ?? k}</span>
                  <strong>{Math.round(v)}</strong>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h3>Envolvidos</h3>
            <div className="stack">
              {def.characters.map((c) => {
                const ch = character(c);
                const rel = state.relations[c] ?? 0;
                return (
                  <div key={c} className="row">
                    <Portrait spec={ch.portrait} size="sm" label={ch.name} />
                    <div>
                      <strong className="small">{ch.name}</strong>
                      <div className="tiny muted">
                        {ch.role} · relação {rel > 0 ? '+' : ''}
                        {rel}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
