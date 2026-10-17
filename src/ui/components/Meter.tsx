import { signed } from '@/game/rules/numbers';

interface Props {
  label: string;
  value: number;
  max?: number;
  variant?: 'green' | 'gold' | 'red' | 'blue';
  delta?: number;
  hint?: string;
}

export function Meter({ label, value, max = 100, variant = 'green', delta, hint }: Props) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="meter">
      <div className="meter-head">
        <span title={hint}>{label}</span>
        <span>
          {Math.round(value)}
          {delta !== undefined && delta !== 0 ? (
            <span className={delta > 0 ? 'small' : 'small'} style={{ marginLeft: 6, color: delta > 0 ? 'var(--green-3)' : 'var(--red-2)' }}>
              {signed(delta)}
            </span>
          ) : null}
        </span>
      </div>
      <div
        className="meter-track"
        role="meter"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label}: ${Math.round(value)} de ${max}`}
      >
        <div className={`meter-fill ${variant === 'gold' ? 'gold' : variant === 'red' ? 'red' : variant === 'blue' ? 'blue' : ''}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
