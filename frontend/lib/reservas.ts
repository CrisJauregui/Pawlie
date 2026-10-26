import type { FranjaDisponible, TipoServicio } from "./types";

// Utilidades de las pantallas de buscar y reservar.
// Las franjas de disponibilidad del cuidador están en hora de Colombia
// (UTC-5, sin horario de verano), igual que en el backend.

export const NOMBRES_SERVICIO: Record<TipoServicio, string> = {
  PASEO: "Paseo",
  CUIDADO_EN_CASA: "Cuidado en casa",
  BANO: "Baño",
};

export const DIAS_SEMANA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

// Fecha de hoy en Colombia, "YYYY-MM-DD" (sirve como mínimo del selector de fecha).
export function hoyColombia(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Bogota",
  });
}

// Día de la semana de una fecha "YYYY-MM-DD" (0 = domingo ... 6 = sábado).
export function diaDeLaSemana(fecha: string): number {
  return new Date(`${fecha}T00:00:00Z`).getUTCDay();
}

// "14:30" → minutos desde la medianoche (870).
function aMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function aHora(minutos: number): string {
  const h = String(Math.floor(minutos / 60)).padStart(2, "0");
  const m = String(minutos % 60).padStart(2, "0");
  return `${h}:${m}`;
}

// Fecha y hora de Colombia → instante ISO que espera el backend.
export function aInstanteIso(fecha: string, hora: string): string {
  return new Date(`${fecha}T${hora}:00-05:00`).toISOString();
}

// Horas de inicio posibles ese día: cada 30 minutos, de modo que el servicio
// termine dentro de una franja del cuidador y empiece en el futuro.
// No sabe qué horas ya están reservadas: si se cruza con otra reserva, el
// backend responde 409 y la pantalla lo avisa.
export function horasDisponibles(
  fecha: string,
  franjas: FranjaDisponible[],
  duracionMinutos: number,
): string[] {
  if (!fecha) return [];
  const dia = diaDeLaSemana(fecha);
  const ahora = Date.now();
  const horas: string[] = [];
  for (const franja of franjas.filter((f) => f.dayOfWeek === dia)) {
    const fin = aMinutos(franja.endTime);
    for (
      let inicio = aMinutos(franja.startTime);
      inicio + duracionMinutos <= fin;
      inicio += 30
    ) {
      const hora = aHora(inicio);
      if (new Date(aInstanteIso(fecha, hora)).getTime() > ahora) {
        horas.push(hora);
      }
    }
  }
  return horas;
}

// Resume las franjas de un día: "8:00 – 12:00 y 14:00 – 18:00".
export function textoFranjas(franjas: FranjaDisponible[]): string {
  return franjas
    .map((f) => `${f.startTime.replace(/^0/, "")} – ${f.endTime}`)
    .join(" y ");
}
