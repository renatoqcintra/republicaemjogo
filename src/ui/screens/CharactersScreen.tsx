import { useState } from 'react';
import { useCampaign } from '@/game/state/campaignStore';
import { CHARACTERS, character } from '@/game/data/characters';
import { mnrOrganization, mnrPosition } from '@/game/data/mnr';
import { Portrait } from '../components/Portrait';
import { Modal } from '../components/Modal';
import type { CharacterId } from '@/game/types';

export function CharactersScreen() {
  const state = useCampaign((s) => s.state)!;
  const [open, setOpen] = useState<CharacterId | null>(null);
  const def = open ? character(open) : null;
  const rel = open ? (state.relations[open] ?? 0) : 0;
  const knowsSecret = rel >= 30 || state.completedMissions.includes('m3');

  return (
    <div className="screen">
      <div className="kicker">Elenco</div>
      <h2>Personagens da República</h2>
      <p className="muted small">
        Todo o elenco é fictício. As relações influenciam diálogos, missões e a disponibilidade de
        alianças.
      </p>

      <div className="grid grid-3 mt">
        {CHARACTERS.map((c) => {
          const relationship = state.relations[c.id] ?? 0;
          return (
            <button key={c.id} className="region-card" onClick={() => setOpen(c.id)}>
              <div className="row" style={{ gap: 12 }}>
                <Portrait spec={c.portrait} size="md" label={c.name} />
                <div>
                  <strong>{c.name}</strong>
                  <div className="tiny muted">{c.role}</div>
                  <div className="tiny muted">{c.faction}</div>
                  <div
                    className="tiny"
                    style={{
                      color:
                        relationship >= 40 ? 'var(--green-3)' : relationship <= -15 ? 'var(--red-2)' : 'var(--muted)',
                    }}
                  >
                    Relação: {relationship > 0 ? '+' : ''}
                    {relationship}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {def && (
        <Modal title={def.name} onClose={() => setOpen(null)} closeLabel="Fechar perfil">
          <div className="dialogue">
            <Portrait spec={def.portrait} size="md" label={def.name} />
            <div>
              <div className="speaker-label">{def.role}</div>
              <p className="small muted">{def.faction}</p>
            </div>
          </div>
          <p className="small mt">{def.bio}</p>
          <ul className="list small">
            <li>
              <span className="muted">Personalidade</span>
              <span>{def.personality}</span>
            </li>
            <li>
              <span className="muted">Interesses</span>
              <span>{def.interests.join(', ')}</span>
            </li>
            <li>
              <span className="muted">Postura inicial</span>
              <span>{def.initialStance}</span>
            </li>
            <li>
              <span className="muted">Alinhamento programático</span>
              <span>
                {def.alignment >= 40
                  ? `Proximidade programática (${def.alignment > 0 ? '+' : ''}${def.alignment}) — não implica apoio eleitoral`
                  : def.alignment <= -40
                    ? `Divergência programática (${def.alignment})`
                    : `Independente dos polos (${def.alignment > 0 ? '+' : ''}${def.alignment})`}
              </span>
            </li>
            {open === 'bento' && (
              <>
                <li>
                  <span className="muted">Posição do MNR</span>
                  <span>{mnrPosition(state.flags)}</span>
                </li>
                <li>
                  <span className="muted">Organização do MNR</span>
                  <span>{mnrOrganization(state.flags)}</span>
                </li>
              </>
            )}
            <li>
              <span className="muted">Relação pessoal</span>
              <span>
                {rel > 0 ? '+' : ''}
                {rel} / 100
              </span>
            </li>
          </ul>
          <div className="card mt" style={{ boxShadow: 'none' }}>
            <div className="kicker">Segredo narrativo</div>
            {knowsSecret ? (
              <p className="small">{def.secret}</p>
            ) : (
              <p className="small muted">
                Conhecimento de bastidores ainda não revelado. Melhore a relação (30+) ou avance na
                trama judicial para desbloquear.
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
