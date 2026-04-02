import { HttpLayer } from '@/common/server';
import { BunRuntime } from '@effect/platform-bun';
import { Layer } from 'effect';

HttpLayer.pipe(Layer.launch, BunRuntime.runMain);
