"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Alerta, Cargando } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { Mascota } from "@/lib/types";
import { useSesion } from "@/store/sesion";

type EstadoMascotas =
  | { tipo: "cargando" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "listo"; mascotas: Mascota[] };

const EMOJI_ESPECIE: Record<string, string> = {
  perro: "🐶",
  gato: "🐱",
};

// Dashboard del dueño.
export default function DashboardDuenoPage() {
  const usuario = useSesion((s) => s.usuario);
  const [estado, setEstado] = useState<EstadoMascotas>({ tipo: "cargando" });

  useEffect(() => {
    api<Mascota[]>("/pets")
      .then((mascotas) => setEstado({ tipo: "listo", mascotas }))
      .catch((err: unknown) =>
        setEstado({
          tipo: "error",
          mensaje:
            err instanceof ApiError
              ? err.message
              : "No se pudieron cargar tus mascotas",
        }),
      );
  }, []);

  const primerNombre = usuario?.name.split(" ")[0] ?? "";
  const totalMascotas = estado.tipo === "listo" ? estado.mascotas.length : "–";

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-3xl font-extrabold">¡Hola, {primerNombre}! 👋</h1>
        <p className="text-tinta-suave">¿Qué necesita tu mascota hoy?</p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Resumen titulo="Mascotas registradas" valor={totalMascotas} color="bg-naranja-claro" />
        {/* Se conectan cuando esté el módulo de solicitudes (Felipe). */}
        <Resumen titulo="Solicitudes activas" valor="–" color="bg-lila-claro" />
        <Resumen titulo="Servicios realizados" valor="–" color="bg-verde-claro" />
      </section>

      <section className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/buscar"
          className="rounded-full bg-naranja px-6 py-3 text-center font-bold text-white hover:bg-naranja-oscuro"
        >
          🔎 Buscar cuidadores
        </Link>
        <Link
          href="/mascotas"
          className="rounded-full border-2 border-naranja px-6 py-3 text-center font-bold text-naranja hover:bg-naranja-claro"
        >
          ➕ Agregar mascota
        </Link>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-extrabold">Mis mascotas</h2>
        {estado.tipo === "cargando" && <Cargando />}
        {estado.tipo === "error" && <Alerta>{estado.mensaje}</Alerta>}
        {estado.tipo === "listo" && estado.mascotas.length === 0 && (
          <p className="rounded-2xl bg-white p-6 text-center text-tinta-suave">
            Todavía no tienes mascotas registradas.{" "}
            <Link href="/mascotas" className="font-bold text-naranja">
              Agrega la primera
            </Link>
          </p>
        )}
        {estado.tipo === "listo" && estado.mascotas.length > 0 && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {estado.mascotas.map((m) => (
              <li key={m.id} className="flex items-center gap-4 rounded-2xl bg-white p-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-crema-oscuro text-3xl">
                  {EMOJI_ESPECIE[m.species.toLowerCase()] ?? "🐾"}
                </span>
                <div>
                  <p className="font-extrabold">{m.name}</p>
                  <p className="text-sm text-tinta-suave">
                    {[m.breed ?? m.species, m.age !== null ? `${m.age} años` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Resumen({
  titulo,
  valor,
  color,
}: {
  titulo: string;
  valor: number | string;
  color: string;
}) {
  return (
    <div className={`rounded-2xl p-5 ${color}`}>
      <p className="text-3xl font-extrabold">{valor}</p>
      <p className="text-sm font-semibold text-tinta-suave">{titulo}</p>
    </div>
  );
}
