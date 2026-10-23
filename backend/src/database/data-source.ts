import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { buildTypeOrmOptions } from '../config/typeorm.config';

// Usado solo por el CLI de TypeORM (npm run migration:*).
// En local lee el .env de la raíz del repo; en Docker/producción las variables ya vienen del entorno.
config({ path: '../.env', quiet: true });

export default new DataSource(buildTypeOrmOptions(process.env));
