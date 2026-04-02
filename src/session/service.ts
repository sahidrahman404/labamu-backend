import { Clock, Context, Effect, Layer } from 'effect';
import type { EffectDrizzleQueryError } from 'drizzle-orm/effect-core/errors';
import { SessionRepository } from '@/session/repository.ts';
import { Session, SessionNotFoundError, SessionExpiredError } from '@/session/model.ts';
import { type UserId } from '@/user/model.ts';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export class SessionService extends Context.Tag('@/session/service/SessionService')<
  SessionService,
  {
    readonly createSession: (userId: UserId) => Effect.Effect<Session, EffectDrizzleQueryError>;
    readonly validateSession: (
      token: string,
    ) => Effect.Effect<
      Session,
      SessionNotFoundError | SessionExpiredError | EffectDrizzleQueryError
    >;
    readonly invalidateSession: (
      token: string,
    ) => Effect.Effect<void, SessionNotFoundError | EffectDrizzleQueryError>;
    readonly invalidateAllUserSessions: (
      userId: UserId,
    ) => Effect.Effect<void, EffectDrizzleQueryError>;
  }
>() {
  static readonly layer = Layer.effect(
    SessionService,
    Effect.gen(function* () {
      const repo = yield* SessionRepository;

      const createSession = Effect.fn('SessionService.createSession')(function* (userId: UserId) {
        const now = yield* Clock.currentTimeMillis;
        const token = crypto.randomUUID();
        const expiresAt = new Date(now + SESSION_TTL_MS);
        return yield* repo.create({ userId, token, expiresAt });
      });

      const validateSession = Effect.fn('SessionService.validateSession')(function* (
        token: string,
      ) {
        const session = yield* repo.findByToken(token);
        const now = yield* Clock.currentTimeMillis;
        if (new Date(session.expiresAt).getTime() < now) {
          return yield* SessionExpiredError.make({ token });
        }
        return session;
      });

      const invalidateSession = Effect.fn('SessionService.invalidateSession')(function* (
        token: string,
      ) {
        return yield* repo.deleteByToken(token);
      });

      const invalidateAllUserSessions = Effect.fn('SessionService.invalidateAllUserSessions')(
        function* (userId: UserId) {
          return yield* repo.deleteByUserId(userId);
        },
      );

      return SessionService.of({
        createSession,
        validateSession,
        invalidateSession,
        invalidateAllUserSessions,
      });
    }),
  );
  static readonly defaultLayer = SessionService.layer.pipe(
    Layer.provideMerge(SessionRepository.defaultLayer),
  );
}
