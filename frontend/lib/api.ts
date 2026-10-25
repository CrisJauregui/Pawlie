import { useSesion } from "@/store/sesion";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  constructor(
    public status: number,
    public mensajes: string[],
  ) {
    super(mensajes.join(". "));
  }
}

// Cliente para hablar con el backend. Lo usan todas las pantallas:
//   api<Mascota[]>("/pets")
//   api("/pets", { method: "POST", body: { name: "Apolo" } })
// - Agrega el token de la sesión en el header Authorization.
// - Si la API responde con error, lanza ApiError con los mensajes del backend.
// - Si responde 401 (token vencido o inválido), cierra la sesión.
export async function api<T>(
  ruta: string,
  opciones: { method?: string; body?: unknown } = {},
): Promise<T> {
  const token = useSesion.getState().token;

  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: opciones.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: opciones.body ? JSON.stringify(opciones.body) : undefined,
    });
  } catch {
    throw new ApiError(0, [
      "No se pudo conectar con el servidor. Intenta de nuevo.",
    ]);
  }

  if (!respuesta.ok) {
    if (respuesta.status === 401 && token) {
      useSesion.getState().cerrarSesion();
    }
    const datos = (await respuesta.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const mensaje = datos?.message ?? "Ocurrió un error inesperado";
    throw new ApiError(
      respuesta.status,
      Array.isArray(mensaje) ? mensaje : [mensaje],
    );
  }

  if (respuesta.status === 204) {
    return undefined as T;
  }
  return (await respuesta.json()) as T;
}
