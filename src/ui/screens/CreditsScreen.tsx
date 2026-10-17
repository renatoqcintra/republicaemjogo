import { useCampaign } from '@/game/state/campaignStore';
import { GAME_FICTION_NOTICE, SAVE_VERSION } from '@/game/constants';

export function CreditsScreen() {
  const setView = useCampaign((s) => s.setView);
  const hasCampaign = useCampaign((s) => s.state !== null && s.state.phase !== 'ended');
  const state = useCampaign((s) => s.state);

  return (
    <div className="screen">
      <div className="kicker">Créditos</div>
      <h2>República em Jogo</h2>
      <p className="muted">
        Protótipo jogável de estratégia política narrativa — uma sátira com suspense em que a república
        é fictícia, mas os dilemas não.
      </p>

      <div className="card">
        <h3>Elenco e instituições</h3>
        <p className="small">
          Fábio Barreto, Leandro Lacerda, Júlio Barreto, Thomas Walker, Rafael Sampaio, Felipe Azevedo,
          Gilberto Kaspar, William Nogueira, André Monteiro, Pedro Marques, Daniela
          Bezerra, Valdemar Costa, Sílvio Valente, Dante Valverde, Caetano Góis e Tiago Farias são
          personagens inventados. Partidos (PRN, FPT, PPV), instituições, regiões, produções e eventos
          também são ficcionais.
        </p>
        <p className="tiny muted">{GAME_FICTION_NOTICE}</p>
      </div>

      <div className="card">
        <h3>Tecnologia</h3>
        <ul className="list small">
          <li>
            <span className="muted">Interface</span>
            <strong>React + TypeScript + Vite</strong>
          </li>
          <li>
            <span className="muted">Estado da partida</span>
            <strong>Zustand</strong>
          </li>
          <li>
            <span className="muted">Motor narrativo</span>
            <strong>Grafos de missão orientados a dados</strong>
          </li>
          <li>
            <span className="muted">Testes</span>
            <strong>Vitest + Testing Library</strong>
          </li>
          <li>
            <span className="muted">Retratos</span>
            <strong>SVG gerado por parâmetros (arte temporária substituível)</strong>
          </li>
          <li>
            <span className="muted">Áudio</span>
            <strong>Síntese Web Audio, opcional e desativável</strong>
          </li>
          <li>
            <span className="muted">Formato de salvamento</span>
            <strong>v{SAVE_VERSION}</strong>
          </li>
        </ul>
      </div>

      <div className="btn-row">
        <button className="btn" onClick={() => setView(hasCampaign ? 'painel' : 'menu')}>
          {hasCampaign ? 'Voltar ao painel' : 'Voltar ao menu'}
        </button>
      </div>

      {state && (
        <p className="tiny muted mt">Semente da partida atual: {state.seed} (usada para reproduzir a simulação).</p>
      )}
    </div>
  );
}
