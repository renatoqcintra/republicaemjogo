import { REGIONS } from '@/game/data/regions';
import type { CampaignState, RegionId } from '@/game/types';

interface Props {
  state: CampaignState;
  selected: RegionId;
  onSelect: (id: RegionId) => void;
}

const SHAPES: Record<RegionId, string> = {
  vam: '40,110 210,80 240,170 200,260 70,250 40,180',
  plc: '240,170 330,120 400,170 370,250 260,260 200,260',
  sle: '330,120 400,60 540,90 560,190 400,170',
  cvm: '200,260 260,260 370,250 430,330 260,380 140,340',
  isb: '',
};

const ISLANDS = [
  { cx: 512, cy: 292, r: 20 },
  { cx: 548, cy: 322, r: 13 },
  { cx: 498, cy: 342, r: 9 },
];

const LABELS: Record<RegionId, { x: number; y: number }> = {
  vam: { x: 138, y: 172 },
  plc: { x: 300, y: 200 },
  sle: { x: 452, y: 122 },
  cvm: { x: 288, y: 312 },
  isb: { x: 520, y: 300 },
};

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

/** Cor do mapa: vermelho (adversário) → cinza (indecisos) → verde (jogador). */
export function regionColor(player: number, opponent: number): string {
  const total = Math.max(1, player + opponent);
  const t = Math.min(1, Math.max(0, (player - 20) / 60));
  const r = lerp(178, 53, t);
  const g = lerp(82, 120, t);
  const b = lerp(72, 95, t);
  void total;
  return `rgb(${r}, ${g}, ${b})`;
}

export function RegionMap({ state, selected, onSelect }: Props) {
  return (
    <svg className="map-svg" viewBox="0 0 600 420" role="group" aria-label="Mapa eleitoral da República">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {REGIONS.filter((r) => r.id !== 'isb').map((region) => {
        const rs = state.regions[region.id];
        return (
          <polygon
            key={region.id}
            className={`map-region ${selected === region.id ? 'selected' : ''}`}
            points={SHAPES[region.id]}
            fill={regionColor(rs.player, rs.opponent)}
            tabIndex={0}
            role="button"
            aria-label={`${region.name}: apoio ${Math.round(rs.player)}%, adversário ${Math.round(rs.opponent)}%`}
            onClick={() => onSelect(region.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(region.id);
              }
            }}
          >
            <title>{`${region.name} — você ${Math.round(rs.player)}% · adversário ${Math.round(rs.opponent)}%`}</title>
          </polygon>
        );
      })}

      {ISLANDS.map((island, i) => {
        const rs = state.regions.isb;
        return (
          <circle
            key={i}
            className={`map-region ${selected === 'isb' ? 'selected' : ''}`}
            cx={island.cx}
            cy={island.cy}
            r={island.r}
            fill={regionColor(rs.player, rs.opponent)}
            tabIndex={0}
            role="button"
            aria-label={`${REGIONS[4].name}: apoio ${Math.round(rs.player)}%`}
            onClick={() => onSelect('isb')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect('isb');
              }
            }}
          >
            <title>{`Ilhas de Santa Brígida — você ${Math.round(rs.player)}%`}</title>
          </circle>
        );
      })}

      {REGIONS.map((region) => (
        <text
          key={`label-${region.id}`}
          x={LABELS[region.id].x}
          y={LABELS[region.id].y}
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize="17"
          fill="rgba(255,255,255,0.85)"
          pointerEvents="none"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
        >
          {region.code}
        </text>
      ))}
    </svg>
  );
}
