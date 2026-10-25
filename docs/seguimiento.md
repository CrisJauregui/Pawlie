# Seguimiento del servicio y reseñas

Responsable: Cristina

## Endpoints

| Método | Ruta | Rol | Qué hace |
|---|---|---|---|
| GET | `/owner/summary` | OWNER | Datos del dashboard: mascotas, solicitudes activas, servicios completados y sus últimas 20 solicitudes |
| GET | `/requests/:id/tracking` | Dueño o cuidador **de esa solicitud** | Detalle del servicio, actualizaciones del cuidador y reseña |
| POST | `/requests/:id/review` | OWNER | Califica un servicio finalizado |

Las actualizaciones las publica el cuidador con `POST /requests/:id/updates` (módulo de Ospina).
El frontend consulta `/requests/:id/tracking` cada 15 segundos mientras el servicio está activo.

### Ejemplo de reseña

```json
POST /requests/:id/review
{
  "rating": 5,
  "comment": "Max volvió feliz",
  "tags": ["Muy puntual", "Regresó feliz"]
}
```

Etiquetas permitidas: `Muy puntual`, `Fotos durante el servicio`, `Gran comunicación`, `Regresó feliz`, `Lo recomendaría`.

## Reglas de negocio

- **Seguimiento:** solo lo ven el dueño y el cuidador de la solicitud. Cualquier otro usuario recibe **404**, para no revelar que la solicitud existe.
- **Reseña:**
  - Solo la deja el dueño de la solicitud (si no es suya → 404; si es cuidador → 403).
  - Solo si el servicio está `FINALIZADA` (si no → 409).
  - Una sola reseña por solicitud (→ 409). Además la base de datos lo garantiza con `UNIQUE (request_id)`.
  - La calificación va de 1 a 5 (validado en el DTO y con un `CHECK` en la tabla).

## Base de datos

Tabla `reviews` (migración `1792900000000-CreateReviews.ts`):

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| request_id | uuid | FK a `requests`, única |
| rating | smallint | 1 a 5 |
| comment | text | opcional |
| tags | text[] | etiquetas rápidas |
| created_at | timestamptz | |

## Datos demo

```bash
cd backend
npm run migration:run
npm run seed
```

Crea datos de Cali con precios en pesos colombianos. Contraseña de todas las cuentas: `Pawlie123`.

| Cuenta | Rol |
|---|---|
| maria@pawlie.com | Dueña (Max, Luna y Nube) |
| camila@pawlie.com | Cuidadora (San Fernando, Cali) |
| andres@pawlie.com | Cuidador (Ciudad Jardín, Cali) |

Incluye solicitudes en todos los estados: pendiente, confirmada, en curso (con actualizaciones), finalizada sin reseña, finalizada con reseña y cancelada.
Si los datos ya existen, el seed no hace nada.

## Trabajo futuro

- Ubicación del cuidador en un mapa en tiempo real (el prototipo de Figma lo muestra; hoy se reemplaza por la línea de tiempo de actualizaciones).
- Notificaciones push cuando el cuidador publica una actualización.
