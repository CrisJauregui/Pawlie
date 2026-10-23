import { join } from 'path';
import { DataSourceOptions } from 'typeorm';

// Configuración única de la base de datos, compartida por la app (app.module.ts)
// y por el CLI de migraciones (data-source.ts).
// synchronize: false → el esquema SOLO cambia mediante migraciones versionadas.
export const buildTypeOrmOptions = (
  env: Record<string, string | undefined>,
): DataSourceOptions => ({
  type: 'postgres',
  host: env.DB_HOST,
  port: Number(env.DB_PORT ?? 5432),
  username: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,
  synchronize: false,
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
});
