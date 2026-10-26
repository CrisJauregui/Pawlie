"use client";

import { Clock } from "lucide-react";
import { Button } from "@/components/ui";
import { formatoPesos } from "@/lib/formato";
import { NOMBRES_SERVICIO } from "@/lib/reservas";
import type { CuidadorDetalle, ServicioCuidador } from "@/lib/types";

function duracion(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}

// Paso 3 (pantalla 12): elegir el servicio del cuidador (solo los activos).
export function PasoServicio({
  cuidador,
  elegido,
  onElegir,
  onVolver,
}: {
  cuidador: CuidadorDetalle;
  elegido: ServicioCuidador | null;
  onElegir: (servicio: ServicioCuidador) => void;
  onVolver: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-extrabold">
        Servicios de {cuidador.name.split(" ")[0]}
      </h2>

      <ul className="grid gap-5 sm:grid-cols-2">
        {cuidador.services.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onElegir(s)}
              className={`flex h-full w-full flex-col gap-2 rounded-3xl bg-white p-6 text-left shadow-sm hover:shadow-md ${
                elegido?.id === s.id ? "ring-2 ring-naranja" : ""
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wide text-lila">
                {NOMBRES_SERVICIO[s.type]}
              </span>
              <span className="text-xl font-extrabold">{s.name}</span>
              <span className="flex items-center gap-2 text-tinta-suave">
                <Clock size={16} className="text-naranja" />
                {duracion(s.durationMinutes)}
              </span>
              <span className="text-2xl font-extrabold text-naranja">
                {formatoPesos(s.price)}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div>
        <Button type="button" variant="secundario" onClick={onVolver}>
          Volver
        </Button>
      </div>
    </div>
  );
}
