import { pgTable, text, timestamp, serial } from 'drizzle-orm/pg-core';

export const user = pgTable('users', {
  id: serial('id'),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
