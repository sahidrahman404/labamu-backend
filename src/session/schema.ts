import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const session = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
