"use client";

import {
  CalendarDays,
  CircleCheck,
  Clock,
  PawPrint,
  Star,
  User,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Alerta, Button, Frase, Tarjeta } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { formatoFechaLarga, formatoHora, formatoPesos } from "@/lib/formato";
import type { Resena, Seguimiento } from "@/lib/types";
import { FotoMascota } from "./partes";

// Deben coincidir con REVIEW_TAGS del backend.
const ETIQUETAS = [
  "Muy puntual",
  "Fotos durante el servicio",
  "Gran comunicación",
  "Regresó feliz",
  "Lo recomendaría",
];

// Servicio finalizado: resumen y reseña (pantalla 8).
export function VistaFinalizado({
  datos,
  alCalificar,
}: {
  datos: Seguimiento;
  alCalificar: () => Promise<void>;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <section className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-verde-claro text-verde">
          <CircleCheck size={40} />
        </span>
        <h1 className="text-4xl font-extrabold text-naranja">
          ¡Servicio finalizado!
        </h1>
        <p className="text-tinta-suave">
          Esperamos que hayan tenido una gran experiencia
        </p>
      </section>

      <section className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm sm:flex-row">
        <FotoMascota
          mascota={datos.pet}
          className="h-48 w-full sm:h-auto sm:w-56"
        />
        <div className="grid flex-1 gap-2 p-6 text-sm">
          <p className="text-xl font-extrabold text-naranja">
            {datos.service.name}
          </p>
          <Linea icono={PawPrint} texto={datos.pet.name} />
          <Linea
            icono={CalendarDays}
            texto={formatoFechaLarga(datos.startAt)}
          />
          <Linea
            icono={Clock}
            texto={`${formatoHora(datos.startAt)} – ${formatoHora(datos.endAt)}`}
          />
          <Linea icono={User} texto={datos.caregiver.name} />
          <Linea icono={Wallet} texto={formatoPesos(datos.totalPrice)} />
        </div>
      </section>

      {datos.updates.length > 0 && (
        <Tarjeta>
          <h2 className="font-extrabold">Así estuvo {datos.pet.name}</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {datos.updates.map((u) => (
              <li key={u.id} className="flex gap-3">
                <span className="w-20 shrink-0 text-tinta-suave">
                  {formatoHora(u.createdAt)}
                </span>
                {u.message}
              </li>
            ))}
          </ul>
        </Tarjeta>
      )}

      {datos.review ? (
        <ResenaEnviada resena={datos.review} />
      ) : (
        <FormularioResena requestId={datos.id} alCalificar={alCalificar} />
      )}

      <Frase className="text-center">¡Gracias por confiar en Pawlie!</Frase>
    </div>
  );
}

function Linea({
  icono: Icono,
  texto,
}: {
  icono: typeof PawPrint;
  texto: string;
}) {
  return (
    <p className="flex items-center gap-2">
      <Icono size={16} className="text-naranja" /> {texto}
    </p>
  );
}

function Estrellas({ valor }: { valor: number }) {
  return (
    <span className="flex gap-1 text-naranja">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={22}
          className={n <= valor ? "fill-current" : "text-crema-oscuro"}
        />
      ))}
    </span>
  );
}

function ResenaEnviada({ resena }: { resena: Resena }) {
  return (
    <Tarjeta className="flex flex-col items-center gap-3 text-center">
      <h2 className="font-extrabold">Tu calificación</h2>
      <Estrellas valor={resena.rating} />
      {resena.comment && (
        <p className="italic text-tinta-suave">“{resena.comment}”</p>
      )}
      <div className="flex flex-wrap justify-center gap-2">
        {resena.tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-lila-claro px-3 py-1 text-xs font-bold text-lila"
          >
            {t}
          </span>
        ))}
      </div>
    </Tarjeta>
  );
}

function FormularioResena({
  requestId,
  alCalificar,
}: {
  requestId: string;
  alCalificar: () => Promise<void>;
}) {
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState("");
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const alternar = (etiqueta: string) =>
    setEtiquetas((actual) =>
      actual.includes(etiqueta)
        ? actual.filter((e) => e !== etiqueta)
        : [...actual, etiqueta],
    );

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Elige de 1 a 5 estrellas");
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      await api(`/requests/${requestId}/review`, {
        method: "POST",
        body: {
          rating,
          tags: etiquetas,
          ...(comentario.trim() ? { comment: comentario.trim() } : {}),
        },
      });
      await alCalificar();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo enviar la reseña",
      );
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <Tarjeta className="flex flex-col gap-5">
        <h2 className="text-center text-lg font-extrabold">
          ¿Cómo fue tu experiencia?
        </h2>
        <div
          className="flex justify-center gap-2"
          role="radiogroup"
          aria-label="Calificación"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} estrellas`}
              onClick={() => setRating(n)}
              className="text-naranja transition-transform hover:scale-110"
            >
              <Star
                size={40}
                className={n <= rating ? "fill-current" : "text-crema-oscuro"}
              />
            </button>
          ))}
        </div>

        <label className="flex flex-col gap-2 text-sm font-bold">
          <span>
            Cuéntanos más{" "}
            <span className="font-normal text-tinta-suave">(opcional)</span>
          </span>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="¿Qué fue lo que más te gustó del servicio?"
            className="rounded-2xl border-2 border-crema-oscuro px-4 py-3 font-normal outline-none placeholder:text-icono focus:border-naranja"
          />
        </label>

        <div>
          <p className="text-xs font-bold text-tinta-suave">
            Etiquetas rápidas
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {ETIQUETAS.map((etiqueta) => {
              const activa = etiquetas.includes(etiqueta);
              return (
                <button
                  key={etiqueta}
                  type="button"
                  aria-pressed={activa}
                  onClick={() => alternar(etiqueta)}
                  className={`rounded-full border-2 px-4 py-1.5 text-xs font-bold ${
                    activa
                      ? "border-lila bg-lila-claro text-lila"
                      : "border-crema-oscuro text-tinta-suave hover:border-lila"
                  }`}
                >
                  {etiqueta}
                </button>
              );
            })}
          </div>
        </div>
      </Tarjeta>

      {error && <Alerta>{error}</Alerta>}
      <Button type="submit" disabled={enviando}>
        {enviando ? "Enviando…" : "Enviar reseña"}
      </Button>
      <Link
        href="/dueno"
        className="text-center text-sm font-bold text-tinta-suave"
      >
        Omitir por ahora
      </Link>
    </form>
  );
}
