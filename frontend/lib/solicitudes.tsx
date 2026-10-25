import type { EstadoSolicitud } from "./types";

export const ESTADOS: Record<
  EstadoSolicitud,
  { texto: string; clases: string }
> = {
  PENDIENTE: {
    texto: "Pendiente",
    clases: "bg-naranja-claro text-naranja-oscuro",
  },
  ACEPTADA: { texto: "Confirmada", clases: "bg-verde-claro text-verde" },
  EN_CURSO: { texto: "En curso", clases: "bg-lila-claro text-lila" },
  FINALIZADA: { texto: "Finalizada", clases: "bg-verde-claro text-verde" },
  RECHAZADA: { texto: "Rechazada", clases: "bg-error/10 text-error" },
  CANCELADA: { texto: "Cancelada", clases: "bg-crema-oscuro text-tinta-suave" },
};

export const ESTADOS_ACTIVOS: EstadoSolicitud[] = [
  "PENDIENTE",
  "ACEPTADA",
  "EN_CURSO",
];

export function EstadoBadge({ estado }: { estado: EstadoSolicitud }) {
  const { texto, clases } = ESTADOS[estado];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${clases}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {texto}
    </span>
  );
}
