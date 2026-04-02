import { Context, Effect, Layer } from 'effect';
import { eq } from 'drizzle-orm';
import type { EffectDrizzleQueryError } from 'drizzle-orm/effect-core/errors';
import { DatabaseService } from '@/common/database-service.ts';
import { user as userTable } from '@/user/schema.ts';
import { type UserId, User, UserNotFoundError, UserAlreadyExistsError } from '@/user/model.ts';

export class UserRepository extends Context.Tag('@/user/repository/UserRepository')<
  UserRepository,
  {
    readonly findById: (
      id: UserId,
    ) => Effect.Effect<User, UserNotFoundError | EffectDrizzleQueryError>;
    readonly findByEmail: (
      email: string,
    ) => Effect.Effect<User, UserNotFoundError | EffectDrizzleQueryError>;
    readonly create: (input: {
      email: string;
      passwordHash: string;
    }) => Effect.Effect<User, UserAlreadyExistsError | EffectDrizzleQueryError>;
    readonly update: (
      id: UserId,
      input: { email?: string; passwordHash?: string },
    ) => Effect.Effect<User, UserNotFoundError | EffectDrizzleQueryError>;
    readonly delete: (
      id: UserId,
    ) => Effect.Effect<void, UserNotFoundError | EffectDrizzleQueryError>;
  }
>() {
  static readonly layer = Layer.effect(
    UserRepository,
    Effect.gen(function* () {
      const db = yield* DatabaseService;

      const findById = Effect.fn('UserRepository.findById')(function* (id: UserId) {
        const rows = yield* db.select().from(userTable).where(eq(userTable.id, id));
        const row = rows[0];
        if (!row) return yield* UserNotFoundError.make({ id });
        return User.make({
          id: row.id as UserId,
          email: row.email,
          passwordHash: row.passwordHash,
          createdAt: String(row.createdAt),
          updatedAt: String(row.updatedAt),
        });
      });

      const findByEmail = Effect.fn('UserRepository.findByEmail')(function* (email: string) {
        const rows = yield* db.select().from(userTable).where(eq(userTable.email, email));
        const row = rows[0];
        if (!row) return yield* UserNotFoundError.make({ email });
        return User.make({
          id: row.id as UserId,
          email: row.email,
          passwordHash: row.passwordHash,
          createdAt: String(row.createdAt),
          updatedAt: String(row.updatedAt),
        });
      });

      const create = Effect.fn('UserRepository.create')(function* (input: {
        email: string;
        passwordHash: string;
      }) {
        const existing = yield* db.select().from(userTable).where(eq(userTable.email, input.email));
        if (existing[0]) {
          return yield* UserAlreadyExistsError.make({ email: input.email });
        }
        const rows = yield* db
          .insert(userTable)
          .values({ email: input.email, passwordHash: input.passwordHash })
          .returning();
        const row = rows[0]!;
        return User.make({
          id: row.id as UserId,
          email: row.email,
          passwordHash: row.passwordHash,
          createdAt: String(row.createdAt),
          updatedAt: String(row.updatedAt),
        });
      });

      const update = Effect.fn('UserRepository.update')(function* (
        id: UserId,
        input: { email?: string; passwordHash?: string },
      ) {
        const rows = yield* db
          .update(userTable)
          .set({
            ...(input.email ? { email: input.email } : {}),
            ...(input.passwordHash ? { passwordHash: input.passwordHash } : {}),
            updatedAt: new Date(),
          })
          .where(eq(userTable.id, id))
          .returning();
        const row = rows[0];
        if (!row) return yield* UserNotFoundError.make({ id });
        return User.make({
          id: row.id as UserId,
          email: row.email,
          passwordHash: row.passwordHash,
          createdAt: String(row.createdAt),
          updatedAt: String(row.updatedAt),
        });
      });

      const deleteUser = Effect.fn('UserRepository.delete')(function* (id: UserId) {
        const rows = yield* db.delete(userTable).where(eq(userTable.id, id)).returning();
        if (!rows[0]) return yield* UserNotFoundError.make({ id });
      });

      return UserRepository.of({
        findById,
        findByEmail,
        create,
        update,
        delete: deleteUser,
      });
    }),
  );
  static readonly defaultLayer = UserRepository.layer.pipe(
    Layer.provideMerge(DatabaseService.defaultLayer),
  );
}
