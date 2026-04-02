import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    host: process.env['HOST'] ?? 'localhost',
    port: Number(process.env['PORT'] ?? 5442),
    user: process.env['USERNAME'] ?? 'backend',
    password: process.env['PASSWORD'] ?? 'backend',
    database: process.env['DATABASE'] ?? 'backend',
  },
});
