import { useCampaign } from '@/game/state/campaignStore';
import { character } from '@/game/data/characters';
import { CAMPAIGN_DAYS, FINAL_WEEK_START, INITIAL_FUNDS } from '@/game/constants';
import { Portrait } from '../components/Portrait';
import { playSound } from '@/game/audio/audioManager';
import { useCampaignState } from './helpers';

export function IntroScreen() {
  const state = useCampaignState();
  const introDone = useCampaign((s) => s.introDone);
  const setView = useCampaign((s) => s.setView);

  if (!state) return null;

  const fabio = character('rafael');
  const helio = character('helio');
  const aurelio = character('aurelio');

  return (
    <div className="screen">
      <div className="kicker">Introdução</div>
      <h2>Como funciona o jogo</h2>

      {/* ------------------------------------------------------------------ */}
      {/* QUEM É O JOGADOR */}
      {/* ------------------------------------------------------------------ */}
      <div className="card mt">
        <div className="dialogue">
          <Portrait spec={fabio.portrait} size="md" label={fabio.name} />
          <div className="dialogue-bubble">
            <div className="speaker-label">Seu personagem</div>
            <p>
              <strong>Fábio Barreto</strong>, 38 anos. Filho do ex-presidente Júlio Barreto, condenado
              pela Justiça. Você fundou uma ONG de transparência que virou plataforma política — e
              agora disputa a presidência da República.
            </p>
            <p className="small muted">
              Seu pai escreveu da prisão: <em>"ou entra nessa brincadeira com método, ou não entre."</em>
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* OBJETIVO */}
      {/* ------------------------------------------------------------------ */}
      <div className="card">
        <div className="kicker">Objetivo</div>
        <h3>Vencer a eleição em {CAMPAIGN_DAYS} dias</h3>
        <p className="small">
          A campanha dura <strong>{CAMPAIGN_DAYS} dias</strong> ({CAMPAIGN_DAYS / 7} semanas). No dia{' '}
          {FINAL_WEEK_START} começa a semana final e, no fim, a apuração decide se você vence.
        </p>
        <p className="small">
          Ao mesmo tempo, o <strong>processo do seu pai</strong> corre em paralelo. Suas escolhas
          influenciam os dois desfechos — o eleitoral e o jurídico.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MECÂNICAS */}
      {/* ------------------------------------------------------------------ */}
      <div className="card">
        <div className="kicker">Mecânicas principais</div>
        <div className="grid grid-2 mt" style={{ gap: 12 }}>
          <div>
            <h4>📅 Avançar dias</h4>
            <p className="small muted">
              Cada dia, você pode executar <strong>ações estratégicas</strong> gastando verba e dias —
              ou avançar para o próximo dia. Eventos podem surgir e exigir decisões.
            </p>
          </div>
          <div>
            <h4>📋 Missões</h4>
            <p className="small muted">
              <strong>5 missões principais</strong> contam a história da campanha. Cada uma tem escolhas
              com consequências. Missões não concluídas <strong>penalizam a apuração</strong>.
            </p>
          </div>
          <div>
            <h4>💰 Verba</h4>
            <p className="small muted">
              Você começa com <strong>R$ {INITIAL_FUNDS} milhões</strong>. Ações, missões e eventos
              gastam verba. Sem dinheiro, sem campanha.
            </p>
          </div>
          <div>
            <h4>📊 Atributos</h4>
            <p className="small muted">
              <strong>Popularidade, Influência, Reputação, Confiança Institucional e Lealdade</strong>{' '}
              determinam quais escolhas estão disponíveis e como você se sai na apuração.
            </p>
          </div>
          <div>
            <h4>🗺️ Regiões</h4>
            <p className="small muted">
              O Brasil tem <strong>5 regiões</strong> com prioridades diferentes. Alianças locais e
              aderência às pautas regionais influenciam o resultado em cada uma.
            </p>
          </div>
          <div>
            <h4>🎤 Debates e eventos</h4>
            <p className="small muted">
              Debates nacionais afetam sua reputação. Eventos diários surgem aleatoriamente — cada um
              com escolhas que mudam o rumo da campanha.
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* TELAS */}
      {/* ------------------------------------------------------------------ */}
      <div className="card">
        <div className="kicker">Onde clicar</div>
        <div className="grid grid-3 mt" style={{ gap: 10 }}>
          <div>
            <h4>Painel</h4>
            <p className="small muted">Visão geral: dia, verba, atributos e missão recomendada.</p>
          </div>
          <div>
            <h4>Mapa</h4>
            <p className="small muted">Veja o apoio em cada região e escolha onde priorizar.</p>
          </div>
          <div>
            <h4>Missões</h4>
            <p className="small muted">Acesse as 5 missões da história — o coração do jogo.</p>
          </div>
          <div>
            <h4>Ações</h4>
            <p className="small muted">Estratégias que gastam verba e dias: mídia, pesquisas, comícios.</p>
          </div>
          <div>
            <h4>Alianças</h4>
            <p className="small muted">Negocie com partidos e figuras políticas para ganhar apoio.</p>
          </div>
          <div>
            <h4>Debate</h4>
            <p className="small muted">Participe de debates ao vivo — escolha bem ou pague o preço.</p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* ADVERSÁRIO */}
      {/* ------------------------------------------------------------------ */}
      <div className="card">
        <div className="dialogue">
          <Portrait spec={aurelio.portrait} size="md" label={aurelio.name} />
          <div className="dialogue-bubble">
            <div className="speaker-label">{aurelio.name} — adversário</div>
            <p>
              "Quem tem estrutura vence quem tem manchete — até o dia em que a manchete vira
              estrutura."
            </p>
            <p className="small muted">
              Leandro Lacerda é seu adversário na eleição. Ele tem partido, dinheiro e mídia. Você
              tem 84 dias e escolhas para fazer.
            </p>
          </div>
        </div>
      </div>

      <div className="btn-row">
        <button
          className="btn btn-primary"
          onClick={() => {
            playSound('success');
            introDone();
          }}
        >
          Iniciar a campanha
        </button>
        <button className="btn" onClick={() => setView('menu')}>
          Voltar ao menu
        </button>
      </div>
    </div>
  );
}
