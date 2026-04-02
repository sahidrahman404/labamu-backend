import { ApiLayer } from '@/common/api';
import { ConfigService } from '@/common/config-service';
import { OtelLayer } from '@/common/otel';
import { HttpApiBuilder, HttpApiScalar, HttpMiddleware, HttpServer } from '@effect/platform';
import { BunContext, BunHttpServer } from '@effect/platform-bun';
import { Effect, Layer } from 'effect';

const ScalarLayer = HttpApiScalar.layer({
  path: '/docs',
  scalar: {
    theme: 'solarized',
    layout: 'modern',
  },
});

const BunHttpServerLayer = Layer.unwrapEffect(
  Effect.gen(function* () {
    const {
      api: { port },
    } = yield* ConfigService;
    return BunHttpServer.layer({ port, hostname: '0.0.0.0' });
  }),
);

const BunHttpServerDefaultLayer = BunHttpServerLayer.pipe(
  Layer.provideMerge(ConfigService.layer),
  Layer.provideMerge(BunContext.layer),
);

export const HttpLayer = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  HttpServer.withLogAddress,
  Layer.provideMerge(ScalarLayer),
  Layer.provideMerge(HttpApiBuilder.middlewareOpenApi()),
  Layer.provideMerge(ApiLayer),
  Layer.provideMerge(OtelLayer),
  Layer.provideMerge(HttpApiBuilder.middlewareCors()),
  Layer.provideMerge(BunHttpServerDefaultLayer),
);
