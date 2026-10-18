import { useEffect } from 'react';
import { useCampaign, type ViewId } from '@/game/state/campaignStore';
import { configureAudio, playSound } from '@/game/audio/audioManager';
import { formatMoney } from '@/game/rules/numbers';
import { GAME_FICTION_NOTICE, GAME_TITLE } from '@/game/constants';
import { EventModal } from './ui/components/EventModal';
import { MainMenuScreen } from './ui/screens/MainMenuScreen';
import { NewCampaignScreen } from './ui/screens/NewCampaignScreen';
import { IntroScreen } from './ui/screens/IntroScreen';
import { PanelScreen } from './ui/screens/PanelScreen';
import { MapScreen } from './ui/screens/MapScreen';
import { MissionsScreen } from './ui/screens/MissionsScreen';
import { MissionScreen } from './ui/screens/MissionScreen';
import { CharactersScreen } from './ui/screens/CharactersScreen';
import { HistoryScreen } from './ui/screens/HistoryScreen';
import { FinanceScreen } from './ui/screens/FinanceScreen';
import { AlliancesScreen } from './ui/screens/AlliancesScreen';
import { DebatesScreen } from './ui/screens/DebatesScreen';
import { ElectionScreen } from './ui/screens/ElectionScreen';
import { EndingScreen } from './ui/screens/EndingScreen';
import { GalleryScreen } from './ui/screens/GalleryScreen';
import { AchievementsScreen } from './ui/screens/AchievementsScreen';
import { SettingsScreen } from './ui/screens/SettingsScreen';
import { CreditsScreen } from './ui/screens/CreditsScreen';

const NAV: { id: ViewId; label: string }[] = [
  { id: 'painel', label: 'Painel' },
  { id: 'mapa', label: 'Mapa' },
  { id: 'missoes', label: 'Missões' },
  { id: 'financas', label: 'Ações' },
  { id: 'aliancas', label: 'Alianças' },
  { id: 'debates', label: 'Debate' },
  { id: 'personagens', label: 'Elenco' },
  { id: 'historico', label: 'Histórico' },
];

function ScreenSwitch({ view }: { view: ViewId }) {
  switch (view) {
    case 'menu':
      return <MainMenuScreen />;
    case 'novaCampanha':
      return <NewCampaignScreen />;
    case 'intro':
      return <IntroScreen />;
    case 'painel':
      return <PanelScreen />;
    case 'mapa':
      return <MapScreen />;
    case 'missoes':
      return <MissionsScreen />;
    case 'missao':
      return <MissionScreen />;
    case 'personagens':
      return <CharactersScreen />;
    case 'historico':
      return <HistoryScreen />;
    case 'financas':
      return <FinanceScreen />;
    case 'aliancas':
      return <AlliancesScreen />;
    case 'debates':
      return <DebatesScreen />;
    case 'apuracao':
      return <ElectionScreen />;
    case 'fim':
      return <EndingScreen />;
    case 'galeria':
      return <GalleryScreen />;
    case 'conquistas':
      return <AchievementsScreen />;
    case 'config':
      return <SettingsScreen />;
    case 'creditos':
      return <CreditsScreen />;
    default:
      return <MainMenuScreen />;
  }
}

export default function App() {
  const view = useCampaign((s) => s.view);
  const state = useCampaign((s) => s.state);
  const settings = useCampaign((s) => s.settings);
  const notices = useCampaign((s) => s.notices);
  const error = useCampaign((s) => s.error);
  const setView = useCampaign((s) => s.setView);
  const clearNotices = useCampaign((s) => s.clearNotices);
  const dismissError = useCampaign((s) => s.dismissError);

  useEffect(() => {
    configureAudio(settings.volume, settings.muted);
  }, [settings.volume, settings.muted]);

  useEffect(() => {
    if (notices.length === 0) return;
    const timer = window.setTimeout(clearNotices, 6000);
    return () => window.clearTimeout(timer);
  }, [notices, clearNotices]);

  const motion =
    settings.reducedMotion === 'auto'
      ? 'auto'
      : settings.reducedMotion === 'reduced'
        ? 'reduced'
        : 'full';
  const contrast = settings.highContrast ? 'alto' : 'normal';

  const showTopbar = state !== null && view !== 'menu';

  return (
    <div className="app" data-motion={motion} data-contrast={contrast}>
      {showTopbar && (
        <header className="topbar">
          <div className="brand">
            {GAME_TITLE}
            <small>Estratégia política</small>
          </div>

          <nav className="nav" aria-label="Navegação principal">
            {NAV.map((item) => (
              <button
                key={item.id}
                className="nav-btn"
                aria-current={view === item.id ? 'page' : undefined}
                onClick={() => {
                  playSound('click');
                  setView(item.id);
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="topbar-spacer" />

          {state && (
            <div className="row" style={{ gap: 6 }}>
              <span className="topbar-chip">
                Dia <strong>{state.day}/84</strong>
              </span>
              <span className="topbar-chip">
                Caixa <strong>{formatMoney(state.funds)}</strong>
              </span>
              {state.electionResult && (
                <span className="topbar-chip">
                  Apuração <strong>{state.electionResult.playerPct.toFixed(1)}%</strong>
                </span>
              )}
            </div>
          )}

          <div className="row" style={{ gap: 4 }}>
            <button className="nav-btn" onClick={() => setView('config')} aria-label="Configurações">
              ⚙
            </button>
            <button className="nav-btn" onClick={() => setView('menu')}>
              Menu
            </button>
          </div>
        </header>
      )}

      <main className="main">
        {error && (
          <div className="error-banner" role="alert">
            <span>{error}</span>
            <button className="btn btn-ghost" onClick={dismissError}>
              Fechar
            </button>
          </div>
        )}
        <ScreenSwitch view={view} />
      </main>

      <footer className="footer">
        {GAME_FICTION_NOTICE} Simulações eleitorais fictícias — sem relação com eleições reais.
      </footer>

      <div className="notice-stack" aria-live="polite">
        {notices.map((n, i) => (
          <div className="notice" key={`${i}-${n}`}>
            {n}
          </div>
        ))}
      </div>

      <EventModal />
    </div>
  );
}
