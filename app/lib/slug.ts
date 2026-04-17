export function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function centsToEuros(cents: number): string {
  return (cents / 100).toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function eurosToCents(euros: string | number): number {
  const n = typeof euros === 'string' ? parseFloat(euros.replace(',', '.')) : euros;
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}
