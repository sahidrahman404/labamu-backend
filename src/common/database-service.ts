import { Context, Effect, Layer } from 'effect';
import * as PgDrizzle from 'drizzle-orm/effect-postgres';
import { ConfigService } from '@/common/config-service.ts';
import { PgClient as pgClient } from '@effect/sql-pg';
import { types } from 'pg';
import { relations } from '@/schema/relation';
import type { PgClient } from '@effect/sql-pg/PgClient';

const PgLayer = Layer.unwrapEffect(
  Effect.gen(function* () {
    const { database } = yield* ConfigService;
    return pgClient.layer({
      password: database.password,
      username: database.username,
      database: database.database,
      host: database.host,
      port: database.port,
      ssl: false,
      types: {
        getTypeParser: (typeId, format) => {
          if ([1184, 1114, 1082, 1186, 1231, 1115, 1185, 1187, 1182].includes(typeId)) {
            return (val: unknown) => val;
          }
          return types.getTypeParser(typeId, format);
        },
      },
    });
  }),
);

const PgDefaultLayer = PgLayer.pipe(Layer.provideMerge(ConfigService.layer));

export class DatabaseService extends Context.Tag('@src/common/database-service/DatabaseService')<
  DatabaseService,
  PgDrizzle.EffectPgDatabase<Record<string, never>, typeof relations> & {
    $client: PgClient;
  }
>() {
  static readonly layer = Layer.effect(DatabaseService, PgDrizzle.make({ relations }));
  static readonly defaultLayer = DatabaseService.layer.pipe(
    Layer.provideMerge(PgDrizzle.DefaultServices),
    Layer.provideMerge(PgDefaultLayer),
  );
}
