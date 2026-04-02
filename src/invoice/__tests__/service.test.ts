import { describe, expect, it } from '@effect/vitest';
import { Effect } from 'effect';
import { InvoiceService } from '@/invoice/service.ts';
import { InvoiceItemRequest, ProductId, PreviewInvoiceRequest } from '@/invoice/model.ts';

describe('InvoiceService', () => {
  describe('getProducts', () => {
    it.effect('returns all seeded products', () =>
      Effect.gen(function* () {
        const service = yield* InvoiceService;

        const products = yield* service.getProducts();

        expect(products).toHaveLength(3);
        expect(products.map((p) => p.name).sort()).toEqual(['Keyboard', 'Laptop', 'Monitor']);
      }).pipe(Effect.provide(InvoiceService.inMemoryLayer)),
    );
  });

  describe('previewInvoice', () => {
    it.effect('calculates correct totals for valid request in IDR', () =>
      Effect.gen(function* () {
        const service = yield* InvoiceService;

        const result = yield* service.previewInvoice(
          new PreviewInvoiceRequest({
            currency: 'IDR',
            items: [
              new InvoiceItemRequest({ productId: ProductId.make('p1'), qty: 1 }),
              new InvoiceItemRequest({ productId: ProductId.make('p2'), qty: 2 }),
            ],
          }),
        );

        expect(result.currency).toBe('IDR');
        expect(result.subtotalIDR).toBe(15000000 + 2 * 2500000);
        expect(result.totalInCurrency).toBe(result.subtotalIDR);
        expect(result.items).toHaveLength(2);
        expect(result.items[0]!.lineTotalIDR).toBe(15000000);
        expect(result.items[1]!.lineTotalIDR).toBe(5000000);
      }).pipe(Effect.provide(InvoiceService.inMemoryLayer)),
    );

    it.effect('converts currency to USD when requested', () =>
      Effect.gen(function* () {
        const service = yield* InvoiceService;

        const result = yield* service.previewInvoice(
          new PreviewInvoiceRequest({
            currency: 'USD',
            items: [new InvoiceItemRequest({ productId: ProductId.make('p3'), qty: 1 })],
          }),
        );

        expect(result.currency).toBe('USD');
        expect(result.subtotalIDR).toBe(500000);
        expect(result.totalInCurrency).toBe(500000 * 0.000065);
      }).pipe(Effect.provide(InvoiceService.inMemoryLayer)),
    );

    it.effect('returns ValidationError when items array is empty', () =>
      Effect.gen(function* () {
        const service = yield* InvoiceService;

        const result = yield* Effect.either(
          service.previewInvoice(
            new PreviewInvoiceRequest({
              currency: 'IDR',
              items: [],
            }),
          ),
        );

        expect(result._tag).toBe('Left');
        if (result._tag === 'Left') {
          expect(result.left.message).toBe('Validation failed');
          expect(result.left.errors?.[0]?.message).toBe('Items array cannot be empty');
        }
      }).pipe(Effect.provide(InvoiceService.inMemoryLayer)),
    );

    it.effect('returns ValidationError when qty is less than 1', () =>
      Effect.gen(function* () {
        const service = yield* InvoiceService;

        const result = yield* Effect.either(
          service.previewInvoice(
            new PreviewInvoiceRequest({
              currency: 'IDR',
              items: [new InvoiceItemRequest({ productId: ProductId.make('p1'), qty: 0 })],
            }),
          ),
        );

        expect(result._tag).toBe('Left');
        if (result._tag === 'Left') {
          expect(result.left.errors?.[0]?.field).toBe('items[0].qty');
        }
      }).pipe(Effect.provide(InvoiceService.inMemoryLayer)),
    );

    it.effect('returns ValidationError when productId not found', () =>
      Effect.gen(function* () {
        const service = yield* InvoiceService;

        const result = yield* Effect.either(
          service.previewInvoice(
            new PreviewInvoiceRequest({
              currency: 'IDR',
              items: [
                new InvoiceItemRequest({
                  productId: ProductId.make('unknown'),
                  qty: 1,
                }),
              ],
            }),
          ),
        );

        expect(result._tag).toBe('Left');
        if (result._tag === 'Left') {
          expect(result.left.errors?.[0]?.message).toBe("Product with id 'unknown' not found");
        }
      }).pipe(Effect.provide(InvoiceService.inMemoryLayer)),
    );
  });
});
