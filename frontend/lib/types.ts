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

export type EstadoSolicitud =
  | "PENDIENTE"
  | "ACEPTADA"
  | "EN_CURSO"
  | "FINALIZADA"
  | "RECHAZADA"
  | "CANCELADA";

export type TipoServicio = "PASEO" | "CUIDADO_EN_CASA" | "BANO";

// Respuesta de GET /owner/summary (lista) y GET /requests/:id/tracking.
export interface ResumenSolicitud {
  id: string;
  status: EstadoSolicitud;
  startAt: string;
  endAt: string;
  totalPrice: number;
  service: { name: string; type: TipoServicio; durationMinutes: number };
  pet: { id: string; name: string; species: string; breed: string | null };
  caregiver: { id: string; name: string; city: string };
}

export interface ResumenDueno {
  pets: number;
  activeRequests: number;
  completedServices: number;
  requests: ResumenSolicitud[];
}

export interface Resena {
  id: string;
  rating: number;
  comment: string | null;
  tags: string[];
  createdAt: string;
}

export interface Seguimiento extends ResumenSolicitud {
  notes: string | null;
  createdAt: string;
  pet: ResumenSolicitud["pet"] & { age: number | null };
  caregiver: ResumenSolicitud["caregiver"] & { photoUrl: string | null };
  owner: { id: string; name: string };
  updates: {
    id: string;
    message: string;
    photoUrl: string | null;
    createdAt: string;
  }[];
  review: Resena | null;
}
