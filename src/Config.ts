import { Config } from 'effect';

export const AppConfig = Config.all({
  port: Config.integer('PORT').pipe(Config.withDefault(3000)),
});
