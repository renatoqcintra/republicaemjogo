import { useState } from 'react';
import { useCampaign } from '@/game/state/campaignStore';
import { DIFFICULTY, GAME_FICTION_NOTICE } from '@/game/constants';
import { playSound } from '@/game/audio/audioManager';
import { ConfirmDialog } from '../components/Modal';
import type { Difficulty } from '@/game/types';

const ORDER: Difficulty[] = ['facil', 'normal', 'dificil'];

export function NewCampaignScreen() {
  const newGame = useCampaign((s) => s.newGame);
  const setView = useCampaign((s) => s.setView);
  const saveAvailable = useCampaign((s) => s.saveAvailable);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);

  const start = () => {
    playSound('choice');
    newGame(difficulty);
  };

  return (
    <div className="screen">
      <div className="kicker">Nova campanha</div>
      <h2>Escolha a dificuldade</h2>
      <p className="muted">
        A dificuldade ajusta custos, frequência de eventos e a margem de erro da sua campanha — sem
        esconder regras nem tornar o jogo injusto.
      </p>

      <div className="grid grid-3 mt">
        {ORDER.map((id) => {
          const d = DIFFICULTY[id];
          const active = difficulty === id;
          return (
            <button
              key={id}
              className={`region-card ${active ? 'selected' : ''}`}
              aria-pressed={active}
              onClick={() => {
                playSound('tick');
                setDifficulty(id);
              }}
            >
              <div className="kicker">{id === 'facil' ? 'Iniciante' : id === 'normal' ? 'Equilibrado' : 'Implacável'}</div>
              <h3 style={{ marginBottom: 6 }}>{d.label}</h3>
              <p className="small muted">{d.description}</p>
              <ul className="list small">
                <li>
                  <span className="muted">Verba inicial</span>
                  <strong>R$ {d.startFunds} mi</strong>
                </li>
                <li>
                  <span className="muted">Custo das ações</span>
                  <strong>{Math.round(d.costMultiplier * 100)}%</strong>
                </li>
                <li>
                  <span className="muted">Frequência de eventos</span>
                  <strong>{Math.round(d.eventFrequency * 100)}%</strong>
                </li>
              </ul>
            </button>
          );
        })}
      </div>

      <div className="btn-row mt">
        <button className="btn btn-primary" onClick={() => (saveAvailable ? setConfirmOverwrite(true) : start())}>
          Começar campanha
        </button>
        <button className="btn" onClick={() => setView('menu')}>
          Voltar
        </button>
      </div>

      <p className="legal-note">{GAME_FICTION_NOTICE}</p>

      {confirmOverwrite && (
        <ConfirmDialog
          title="Substituir campanha salva?"
          message="Já existe uma campanha salva neste dispositivo. Iniciar uma nova irá substituí-la. Esta ação não pode ser desfeita."
          confirmLabel="Iniciar nova campanha"
          danger
          onConfirm={() => {
            setConfirmOverwrite(false);
            start();
          }}
          onCancel={() => setConfirmOverwrite(false)}
        />
      )}
    </div>
  );
}
