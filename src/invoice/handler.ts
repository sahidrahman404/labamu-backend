import { HttpApiBuilder } from '@effect/platform';
import { Effect, Layer } from 'effect';
import { MyApi } from '@/common/api.ts';
import { InvoiceService } from '@/invoice/service.ts';
import { InvoiceRepo } from '@/invoice/invoice-repo.ts';

const InvoiceHandlers = HttpApiBuilder.group(MyApi, 'invoice', (handlers) =>
  handlers
    .handle('getProducts', () =>
      Effect.gen(function* () {
        const service = yield* InvoiceService;
        return yield* service.getProducts();
      }),
    )
    .handle('previewInvoice', (_) =>
      Effect.gen(function* () {
        const service = yield* InvoiceService;
        return yield* service.previewInvoice(_.payload);
      }),
    ),
);

export const InvoiceHandlersDefaultLayer = InvoiceHandlers.pipe(
  Layer.provideMerge(InvoiceService.defaultLayer),
  Layer.provideMerge(InvoiceRepo.inMemoryLayer),
);
