"use client";

import { MapPin, Search, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Alerta, Cargando, Input } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { formatoPesos, iniciales } from "@/lib/formato";
import { hoyColombia, NOMBRES_SERVICIO } from "@/lib/reservas";
import type { Cuidador, CuidadorDetalle, TipoServicio } from "@/lib/types";

const TIPOS: { id: TipoServicio | ""; texto: string }[] = [
  { id: "", texto: "Todos" },
  { id: "PASEO", texto: NOMBRES_SERVICIO.PASEO },
  { id: "CUIDADO_EN_CASA", texto: NOMBRES_SERVICIO.CUIDADO_EN_CASA },
  { id: "BANO", texto: NOMBRES_SERVICIO.BANO },
];

// Paso 1: buscar cuidadores con filtros (ciudad, tipo de servicio y fecha) y elegir uno.
export function PasoCuidador({
  elegido,
  onElegir,
}: {
  elegido: CuidadorDetalle | null;
  onElegir: (cuidador: CuidadorDetalle) => void;
}) {
  const [ciudad, setCiudad] = useState("");
  const [tipo, setTipo] = useState<TipoServicio | "">("");
  const [fecha, setFecha] = useState("");
  const [lista, setLista] = useState<Cuidador[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [abriendo, setAbriendo] = useState<string | null>(null);

  // Se vuelve a buscar cuando cambia un filtro (la ciudad con una pequeña espera
  // para no consultar en cada letra).
  useEffect(() => {
    let vigente = true;
    const espera = setTimeout(() => {
      const params = new URLSearchParams();
      if (ciudad.trim()) params.set("city", ciudad.trim());
      if (tipo) params.set("type", tipo);
      if (fecha) params.set("date", fecha);
      const consulta = params.toString();
      api<Cuidador[]>(`/caregivers${consulta ? `?${consulta}` : ""}`)
        .then((datos) => {
          if (!vigente) return;
          setError(null);
          setLista(datos);
        })
        .catch((err: unknown) => {
          if (!vigente) return;
          setError(
            err instanceof ApiError
              ? err.message
              : "No se pudo buscar cuidadores",
          );
        });
    }, 300);
    return () => {
      vigente = false;
      clearTimeout(espera);
    };
  }, [ciudad, tipo, fecha]);

  // Al elegir se pide el perfil completo (trae también la disponibilidad).
  async function elegir(id: string) {
    setAbriendo(id);
    try {
      onElegir(await api<CuidadorDetalle>(`/caregivers/${id}`));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo abrir el perfil",
      );
      setAbriendo(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 rounded-3xl bg-white p-5 shadow-sm sm:grid-cols-2">
        <Input
          id="ciudad"
          label="Ciudad o barrio"
          icono={MapPin}
          placeholder="Ej: Cali"
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
        />
        <Input
          id="fecha"
          label="Fecha (opcional)"
          type="date"
          min={hoyColombia()}
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          {TIPOS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTipo(t.id)}
              className={`rounded-full border-2 px-5 py-2 text-sm font-bold ${
                tipo === t.id
                  ? "border-lila bg-lila text-white"
                  : "border-crema-oscuro bg-white text-tinta-suave hover:border-lila"
              }`}
            >
              {t.texto}
            </button>
          ))}
        </div>
      </section>

      {error && <Alerta>{error}</Alerta>}
      {!lista && !error && <Cargando />}
      {lista && lista.length === 0 && (
        <p className="flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-crema-oscuro p-10 text-center text-tinta-suave">
          <Search size={28} className="text-icono" />
          No encontramos cuidadores con esos filtros. Prueba con otra ciudad,
          tipo de servicio o fecha.
        </p>
      )}

      <ul className="grid gap-5 lg:grid-cols-2">
        {lista?.map((c) => (
          <li
            key={c.id}
            className={`flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm ${
              elegido?.id === c.id ? "ring-2 ring-naranja" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-naranja bg-naranja-claro text-lg font-extrabold text-naranja-oscuro">
                {iniciales(c.name)}
              </span>
              <div className="flex-1">
                <p className="text-lg font-extrabold">{c.name}</p>
                <p className="flex items-center gap-1.5 text-sm text-tinta-suave">
                  <MapPin size={14} /> {c.city}
                </p>
                <p className="flex items-center gap-1.5 text-sm">
                  <Star size={14} className="fill-naranja text-naranja" />
                  {c.rating.average !== null ? (
                    <>
                      <span className="font-bold">{c.rating.average}</span>
                      <span className="text-tinta-suave">
                        ({c.rating.count}{" "}
                        {c.rating.count === 1 ? "reseña" : "reseñas"})
                      </span>
                    </>
                  ) : (
                    <span className="text-tinta-suave">Sin reseñas todavía</span>
                  )}
                </p>
              </div>
            </div>

            {c.bio && <p className="text-sm text-tinta-suave">{c.bio}</p>}
            <p className="text-xs font-bold text-tinta-suave">
              {c.yearsExperience}{" "}
              {c.yearsExperience === 1 ? "año" : "años"} de experiencia
            </p>

            <ul className="flex flex-wrap gap-2">
              {c.services.map((s) => (
                <li
                  key={s.id}
                  className="rounded-full bg-lila-claro px-3 py-1 text-xs font-bold text-lila"
                >
                  {s.name} · {formatoPesos(s.price)}
                </li>
              ))}
              {c.services.length === 0 && (
                <li className="text-xs text-tinta-suave">
                  Aún no publica servicios
                </li>
              )}
            </ul>

            <button
              type="button"
              disabled={abriendo !== null || c.services.length === 0}
              onClick={() => elegir(c.id)}
              className="rounded-full bg-naranja px-6 py-2.5 font-bold text-white hover:bg-naranja-oscuro disabled:opacity-50"
            >
              {abriendo === c.id ? "Abriendo…" : "Elegir cuidador"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
