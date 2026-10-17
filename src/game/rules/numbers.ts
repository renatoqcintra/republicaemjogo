/** Utilitários numéricos compartilhados pelas regras do jogo. */

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Arredonda para 1 casa decimal, evitando -0 e lixo de ponto flutuante. */
export function round1(value: number): number {
  const r = Math.round(value * 10) / 10;
  return Object.is(r, -0) ? 0 : r;
}

export function round2(value: number): number {
  const r = Math.round(value * 100) / 100;
  return Object.is(r, -0) ? 0 : r;
}

export function percent(value: number): string {
  return `${round1(value).toFixed(1)}%`;
}

export function formatMoney(millions: number): string {
  return `R$ ${millions.toFixed(0)} mi`;
}

export function signed(value: number, suffix = ''): string {
  const v = round1(value);
  return `${v > 0 ? '+' : ''}${v}${suffix}`;
}
