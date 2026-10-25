// Los horarios de disponibilidad se guardan en hora local de Colombia
// (UTC-5, sin horario de verano), pero el servidor puede correr en UTC (Render, Railway).
// Estas funciones convierten una fecha a su día y hora locales sin depender
// de la zona horaria del servidor.
const COLOMBIA_OFFSET_MS = -5 * 60 * 60 * 1000;

export interface LocalParts {
  // Fecha local en formato YYYY-MM-DD.
  dateKey: string;
  // 0 = domingo ... 6 = sábado (igual que availability.day_of_week).
  dayOfWeek: number;
  // Hora local en formato HH:MM (ordena bien como texto).
  time: string;
}

export function toLocalParts(date: Date): LocalParts {
  const shifted = new Date(date.getTime() + COLOMBIA_OFFSET_MS);
  const hours = String(shifted.getUTCHours()).padStart(2, '0');
  const minutes = String(shifted.getUTCMinutes()).padStart(2, '0');
  return {
    dateKey: shifted.toISOString().slice(0, 10),
    dayOfWeek: shifted.getUTCDay(),
    time: `${hours}:${minutes}`,
  };
}

// Día de la semana de una fecha "YYYY-MM-DD" (sin hora). NaN si la fecha no existe.
export function dayOfWeekOfDate(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}
