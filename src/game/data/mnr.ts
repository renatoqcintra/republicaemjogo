import type { CampaignState } from '../types';

/**
 * Movimento Nacional de Renovação (MNR) — organização de Rafael Sampaio.
 *
 * O MNR é uma TERCEIRA VIA REVOLUCIONÁRIA de direita: mais à direita que o
 * PRN na pauta, mas recusa apoiar Fábio ou Leandro — disputa os dois polos,
 * não se soma a nenhum. É distinto do PRN (partido de Fábio) e de qualquer
 * partido: movimento independente com núcleos regionais, militância e agenda
 * própria. Sua posição diante da campanha é um ESTÁGIO NARRATIVO (flags), não
 * um indicador numérico — e não se confunde com relação pessoal (relações) nem
 * com compatibilidade programática (`CharacterDef.alignment`):
 *
 * - ausência da flag  → independente (nenhum apoio a nenhum candidato);
 * - 'dialogo'         → conversa acontece, sem compromisso eleitoral;
 * - 'acordo'          → acordo tático de pautas pontuais, sem apoio eleitoral;
 * - 'apoio'           → apoio eleitoral público declarado (exceção raríssima);
 * - 'alianca'         → cooperação política ampla, com cláusulas (raríssima);
 * - 'distante'        → rompimento/afastamento momentâneo.
 */
export type MnrApoio = 'dialogo' | 'acordo' | 'apoio' | 'alianca' | 'distante';

/** Estágio organizacional dos núcleos (capacidade de mobilização). */
export type MnrEstrutura = 'incipiente' | 'organizada' | 'nacional';

/** Coesão das bases: disposição dos militantes em seguir a direção do MNR. */
export type MnrCoesao = 'coesa' | 'tensa' | 'fragmentada';

type Flags = CampaignState['flags'];

/** Posição do MNR frente à campanha — por padrão: terceira via independente. */
export function mnrPosition(flags: Flags): string {
  switch (flags['mnrApoio']) {
    case 'dialogo':
      return 'Diálogo aberto com a campanha — sem apoio eleitoral';
    case 'acordo':
      return 'Acordo programático tático sobre pautas pontuais — sem apoio eleitoral';
    case 'apoio':
      return 'Apoio público declarado — exceção votada pela direção do MNR';
    case 'alianca':
      return 'Aliança política formal com a campanha (sem filiação partidária)';
    case 'distante':
      return 'Distanciado da campanha';
    default:
      return 'Independente — terceira via de direita, sem apoio a nenhum candidato';
  }
}

/** Organização do MNR: estrutura de mobilização + disposição das bases. */
export function mnrOrganization(flags: Flags): string {
  const estrutura =
    flags['mnrEstrutura'] === 'nacional'
      ? 'Rede nacional com militância ativa'
      : flags['mnrEstrutura'] === 'organizada'
        ? 'Núcleos regionais organizados'
        : 'Núcleos em formação';
  const coesao =
    flags['mnrCoesao'] === 'fragmentada'
      ? 'bases fragmentadas'
      : flags['mnrCoesao'] === 'tensa'
        ? 'bases tensas'
        : 'bases coesas';
  return `${estrutura} · ${coesao}`;
}
