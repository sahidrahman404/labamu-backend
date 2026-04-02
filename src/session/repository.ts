import { Context, Effect, Layer } from 'effect';
import { eq } from 'drizzle-orm';
import type { EffectDrizzleQueryError } from 'drizzle-orm/effect-core/errors';
import { DatabaseService } from '@/common/database-service.ts';
import { session as sessionTable } from '@/session/schema.ts';
import { type UserId } from '@/user/model.ts';
import { type SessionId, Session, SessionNotFoundError } from '@/session/model.ts';

export class SessionRepository extends Context.Tag('@/session/repository/SessionRepository')<
  SessionRepository,
  {
    readonly findById: (
      id: SessionId,
    ) => Effect.Effect<Session, SessionNotFoundError | EffectDrizzleQueryError>;
    readonly findByToken: (
      token: string,
    ) => Effect.Effect<Session, SessionNotFoundError | EffectDrizzleQueryError>;
    readonly create: (input: {
      userId: UserId;
      token: string;
      expiresAt: Date;
    }) => Effect.Effect<Session, EffectDrizzleQueryError>;
    readonly deleteById: (
      id: SessionId,
    ) => Effect.Effect<void, SessionNotFoundError | EffectDrizzleQueryError>;
    readonly deleteByToken: (
      token: string,
    ) => Effect.Effect<void, SessionNotFoundError | EffectDrizzleQueryError>;
    readonly deleteByUserId: (userId: UserId) => Effect.Effect<void, EffectDrizzleQueryError>;
  }
>() {
  static readonly layer = Layer.effect(
    SessionRepository,
    Effect.gen(function* () {
      const db = yield* DatabaseService;

      const findById = Effect.fn('SessionRepository.findById')(function* (id: SessionId) {
        const rows = yield* db.select().from(sessionTable).where(eq(sessionTable.id, id));
        const row = rows[0];
        if (!row) return yield* SessionNotFoundError.make({ id });
        return Session.make({
          id: row.id as SessionId,
          userId: row.userId as UserId,
          token: row.token,
          expiresAt: String(row.expiresAt),
          createdAt: String(row.createdAt),
        });
      });

      const findByToken = Effect.fn('SessionRepository.findByToken')(function* (token: string) {
        const rows = yield* db.select().from(sessionTable).where(eq(sessionTable.token, token));
        const row = rows[0];
        if (!row) return yield* SessionNotFoundError.make({ token });
        return Session.make({
          id: row.id as SessionId,
          userId: row.userId as UserId,
          token: row.token,
          expiresAt: String(row.expiresAt),
          createdAt: String(row.createdAt),
        });
      });

      const create = Effect.fn('SessionRepository.create')(function* (input: {
        userId: UserId;
        token: string;
        expiresAt: Date;
      }) {
        const rows = yield* db
          .insert(sessionTable)
          .values({
            userId: input.userId,
            token: input.token,
            expiresAt: input.expiresAt,
          })
          .returning();
        const row = rows[0]!;
        return Session.make({
          id: row.id as SessionId,
          userId: row.userId as UserId,
          token: row.token,
          expiresAt: String(row.expiresAt),
          createdAt: String(row.createdAt),
        });
      });

      const deleteById = Effect.fn('SessionRepository.deleteById')(function* (id: SessionId) {
        const rows = yield* db.delete(sessionTable).where(eq(sessionTable.id, id)).returning();
        if (!rows[0]) return yield* SessionNotFoundError.make({ id });
      });

      const deleteByToken = Effect.fn('SessionRepository.deleteByToken')(function* (token: string) {
        const rows = yield* db
          .delete(sessionTable)
          .where(eq(sessionTable.token, token))
          .returning();
        if (!rows[0]) return yield* SessionNotFoundError.make({ token });
      });

      const deleteByUserId = Effect.fn('SessionRepository.deleteByUserId')(function* (
        userId: UserId,
      ) {
        yield* db.delete(sessionTable).where(eq(sessionTable.userId, userId));
      });

      return SessionRepository.of({
        findById,
        findByToken,
        create,
        deleteById,
        deleteByToken,
        deleteByUserId,
      });
    }),
  );
  static readonly defaultLayer = SessionRepository.layer.pipe(
    Layer.provideMerge(DatabaseService.defaultLayer),
  );
}
