# Registro de problemas y decisiones

Problemas que encontramos durante el desarrollo, cómo los resolvimos y las decisiones de diseño que tomamos, con su motivo.

## Decisiones

| Fecha | Decisión | Por qué | Alternativa descartada |
|---|---|---|---|
| Oct 2026 | Unir Request y Booking del D1 en una sola tabla `requests` con un campo de estado | Guardaban los mismos datos; con un estado se evita duplicar información e inconsistencias | Dos tablas sincronizadas |
| Oct 2026 | El historial de servicios es una consulta de las solicitudes FINALIZADAS | No necesita tabla propia | Tabla `ServiceHistory` |
| Oct 2026 | Agregar las tablas `services` (catálogo con precio y duración) y `reviews` | Las pantallas del Figma las necesitaban y no estaban en el modelo del D1 | Precio fijo en el perfil del cuidador |
| Oct 2026 | Datos de Colombia: barrios de Cali y precios en pesos | El problema se plantea en Cali | Datos genéricos en USD |
| Oct 2026 | Elegir el rol en una pantalla aparte del registro | El formulario queda más corto y el rol se explica mejor | Un selector dentro del formulario |
| Oct 2026 | Sin inicio de sesión con Google ni recuperación de contraseña | Fuera del alcance de las entregas; se deja como trabajo futuro | Integrar OAuth |
| Oct 2026 | Línea de tiempo de actualizaciones en lugar del mapa del Figma | No guardamos ubicación GPS; las actualizaciones del cuidador sí son datos reales | Mapa con ubicación simulada |
| Oct 2026 | El seguimiento se refresca cada 15 segundos (polling) | Las actualizaciones no son por segundo; es simple y suficiente | WebSockets |
| Oct 2026 | Responder 404, no 403, cuando un usuario pide datos de otro | No revela que el recurso existe | 403 |
| Oct 2026 | El login responde el mismo mensaje si el correo no existe o la clave está mal | No revela qué correos están registrados | Mensajes distintos |
| Oct 2026 | La sesión (usuario y token) vive en Zustand, guardada en `localStorage` | La sesión sobrevive al recargar y cualquier pantalla la lee | Cookie `httpOnly`: más segura frente a XSS, queda como mejora |
| Oct 2026 | Las reglas de la reseña están en el service y también en la base (`UNIQUE` en `request_id`, `CHECK` de 1 a 5) | Aunque alguien salte el service, la base no acepta datos inválidos | Solo validar en el service |
| Oct 2026 | El esquema solo cambia con migraciones (`synchronize: false`) | Cambios versionados y reproducibles en cualquier máquina | `synchronize: true` |
| Oct 2026 | Íconos de `lucide-react` en lugar de emojis | Se ven igual en todos los sistemas y siguen el estilo del Figma | Emojis |
| Nov 2026 | Hook `useApi` para cargar datos con sus estados | Evita repetir en cada pantalla el mismo código de carga y error | Un `useEffect` por pantalla |
| Nov 2026 | Tiempo máximo de 10 segundos por petición | La pantalla no se queda cargando si el servidor no responde; es menor que el polling de 15 s | Esperar sin límite |

## Problemas y soluciones

| Fecha | Problema | Causa | Solución |
|---|---|---|---|
| Oct 2026 | Jest no podía cargar los paquetes de NestJS | Esos paquetes vienen como módulos ES y Node 22 no los carga en Jest | Usar Node 24 con `--experimental-vm-modules` y fijar la versión en `.nvmrc` |
| Oct 2026 | Las pruebas E2E borraban los datos de desarrollo | Usaban la misma base de datos | Base aparte `<POSTGRES_DB>_test` (`test/setup-e2e.ts`) |
| Oct 2026 | `next build` fallaba en `/servicios/[id]` | Las rutas que leen parámetros de la URL necesitan un `Suspense` | `Suspense` en `app/(app)/layout.tsx` |
| Oct 2026 | El lint marcaba "componente creado durante el render" | La foto de la mascota se definía dentro de otro componente | Componentes aparte (`FotoMascota`) |
| Oct 2026 | El CI quedó en rojo dos veces por formato en `caregivers` | Al unir ramas desactualizadas se perdió el salto de línea final | Arreglar el formato y actualizar master antes de crear cada rama |
| Nov 2026 | El CI marcaba `Cannot find name 'LayoutProps'` | `tsc` corría antes de que Next generara los tipos de las rutas | Correr `npx next typegen` antes de `tsc` en el CI (cambio en `.github/workflows/ci.yml`) |
| Nov 2026 | El backend en Render tarda en responder la primera vez | El plan gratis apaga el servicio cuando no se usa | Abrir la URL unos minutos antes de la demostración |
