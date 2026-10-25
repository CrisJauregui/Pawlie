// Tipos que devuelve la API (deben coincidir con el backend).

export type Rol = "OWNER" | "CAREGIVER";

export interface Usuario {
  id: string;
  name: string;
  email: string;
  role: Rol;
  phone: string | null;
}

export interface RespuestaAuth {
  accessToken: string;
  user: Usuario;
}
