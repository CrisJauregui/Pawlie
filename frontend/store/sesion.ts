import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Usuario } from "@/lib/types";

interface EstadoSesion {
  token: string | null;
  usuario: Usuario | null;
  iniciarSesion: (token: string, usuario: Usuario) => void;
  cerrarSesion: () => void;
}

// Sesión global de la app. Se guarda en localStorage para que no se pierda
// al recargar la página. El token igual expira (JWT_EXPIRES_IN en el backend)
// y si la API responde 401 se cierra la sesión (ver lib/api.ts).
export const useSesion = create<EstadoSesion>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      iniciarSesion: (token, usuario) => set({ token, usuario }),
      cerrarSesion: () => set({ token: null, usuario: null }),
    }),
    { name: "pawlie-sesion" },
  ),
);

// En el servidor no existe localStorage: hasta que el navegador cargue la
// sesión guardada, este hook devuelve false (así evitamos mostrar datos
// equivocados o redirigir al login antes de tiempo).
export function useSesionCargada(): boolean {
  return useSyncExternalStore(
    (avisar) => useSesion.persist.onFinishHydration(avisar),
    () => useSesion.persist.hasHydrated(),
    () => false,
  );
}

// Ruta de inicio según el rol del usuario.
export function rutaInicio(usuario: Usuario): string {
  return usuario.role === "CAREGIVER" ? "/cuidador" : "/dueno";
}
