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

// ---- Buscar cuidadores y reservar (GET /caregivers, /services, /requests) ----

export interface ServicioCuidador {
  id: string;
  name: string;
  type: TipoServicio;
  price: number;
  durationMinutes: number;
}

// Respuesta de GET /caregivers (lista).
export interface Cuidador {
  id: string;
  name: string;
  city: string;
  bio: string | null;
  yearsExperience: number;
  photoUrl: string | null;
  rating: { average: number | null; count: number };
  services: ServicioCuidador[];
}

export interface FranjaDisponible {
  id: string;
  dayOfWeek: number; // 0 = domingo ... 6 = sábado
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

// Respuesta de GET /caregivers/:id.
export interface CuidadorDetalle extends Cuidador {
  availability: FranjaDisponible[];
}

// Respuesta de GET /services (los servicios del cuidador con sesión).
// El precio llega como texto desde la base de datos ("35000.00").
export interface Servicio {
  id: string;
  name: string;
  type: TipoServicio;
  price: string;
  durationMinutes: number;
  isActive: boolean;
}

// Respuesta de POST /requests, GET /requests/me y GET /requests/:id.
export interface Solicitud {
  id: string;
  status: EstadoSolicitud;
  startAt: string;
  endAt: string;
  totalPrice: number;
  notes: string | null;
  createdAt: string;
  service: {
    id: string;
    name: string;
    type: TipoServicio;
    durationMinutes: number;
  };
  pet: { id: string; name: string; species: string; breed: string | null };
  caregiver: { id: string; name: string; city: string };
  owner: { id: string; name: string };
}
