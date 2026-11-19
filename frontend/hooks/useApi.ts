"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";

// Trae datos del backend y entrega lo que una pantalla necesita para
// mostrar sus estados de carga, error, vacío y éxito:
//
//   const { datos, cargando, error, recargar } = useApi<Mascota[]>("/pets");
//
// - cargando: true mientras llega la primera respuesta.
// - error: el mensaje del backend (o uno general si no hay conexión).
// - recargar(): vuelve a pedir los datos sin borrar los que ya se ven
//   (sirve después de guardar algo o para refrescar cada cierto tiempo).
// - Si la ruta es null, no se hace la petición (por ejemplo, si falta un id).
export function useApi<T>(
  ruta: string | null,
  mensajeError = "No se pudo cargar la información",
) {
  const [datos, setDatos] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Cuenta las peticiones para ignorar respuestas viejas que lleguen tarde.
  const ultimaPeticion = useRef(0);

  const recargar = useCallback((): Promise<void> => {
    if (!ruta) return Promise.resolve();
    const numero = ++ultimaPeticion.current;
    return api<T>(ruta)
      .then((respuesta) => {
        if (numero !== ultimaPeticion.current) return;
        setDatos(respuesta);
        setError(null);
      })
      .catch((err: unknown) => {
        if (numero !== ultimaPeticion.current) return;
        setError(err instanceof ApiError ? err.message : mensajeError);
      });
  }, [ruta, mensajeError]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const cargando = ruta !== null && datos === null && error === null;

  return { datos, cargando, error, recargar };
}
