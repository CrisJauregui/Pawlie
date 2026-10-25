"use client";

import { MapPin, MessageCircle, PawPrint, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Frase, Tarjeta } from "@/components/ui";
import { formatoHora } from "@/lib/formato";
import type { Seguimiento } from "@/lib/types";
import { AvatarCuidador, FotoMascota } from "./partes";

// "hace 3 min"
function haceCuanto(fecha: string, ahora: number): string {
  const minutos = Math.max(0, Math.floor((ahora - Date.parse(fecha)) / 60000));
  if (minutos < 1) return "hace un momento";
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  return `hace ${horas} h`;
}

// "28:17" (o "1:05:09" si pasa de una hora)
function cronometro(desde: string, ahora: number): string {
  const total = Math.max(0, Math.floor((ahora - Date.parse(desde)) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const dos = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${dos(m)}:${dos(s)}` : `${dos(m)}:${dos(s)}`;
}

// Seguimiento del servicio en curso (pantalla 7).
// En lugar del mapa del Figma se muestran las actualizaciones reales que
// publica el cuidador (POST /requests/:id/updates).
export function VistaSeguimiento({ datos }: { datos: Seguimiento }) {
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const ultima = datos.updates.at(-1);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-4xl font-extrabold">
            Tu mascota está{" "}
            <span className="text-naranja">en buenas manos</span>
          </h1>
          <p className="mt-1 text-tinta-suave">
            Sigue el servicio de {datos.pet.name} en tiempo real
          </p>
        </div>
        <Frase>¡Todo va perfecto!</Frase>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-6">
          <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="relative">
              <FotoMascota mascota={datos.pet} className="h-60 w-full" />
              <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-verde shadow-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-verde" />
                En vivo
              </span>
            </div>
            <div className="p-5">
              <p className="font-extrabold">
                {ultima
                  ? ultima.message
                  : `${datos.pet.name} ya está con su cuidador`}
              </p>
              <p className="text-sm text-tinta-suave">
                Última actualización:{" "}
                {haceCuanto(ultima?.createdAt ?? datos.startAt, ahora)}
              </p>
            </div>
          </section>

          <Tarjeta className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Mini titulo="Servicio" valor={datos.service.name} />
            <Mini titulo="Mascota" valor={datos.pet.name} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-tinta-suave">
                Tiempo
              </p>
              <p className="font-mono text-2xl font-extrabold text-lila">
                {cronometro(datos.startAt, ahora)}
              </p>
            </div>
            <Mini titulo="Zona" valor={datos.caregiver.city} />
          </Tarjeta>
        </div>

        <div className="flex flex-col gap-6">
          <Tarjeta className="flex items-center gap-4">
            <AvatarCuidador nombre={datos.caregiver.name} />
            <div className="flex-1">
              <p className="text-lg font-extrabold">{datos.caregiver.name}</p>
              <p className="flex items-center gap-1 text-sm text-tinta-suave">
                <Star size={14} className="fill-naranja text-naranja" />
                Perfil verificado
              </p>
              <p className="flex items-center gap-1 text-xs text-tinta-suave">
                <MapPin size={12} /> {datos.caregiver.city}
              </p>
            </div>
            <MessageCircle size={22} className="text-icono" />
          </Tarjeta>

          <Tarjeta>
            <h2 className="text-lg font-extrabold">Estado del servicio</h2>
            <ol className="mt-5 flex flex-col">
              <Paso
                hecho
                titulo="Servicio iniciado"
                hora={formatoHora(datos.startAt)}
              />
              {datos.updates.map((u) => (
                <Paso
                  key={u.id}
                  hecho
                  titulo={u.message}
                  hora={formatoHora(u.createdAt)}
                />
              ))}
              <Paso
                titulo="Servicio completado"
                hora={`Hasta las ${formatoHora(datos.endAt)}`}
                ultimo
              />
            </ol>
          </Tarjeta>
        </div>
      </div>
    </div>
  );
}

function Mini({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-tinta-suave">
        {titulo}
      </p>
      <p className="font-bold">{valor}</p>
    </div>
  );
}

function Paso({
  titulo,
  hora,
  hecho = false,
  ultimo = false,
}: {
  titulo: string;
  hora: string;
  hecho?: boolean;
  ultimo?: boolean;
}) {
  return (
    <li className="flex gap-4">
      <span className="flex flex-col items-center">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full ${
            hecho ? "bg-verde text-white" : "bg-crema-oscuro text-tinta-suave"
          }`}
        >
          <PawPrint size={12} className="fill-current" />
        </span>
        {!ultimo && <span className="w-0.5 flex-1 bg-verde-claro" />}
      </span>
      <span className={`pb-5 ${hecho ? "" : "text-tinta-suave"}`}>
        <span className="block font-bold">{titulo}</span>
        <span className="text-xs text-tinta-suave">{hora}</span>
      </span>
    </li>
  );
}
