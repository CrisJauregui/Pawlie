"use client";

import { CalendarDays, Clock, MapPin, PawPrint, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FotoMascota } from "@/components/FotoMascota";
import { Alerta, Button } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { formatoFechaLarga, formatoHora, formatoPesos } from "@/lib/formato";
import { aInstanteIso } from "@/lib/reservas";
import type {
  CuidadorDetalle,
  Mascota,
  ServicioCuidador,
  Solicitud,
} from "@/lib/types";

// Paso 5 (pantalla 14): revisar la solicitud y enviarla al cuidador.
export function PasoResumen({
  cuidador,
  mascota,
  servicio,
  fecha,
  hora,
  onCambiarHorario,
  onVolver,
}: {
  cuidador: CuidadorDetalle;
  mascota: Mascota;
  servicio: ServicioCuidador;
  fecha: string;
  hora: string;
  onCambiarHorario: () => void;
  onVolver: () => void;
}) {
  const router = useRouter();
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<{ texto: string; choque: boolean } | null>(
    null,
  );

  const inicio = aInstanteIso(fecha, hora);
  const fin = new Date(
    new Date(inicio).getTime() + servicio.durationMinutes * 60 * 1000,
  );

  async function enviar() {
    setEnviando(true);
    setError(null);
    try {
      const solicitud = await api<Solicitud>("/requests", {
        method: "POST",
        body: {
          caregiverId: cuidador.id,
          serviceId: servicio.id,
          petId: mascota.id,
          startAt: inicio,
          ...(notas.trim() ? { notes: notas.trim() } : {}),
        },
      });
      router.push(`/servicios/${solicitud.id}`);
    } catch (err) {
      setEnviando(false);
      setError(
        err instanceof ApiError
          ? // 409: otra reserva ocupa ese horario → se invita a elegir otra hora.
            { texto: err.message, choque: err.status === 409 }
          : { texto: "No se pudo enviar la solicitud", choque: false },
      );
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-extrabold">Resumen de tu solicitud</h2>

      <section className="flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <FotoMascota
            mascota={mascota}
            tamanoIcono={32}
            className="h-16 w-16 shrink-0 rounded-2xl"
          />
          <div>
            <p className="text-lg font-extrabold">{mascota.name}</p>
            <p className="flex items-center gap-1.5 text-sm text-tinta-suave">
              <PawPrint size={14} className="fill-current text-naranja" />
              {mascota.breed ?? mascota.species}
            </p>
          </div>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <Dato icono={MapPin} titulo="Cuidador">
            {cuidador.name} · {cuidador.city}
          </Dato>
          <Dato icono={PawPrint} titulo="Servicio">
            {servicio.name}
          </Dato>
          <Dato icono={CalendarDays} titulo="Fecha">
            <span className="capitalize">{formatoFechaLarga(inicio)}</span>
          </Dato>
          <Dato icono={Clock} titulo="Horario">
            {formatoHora(inicio)} – {formatoHora(fin)}
          </Dato>
        </dl>

        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Notas para el cuidador (opcional)
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Ej: Max es muy sociable. Por favor llevar agua."
            className="rounded-2xl border-2 border-crema-oscuro bg-white px-4 py-3 text-base font-normal outline-none focus:border-naranja"
          />
        </label>

        <p className="flex items-center justify-between rounded-2xl bg-crema p-4">
          <span className="flex items-center gap-2 font-bold">
            <Wallet size={18} className="text-naranja" /> Total
          </span>
          <span className="text-2xl font-extrabold text-naranja">
            {formatoPesos(servicio.price)}
          </span>
        </p>

        <p className="text-sm text-tinta-suave">
          El cuidador revisará tu solicitud y te avisará si la acepta. Puedes
          cancelarla mientras esté pendiente o aceptada.
        </p>
      </section>

      {error && <Alerta>{error.texto}</Alerta>}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="secundario"
          onClick={error?.choque ? onCambiarHorario : onVolver}
          disabled={enviando}
        >
          {error?.choque ? "Elegir otra hora" : "Volver"}
        </Button>
        <Button type="button" onClick={enviar} disabled={enviando}>
          {enviando ? "Enviando…" : "Enviar solicitud"}
        </Button>
      </div>
    </div>
  );
}

function Dato({
  icono: Icono,
  titulo,
  children,
}: {
  icono: typeof Clock;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <Icono size={18} className="mt-0.5 shrink-0 text-naranja" />
      <div>
        <dt className="text-xs font-bold uppercase tracking-wide text-tinta-suave">
          {titulo}
        </dt>
        <dd className="font-bold">{children}</dd>
      </div>
    </div>
  );
}
