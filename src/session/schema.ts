import { pgTable, text, timestamp, integer, serial } from 'drizzle-orm/pg-core';

export const session = pgTable('sessions', {
  id: serial('id'),
  userId: integer('user_id').notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
