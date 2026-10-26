"use client";

import {
  CalendarDays,
  CircleCheck,
  FileText,
  PawPrint,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Alerta, Button, Cargando, Frase, Input } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { formatoFechaCorta, formatoHora, formatoPesos } from "@/lib/formato";
import { EstadoBadge } from "@/lib/solicitudes";
import type { EstadoSolicitud, ResumenSolicitud } from "@/lib/types";
import { useSesion } from "@/store/sesion";

type Solicitud = Omit<ResumenSolicitud, "caregiver"> & {
  owner: { id: string; name: string };
};

type Accion = "start" | "complete";

const DATOS_TEMPORALES = true;

const DEMO: Solicitud[] = [
  {
    id: "demo-1",
    status: "PENDIENTE",
    startAt: "2026-10-28T09:00:00-05:00",
    endAt: "2026-10-28T10:00:00-05:00",
    totalPrice: 20000,
    service: { name: "Paseo 1h", type: "PASEO", durationMinutes: 60 },
    pet: { id: "p1", name: "Luna", species: "Gato", breed: "Siamés" },
    owner: { id: "o1", name: "Laura Pérez" },
  },
  {
    id: "demo-2",
    status: "ACEPTADA",
    startAt: "2026-10-27T15:00:00-05:00",
    endAt: "2026-10-27T16:00:00-05:00",
    totalPrice: 20000,
    service: { name: "Paseo 1h", type: "PASEO", durationMinutes: 60 },
    pet: { id: "p2", name: "Rocky", species: "Perro", breed: "Labrador" },
    owner: { id: "o2", name: "Andrés Gómez" },
  },
  {
    id: "demo-3",
    status: "EN_CURSO",
    startAt: "2026-10-26T08:00:00-05:00",
    endAt: "2026-10-26T09:00:00-05:00",
    totalPrice: 35000,
    service: { name: "Baño y cepillado", type: "BANO", durationMinutes: 90 },
    pet: { id: "p3", name: "Apolo", species: "Perro", breed: null },
    owner: { id: "o3", name: "María Torres" },
  },
  {
    id: "demo-4",
    status: "FINALIZADA",
    startAt: "2026-10-24T10:00:00-05:00",
    endAt: "2026-10-24T11:00:00-05:00",
    totalPrice: 20000,
    service: { name: "Paseo 1h", type: "PASEO", durationMinutes: 60 },
    pet: { id: "p4", name: "Mía", species: "Perro", breed: "Beagle" },
    owner: { id: "o4", name: "Carlos Ruiz" },
  },
];

const SIGUIENTE_ESTADO: Record<Accion, EstadoSolicitud> = {
  start: "EN_CURSO",
  complete: "FINALIZADA",
};

function cargarSolicitudes(): Promise<Solicitud[]> {
  return Promise.resolve(DEMO);
}

function mensajeError(err: unknown): string {
  return err instanceof ApiError
    ? err.message
    : "No se pudo completar la acción";
}

export default function DashboardCuidadorPage() {
  const usuario = useSesion((s) => s.usuario);
  const [solicitudes, setSolicitudes] = useState<Solicitud[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarSolicitudes().then(setSolicitudes);
  }, []);

  async function cambiar(id: string, accion: Accion) {
    setError(null);
    try {
      if (!DATOS_TEMPORALES) {
        await api(`/requests/${id}/${accion}`, { method: "PATCH" });
      }
      setSolicitudes((lista) =>
        (lista ?? []).map((s) =>
          s.id === id ? { ...s, status: SIGUIENTE_ESTADO[accion] } : s,
        ),
      );
    } catch (err) {
      setError(mensajeError(err));
    }
  }

  async function publicar(id: string, message: string): Promise<boolean> {
    setError(null);
    try {
      if (!DATOS_TEMPORALES) {
        await api(`/requests/${id}/updates`, {
          method: "POST",
          body: { message },
        });
      }
      return true;
    } catch (err) {
      setError(mensajeError(err));
      return false;
    }
  }

  const primerNombre = usuario?.name.split(" ")[0] ?? "";

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold">
            ¡Hola, <span className="text-naranja">{primerNombre}</span>!
          </h1>
          <p className="mt-1 text-tinta-suave">
            Aquí tienes el resumen de tus servicios y solicitudes
          </p>
        </div>
        <Frase>Amor en cada pata</Frase>
      </section>

      {error && <Alerta>{error}</Alerta>}
      {solicitudes === null ? (
        <Cargando />
      ) : (
        <Contenido
          solicitudes={solicitudes}
          onCambiar={cambiar}
          onPublicar={publicar}
        />
      )}
    </div>
  );
}

