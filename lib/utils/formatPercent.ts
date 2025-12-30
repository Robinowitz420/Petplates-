export function formatPercent(value: unknown): string {
  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? parseFloat(value)
        : NaN;

  if (!Number.isFinite(n)) return '0%';

  return `${Math.round(n)}%`;
}
