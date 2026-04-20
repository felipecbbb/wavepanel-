export function toLocalIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function startOfDay(date: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);
}

export function endOfDay(date: string): Date {
  const d = startOfDay(date);
  d.setDate(d.getDate() + 1);
  return d;
}

export function addDays(date: string, days: number): string {
  const d = startOfDay(date);
  d.setDate(d.getDate() + days);
  return toLocalIsoDate(d);
}

export function formatSpanishDate(date: string): string {
  const d = startOfDay(date);
  return d.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatSpanishTime(isoTs: string): string {
  return new Date(isoTs).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function combineDateAndTime(date: string, time: string): string {
  // Produces a local-ISO string the server will accept for timestamptz
  return `${date}T${time}:00`;
}

// Lunes de la semana que contiene `date` (formato YYYY-MM-DD).
export function startOfWeekIso(date: string): string {
  const d = startOfDay(date);
  const day = d.getDay() || 7; // domingo=0 → 7; lunes=1
  d.setDate(d.getDate() - (day - 1));
  return toLocalIsoDate(d);
}

// 7 días YYYY-MM-DD empezando desde `startDate`.
export function weekDays(startDate: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
}

// Etiqueta corta de día, ej: "lun 14 abr".
export function formatShortDayLabel(date: string): string {
  const d = startOfDay(date);
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
}