function Contenido({
  solicitudes,
  onCambiar,
  onPublicar,
}: {
  solicitudes: Solicitud[];
  onCambiar: (id: string, accion: Accion) => Promise<void>;
  onPublicar: (id: string, mensaje: string) => Promise<boolean>;
}) {
  const cuenta = (...estados: EstadoSolicitud[]) =>
    solicitudes.filter((s) => estados.includes(s.status)).length;
  const ordenadas = [...solicitudes].sort((a, b) =>
    a.startAt.localeCompare(b.startAt),
  );

  return (
    <>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Resumen
          icono={FileText}
          valor={cuenta("PENDIENTE")}
          titulo="Solicitudes nuevas"
          texto="Esperan tu respuesta."
          color="bg-naranja-claro text-naranja"
        />
        <Resumen
          icono={CalendarDays}
          valor={cuenta("ACEPTADA", "EN_CURSO")}
          titulo="Servicios activos"
          texto="Confirmados o en curso."
          color="bg-lila-claro text-lila"
        />
        <Resumen
          icono={CircleCheck}
          valor={cuenta("FINALIZADA")}
          titulo="Servicios completados"
          texto="¡Cada uno fue una aventura!"
          color="bg-verde-claro text-verde"
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-2xl font-extrabold">
          <PawPrint size={20} className="fill-current text-naranja" />
          Mis solicitudes
        </h2>
        {DATOS_TEMPORALES && (
          <p className="text-xs text-tinta-suave">
            Datos de demostración: el listado se conectará a la API del cuidador.
          </p>
        )}

        {ordenadas.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-crema-oscuro p-10 text-center text-tinta-suave">
            <PawPrint size={32} className="text-icono" />
            Todavía no tienes solicitudes.
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ordenadas.map((s) => (
              <TarjetaSolicitud
                key={s.id}
                solicitud={s}
                onCambiar={onCambiar}
                onPublicar={onPublicar}
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

function TarjetaSolicitud({
  solicitud: s,
  onCambiar,
  onPublicar,
}: {
  solicitud: Solicitud;
  onCambiar: (id: string, accion: Accion) => Promise<void>;
  onPublicar: (id: string, mensaje: string) => Promise<boolean>;
}) {
  const [texto, setTexto] = useState("");
  const [enviadas, setEnviadas] = useState(0);
  const [ocupado, setOcupado] = useState(false);

  async function cambiar(accion: Accion) {
    setOcupado(true);
    await onCambiar(s.id, accion);
    setOcupado(false);
  }

  async function publicar() {
    const mensaje = texto.trim();
    if (!mensaje) return;
    setOcupado(true);
    if (await onPublicar(s.id, mensaje)) {
      setTexto("");
      setEnviadas((n) => n + 1);
    }
    setOcupado(false);
  }

  return (
    <li className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-extrabold">{s.pet.name}</p>
          <p className="flex items-center gap-1.5 text-tinta-suave">
            <PawPrint size={14} className="fill-current text-naranja" />
            {s.pet.breed ?? s.pet.species}
          </p>
        </div>
        <EstadoBadge estado={s.status} />
      </div>

      <div className="rounded-2xl bg-crema p-4 text-sm">
        <p className="font-bold">{s.service.name}</p>
        <p className="text-tinta-suave">
          {formatoFechaCorta(s.startAt)} · {formatoHora(s.startAt)}
        </p>
        <p className="text-xs text-tinta-suave">
          Dueño: {s.owner.name} · {formatoPesos(s.totalPrice)}
        </p>
      </div>

      {s.status === "PENDIENTE" && (
        <Link
          href="/solicitudes"
          className="text-sm font-bold text-naranja hover:text-naranja-oscuro"
        >
          Revisar solicitud
        </Link>
      )}

      {s.status === "ACEPTADA" && (
        <Button
          type="button"
          disabled={ocupado}
          onClick={() => cambiar("start")}
        >
          Iniciar servicio
        </Button>
      )}

      {s.status === "EN_CURSO" && (
        <div className="flex flex-col gap-3">
          <Input
            id={`mensaje-${s.id}`}
            label="Actualización para el dueño"
            placeholder="Ej: Ya llegamos al parque"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="secundario"
              disabled={ocupado || !texto.trim()}
              onClick={publicar}
            >
              Publicar
            </Button>
            <Button
              type="button"
              disabled={ocupado}
              onClick={() => cambiar("complete")}
            >
              Finalizar servicio
            </Button>
          </div>
          {enviadas > 0 && (
            <p className="text-xs text-tinta-suave">
              {enviadas === 1
                ? "1 actualización enviada"
                : `${enviadas} actualizaciones enviadas`}
            </p>
          )}
        </div>
      )}
    </li>
  );
}