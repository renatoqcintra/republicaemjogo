import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Portrait } from '@/ui/components/Portrait';
import { CHARACTERS } from '@/game/data/characters';

/** Penteados desenhados "colados" no contorno do crânio. */
const FIT_STYLES = new Set(['short', 'back', 'bun', 'long']);

describe('retratos: cabelo nunca sai da cabeça', () => {
  it('todo retrato declara o aro (clipPath) e aplica o clip ao cabelo frontal', () => {
    for (const c of CHARACTERS) {
      const { container, unmount } = render(<Portrait spec={c.portrait} label={c.name} />);
      expect(container.querySelector('svg clipPath'), c.id).not.toBeNull();
      expect(container.querySelector('svg g[clip-path]'), c.id).not.toBeNull();
      unmount();
    }
  });

  it('o aro tem id único por retrato (sem colisão entre os 16 SVGs)', () => {
    const { container } = render(
      <div>
        {CHARACTERS.map((c) => (
          <Portrait key={c.id} spec={c.portrait} label={c.name} />
        ))}
      </div>,
    );
    const ids = [...container.querySelectorAll('svg clipPath')].map((el) => el.id);
    expect(ids).toHaveLength(16);
    expect(new Set(ids).size).toBe(16);
    expect(ids.every((id) => /^hairclip[A-Za-z0-9]+$/.test(id))).toBe(true);
  });

  it('penteados ajustados ao crânio começam na lateral da cabeça (x ≈ 24–30)', () => {
    for (const c of CHARACTERS) {
      if (!FIT_STYLES.has(c.portrait.hairStyle)) continue;
      const { container, unmount } = render(<Portrait spec={c.portrait} label={c.name} />);
      const d = container.querySelector('svg g[clip-path] path')?.getAttribute('d') ?? '';
      const start = /^M(-?[\d.]+)/.exec(d);
      expect(start, `${c.id}: caminho do cabelo`).not.toBeNull();
      const startX = Number(start![1]);
      // Antes da correção os cantos começavam em x ≈ 17–23, muito fora do rosto.
      expect(startX, `${c.id}/x inicial do cabelo`).toBeGreaterThanOrEqual(23.5);
      expect(startX, `${c.id}/x inicial do cabelo`).toBeLessThanOrEqual(30);
      // E a massa cobre a coroa: o caminho sobe acima do topo do crânio (y ≤ 14.5).
      const coords = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
      const ys = coords.filter((_, i) => i % 2 === 1);
      expect(Math.min(...ys), `${c.id}/coroa coberta`).toBeLessThanOrEqual(14.5);
      unmount();
    }
  });
});
