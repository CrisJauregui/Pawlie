"use client";

import { PawPrint } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FotoMascota } from "@/components/FotoMascota";
import { Alerta, Button, Cargando } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { edadMascota } from "@/lib/mascotas";
import type { Mascota } from "@/lib/types";

// Paso 2 (pantalla 11): elegir cuál de tus mascotas recibirá el servicio.
export function PasoMascota({
  elegida,
  onElegir,
  onVolver,
}: {
  elegida: Mascota | null;
  onElegir: (mascota: Mascota) => void;
  onVolver: () => void;
}) {
  const [mascotas, setMascotas] = useState<Mascota[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Mascota[]>("/pets")
      .then(setMascotas)
      .catch((err: unknown) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "No se pudieron cargar tus mascotas",
        ),
      );
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-extrabold">¿Para cuál mascota es?</h2>

      {error && <Alerta>{error}</Alerta>}
      {!mascotas && !error && <Cargando />}
      {mascotas && mascotas.length === 0 && (
        <p className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-crema-oscuro p-10 text-center text-tinta-suave">
          <PawPrint size={32} className="text-icono" />
          Primero registra a tu mascota para poder reservar.
          <Link href="/mascotas" className="font-bold text-naranja">
            Agregar mascota
          </Link>
        </p>
      )}

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {mascotas?.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => onElegir(m)}
              className={`flex w-full flex-col overflow-hidden rounded-3xl bg-white text-left shadow-sm hover:shadow-md ${
                elegida?.id === m.id ? "ring-2 ring-naranja" : ""
              }`}
            >
              <FotoMascota
                mascota={m}
                tamanoIcono={48}
                className="h-40 w-full"
              />
              <span className="flex flex-col gap-1 p-5">
                <span className="text-xl font-extrabold">{m.name}</span>
                <span className="text-tinta-suave">
                  {m.breed ?? m.species}
                  {m.age !== null && ` · ${edadMascota(m.age)}`}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div>
        <Button type="button" variant="secundario" onClick={onVolver}>
          Volver
        </Button>
      </div>
    </div>
  );
}
