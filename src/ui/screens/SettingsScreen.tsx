import { useEffect, useState } from 'react';
import { useCampaign } from '@/game/state/campaignStore';
import { configureAudio, playSound } from '@/game/audio/audioManager';
import { Modal } from '../components/Modal';import { hasSave } from '@/game/save/saveManager';

export function SettingsScreen() {
  const settings = useCampaign((s) => s.settings);
  const updateSettings = useCampaign((s) => s.updateSettings);
  const setView = useCampaign((s) => s.setView);
  const confirmDeleteSave = useCampaign((s) => s.confirmDeleteSave);
  const [showDelete, setShowDelete] = useState(false);
  const [saveInfo, setSaveInfo] = useState<string>('Verificando…');

  useEffect(() => {
    configureAudio(settings.volume, settings.muted);
  }, [settings.volume, settings.muted]);

  useEffect(() => {
    const raw = hasSave();
    setSaveInfo(raw ? 'Há uma campanha salva neste dispositivo.' : 'Nenhuma campanha salva neste dispositivo.');
  }, []);

  return (
    <div className="screen">
      <div className="kicker">Configurações</div>
      <h2>Preferências</h2>

      <div className="grid grid-2 mt">
        <div className="card">
          <h3>Áudio</h3>
          <label className="row-between small" htmlFor="vol">
            <span>Volume dos efeitos</span>
            <strong>{Math.round(settings.volume * 100)}%</strong>
          </label>
          <input
            id="vol"
            type="range"
            min={0}
            max={100}
            value={Math.round(settings.volume * 100)}
            onChange={(e) => updateSettings({ volume: Number(e.target.value) / 100 })}
            style={{ width: '100%' }}
          />
          <label className="row small mt" style={{ marginTop: 12 }}>
            <input
              type="checkbox"
              checked={settings.muted}
              onChange={(e) => updateSettings({ muted: e.target.checked })}
            />
            <span>Desativar todos os sons</span>
          </label>
          <p className="tiny muted mt">
            O jogo funciona integralmente sem som. Os efeitos são gerados localmente, sem arquivos
            externos.
          </p>
          <button className="btn mt" onClick={() => playSound('success')}>
            Testar som
          </button>
        </div>

        <div className="card">
          <h3>Acessibilidade</h3>
          <label className="small" htmlFor="motion">
            Movimento
          </label>
          <select
            id="motion"
            className="btn"
            style={{ width: '100%', marginTop: 6 }}
            value={settings.reducedMotion}
            onChange={(e) => updateSettings({ reducedMotion: e.target.value as typeof settings.reducedMotion })}
          >
            <option value="auto">Seguir a preferência do sistema</option>
            <option value="reduced">Reduzir animações</option>
            <option value="full">Permitir animações</option>
          </select>
          <label className="row small" style={{ marginTop: 12 }}>
            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={(e) => updateSettings({ highContrast: e.target.checked })}
            />
            <span>Alto contraste</span>
          </label>
          <label className="row small" style={{ marginTop: 8 }}>
            <input
              type="checkbox"
              checked={settings.showDiagnostics}
              onChange={(e) => updateSettings({ showDiagnostics: e.target.checked })}
            />
            <span>Mostrar diagnósticos da partida (seed e versão)</span>
          </label>
        </div>
      </div>

      <div className="card">
        <h3>Salvamento local</h3>
        <p className="small">{saveInfo}</p>
        <p className="tiny muted">
          O progresso fica apenas neste navegador ou dispositivo (armazenamento local). Não há
          sincronização em nuvem: para continuar em outro computador, seria preciso exportar e
          importar manualmente o arquivo de salvamento.
        </p>
        <div className="btn-row">
          <button
            className="btn btn-danger"
            disabled={!hasSave()}
            onClick={() => setShowDelete(true)}
          >
            Apagar campanha salva
          </button>
          <button className="btn" onClick={() => setView('menu')}>
            Voltar ao menu
          </button>
        </div>
      </div>

      {showDelete && (
        <Modal title="Apagar campanha salva?" onClose={() => setShowDelete(false)} closeLabel="Cancelar">
          <p className="small muted">
            Esta ação apaga permanentemente a campanha salva neste dispositivo. Finais e conquistas
            desbloqueados são preservados. Não há como desfazer.
          </p>
          <div className="btn-row">
            <button
              className="btn btn-danger"
              onClick={() => {
                confirmDeleteSave();
                setShowDelete(false);
                setSaveInfo('Nenhuma campanha salva neste dispositivo.');
              }}
            >
              Apagar definitivamente
            </button>
            <button className="btn" onClick={() => setShowDelete(false)}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
