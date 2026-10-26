"use client";

import { CalendarDays, Clock, StickyNote, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FotoMascota } from "@/components/FotoMascota";
import { Alerta, Cargando, TituloPagina } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { formatoFechaCorta, formatoHora, formatoPesos } from "@/lib/formato";
import { ESTADOS_ACTIVOS, EstadoBadge } from "@/lib/solicitudes";
import type { Rol, Solicitud } from "@/lib/types";
import { useSesion } from "@/store/sesion";

const FILTROS = [
  { id: "pendientes", texto: "Pendientes" },
  { id: "activas", texto: "Activas" },
  { id: "historial", texto: "Historial" },
] as const;

type Filtro = (typeof FILTROS)[number]["id"];

function coincide(s: Solicitud, filtro: Filtro): boolean {
  if (filtro === "pendientes") return s.status === "PENDIENTE";
  if (filtro === "activas") return ESTADOS_ACTIVOS.includes(s.status);
  return !ESTADOS_ACTIVOS.includes(s.status);
}

// Solicitudes (pantallas 15 a 17).
// - Cuidador: recibe las solicitudes y puede aceptarlas o rechazarlas.
// - Dueño: ve las que envió y puede cancelarlas.
export default function SolicitudesPage() {
  const rol = useSesion((s) => s.usuario?.role);
  const [solicitudes, setSolicitudes] = useState<Solicitud[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("pendientes");

  useEffect(() => {
    api<Solicitud[]>("/requests/me")
      .then(setSolicitudes)
      .catch((err: unknown) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "No se pudieron cargar las solicitudes",
        ),
      );
  }, []);

  // Cambia el estado de una solicitud y actualiza la lista sin recargar.
  async function cambiarEstado(
    id: string,
    accion: "accept" | "reject" | "cancel",
  ) {
    setError(null);
    try {
      const cambio = await api<{ id: string; status: Solicitud["status"] }>(
        `/requests/${id}/${accion}`,
        { method: "PATCH" },
      );
      setSolicitudes((lista) =>
        (lista ?? []).map((s) =>
          s.id === id ? { ...s, status: cambio.status } : s,
        ),
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo actualizar la solicitud",
      );
    }
  }

  const visibles = (solicitudes ?? []).filter((s) => coincide(s, filtro));

  return (
    <div className="flex flex-col gap-8">
      <TituloPagina
        titulo="Solicitudes"
        subtitulo={
          rol === "CAREGIVER"
            ? "Revisa las solicitudes que recibes y responde a los dueños."
            : "Aquí están las solicitudes que has enviado a los cuidadores."
        }
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
            {solicitudes && (
              <span className="ml-2 opacity-70">
                {solicitudes.filter((s) => coincide(s, f.id)).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && <Alerta>{error}</Alerta>}
      {!solicitudes && !error && <Cargando />}
      {solicitudes && visibles.length === 0 && (
        <p className="rounded-3xl border-2 border-dashed border-crema-oscuro p-10 text-center text-tinta-suave">
          No hay solicitudes en esta sección.
          {rol === "OWNER" && (
            <>
              {" "}
              <Link href="/buscar" className="font-bold text-naranja">
                Buscar cuidadores
              </Link>
            </>
          )}
        </p>
      )}

      <ul className="flex flex-col gap-4">
        {visibles.map((s) => (
          <Fila key={s.id} solicitud={s} rol={rol} onAccion={cambiarEstado} />
        ))}
      </ul>
    </div>
  );
}

function Fila({
  solicitud: s,
  rol,
  onAccion,
}: {
  solicitud: Solicitud;
  rol: Rol | undefined;
  onAccion: (id: string, accion: "accept" | "reject" | "cancel") => void;
}) {
  const esCuidador = rol === "CAREGIVER";
  const puedeCancelar = s.status === "PENDIENTE" || s.status === "ACEPTADA";

  return (
    <li className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <FotoMascota
          mascota={s.pet}
          tamanoIcono={32}
          className="h-18 w-18 shrink-0 rounded-2xl"
        />
        <div className="flex-1">
          <EstadoBadge estado={s.status} />
          <p className="mt-1 text-lg font-extrabold">{s.pet.name}</p>
          <p className="text-tinta-suave">{s.service.name}</p>
          <p className="text-xs text-tinta-suave">
            {esCuidador
              ? `Dueño: ${s.owner.name}`
              : `Con ${s.caregiver.name}`}
          </p>
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
      </div>

      {s.notes && (
        <p className="flex gap-2 rounded-2xl bg-crema p-4 text-sm text-tinta-suave">
          <StickyNote size={16} className="mt-0.5 shrink-0 text-naranja" />
          {s.notes}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {esCuidador && s.status === "PENDIENTE" && (
          <>
            <button
              onClick={() => onAccion(s.id, "accept")}
              className="rounded-full bg-verde px-6 py-2.5 font-bold text-white hover:opacity-90"
            >
              Aceptar
            </button>
            <button
              onClick={() => {
                if (confirm("¿Rechazar esta solicitud?")) {
                  onAccion(s.id, "reject");
                }
              }}
              className="rounded-full border-2 border-error px-6 py-2.5 font-bold text-error hover:bg-error/10"
            >
              Rechazar
            </button>
          </>
        )}
        {!esCuidador && puedeCancelar && (
          <button
            onClick={() => {
              if (confirm("¿Cancelar esta solicitud?")) {
                onAccion(s.id, "cancel");
              }
            }}
            className="rounded-full border-2 border-error px-6 py-2.5 font-bold text-error hover:bg-error/10"
          >
            Cancelar solicitud
          </button>
        )}
        {!esCuidador && (
          <Link
            href={`/servicios/${s.id}`}
            className="rounded-full border-2 border-naranja px-6 py-2.5 font-bold text-naranja hover:bg-naranja-claro"
          >
            Ver estado
          </Link>
        )}
      </div>
    </li>
  );
}
