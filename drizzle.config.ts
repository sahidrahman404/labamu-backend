import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    ssl: false,
    host: process.env['HOST'] ?? 'localhost',
    port: Number(process.env['PORT'] ?? 5442),
    user: process.env['DB_USER'] ?? 'backend',
    password: process.env['PASSWORD'] ?? 'backend',
    database: process.env['DATABASE'] ?? 'backend',
  },
});
