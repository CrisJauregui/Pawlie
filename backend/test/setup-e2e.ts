import { config } from 'dotenv';

// Las pruebas e2e usan una base de datos APARTE (por defecto "<POSTGRES_DB>_test")
// porque borran datos. Se define antes de que ConfigModule lea el .env
// (dotenv no sobreescribe variables que ya existen).
config({ path: '../.env', quiet: true });
process.env.POSTGRES_DB =
  process.env.POSTGRES_TEST_DB ?? `${process.env.POSTGRES_DB}_test`;
process.env.JWT_SECRET ??= 'e2e-secret';
