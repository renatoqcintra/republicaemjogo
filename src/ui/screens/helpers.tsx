import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { character } from '@/game/data/characters';
import { ATTR_LABELS as ATTR_LABELS_PT } from '@/game/constants';
import { useCampaign } from '@/game/state/campaignStore';
import type { CampaignState, CharacterId } from '@/game/types';
import { Portrait } from '../components/Portrait';

/**
 * Hook para telas que exigem uma campanha ativa: redireciona ao menu se não
 * houver estado (evita efeito colateral durante o render).
 */
export function useCampaignState(): CampaignState | null {
  const state = useCampaign((s) => s.state);
  const setView = useCampaign((s) => s.setView);
  useEffect(() => {
    if (!state) setView('menu');
  }, [state, setView]);
  return state;
}

export function SectionTitle({ kicker, title, right }: { kicker?: string; title: string; right?: ReactNode }) {
  return (
    <div className="card-title">
      <div>
        {kicker && <div className="kicker">{kicker}</div>}
        <h2 style={{ margin: 0 }}>{title}</h2>
      </div>
      {right}
    </div>
  );
}

export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return (
    <div className="card center">
      <h3>{title}</h3>
      <p className="muted">{message}</p>
      {action}
    </div>
  );
}

export function CharacterChip({ id, size = 'sm' }: { id: CharacterId; size?: 'sm' | 'md' }) {
  const def = character(id);
  return (
    <span className="row" style={{ gap: 8 }}>
      <Portrait spec={def.portrait} size={size} label={def.name} />
      <span>
        <strong style={{ display: 'block', fontSize: size === 'sm' ? '0.85rem' : '1rem' }}>{def.name}</strong>
        <span className="tiny muted">{def.role}</span>
      </span>
    </span>
  );
}

export const ATTR_LABELS = ATTR_LABELS_PT as Record<string, string>;

export const ATTR_HINTS: Record<string, string> = {
  popularity: 'Quanto o eleitorado médio simpatiza com você. Afeta comícios, debates e adesão de indecisos.',
  influence: 'Peso político e capacidade de mobilizar estruturas. Desbloqueia ações caras e decisivas.',
  reputation: 'Credibilidade com imprensa e instituições. Reduz o dano de escândalos e amplifica esclarecimentos.',
  institutionalTrust:
    'Confiança de tribunais, servidores e elites técnicas. Baixa demais, a defesa do pai desmorona.',
  loyalty: 'Lealdade da sua rede de aliados. Abaixo de 40, a campanha pode ruir na derrota.',
};

export const FACTION_LABELS: Record<string, string> = {
  prn: 'Partido Renovador Nacional',
  ppv: 'Partido Popular do Vale',
  imprensa: 'Imprensa',
  judiciario: 'Judiciário',
  mercado: 'Mercado e doadores',
  movimentos: 'Movimentos sociais',
};

export const MISSION_STATUS_LABELS: Record<string, string> = {
  locked: 'Bloqueada',
  available: 'Disponível',
  active: 'Em andamento',
  done: 'Concluída',
  failed: 'Falhou',
};
