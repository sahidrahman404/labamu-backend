import { Context, Effect, Layer, Schema } from 'effect';
import type { EffectDrizzleQueryError } from 'drizzle-orm/effect-core/errors';
import { UserRepository } from '@/user/repository.ts';
import { type UserId, User, UserNotFoundError, UserAlreadyExistsError } from '@/user/model.ts';

export class InvalidPasswordError extends Schema.TaggedError<InvalidPasswordError>()(
  'InvalidPasswordError',
  {},
) {}

export class UserService extends Context.Tag('@/user/service/UserService')<
  UserService,
  {
    readonly register: (
      email: string,
      password: string,
    ) => Effect.Effect<User, UserAlreadyExistsError | EffectDrizzleQueryError>;
    readonly findById: (
      id: UserId,
    ) => Effect.Effect<User, UserNotFoundError | EffectDrizzleQueryError>;
    readonly findByEmail: (
      email: string,
    ) => Effect.Effect<User, UserNotFoundError | EffectDrizzleQueryError>;
    readonly verifyPassword: (
      email: string,
      password: string,
    ) => Effect.Effect<User, UserNotFoundError | InvalidPasswordError | EffectDrizzleQueryError>;
    readonly delete: (
      id: UserId,
    ) => Effect.Effect<void, UserNotFoundError | EffectDrizzleQueryError>;
  }
>() {
  static readonly layer = Layer.effect(
    UserService,
    Effect.gen(function* () {
      const repo = yield* UserRepository;

      const register = Effect.fn('UserService.register')(function* (
        email: string,
        password: string,
      ) {
        const passwordHash = yield* Effect.promise(() => Bun.password.hash(password));
        return yield* repo.create({ email, passwordHash });
      });

      const findById = Effect.fn('UserService.findById')(function* (id: UserId) {
        return yield* repo.findById(id);
      });

      const findByEmail = Effect.fn('UserService.findByEmail')(function* (email: string) {
        return yield* repo.findByEmail(email);
      });

      const verifyPassword = Effect.fn('UserService.verifyPassword')(function* (
        email: string,
        password: string,
      ) {
        const user = yield* repo.findByEmail(email);
        const valid = yield* Effect.promise(() => Bun.password.verify(password, user.passwordHash));
        if (!valid) {
          return yield* new InvalidPasswordError();
        }
        return user;
      });

      const deleteUser = Effect.fn('UserService.delete')(function* (id: UserId) {
        return yield* repo.delete(id);
      });

      return UserService.of({
        register,
        findById,
        findByEmail,
        verifyPassword,
        delete: deleteUser,
      });
    }),
  );
  static readonly defaultLayer = UserService.layer.pipe(
    Layer.provideMerge(UserRepository.defaultLayer),
  );
}
