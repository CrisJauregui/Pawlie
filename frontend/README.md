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
| `hooks/useApi.ts` | Hook para cargar datos del backend con sus estados (carga, error, datos) y recargarlos. |
| `hooks/useListaApi.ts` | Hook para listas que la pantalla modifica sin volver a pedirlas (mascotas, horarios). |
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
| `/servicios` | Mis servicios: estado, seguimiento y finalizado (`/servicios/[id]`) | OWNER | Cristina |
| `/buscar` | Buscar cuidadores y reservar | OWNER | Felipe |
| `/solicitudes` | Solicitudes | Ambos | Felipe |
| `/mascotas` | Mis mascotas | OWNER | Ospina |
| `/cuidador` | Dashboard del cuidador | CAREGIVER | Ospina |
| `/disponibilidad` | Calendario (disponibilidad) | CAREGIVER | Ospina |
| `/mis-servicios` | Servicios y precios del cuidador | CAREGIVER | Felipe |

## Cómo hacer una pantalla nueva

1. Crear el archivo en `app/(app)/<ruta>/page.tsx` (así queda protegida y con el menú).
2. Si va en el menú o la ve un solo rol, agregarla en `lib/navegacion.ts`.
3. Para **traer datos**, usar el hook `useApi`; el token se envía solo:

```tsx
"use client";
import { Alerta, Cargando } from "@/components/ui";
import { useApi } from "@/hooks/useApi";

export default function MisMascotasPage() {
  const { datos, cargando, error, recargar } = useApi<Mascota[]>("/pets");

  if (cargando) return <Cargando />;
  if (error) return <Alerta>{error}</Alerta>;
  if (datos?.length === 0) return <p>Todavía no tienes mascotas.</p>;
  // ... mostrar datos; después de guardar algo, llamar a recargar()
}
```

   Para **enviar datos** (crear, editar, borrar), usar `api()` directamente:

```tsx
await api("/pets", { method: "POST", body: { name: "Apolo" } });
```

4. Para saber quién inició sesión: `const usuario = useSesion((s) => s.usuario);`
5. Usar los colores de la marca de `app/globals.css` (`bg-naranja`, `bg-crema`, `bg-lila-claro`, `text-tinta-suave`, …) y los componentes de `components/ui.tsx`.

## Sesión y token

- Al iniciar sesión, el token y el usuario se guardan en el store de Zustand (`store/sesion.ts`), que los persiste en `localStorage` para no perder la sesión al recargar.
- `api()` agrega el header `Authorization: Bearer <token>` en cada petición.
- Si el backend no responde en 10 segundos, `api()` cancela la petición y muestra "El servidor tardó demasiado en responder".
- Si el backend responde **401** (token vencido o inválido), la sesión se cierra y `AppShell` manda al login.
- El frontend solo oculta pantallas según el rol; **la seguridad real está en el backend** (`JwtAuthGuard` y `RolesGuard`).
