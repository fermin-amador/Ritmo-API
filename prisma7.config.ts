import { existsSync } from 'node:fs';
import { defineConfig, env } from 'prisma/config';

if (process.env.NODE_ENV !== 'production' && existsSync('.env.dev')) {
  process.loadEnvFile('.env.dev');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',

  migrations: {
    path: 'prisma/migrations',
  },

  datasource: {
    url: env('DATABASE_URL'),
  },
});