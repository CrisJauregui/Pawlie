"use client";

import { CalendarOff } from "lucide-react";
import { Button, Input } from "@/components/ui";
import {
  DIAS_SEMANA,
  diaDeLaSemana,
  horasDisponibles,
  hoyColombia,
  textoFranjas,
} from "@/lib/reservas";
import type { CuidadorDetalle, ServicioCuidador } from "@/lib/types";

// "14:30" → "2:30 p. m."
function horaLegible(hora: string): string {
  const [h, m] = hora.split(":").map(Number);
  const sufijo = h < 12 ? "a. m." : "p. m.";
  const hora12 = h % 12 === 0 ? 12 : h % 12;
  return `${hora12}:${String(m).padStart(2, "0")} ${sufijo}`;
}

// Paso 4 (pantalla 13): elegir la fecha y la hora de inicio dentro de la
// disponibilidad del cuidador.
export function PasoFecha({
  cuidador,
  servicio,
  fecha,
  hora,
  onCambiar,
  onContinuar,
  onVolver,
}: {
  cuidador: CuidadorDetalle;
  servicio: ServicioCuidador;
  fecha: string;
  hora: string;
  onCambiar: (fecha: string, hora: string) => void;
  onContinuar: () => void;
  onVolver: () => void;
}) {
  const horas = horasDisponibles(
    fecha,
    cuidador.availability,
    servicio.durationMinutes,
  );

  const atiendeEseDia =
    fecha !== "" &&
    cuidador.availability.some((f) => f.dayOfWeek === diaDeLaSemana(fecha));

  // Días de la semana en los que atiende, para orientar al dueño.
  const dias = new Set(cuidador.availability.map((f) => f.dayOfWeek));
  const diasQueAtiende = [...dias]
    .sort((a, b) => a - b)
    .map((dia) => {
      const franjas = cuidador.availability.filter((f) => f.dayOfWeek === dia);
      return `${DIAS_SEMANA[dia]} ${textoFranjas(franjas)}`;
    });

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-extrabold">¿Cuándo lo necesitas?</h2>

      <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm">
        <Input
          id="fecha-reserva"
          label="Fecha"
          type="date"
          min={hoyColombia()}
          value={fecha}
          // Al cambiar de día se borra la hora: puede no existir ese día.
          onChange={(e) => onCambiar(e.target.value, "")}
        />

        {diasQueAtiende.length > 0 ? (
          <p className="text-sm text-tinta-suave">
            {cuidador.name.split(" ")[0]} atiende: {diasQueAtiende.join(" · ")}
          </p>
        ) : (
          <p className="text-sm text-tinta-suave">
            Este cuidador todavía no ha registrado su disponibilidad.
          </p>
        )}

        {fecha && horas.length === 0 && (
          <p className="flex items-center gap-3 rounded-2xl bg-naranja-claro p-4 text-sm font-semibold text-naranja-oscuro">
            <CalendarOff size={20} className="shrink-0" />
            {atiendeEseDia
              ? "No quedan horas disponibles ese día para este servicio. Prueba con otra fecha."
              : "El cuidador no atiende ese día. Elige otra fecha."}
          </p>
        )}

        {horas.length > 0 && (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-semibold">
              Hora de inicio
            </legend>
            <div className="flex flex-wrap gap-2">
              {horas.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => onCambiar(fecha, h)}
                  className={`rounded-full border-2 px-4 py-2 text-sm font-bold ${
                    hora === h
                      ? "border-naranja bg-naranja text-white"
                      : "border-crema-oscuro bg-white text-tinta-suave hover:border-naranja"
                  }`}
                >
                  {horaLegible(h)}
                </button>
              ))}
            </div>
          </fieldset>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secundario" onClick={onVolver}>
          Volver
        </Button>
        <Button type="button" disabled={!fecha || !hora} onClick={onContinuar}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
