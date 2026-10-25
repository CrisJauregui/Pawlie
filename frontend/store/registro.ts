import { create } from "zustand";

export interface DatosRegistro {
  name: string;
  email: string;
  password: string;
  phone: string;
}

interface EstadoRegistro {
  datos: DatosRegistro | null;
  guardar: (datos: DatosRegistro) => void;
  limpiar: () => void;
}

// Guarda los datos de "Crear cuenta" mientras el usuario elige su rol.
// Solo vive en memoria (no se guarda en el navegador) porque incluye la contraseña.
export const useRegistro = create<EstadoRegistro>()((set) => ({
  datos: null,
  guardar: (datos) => set({ datos }),
  limpiar: () => set({ datos: null }),
}));
