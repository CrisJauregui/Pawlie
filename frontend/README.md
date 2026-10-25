# Pawlie · Frontend (Next.js)

## Cómo correrlo

```bash
cd frontend
cp .env.example .env.local   # URL del backend
npm install
npm run dev                  # http://localhost:3001
```

El backend debe estar corriendo en `http://localhost:3000` (ver `docs/autenticacion.md`).

## Estructura

| Carpeta | Qué tiene |
|---|---|
| `app/` | Pantallas. `app/(app)/` son las pantallas privadas (requieren sesión). |
| `components/` | Componentes reutilizables (íconos: `lucide-react`): `Logo`, `ui.tsx` (Button, Input, Alerta, Cargando), `AppShell` (menú). |
| `lib/api.ts` | Función `api()` para llamar al backend con el token. |
| `lib/navegacion.ts` | Menú y qué rol puede ver cada ruta. |
| `lib/types.ts` | Tipos de los datos que devuelve la API. |
| `store/` | Estado global con Zustand: `sesion.ts` (usuario y token), `registro.ts`. |

## Rutas

| Ruta | Pantalla | Rol | Responsable |
|---|---|---|---|
| `/` | Bienvenida | Público | Cristina |
| `/login` | Iniciar sesión | Público | Cristina |
| `/registro` | Crear cuenta | Público | Cristina |
| `/registro/rol` | Seleccionar rol | Público | Cristina |
| `/dueno` | Dashboard del dueño | OWNER | Cristina |
| `/perfil` | Perfil | Ambos | Cristina |
| `/servicios` | Seguimiento y servicio finalizado | OWNER | Cristina |
| `/buscar` | Buscar cuidadores y reservar | OWNER | Felipe |
| `/solicitudes` | Solicitudes | Ambos | Felipe |
| `/mascotas` | Mis mascotas | OWNER | Ospina |
| `/cuidador` | Dashboard del cuidador | CAREGIVER | Ospina |
| `/disponibilidad` | Disponibilidad | CAREGIVER | Ospina |

## Cómo hacer una pantalla nueva

1. Crear el archivo en `app/(app)/<ruta>/page.tsx` (así queda protegida y con el menú).
2. Si va en el menú o la ve un solo rol, agregarla en `lib/navegacion.ts`.
3. Llamar al backend con `api()`; el token se envía solo:

```tsx
"use client";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";

export default function MisMascotasPage() {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Mascota[]>("/pets")
      .then(setMascotas)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Error"));
  }, []);
  // ...
}
```

4. Para saber quién inició sesión: `const usuario = useSesion((s) => s.usuario);`
5. Usar los colores de la marca de `app/globals.css` (`bg-naranja`, `bg-crema`, `bg-lila-claro`, `text-tinta-suave`, …) y los componentes de `components/ui.tsx`.

## Sesión y token

- Al iniciar sesión, el token y el usuario se guardan en el store de Zustand (`store/sesion.ts`), que los persiste en `localStorage` para no perder la sesión al recargar.
- `api()` agrega el header `Authorization: Bearer <token>` en cada petición.
- Si el backend responde **401** (token vencido o inválido), la sesión se cierra y `AppShell` manda al login.
- El frontend solo oculta pantallas según el rol; **la seguridad real está en el backend** (`JwtAuthGuard` y `RolesGuard`).
