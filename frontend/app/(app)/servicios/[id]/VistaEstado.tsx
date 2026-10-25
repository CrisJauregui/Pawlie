import {
  CalendarDays,
  Check,
  CircleCheck,
  CircleX,
  Clock,
  Info,
  PawPrint,
  StickyNote,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { Tarjeta } from "@/components/ui";
import { formatoFechaLarga, formatoHora, formatoPesos } from "@/lib/formato";
import type { EstadoSolicitud, Seguimiento } from "@/lib/types";
import { Dato, Pareja } from "./partes";

const PASOS = ["Solicitud enviada", "Confirmada", "En curso", "Finalizada"];

const PASO_ACTUAL: Partial<Record<EstadoSolicitud, number>> = {
  PENDIENTE: 0,
  ACEPTADA: 1,
};

const ENCABEZADO: Record<
  string,
  { titulo: string; texto: string; aviso: string }
> = {
  PENDIENTE: {
    titulo: "¡Solicitud enviada!",
    texto: "Ahora solo espera. Te avisaremos cuando el cuidador confirme.",
    aviso:
      "El cuidador revisará tu solicitud. Puedes cancelarla sin costo mientras no haya empezado el servicio.",
  },
  ACEPTADA: {
    titulo: "¡Solicitud confirmada!",
    texto: "El cuidador aceptó tu solicitud. Todo listo para el servicio.",
    aviso:
      "Cuando el cuidador inicie el servicio podrás seguirlo en tiempo real desde aquí.",
  },
  RECHAZADA: {
    titulo: "Solicitud rechazada",
    texto: "El cuidador no puede atender esta solicitud.",
    aviso: "Puedes buscar otro cuidador disponible para la misma fecha.",
  },
  CANCELADA: {
    titulo: "Solicitud cancelada",
    texto: "Esta solicitud fue cancelada.",
    aviso: "Puedes crear una nueva solicitud cuando quieras.",
  },
};

// Estado de la solicitud (pantalla 6).
export function VistaEstado({ datos }: { datos: Seguimiento }) {
  const { titulo, texto, aviso } = ENCABEZADO[datos.status];
  const paso = PASO_ACTUAL[datos.status];
  const cerrada = paso === undefined;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col items-center gap-3 text-center">
        <span
          className={`flex h-20 w-20 items-center justify-center rounded-full ${
            cerrada
              ? "bg-crema-oscuro text-tinta-suave"
              : "bg-lila-claro text-lila"
          }`}
        >
          {cerrada ? <CircleX size={40} /> : <CircleCheck size={40} />}
        </span>
        <h1 className="text-4xl font-extrabold">{titulo}</h1>
        <p className="text-tinta-suave">{texto}</p>
      </section>

      {!cerrada && (
        <Tarjeta>
          <p className="text-center text-xs font-bold uppercase tracking-wide text-tinta-suave">
            Estado de la solicitud
          </p>
          <ol className="mt-5 grid grid-cols-4">
            {PASOS.map((nombre, i) => {
              const hecho = i < paso;
              const actual = i === paso;
              return (
                <li
                  key={nombre}
                  className="relative flex flex-col items-center gap-2 text-center"
                >
                  {i > 0 && (
                    <span
                      className={`absolute right-1/2 top-4 h-0.5 w-full ${
                        i <= paso ? "bg-verde" : "bg-crema-oscuro"
                      }`}
                    />
                  )}
                  <span
                    className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold ${
                      hecho
                        ? "bg-verde text-white"
                        : actual
                          ? "bg-naranja text-white ring-4 ring-naranja-claro"
                          : "bg-crema-oscuro text-tinta-suave"
                    }`}
                  >
                    {hecho ? <Check size={16} /> : i + 1}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      actual
                        ? "text-naranja"
                        : hecho
                          ? "text-verde"
                          : "text-tinta-suave"
                    }`}
                  >
                    {nombre}
                  </span>
                </li>
              );
            })}
          </ol>
        </Tarjeta>
      )}

      <Tarjeta>
        <h2 className="flex items-center gap-2 text-lg font-extrabold">
          <CalendarDays size={20} className="text-naranja" /> Detalles de la
          solicitud
        </h2>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <Dato
              icono={PawPrint}
              titulo="Servicio"
              valor={datos.service.name}
            />
            <Dato
              icono={CalendarDays}
              titulo="Fecha"
              valor={formatoFechaLarga(datos.startAt)}
            />
            <Dato
              icono={Clock}
              titulo="Hora"
              valor={`${formatoHora(datos.startAt)} – ${formatoHora(datos.endAt)}`}
            />
            <Dato
              icono={Wallet}
              titulo="Total"
              valor={formatoPesos(datos.totalPrice)}
            />
            {datos.notes && (
              <Dato icono={StickyNote} titulo="Notas" valor={datos.notes} />
            )}
          </div>
          <Pareja datos={datos} />
        </div>
      </Tarjeta>

      <p className="flex items-start gap-3 rounded-3xl bg-lila-claro p-5 text-sm text-lila">
        <Info size={20} className="shrink-0" />
        {aviso}
      </p>

      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        {datos.status === "RECHAZADA" || datos.status === "CANCELADA" ? (
          <Link
            href="/buscar"
            className="rounded-full bg-naranja px-8 py-3 text-center font-bold text-white hover:bg-naranja-oscuro"
          >
            Buscar otro cuidador
          </Link>
        ) : null}
        <Link
          href="/dueno"
          className="rounded-full border-2 border-naranja px-8 py-3 text-center font-bold text-naranja hover:bg-naranja-claro"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
