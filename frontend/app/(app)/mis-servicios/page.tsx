"use client";

import { Clock, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Alerta, Button, Cargando, Input, TituloPagina } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { formatoPesos } from "@/lib/formato";
import { NOMBRES_SERVICIO } from "@/lib/reservas";
import type { Servicio, TipoServicio } from "@/lib/types";

interface Formulario {
  name: string;
  type: TipoServicio;
  price: string;
  durationMinutes: string;
}

const FORMULARIO_VACIO: Formulario = {
  name: "",
  type: "PASEO",
  price: "",
  durationMinutes: "60",
};

// Mis servicios del cuidador (pantalla 16): crear, editar, activar/desactivar
// y eliminar los servicios que ofrece.
export default function MisServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  // null = formulario cerrado; "nuevo" = crear; otro valor = id del servicio que se edita.
  const [editando, setEditando] = useState<string | "nuevo" | null>(null);
  const [form, setForm] = useState<Formulario>(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    api<Servicio[]>("/services")
      .then(setServicios)
      .catch((err: unknown) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "No se pudieron cargar tus servicios",
        ),
      );
  }, []);

  function abrirNuevo() {
    setForm(FORMULARIO_VACIO);
    setEditando("nuevo");
    setError(null);
  }

  function abrirEdicion(s: Servicio) {
    setForm({
      name: s.name,
      type: s.type,
      price: String(Number(s.price)),
      durationMinutes: String(s.durationMinutes),
    });
    setEditando(s.id);
    setError(null);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    const precio = Number(form.price);
    const duracion = Number(form.durationMinutes);
    if (!form.name.trim()) return setError("Escribe el nombre del servicio");
    if (!Number.isFinite(precio) || precio <= 0) {
      return setError("El precio debe ser mayor a 0");
    }
    if (!Number.isInteger(duracion) || duracion < 15 || duracion > 1440) {
      return setError("La duración debe ser de 15 a 1440 minutos");
    }

    setGuardando(true);
    setError(null);
    const cuerpo = {
      name: form.name.trim(),
      type: form.type,
      price: precio,
      durationMinutes: duracion,
    };
    try {
      if (editando === "nuevo") {
        const creado = await api<Servicio>("/services", {
          method: "POST",
          body: cuerpo,
        });
        setServicios((lista) => [creado, ...(lista ?? [])]);
      } else {
        const actualizado = await api<Servicio>(`/services/${editando}`, {
          method: "PATCH",
          body: cuerpo,
        });
        setServicios((lista) =>
          (lista ?? []).map((s) => (s.id === actualizado.id ? actualizado : s)),
        );
      }
      setEditando(null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo guardar el servicio",
      );
    } finally {
      setGuardando(false);
    }
  }

  async function alternarActivo(s: Servicio) {
    setError(null);
    try {
      const actualizado = await api<Servicio>(`/services/${s.id}`, {
        method: "PATCH",
        body: { isActive: !s.isActive },
      });
      setServicios((lista) =>
        (lista ?? []).map((x) => (x.id === actualizado.id ? actualizado : x)),
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo actualizar el servicio",
      );
    }
  }

  async function eliminar(s: Servicio) {
    if (!confirm(`¿Eliminar "${s.name}"?`)) return;
    setError(null);
    try {
      await api(`/services/${s.id}`, { method: "DELETE" });
      setServicios((lista) => (lista ?? []).filter((x) => x.id !== s.id));
    } catch (err) {
      // 409: ya tiene solicitudes → el mensaje del backend sugiere desactivarlo.
      setError(
        err instanceof ApiError ? err.message : "No se pudo eliminar el servicio",
      );
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <TituloPagina
          titulo="Mis servicios"
          subtitulo="Define qué ofreces, a qué precio y cuánto dura cada servicio."
        />
        {editando === null && (
          <Button type="button" onClick={abrirNuevo}>
            <Plus size={18} /> Nuevo servicio
          </Button>
        )}
      </div>

      {error && <Alerta>{error}</Alerta>}

      {editando !== null && (
        <form
          onSubmit={guardar}
          className="grid gap-4 rounded-3xl bg-white p-6 shadow-sm sm:grid-cols-2"
        >
          <h2 className="text-xl font-extrabold sm:col-span-2">
            {editando === "nuevo" ? "Nuevo servicio" : "Editar servicio"}
          </h2>
          <Input
            id="nombre"
            label="Nombre"
            placeholder="Ej: Paseo de 1 hora"
            maxLength={100}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Tipo
            <select
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as TipoServicio })
              }
              className="rounded-2xl border-2 border-crema-oscuro bg-white px-4 py-3 text-base font-normal outline-none focus:border-naranja"
            >
              {(Object.keys(NOMBRES_SERVICIO) as TipoServicio[]).map((t) => (
                <option key={t} value={t}>
                  {NOMBRES_SERVICIO[t]}
                </option>
              ))}
            </select>
          </label>
          <Input
            id="precio"
            label="Precio (COP)"
            type="number"
            min={1}
            step={1000}
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <Input
            id="duracion"
            label="Duración (minutos)"
            type="number"
            min={15}
            max={1440}
            step={15}
            value={form.durationMinutes}
            onChange={(e) =>
              setForm({ ...form, durationMinutes: e.target.value })
            }
          />
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando…" : "Guardar"}
            </Button>
            <Button
              type="button"
              variant="secundario"
              disabled={guardando}
              onClick={() => setEditando(null)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {!servicios && !error && <Cargando />}
      {servicios && servicios.length === 0 && editando === null && (
        <p className="rounded-3xl border-2 border-dashed border-crema-oscuro p-10 text-center text-tinta-suave">
          Todavía no has creado servicios. Los dueños solo pueden reservar los
          que publiques aquí.
        </p>
      )}

      <ul className="grid gap-5 md:grid-cols-2">
        {servicios?.map((s) => (
          <li
            key={s.id}
            className={`flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-sm ${
              s.isActive ? "" : "opacity-70"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-lila">
                  {NOMBRES_SERVICIO[s.type]}
                </p>
                <p className="text-xl font-extrabold">{s.name}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  s.isActive
                    ? "bg-verde-claro text-verde"
                    : "bg-crema-oscuro text-tinta-suave"
                }`}
              >
                {s.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
            <p className="flex items-center gap-2 text-tinta-suave">
              <Clock size={16} className="text-naranja" />
              {s.durationMinutes} min
            </p>
            <p className="text-2xl font-extrabold text-naranja">
              {formatoPesos(Number(s.price))}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => abrirEdicion(s)}
                className="flex items-center gap-2 rounded-full border-2 border-naranja px-4 py-2 text-sm font-bold text-naranja hover:bg-naranja-claro"
              >
                <Pencil size={14} /> Editar
              </button>
              <button
                onClick={() => alternarActivo(s)}
                className="rounded-full border-2 border-lila px-4 py-2 text-sm font-bold text-lila hover:bg-lila-claro"
              >
                {s.isActive ? "Desactivar" : "Activar"}
              </button>
              <button
                onClick={() => eliminar(s)}
                className="flex items-center gap-2 rounded-full border-2 border-error px-4 py-2 text-sm font-bold text-error hover:bg-error/10"
              >
                <Trash2 size={14} /> Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
