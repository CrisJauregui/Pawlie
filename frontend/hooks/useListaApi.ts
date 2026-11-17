"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";

// Hook reutilizable para las pantallas que cargan una lista desde la API
// y luego la modifican (crear, editar, eliminar) sin volver a pedirla:
//   const { datos, error, setDatos } = useListaApi<Mascota>("/pets", "...");
// - datos === null mientras carga.
// - error trae el mensaje del backend, o el mensaje por defecto.
export function useListaApi<T>(ruta: string, mensajeError: string) {
  const [datos, setDatos] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      setDatos(await api<T[]>(ruta));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : mensajeError);
    }
  }, [ruta, mensajeError]);

  useEffect(() => {
    // La carga es asíncrona: setDatos/setError se llaman después del render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
  }, [cargar]);

  return { datos, setDatos, error, setError, recargar: cargar };
}
