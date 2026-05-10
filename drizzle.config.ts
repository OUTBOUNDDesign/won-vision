import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL_UNPOOLED) {
  throw new Error('DATABASE_URL_UNPOOLED is required for drizzle-kit migrations');
}

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED },
  verbose: true,
  strict: true,
});
