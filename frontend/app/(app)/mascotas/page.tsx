"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { FotoMascota } from "@/components/FotoMascota";
import { Alerta, Button, Cargando, Input, TituloPagina } from "@/components/ui";
import { useListaApi } from "@/hooks/useListaApi";
import { api, ApiError } from "@/lib/api";
import { edadMascota } from "@/lib/mascotas";
import type { Mascota } from "@/lib/types";

interface Formulario {
  name: string;
  species: string;
  breed: string;
  age: string;
  notes: string;
}

const FORMULARIO_VACIO: Formulario = {
  name: "",
  species: "Perro",
  breed: "",
  age: "",
  notes: "",
};

const ESPECIES = ["Perro", "Gato", "Conejo", "Otra"];

// Mis mascotas (dueño): ver, registrar, editar y eliminar sus mascotas.
// El backend (PetsController) solo deja entrar al rol OWNER y solo devuelve
// las mascotas del dueño con sesión.
export default function MascotasPage() {
  const {
    datos: mascotas,
    setDatos: setMascotas,
    error,
    setError,
  } = useListaApi<Mascota>("/pets", "No se pudieron cargar tus mascotas");
  // null = formulario cerrado; "nueva" = crear; otro valor = id de la mascota que se edita.
  const [editando, setEditando] = useState<string | "nueva" | null>(null);
  const [form, setForm] = useState<Formulario>(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState<string | null>(null);

  function abrirNueva() {
    setForm(FORMULARIO_VACIO);
    setEditando("nueva");
    setError(null);
    setExito(null);
  }

  function abrirEdicion(m: Mascota) {
    setForm({
      name: m.name,
      species: m.species,
      breed: m.breed ?? "",
      age: m.age === null ? "" : String(m.age),
      notes: m.notes ?? "",
    });
    setEditando(m.id);
    setError(null);
    setExito(null);
  }

  // Valida lo básico antes de enviar y luego crea (POST /pets) o edita
  // (PATCH /pets/:id). La lista se actualiza en pantalla con setMascotas,
  // sin volver a pedirla, y se muestra un mensaje de éxito.
  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    const edad = form.age.trim() === "" ? undefined : Number(form.age);
    if (!form.name.trim()) return setError("Escribe el nombre de tu mascota");
    if (!form.species.trim()) return setError("Escribe la especie");
    if (edad !== undefined && (!Number.isInteger(edad) || edad < 0 || edad > 40)) {
      return setError("La edad debe ser un número entero entre 0 y 40");
    }

    setGuardando(true);
    setError(null);
    const cuerpo = {
      name: form.name.trim(),
      species: form.species.trim(),
      breed: form.breed.trim() || undefined,
      age: edad,
      notes: form.notes.trim() || undefined,
    };
    try {
      if (editando === "nueva") {
        const creada = await api<Mascota>("/pets", {
          method: "POST",
          body: cuerpo,
        });
        setMascotas((lista) => [creada, ...(lista ?? [])]);
        setExito(`${creada.name} quedó registrada`);
      } else {
        const actualizada = await api<Mascota>(`/pets/${editando}`, {
          method: "PATCH",
          body: cuerpo,
        });
        setMascotas((lista) =>
          (lista ?? []).map((m) => (m.id === actualizada.id ? actualizada : m)),
        );
        setExito(`Guardamos los cambios de ${actualizada.name}`);
      }
      setEditando(null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo guardar la mascota",
      );
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(m: Mascota) {
    if (!confirm(`¿Eliminar a ${m.name}?`)) return;
    setError(null);
    setExito(null);
    try {
      await api(`/pets/${m.id}`, { method: "DELETE" });
      setMascotas((lista) => (lista ?? []).filter((x) => x.id !== m.id));
      setExito(`${m.name} fue eliminada`);
    } catch (err) {
      // 409: tiene solicitudes asociadas → el backend explica por qué.
      setError(
        err instanceof ApiError ? err.message : "No se pudo eliminar la mascota",
      );
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <TituloPagina
          titulo="Mis mascotas"
          subtitulo="Registra a tus peludos para poder reservarles un cuidador."
        />
        {editando === null && (
          <Button type="button" onClick={abrirNueva}>
            <Plus size={18} /> Nueva mascota
          </Button>
        )}
      </div>

      {error && <Alerta>{error}</Alerta>}
      {exito && (
        <p
          role="status"
          className="rounded-2xl bg-verde-claro px-4 py-3 text-sm font-semibold text-verde"
        >
          {exito}
        </p>
      )}

      {editando !== null && (
        <form
          onSubmit={guardar}
          className="grid gap-4 rounded-3xl bg-white p-6 shadow-sm sm:grid-cols-2"
        >
          <h2 className="text-xl font-extrabold sm:col-span-2">
            {editando === "nueva" ? "Nueva mascota" : "Editar mascota"}
          </h2>
          <Input
            id="nombre"
            label="Nombre"
            placeholder="Ej: Max"
            maxLength={100}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Especie
            <select
              id="especie"
              value={ESPECIES.includes(form.species) ? form.species : "Otra"}
              onChange={(e) => setForm({ ...form, species: e.target.value })}
              className="rounded-2xl border-2 border-crema-oscuro bg-white px-4 py-3 text-base font-normal outline-none focus:border-naranja"
            >
              {ESPECIES.map((esp) => (
                <option key={esp} value={esp}>
                  {esp}
                </option>
              ))}
            </select>
          </label>
          <Input
            id="raza"
            label="Raza (opcional)"
            placeholder="Ej: Golden Retriever"
            maxLength={100}
            value={form.breed}
            onChange={(e) => setForm({ ...form, breed: e.target.value })}
          />
          <Input
            id="edad"
            label="Edad en años (opcional)"
            type="number"
            min={0}
            max={40}
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />
          <label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2">
            Notas para el cuidador (opcional)
            <textarea
              id="notas"
              rows={3}
              maxLength={1000}
              placeholder="Alergias, medicamentos, carácter…"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="rounded-2xl border-2 border-crema-oscuro bg-white px-4 py-3 text-base font-normal outline-none focus:border-naranja"
            />
          </label>
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

      {!mascotas && !error && <Cargando />}
      {mascotas && mascotas.length === 0 && editando === null && (
        <p className="rounded-3xl border-2 border-dashed border-crema-oscuro p-10 text-center text-tinta-suave">
          Todavía no has registrado mascotas. Agrega la primera para poder
          reservar un cuidador.
        </p>
      )}

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {mascotas?.map((m) => {
          const edad = edadMascota(m.age);
          return (
            <li
              key={m.id}
              className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm"
            >
              <FotoMascota mascota={m} className="h-44 w-full" />
              <div className="flex flex-1 flex-col gap-2 p-5">
                <p className="text-xl font-extrabold">{m.name}</p>
                <p className="text-tinta-suave">
                  {[m.species, m.breed, edad].filter(Boolean).join(" · ")}
                </p>
                {m.notes && (
                  <p className="text-sm text-tinta-suave">{m.notes}</p>
                )}
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => abrirEdicion(m)}
                    className="flex items-center gap-2 rounded-full border-2 border-naranja px-4 py-2 text-sm font-bold text-naranja hover:bg-naranja-claro"
                  >
                    <Pencil size={14} /> Editar
                  </button>
                  <button
                    onClick={() => eliminar(m)}
                    className="flex items-center gap-2 rounded-full border-2 border-error px-4 py-2 text-sm font-bold text-error hover:bg-error/10"
                  >
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
