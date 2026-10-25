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

export interface Mascota {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  age: number | null;
  notes: string | null;
}
