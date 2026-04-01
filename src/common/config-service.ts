import { Config, Context, Effect, Layer, Redacted } from 'effect';

export class ConfigService extends Context.Tag('@/common/config-service/ConfigService')<
  ConfigService,
  {
    readonly database: {
      readonly host: string;
      readonly port: number;
      readonly username: string;
      readonly password: Redacted.Redacted;
      readonly database: string;
    };
  }
>() {
  static readonly layer = Layer.effect(
    ConfigService,
    Effect.gen(function* () {
      const host = yield* Config.string('HOST');
      const port = yield* Config.integer('PORT');
      const username = yield* Config.string('USERNAME');
      const password = yield* Config.redacted('PASSWORD');
      const database = yield* Config.string('DATABASE');

      return ConfigService.of({
        database: {
          host,
          port,
          username,
          password,
          database,
        },
      });
    }),
  );
  static readonly devLayer = Layer.succeed(
    ConfigService,
    ConfigService.of({
      database: {
        host: 'localhost',
        port: 5442,
        username: 'backend',
        password: Redacted.make('backend'),
        database: 'backend',
      },
    }),
  );
}
