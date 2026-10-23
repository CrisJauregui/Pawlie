# Autenticación y roles en Pawlie

Responsable: Cristina

## Endpoints

| Método | Ruta | Acceso | Qué hace |
|---|---|---|---|
| POST | `/auth/register` | Público | Crea una cuenta como `OWNER` (dueño) o `CAREGIVER` (cuidador) y devuelve el token |
| POST | `/auth/login` | Público | Valida correo y contraseña y devuelve el token |
| GET | `/auth/me` | Con token | Devuelve los datos del usuario que inició sesión |

Ejemplo de registro:

```json
POST /auth/register
{
  "name": "María López",
  "email": "maria@pawlie.com",
  "password": "Pawlie123",
  "role": "OWNER"
}
```

Respuesta (igual para el login):

```json
{
  "accessToken": "eyJhbGciOi...",
  "user": { "id": "…", "name": "María López", "email": "maria@pawlie.com", "role": "OWNER", "phone": null }
}
```

Las demás peticiones envían el token en el header:

```
Authorization: Bearer eyJhbGciOi...
```

## Cómo proteger tus endpoints (Felipe y Ospina)

```ts
import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from '../users/enums/user-role.enum';

@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard) // 1. exige token  2. revisa el rol
export class RequestsController {
  // Cualquier usuario con sesión (sin @Roles)
  @Get('me')
  findMine(@CurrentUser() user: AuthUser) {
    return this.requestsService.findByUser(user.id, user.role);
  }

  // Solo cuidadores
  @Patch(':id/accept')
  @Roles(UserRole.CAREGIVER)
  accept(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.requestsService.accept(id, user.id);
  }
}
```

- `@CurrentUser()` da `{ id, email, role }` del usuario del token. **Nunca** tomen el id del usuario del body: siempre de aquí.
- `@Roles()` decide **qué tipo de usuario** puede entrar. Que el recurso sea **suyo** (por ejemplo, que la mascota sea del dueño) lo valida cada uno en su service y responde `403` o `404`.
- Las relaciones con la tabla de usuarios van contra la entidad `User` de `src/users/user.entity.ts`.

## Qué responde la API cuando algo falla

| Código | Cuándo |
|---|---|
| 400 | Datos inválidos o campos que no existen en el DTO |
| 401 | No hay token, el token es falso o ya expiró, o el login es incorrecto |
| 403 | El usuario tiene sesión pero su rol no puede hacer esa acción |
| 409 | El correo ya está registrado |

## Cómo funciona por dentro (para la sustentación)

1. **Registro:** el DTO valida los datos → `AuthService.register` revisa que el correo no exista → `bcrypt.hash` convierte la contraseña en un hash (10 rondas) → se guarda el usuario → se firma un JWT.
2. **Login:** se busca el usuario por correo (es la única consulta que trae el hash, porque la columna tiene `select: false`) → `bcrypt.compare` compara → si algo falla se responde el mismo mensaje, para no revelar qué correos existen.
3. **Petición protegida:** `JwtAuthGuard` activa la `JwtStrategy` de Passport → se verifica la firma y la expiración con `JWT_SECRET` → `validate()` confirma que el usuario existe y lo deja en `request.user` → `RolesGuard` compara su rol con `@Roles()`.
4. El token contiene `sub` (id), `email` y `role`. Está firmado, no cifrado: por eso no lleva datos sensibles.

## Base de datos

- La tabla `users` se crea con la migración `src/database/migrations/1761177600000-CreateUsers.ts`.
- `synchronize` está apagado: el esquema solo cambia con migraciones.
- Comandos (desde `backend/`):

```bash
npm run migration:run       # aplica las migraciones pendientes
npm run migration:revert    # deshace la última
npm run migration:generate -- src/database/migrations/NombreDelCambio   # genera una a partir de las entidades
```

## Pruebas

Requieren **Node 24** (`nvm use` toma la versión del archivo `.nvmrc`).

```bash
npm test            # unitarias: AuthService y RolesGuard
npm run test:e2e    # integración contra una base de datos de pruebas
```

Las e2e usan una base aparte (`<POSTGRES_DB>_test`) porque borran datos. Hay que crearla una vez:

```bash
docker compose exec db createdb -U <POSTGRES_USER> <POSTGRES_DB>_test
```
