import { Context, Effect, Layer } from 'effect';
import {
  type Product,
  type PreviewInvoiceRequest,
  type PreviewInvoiceResponse,
  type PreviewInvoiceItem,
  ExchangeRates,
  ValidationError,
} from '@/invoice/model.ts';
import { InvoiceRepo } from '@/invoice/invoice-repo.ts';

const validatePreviewRequest = (
  request: PreviewInvoiceRequest,
  productMap: Map<string, Product>,
): Effect.Effect<void, ValidationError> => {
  const errors: Array<{ message: string; field?: string }> = [];

  if (request.items.length === 0) {
    errors.push({ message: 'Items array cannot be empty', field: 'items' });
  }

  request.items.forEach((item, index) => {
    if (item.qty < 1) {
      errors.push({
        message: `Quantity must be at least 1`,
        field: `items[${index}].qty`,
      });
    }
    if (!productMap.has(item.productId)) {
      errors.push({
        message: `Product with id '${item.productId}' not found`,
        field: `items[${index}].productId`,
      });
    }
  });

  if (errors.length > 0) {
    return new ValidationError({
      message: 'Validation failed',
      errors,
    }).pipe(Effect.fail);
  }

  return Effect.void;
};

const calculatePreview = (
  request: PreviewInvoiceRequest,
  productMap: Map<string, Product>,
): PreviewInvoiceResponse => {
  const previewItems: PreviewInvoiceItem[] = request.items.map((item) => {
    const product = productMap.get(item.productId)!;
    return {
      productId: item.productId,
      name: product.name,
      unitPriceIDR: product.priceInIDR,
      qty: item.qty,
      lineTotalIDR: product.priceInIDR * item.qty,
    };
  });

  const subtotalIDR = previewItems.reduce((sum, item) => sum + item.lineTotalIDR, 0);

  const rate = ExchangeRates[request.currency] ?? 1;
  const totalInCurrency = subtotalIDR * rate;

  return {
    currency: request.currency,
    subtotalIDR,
    totalInCurrency,
    items: previewItems,
  };
};

export class InvoiceService extends Context.Tag('@/invoice/service/InvoiceService')<
  InvoiceService,
  {
    readonly getProducts: () => Effect.Effect<Product[]>;
    readonly previewInvoice: (
      request: PreviewInvoiceRequest,
    ) => Effect.Effect<PreviewInvoiceResponse, ValidationError>;
  }
>() {
  static readonly layer = Layer.effect(
    InvoiceService,
    Effect.gen(function* () {
      const repo = yield* InvoiceRepo;

      const getProducts = Effect.fn('@/invoice/service/InvoiceService.getProducts')(function* () {
        return [...(yield* repo.getAllProducts())];
      });

      const previewInvoice = Effect.fn('@/invoice/service/InvoiceService.previewInvoice')(
        function* (request: PreviewInvoiceRequest) {
          const products = yield* repo.getAllProducts();
          const productMap = new Map<string, Product>(products.map((p) => [p.id, p]));

          yield* validatePreviewRequest(request, productMap);
          return calculatePreview(request, productMap);
        },
      );

      return InvoiceService.of({
        getProducts,
        previewInvoice,
      });
    }),
  );

  static readonly defaultLayer = InvoiceService.layer.pipe(
    Layer.provideMerge(InvoiceRepo.inMemoryLayer),
  );

  static readonly inMemoryLayer = InvoiceService.layer.pipe(
    Layer.provideMerge(InvoiceRepo.inMemoryLayer),
  );
}
