import { Config, Context, Effect, Layer, Redacted, Schema } from 'effect';

const AppEnv = Schema.Literal('development', 'production').pipe(Schema.brand('AppEnv'));

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
    readonly otel: {
      readonly observabilityEnabled: boolean;
      readonly exporterUrl: string;
      readonly serviceName: string;
      readonly serviceVersion: string;
      readonly token: Redacted.Redacted;
      readonly dataset: string;
      readonly headers: string;
    };
    readonly api: {
      readonly port: number;
    };
    readonly appEnv: typeof AppEnv.Type;
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

      const observabilityEnabled = yield* Config.boolean('OBSERVABILITY_ENABLED');
      const exporterUrl = yield* Config.string('EXPORTER_URL');
      const serviceName = yield* Config.string('SERVICE_NAME');
      const serviceVersion = yield* Config.string('SERVICE_VERSION');
      const token = yield* Config.redacted('TOKEN');
      const dataset = yield* Config.string('DATASET');
      const headers = yield* Config.string('HEADERS');

      const appEnv = yield* Schema.Config('APP_ENV', AppEnv);
      const apiPort = yield* Config.integer('API_PORT');

      return ConfigService.of({
        database: {
          host,
          port,
          username,
          password,
          database,
        },
        otel: {
          observabilityEnabled,
          exporterUrl,
          serviceName,
          serviceVersion,
          token,
          dataset,
          headers,
        },
        api: {
          port: apiPort,
        },
        appEnv,
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
      otel: {
        observabilityEnabled: true,
        exporterUrl: 'http://localhost:4318',
        serviceName: 'backend',
        serviceVersion: '1.0.0',
        token: Redacted.make(''),
        dataset: '',
        headers: '',
      },
      api: {
        port: 8000,
      },
      appEnv: AppEnv.make('development'),
    }),
  );
}
