import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';
import { useCampaign } from '@/game/state/campaignStore';
import { useMemoryStorage } from '@/game/save/storage';
import { createCampaignState } from '@/game/state/initialState';
import type { CampaignState } from '@/game/types';

beforeEach(() => {
  useMemoryStorage();
  useCampaign.setState({
    view: 'menu',
    state: null,
    notices: [],
    error: null,
    loadWarnings: [],
    saveAvailable: false,
    selectedRegion: 'sle',
  });
});

/**
 * Espera a trava de clique duplo da tela de missão liberar (400 ms). A trava
 * só existe quando o destino do clique é outro nó de decisão.
 */
const settleChoices = () => new Promise((resolve) => setTimeout(resolve, 450));

async function startCampaign(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /nova campanha/i }));
  await user.click(screen.getByRole('button', { name: /começar campanha/i }));
  // introdução narrativa
  await waitFor(() => expect(screen.getByRole('button', { name: /iniciar a campanha/i })).toBeInTheDocument());
  await user.click(screen.getByRole('button', { name: /iniciar a campanha/i }));
  await waitFor(() => expect(screen.getByText(/comitê barreto/i)).toBeInTheDocument());
}

describe('fluxo principal da interface', () => {
  it('renderiza o menu principal com as opções', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /república em jogo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /nova campanha/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /continuar campanha/i })).toBeDisabled();
  });

  it('inicia campanha: menu → dificuldade → introdução → painel', async () => {
    const user = userEvent.setup();
    render(<App />);
    await startCampaign(user);

    expect(screen.getByText(/dia 1 de 56/i)).toBeInTheDocument();
    expect(screen.getByText(/Popularidade/i)).toBeInTheDocument();
  });

  it('executa a missão 1 completa pela interface', async () => {
    const user = userEvent.setup();
    render(<App />);
    await startCampaign(user);

    await user.click(screen.getByRole('button', { name: /iniciar missão/i }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /o sobrenome pesa/i })).toBeInTheDocument(),
    );

    // diálogo de abertura (avanço para um nó de decisão: espera a trava liberar)
    await user.click(screen.getByRole('button', { name: /continuar/i }));
    await settleChoices();
    // escolha de estratégia: alternativas diferenciadas com consequência possível
    const legado = await screen.findByRole('button', { name: /assumir o legado/i });
    expect(within(legado).getByText('A')).toBeInTheDocument();
    expect(within(legado).getByText(/reputação fica exposta/i)).toBeInTheDocument();
    expect(within(legado).getByText(/aliados fiéis/i)).toBeInTheDocument();
    await user.click(legado);
    // diálogo com Gilberto Kaspar
    await user.click(await screen.findByRole('button', { name: /continuar/i }));
    await settleChoices();
    // escolha de região
    await user.click(await screen.findByRole('button', { name: /serra do leste/i }));
    // reflexão final
    await user.click(await screen.findByRole('button', { name: /continuar/i }));
    // conclusão
    await user.click(await screen.findByRole('button', { name: /concluir missão/i }));

    const state = useCampaign.getState().state!;
    expect(state.completedMissions).toContain('m1');
    expect(state.flags['initialStrategy']).toBe('legado');
    expect(state.flags['priorityRegion']).toBe('sle');
    expect(state.missions.m2.status).toBe('available');
  });

  it('ações estratégicas refletem no estado e no caixa', async () => {
    const user = userEvent.setup();
    render(<App />);
    await startCampaign(user);

    await user.click(screen.getByRole('button', { name: /^ações$/i }));
    await waitFor(() => expect(screen.getByText(/ações estratégicas e finanças/i)).toBeInTheDocument());

    const before = useCampaign.getState().state!.funds;
    const cards = screen.getAllByText('Executar');
    await user.click(cards[0]!); // primeira ação da lista (comício)
    await waitFor(() => {
      expect(useCampaign.getState().state!.funds).toBeLessThan(before);
    });
  });

  it('mapa eleitoral mostra as cinco regiões e seleção funciona', async () => {
    const user = userEvent.setup();
    render(<App />);
    await startCampaign(user);

    await user.click(screen.getByRole('button', { name: /^mapa$/i }));
    await waitFor(() => expect(screen.getByText(/as cinco regiões/i)).toBeInTheDocument());
    const rows = screen.getAllByRole('button', { name: /apoio/i });
    expect(rows.length).toBeGreaterThanOrEqual(5);

    await user.click(rows[0]!);
    expect(useCampaign.getState().selectedRegion).toBeTruthy();
  });

  it('mostra erro quando o jogador não tem verba', async () => {
    const user = userEvent.setup();
    render(<App />);
    await startCampaign(user);

    useCampaign.setState({ state: { ...useCampaign.getState().state!, funds: 0 } });
    await user.click(screen.getByRole('button', { name: /^ações$/i }));
    await waitFor(() => expect(screen.getByText(/ações estratégicas e finanças/i)).toBeInTheDocument());

    const executar = screen.getAllByText('Executar');
    expect(executar[0]).toBeDisabled();
  });

  it('configurações são persistidas no armazenamento', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /configurações/i }));
    await waitFor(() => expect(screen.getByText(/preferências/i)).toBeInTheDocument());

    const checkbox = screen.getByRole('checkbox', { name: /desativar todos os sons/i });
    await user.click(checkbox);
    expect(useCampaign.getState().settings.muted).toBe(true);
  });

  it('apuração exibe simulação fictícia e aviso legal', async () => {
    const user = userEvent.setup();
    render(<App />);
    await startCampaign(user);

    useCampaign.getState().finishElection();
    await waitFor(() => expect(screen.getByText(/apuração eleitoral simulada/i)).toBeInTheDocument());
    expect(screen.getAllByText(/fictícia/i).length).toBeGreaterThan(0);
    expect(useCampaign.getState().state!.electionResult).not.toBeNull();
  });

  it('final é exibido após a apuração e registrado no progresso global', async () => {
    const user = userEvent.setup();
    render(<App />);
    await startCampaign(user);

    useCampaign.getState().finishElection();
    await waitFor(() => expect(useCampaign.getState().state!.ending).toBeTruthy());

    const endingView = screen.getAllByRole('button', { name: /ver desfecho da campanha/i })[0];
    if (endingView) {
      await user.click(endingView);
      await waitFor(() => expect(screen.getByText(/fim de campanha/i)).toBeInTheDocument());
    }
    expect(useCampaign.getState().meta.campaignsPlayed).toBeGreaterThanOrEqual(1);
    expect(useCampaign.getState().meta.endings.length).toBeGreaterThanOrEqual(1);
  });

  it('campanha salva pode ser continuada', async () => {
    const user = userEvent.setup();
    render(<App />);
    await startCampaign(user);

    const saved = useCampaign.getState().state!;
    useCampaign.setState({ view: 'menu', state: null, saveAvailable: true });

    await user.click(await screen.findByRole('button', { name: /continuar campanha/i }));
    await waitFor(() => expect(useCampaign.getState().state?.seed).toBe(saved.seed));
    expect(screen.getByText(/comitê barreto/i)).toBeInTheDocument();
  });

  it('painel bloqueia confirmação destrutiva com cancelar', async () => {
    const user = userEvent.setup();
    render(<App />);
    await startCampaign(user);

    useCampaign.getState().advanceDays(50);
    await waitFor(() => expect(screen.getAllByText(/semana final/i).length).toBeGreaterThan(0));

    await user.click(screen.getByRole('button', { name: /retirar candidatura/i }));
    const dialog = await screen.findByRole('dialog', { name: /retirar a candidatura/i });
    await user.click(within(dialog).getByRole('button', { name: /cancelar/i }));
    expect(useCampaign.getState().state!.ending).toBeNull();
  });

  it('apuração só libera no último dia e exige confirmação', async () => {
    const user = userEvent.setup();
    render(<App />);
    await startCampaign(user);

    // Semana final, mas missão 5 pendente e antes do último dia: sem apuração.
    useCampaign.getState().advanceDays(50);
    await waitFor(() => expect(screen.getAllByText(/semana final/i).length).toBeGreaterThan(0));
    expect(screen.queryByRole('button', { name: /encerrar campanha e apurar/i })).toBeNull();

    // Último dia: o botão aparece e a confirmação pode ser recusada.
    useCampaign.getState().advanceDays(6);
    await user.click(await screen.findByRole('button', { name: /encerrar campanha e apurar/i }));
    const cancelDialog = await screen.findByRole('dialog', { name: /encerrar a campanha e apurar/i });
    await user.click(within(cancelDialog).getByRole('button', { name: /cancelar/i }));
    expect(useCampaign.getState().state!.phase).not.toBe('ended');

    // Confirmando, a campanha encerra e a apuração é gravada.
    await user.click(screen.getByRole('button', { name: /encerrar campanha e apurar/i }));
    const confirmDialog = await screen.findByRole('dialog', { name: /encerrar a campanha e apurar/i });
    await user.click(within(confirmDialog).getByRole('button', { name: /apurar agora/i }));
    await waitFor(() => expect(useCampaign.getState().state!.phase).toBe('ended'));
    expect(useCampaign.getState().state!.electionResult).not.toBeNull();
  });

  it('clique rápido demais não toma duas decisões seguidas', async () => {
    const user = userEvent.setup();
    // Estado posicionado no nó "linha" da Missão 3 (nós encadeados de escolha).
    const base = createCampaignState({ seed: 3, difficulty: 'normal' });
    const emLinha: CampaignState = {
      ...base,
      missions: {
        ...base.missions,
        m3: { ...base.missions.m3, status: 'active', started: true, currentNode: 'linha' },
      },
    };
    useCampaign.setState({ view: 'missao', state: emLinha });
    render(<App />);

    await user.click(screen.getByRole('button', { name: /linha jurídica estrita/i }));
    // O nó avançou para "imprensa"; o clique imediato seguinte é ignorado.
    await user.click(screen.getByRole('button', { name: /parte é autêntica/i }));

    const s = useCampaign.getState().state!;
    expect(s.missions.m3.currentNode).toBe('imprensa');
    expect(s.decisions.filter((d) => d.mission === 'm3')).toHaveLength(1);
  });
});
