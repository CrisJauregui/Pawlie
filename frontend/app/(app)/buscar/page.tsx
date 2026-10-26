"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { TituloPagina } from "@/components/ui";
import type { CuidadorDetalle, Mascota, ServicioCuidador } from "@/lib/types";
import { PasoCuidador } from "./PasoCuidador";
import { PasoFecha } from "./PasoFecha";
import { PasoMascota } from "./PasoMascota";
import { PasoResumen } from "./PasoResumen";
import { PasoServicio } from "./PasoServicio";

const PASOS = ["Cuidador", "Mascota", "Servicio", "Fecha y hora", "Resumen"];

// Lo que el dueño va eligiendo en el asistente.
export interface Reserva {
  cuidador: CuidadorDetalle | null;
  mascota: Mascota | null;
  servicio: ServicioCuidador | null;
  fecha: string; // "YYYY-MM-DD"
  hora: string; // "HH:MM"
}

const RESERVA_VACIA: Reserva = {
  cuidador: null,
  mascota: null,
  servicio: null,
  fecha: "",
  hora: "",
};

// Buscar cuidadores y reservar (pantallas 9 a 14): asistente de 5 pasos.
export default function BuscarPage() {
  const [paso, setPaso] = useState(0);
  const [reserva, setReserva] = useState<Reserva>(RESERVA_VACIA);

  const actualizar = (cambios: Partial<Reserva>) =>
    setReserva((anterior) => ({ ...anterior, ...cambios }));

  return (
    <div className="flex flex-col gap-8">
      <TituloPagina
        titulo="Reservar un servicio"
        subtitulo="Encuentra al cuidador ideal y reserva en pocos pasos."
      />

      <ol className="flex items-center gap-2 overflow-x-auto pb-1">
        {PASOS.map((nombre, i) => (
          <li key={nombre} className="flex shrink-0 items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-extrabold ${
                i < paso
                  ? "bg-verde text-white"
                  : i === paso
                    ? "bg-naranja text-white"
                    : "bg-crema-oscuro text-tinta-suave"
              }`}
            >
              {i < paso ? <Check size={16} /> : i + 1}
            </span>
            <span
              className={`text-sm font-bold ${
                i === paso ? "text-tinta" : "text-tinta-suave"
              } ${i === paso ? "" : "hidden sm:inline"}`}
            >
              {nombre}
            </span>
            {i < PASOS.length - 1 && (
              <span className="mx-1 hidden h-0.5 w-6 bg-crema-oscuro sm:block" />
            )}
          </li>
        ))}
      </ol>

      {paso === 0 && (
        <PasoCuidador
          elegido={reserva.cuidador}
          onElegir={(cuidador) => {
            // Si cambia de cuidador, el servicio y el horario elegidos ya no valen.
            if (cuidador.id !== reserva.cuidador?.id) {
              actualizar({ cuidador, servicio: null, fecha: "", hora: "" });
            }
            setPaso(1);
          }}
        />
      )}
      {paso === 1 && (
        <PasoMascota
          elegida={reserva.mascota}
          onElegir={(mascota) => {
            actualizar({ mascota });
            setPaso(2);
          }}
          onVolver={() => setPaso(0)}
        />
      )}
      {paso === 2 && reserva.cuidador && (
        <PasoServicio
          cuidador={reserva.cuidador}
          elegido={reserva.servicio}
          onElegir={(servicio) => {
            // Otro servicio dura distinto: hay que volver a elegir la hora.
            if (servicio.id !== reserva.servicio?.id) {
              actualizar({ servicio, hora: "" });
            }
            setPaso(3);
          }}
          onVolver={() => setPaso(1)}
        />
      )}
      {paso === 3 && reserva.cuidador && reserva.servicio && (
        <PasoFecha
          cuidador={reserva.cuidador}
          servicio={reserva.servicio}
          fecha={reserva.fecha}
          hora={reserva.hora}
          onCambiar={(fecha, hora) => actualizar({ fecha, hora })}
          onContinuar={() => setPaso(4)}
          onVolver={() => setPaso(2)}
        />
      )}
      {paso === 4 &&
        reserva.cuidador &&
        reserva.mascota &&
        reserva.servicio &&
        reserva.hora && (
          <PasoResumen
            cuidador={reserva.cuidador}
            mascota={reserva.mascota}
            servicio={reserva.servicio}
            fecha={reserva.fecha}
            hora={reserva.hora}
            onCambiarHorario={() => setPaso(3)}
            onVolver={() => setPaso(3)}
          />
        )}
    </div>
  );
}
