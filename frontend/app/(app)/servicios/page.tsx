"use client";

import { CalendarDays, Clock, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Alerta, Cargando, TituloPagina } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { formatoFechaCorta, formatoHora, formatoPesos } from "@/lib/formato";
import { FotoMascota } from "@/components/FotoMascota";
import { ESTADOS_ACTIVOS, EstadoBadge } from "@/lib/solicitudes";
import type { ResumenDueno, ResumenSolicitud } from "@/lib/types";

const FILTROS = [
  { id: "activos", texto: "Activos" },
  { id: "finalizados", texto: "Finalizados" },
  { id: "todos", texto: "Todos" },
] as const;

type Filtro = (typeof FILTROS)[number]["id"];

// Mis servicios: entrada al estado, seguimiento y resumen final de cada solicitud.
export default function ServiciosPage() {
  const [solicitudes, setSolicitudes] = useState<ResumenSolicitud[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("activos");

  useEffect(() => {
    api<ResumenDueno>("/owner/summary")
      .then((r) => setSolicitudes(r.requests))
      .catch((err: unknown) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "No se pudieron cargar tus servicios",
        ),
      );
  }, []);

  const visibles = (solicitudes ?? []).filter((s) =>
    filtro === "todos"
      ? true
      : filtro === "activos"
        ? ESTADOS_ACTIVOS.includes(s.status)
        : !ESTADOS_ACTIVOS.includes(s.status),
  );

  return (
    <div className="flex flex-col gap-8">
      <TituloPagina
        titulo="Mis servicios"
        subtitulo="Sigue a tu mascota en tiempo real y revisa sus servicios anteriores."
      />

      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            className={`rounded-full border-2 px-5 py-2 text-sm font-bold ${
              filtro === f.id
                ? "border-lila bg-lila text-white"
                : "border-crema-oscuro bg-white text-tinta-suave hover:border-lila"
            }`}
          >
            {f.texto}
          </button>
        ))}
      </div>

      {error && <Alerta>{error}</Alerta>}
      {!solicitudes && !error && <Cargando />}
      {solicitudes && visibles.length === 0 && (
        <p className="rounded-3xl border-2 border-dashed border-crema-oscuro p-10 text-center text-tinta-suave">
          No tienes servicios en esta sección.{" "}
          <Link href="/buscar" className="font-bold text-naranja">
            Buscar cuidadores
          </Link>
        </p>
      )}

      <ul className="flex flex-col gap-4">
        {visibles.map((s) => (
          <Fila key={s.id} solicitud={s} />
        ))}
      </ul>
    </div>
  );
}

function Fila({ solicitud: s }: { solicitud: ResumenSolicitud }) {
  const accion =
    s.status === "EN_CURSO"
      ? {
          texto: "Seguir servicio",
          clases: "bg-lila text-white hover:bg-lila/90",
        }
      : s.status === "FINALIZADA"
        ? {
            texto: "Ver resumen",
            clases: "bg-naranja text-white hover:bg-naranja-oscuro",
          }
        : {
            texto: "Ver estado",
            clases:
              "border-2 border-naranja text-naranja hover:bg-naranja-claro",
          };

  return (
    <li className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm sm:flex-row sm:items-center">
      <FotoMascota
        mascota={s.pet}
        tamanoIcono={32}
        className="h-18 w-18 shrink-0 rounded-2xl"
      />
      <div className="flex-1">
        <EstadoBadge estado={s.status} />
        <p className="mt-1 text-lg font-extrabold">{s.pet.name}</p>
        <p className="text-tinta-suave">{s.service.name}</p>
        <p className="text-xs text-tinta-suave">Con {s.caregiver.name}</p>
      </div>
      <div className="flex flex-col gap-1 text-sm">
        <span className="flex items-center gap-2">
          <CalendarDays size={16} className="text-naranja" />
          {formatoFechaCorta(s.startAt)}
        </span>
        <span className="flex items-center gap-2">
          <Clock size={16} className="text-naranja" />
          {formatoHora(s.startAt)} – {formatoHora(s.endAt)}
        </span>
        <span className="flex items-center gap-2">
          <Wallet size={16} className="text-naranja" />
          {formatoPesos(s.totalPrice)}
        </span>
      </div>
      <Link
        href={`/servicios/${s.id}`}
        className={`rounded-full px-6 py-2.5 text-center font-bold ${accion.clases}`}
      >
        {accion.texto}
      </Link>
    </li>
  );
}
