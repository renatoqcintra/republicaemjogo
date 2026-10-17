import { useCampaign } from '@/game/state/campaignStore';
import { STRATEGIC_ACTIONS } from '@/game/data/actions';
import { realCost } from '@/game/engine/missionEngine';
import { evalAll } from '@/game/conditions';
import { formatMoney } from '@/game/rules/numbers';
import { playSound } from '@/game/audio/audioManager';
import { Meter } from '../components/Meter';
import { character } from '@/game/data/characters';
import { Portrait } from '../components/Portrait';

export function DebatesScreen() {
  const state = useCampaign((s) => s.state)!;
  const performAction = useCampaign((s) => s.performAction);

  const treino = STRATEGIC_ACTIONS.find((a) => a.id === 'treino_debate')!;
  const cost = realCost(state, treino.cost);
  const allowed = evalAll(treino.requires, state);
  const affordable = cost.funds === undefined || state.funds >= cost.funds;
  const debateDone = state.flags['debateFinalScore'] !== undefined;
  const debateScore = typeof state.flags['debateFinalScore'] === 'number' ? state.flags['debateFinalScore'] : null;
  const debateWon = state.flags['debateWon'] === true;

  return (
    <div className="screen">
      <div className="kicker">Debates</div>
      <h2>Sala de preparação</h2>
      <p className="muted small">
        O debate nacional da quinta-feira da última semana pesa na apuração. Desempenho alto rende
        bônus em todas as regiões; desempenho baixo apenas não queima a noite.
      </p>

      <div className="grid grid-2 mt">
        <div className="card">
          <h3>Seu preparo atual</h3>
          <Meter
            label="Desempenho em debates"
            value={state.debateSkill}
            variant="gold"
            hint="Base construída com ações de preparação e eventos."
          />
          {debateDone && (
            <p className="small">
              Debate final: <strong>{debateScore}/100</strong>{' '}
              {debateWon ? (
                <span className="tag green">noite sua</span>
              ) : (
                <span className="tag">sem brilho</span>
              )}
            </p>
          )}
          <button
            className="btn btn-primary mt"
            disabled={!allowed || !affordable || state.phase === 'ended'}
            onClick={() => {
              playSound('choice');
              performAction('treino_debate');
            }}
          >
            Simulado de debate ({formatMoney(cost.funds ?? 0)})
          </button>
          {!allowed && <p className="tiny mt">Requisito: atributos atuais não permitem.</p>}
          {!affordable && allowed && <p className="tiny mt" style={{ color: 'var(--red-2)' }}>Verba insuficiente.</p>}
        </div>

        <div className="card">
          <h3>Seu adversário</h3>
          <div className="dialogue">
            <Portrait spec={character('aurelio').portrait} size="md" label="Leandro Lacerda" />
            <div className="dialogue-bubble">
              <div className="speaker-label">Leandro Lacerda</div>
              <p className="small">
                "Vinte anos de debates nacionais. Já perdi três — e aprendi com cada um. Prepare-se para
                a pergunta sobre o seu pai: ela sempre vem antes do intervalo."
              </p>
            </div>
          </div>
          <ul className="list small mt">
            <li>
              <span className="muted">Estilo</span>
              <strong>Ironia paciente e números soltos</strong>
            </li>
            <li>
              <span className="muted">Fraqueza</span>
              <strong>Perguntas sobre o caixa do partido</strong>
            </li>
            <li>
              <span className="muted">Arma</span>
              <strong>Memoriza erros de frase alheia</strong>
            </li>
          </ul>
        </div>
      </div>

      <div className="card">
        <h3>Como o debate final é resolvido</h3>
        <p className="small muted">
          O debate acontece dentro da missão “A última semana”. Sua escolha de postura (atacar,
          defender, emocionar ou sobreviver) gera uma nota final de 0 a 100 que entra direto na
          apuração — junto com popularidade, reputação, alianças e aderência às prioridades de cada
          região.
        </p>
        <p className="tiny muted">
          Dica: posturas de ataque exigem influência alta; o discurso emocional depende de popularidade
          45+. Preparo de debate reduz o risco de qualquer caminho.
        </p>
      </div>
    </div>
  );
}
