import { BunRuntime } from '@effect/platform-bun';
import { Effect } from 'effect';
import { App } from '@/App.ts';

const program = Effect.logInfo('Starting server...').pipe(Effect.provide(App));

BunRuntime.runMain(program);
