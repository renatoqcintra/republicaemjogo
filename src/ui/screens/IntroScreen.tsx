import { useCampaign } from '@/game/state/campaignStore';
import { character } from '@/game/data/characters';
import { Portrait } from '../components/Portrait';
import { playSound } from '@/game/audio/audioManager';
import { useCampaignState } from './helpers';

export function IntroScreen() {
  const state = useCampaignState();
  const introDone = useCampaign((s) => s.introDone);
  const setView = useCampaign((s) => s.setView);

  if (!state) return null;

  const rafael = character('rafael');
  const helio = character('helio');
  const aurelio = character('aurelio');

  return (
    <div className="screen">
      <div className="kicker">Introdução narrativa</div>
      <h2>Quatro semanas antes da candidatura</h2>

      <div className="card mt">
        <div className="dialogue">
          <Portrait spec={helio.portrait} size="md" label={helio.name} />
          <div className="dialogue-bubble">
            <div className="speaker-label">{helio.name} — bilhete do presídio de Santa Brígida</div>
            <p>
              "Filho, escrevo entre uma audiência e outra. Condenaram-me por aquilo que provaram e por
              aquilo que imaginaram. A diferença entre os dois é o que você vai tentar corrigir — ou vai
              herdar. Escolha agora: ou entra nessa brincadeira com método, ou não entre."
            </p>
            <p className="small muted">O bilhete termina com um treco de piada sobre o café do presídio.</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="dialogue">
          <Portrait spec={rafael.portrait} size="md" label={rafael.name} />
          <div className="dialogue-bubble">
            <div className="speaker-label">{rafael.name}</div>
            <p>
              Fábio Barreto tem 38 anos, um curso de Direito que nunca usou profissionalmente e uma ONG
              de transparência que virou plataforma política. O pai preso é a pergunta de todas as
              entrevistas. A resposta que ele preparou cabe em uma frase: "o julgamento segue o seu curso".
            </p>
            <p className="muted small">
              Sua campanha vai durar oito semanas. Cada escolha custa verba, dias e aliados — e devolve
              consequências na eleição e no processo.
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="dialogue">
          <Portrait spec={aurelio.portrait} size="md" label={aurelio.name} />
          <div className="dialogue-bubble">
            <div className="speaker-label">{aurelio.name} — adversário, quatro disputas nacionais</div>
            <p>
              "Preparou-se para disputar com um nome grande. Eu disputei com um nome pequeno durante vinte
              anos. A conta é simples: quem tem estrutura vence quem tem manchete — até o dia em que a
              manchete vira estrutura."
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
