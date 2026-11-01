export function formatDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export const pct = (n: number) => `${Math.round(n * 100)}%`;
