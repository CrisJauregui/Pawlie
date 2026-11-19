"use client";

import { Clock, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Alerta, Button, Cargando, Input, TituloPagina } from "@/components/ui";
import { useListaApi } from "@/hooks/useListaApi";
import { api, ApiError } from "@/lib/api";
import { DIAS_SEMANA } from "@/lib/reservas";
import type { FranjaDisponible } from "@/lib/types";

// La semana empieza el lunes, como en el prototipo (0 = domingo va al final).
const ORDEN_DIAS = [1, 2, 3, 4, 5, 6, 0];

// Postgres devuelve "HH:MM:SS"; en pantalla y en la API usamos "HH:MM".
function hhmm(hora: string): string {
  return hora.slice(0, 5);
}

// Calendario de disponibilidad (cuidador): franjas semanales en las que
// recibe reservas. El backend (AvailabilityController) solo deja entrar al
// rol CAREGIVER y rechaza franjas que se crucen en el mismo día (409).
export default function DisponibilidadPage() {
  const {
    datos: franjas,
    setDatos: setFranjas,
    error,
    setError,
  } = useListaApi<FranjaDisponible>(
    "/availability",
    "No se pudo cargar tu disponibilidad",
  );
  const [dia, setDia] = useState(1);
  const [inicio, setInicio] = useState("08:00");
  const [fin, setFin] = useState("12:00");
  const [guardando, setGuardando] = useState(false);

  // Agrega un horario con POST /availability. Si se cruza con otro del
  // mismo día, el backend responde 409 y mostramos su mensaje.
  async function agregar(e: React.FormEvent) {
    e.preventDefault();
    if (inicio >= fin) {
      return setError("La hora de inicio debe ser anterior a la hora de fin");
    }
    setGuardando(true);
    setError(null);
    try {
      const creada = await api<FranjaDisponible>("/availability", {
        method: "POST",
        body: { dayOfWeek: dia, startTime: inicio, endTime: fin },
      });
      setFranjas((lista) => [...(lista ?? []), creada]);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo guardar el horario",
      );
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(f: FranjaDisponible) {
    setError(null);
    try {
      await api(`/availability/${f.id}`, { method: "DELETE" });
      setFranjas((lista) => (lista ?? []).filter((x) => x.id !== f.id));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo eliminar el horario",
      );
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <TituloPagina
        titulo="Mi disponibilidad"
        subtitulo="Indica los días y horas en que puedes recibir reservas cada semana."
      />

      {error && <Alerta>{error}</Alerta>}

      <form
        onSubmit={agregar}
        className="grid items-end gap-4 rounded-3xl bg-white p-6 shadow-sm sm:grid-cols-4"
      >
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Día
          <select
            id="dia"
            value={dia}
            onChange={(e) => setDia(Number(e.target.value))}
            className="rounded-2xl border-2 border-crema-oscuro bg-white px-4 py-3 text-base font-normal outline-none focus:border-naranja"
          >
            {ORDEN_DIAS.map((d) => (
              <option key={d} value={d}>
                {DIAS_SEMANA[d]}
              </option>
            ))}
          </select>
        </label>
        <Input
          id="inicio"
          label="Desde"
          type="time"
          value={inicio}
          onChange={(e) => setInicio(e.target.value)}
        />
        <Input
          id="fin"
          label="Hasta"
          type="time"
          value={fin}
          onChange={(e) => setFin(e.target.value)}
        />
        <Button type="submit" disabled={guardando}>
          <Plus size={18} /> {guardando ? "Agregando…" : "Agregar"}
        </Button>
      </form>

      {!franjas && !error && <Cargando />}
      {franjas && franjas.length === 0 && (
        <p className="rounded-3xl border-2 border-dashed border-crema-oscuro p-10 text-center text-tinta-suave">
          Todavía no tienes horarios. Los dueños solo pueden reservarte en los
          días y horas que agregues aquí.
        </p>
      )}

      {franjas && franjas.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ORDEN_DIAS.map((d) => {
            const delDia = franjas
              .filter((f) => f.dayOfWeek === d)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));
            return (
              <li
                key={d}
                className={`flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-sm ${
                  delDia.length === 0 ? "opacity-60" : ""
                }`}
              >
                <p className="text-lg font-extrabold">{DIAS_SEMANA[d]}</p>
                {delDia.length === 0 && (
                  <p className="text-sm text-tinta-suave">Sin horarios</p>
                )}
                {delDia.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-naranja-claro px-4 py-2"
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <Clock size={16} className="text-naranja" />
                      {hhmm(f.startTime)} – {hhmm(f.endTime)}
                    </span>
                    <button
                      onClick={() => eliminar(f)}
                      aria-label={`Eliminar horario ${DIAS_SEMANA[d]} ${hhmm(f.startTime)}`}
                      className="text-error hover:opacity-70"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
