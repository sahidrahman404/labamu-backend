import { Context, Effect, Layer, Ref } from 'effect';
import { type Product, type ProductId, ProductNotFound } from '@/invoice/model.ts';

export class InvoiceRepo extends Context.Tag('@/invoice/invoice-repo/InvoiceRepo')<
  InvoiceRepo,
  {
    readonly getProductById: (id: ProductId) => Effect.Effect<Product, ProductNotFound>;
    readonly getAllProducts: () => Effect.Effect<readonly Product[]>;
    readonly seedProducts: () => Effect.Effect<void>;
  }
>() {
  static readonly inMemoryLayer = Layer.effect(
    InvoiceRepo,
    Effect.gen(function* () {
      const productsRef = yield* Ref.make<readonly Product[]>([
        { id: 'p1' as ProductId, name: 'Laptop', priceInIDR: 15000000 },
        { id: 'p2' as ProductId, name: 'Monitor', priceInIDR: 2500000 },
        { id: 'p3' as ProductId, name: 'Keyboard', priceInIDR: 500000 },
      ]);

      const getProductById = Effect.fn('InvoiceRepo.getProductById')(function* (id: ProductId) {
        const products = yield* Ref.get(productsRef);
        const found = products.find((p) => p.id === id);

        if (!found) {
          return yield* new ProductNotFound({ productId: id });
        }

        return found;
      });

      const getAllProducts = Effect.fn('InvoiceRepo.getAllProducts')(function* () {
        return yield* Ref.get(productsRef);
      });

      const seedProducts = Effect.fn('InvoiceRepo.seedProducts')(function* () {
        yield* Ref.update(productsRef, (existing) => existing);
      });

      return InvoiceRepo.of({
        getProductById,
        getAllProducts,
        seedProducts,
      });
    }),
  );
}
