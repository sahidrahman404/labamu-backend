import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    host: Bun.env['HOST'] ?? 'localhost',
    port: Number(Bun.env['PORT'] ?? 5442),
    user: Bun.env['USERNAME'] ?? 'backend',
    password: Bun.env['PASSWORD'] ?? 'backend',
    database: Bun.env['DATABASE'] ?? 'backend',
  },
});
