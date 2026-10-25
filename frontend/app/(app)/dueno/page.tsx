"use client";

import {
  ArrowRight,
  CalendarDays,
  CircleCheck,
  PawPrint,
  Plus,
  Search,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Alerta, Cargando, Frase } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { formatoFechaCorta, formatoHora } from "@/lib/formato";
import { FotoMascota } from "@/components/FotoMascota";
import { edadMascota } from "@/lib/mascotas";
import { ESTADOS_ACTIVOS } from "@/lib/solicitudes";
import type { Mascota, ResumenDueno, ResumenSolicitud } from "@/lib/types";
import { useSesion } from "@/store/sesion";

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "listo"; mascotas: Mascota[]; resumen: ResumenDueno };

// Dashboard del dueño (pantalla 5).
export default function DashboardDuenoPage() {
  const usuario = useSesion((s) => s.usuario);
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });

  useEffect(() => {
    Promise.all([api<Mascota[]>("/pets"), api<ResumenDueno>("/owner/summary")])
      .then(([mascotas, resumen]) =>
        setEstado({ tipo: "listo", mascotas, resumen }),
      )
      .catch((err: unknown) =>
        setEstado({
          tipo: "error",
          mensaje:
            err instanceof ApiError
              ? err.message
              : "No se pudo cargar tu información",
        }),
      );
  }, []);

  const primerNombre = usuario?.name.split(" ")[0] ?? "";

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold">
            ¡Hola, <span className="text-naranja">{primerNombre}</span>!
          </h1>
          <p className="mt-1 text-tinta-suave">
            Aquí tienes un resumen de la actividad de tus mascotas
          </p>
        </div>
        <Frase>Amor en cada pata</Frase>
      </section>

      {estado.tipo === "cargando" && <Cargando />}
      {estado.tipo === "error" && <Alerta>{estado.mensaje}</Alerta>}
      {estado.tipo === "listo" && (
        <Contenido mascotas={estado.mascotas} resumen={estado.resumen} />
      )}
    </div>
  );
}

function Contenido({
  mascotas,
  resumen,
}: {
  mascotas: Mascota[];
  resumen: ResumenDueno;
}) {
  // Próximo servicio activo de cada mascota (el más cercano en el tiempo).
  const proximoPorMascota = new Map<string, ResumenSolicitud>();
  [...resumen.requests]
    .filter((r) => ESTADOS_ACTIVOS.includes(r.status))
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
    .forEach((r) => {
      if (!proximoPorMascota.has(r.pet.id)) proximoPorMascota.set(r.pet.id, r);
    });

  return (
    <>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Resumen
          icono={PawPrint}
          valor={resumen.pets}
          titulo={
            resumen.pets === 1 ? "Mascota registrada" : "Mascotas registradas"
          }
          texto="Cada una hace la vida más especial."
          color="bg-naranja-claro text-naranja"
        />
        <Resumen
          icono={CalendarDays}
          valor={resumen.activeRequests}
          titulo={
            resumen.activeRequests === 1
              ? "Solicitud activa"
              : "Solicitudes activas"
          }
          texto="Pendientes, confirmadas o en curso."
          color="bg-lila-claro text-lila"
        />
        <Resumen
          icono={CircleCheck}
          valor={resumen.completedServices}
          titulo="Servicios completados"
          texto="¡Cada uno fue una aventura!"
          color="bg-verde-claro text-verde"
        />
      </section>

      <section className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/buscar"
          className="flex items-center justify-center gap-2 rounded-full bg-naranja px-7 py-3 font-bold text-white shadow-sm hover:bg-naranja-oscuro"
        >
          <Search size={20} /> Buscar cuidadores
        </Link>
        <Link
          href="/mascotas"
          className="flex items-center justify-center gap-2 rounded-full border-2 border-naranja px-7 py-3 font-bold text-naranja hover:bg-naranja-claro"
        >
          <Plus size={20} /> Agregar mascota
        </Link>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-extrabold">
            <PawPrint size={20} className="fill-current text-naranja" />
            Mis mascotas
          </h2>
          <Link
            href="/mascotas"
            className="flex items-center gap-1 text-sm font-bold text-tinta-suave hover:text-naranja"
          >
            Ver todas <ArrowRight size={16} />
          </Link>
        </div>

        {mascotas.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-crema-oscuro p-10 text-center text-tinta-suave">
            <PawPrint size={32} className="text-icono" />
            Todavía no tienes mascotas registradas.
            <Link href="/mascotas" className="font-bold text-naranja">
              Agrega la primera
            </Link>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {mascotas.map((m) => (
              <TarjetaMascota
                key={m.id}
                mascota={m}
                proximo={proximoPorMascota.get(m.id)}
              />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function Resumen({
  icono: Icono,
  valor,
  titulo,
  texto,
  color,
}: {
  icono: LucideIcon;
  valor: number;
  titulo: string;
  texto: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-sm">
      <span
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${color}`}
      >
        <Icono size={26} strokeWidth={1.75} />
      </span>
      <div>
        <p className="text-3xl font-extrabold">{valor}</p>
        <p className="font-bold">{titulo}</p>
        <p className="text-xs text-tinta-suave">{texto}</p>
      </div>
    </div>
  );
}

function TarjetaMascota({
  mascota,
  proximo,
}: {
  mascota: Mascota;
  proximo?: ResumenSolicitud;
}) {
  return (
    <li className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm">
      <FotoMascota mascota={mascota} tamanoIcono={56} className="h-44 w-full" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-xl font-extrabold">{mascota.name}</p>
          <p className="flex items-center gap-1.5 text-tinta-suave">
            <PawPrint size={14} className="fill-current text-naranja" />
            {mascota.breed ?? mascota.species}
            {mascota.age !== null && ` · ${edadMascota(mascota.age)}`}
          </p>
        </div>

        {proximo ? (
          <Link
            href={`/servicios/${proximo.id}`}
            className="flex gap-3 rounded-2xl bg-crema p-4 hover:bg-crema-oscuro"
          >
            <CalendarDays size={18} className="mt-0.5 shrink-0 text-naranja" />
            <span className="text-sm">
              <span className="block text-xs font-bold uppercase tracking-wide text-tinta-suave">
                Próximo servicio
              </span>
              <span className="block font-bold">{proximo.service.name}</span>
              <span className="block text-tinta-suave">
                {formatoFechaCorta(proximo.startAt)} ·{" "}
                {formatoHora(proximo.startAt)}
              </span>
              <span className="block text-xs text-tinta-suave">
                Con {proximo.caregiver.name}
              </span>
            </span>
          </Link>
        ) : (
          <p className="rounded-2xl bg-crema p-4 text-sm text-tinta-suave">
            Sin servicios programados.
          </p>
        )}
      </div>
    </li>
  );
}
