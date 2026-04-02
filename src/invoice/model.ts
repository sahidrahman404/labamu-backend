import { HttpApiSchema } from '@effect/platform';
import { Schema } from 'effect';

export const SupportedCurrency = Schema.Literal('IDR', 'USD');
export type SupportedCurrency = typeof SupportedCurrency.Type;

export const ProductId = Schema.String.pipe(Schema.brand('ProductId'));
export type ProductId = typeof ProductId.Type;

export class Product extends Schema.Class<Product>('Product')({
  id: ProductId,
  name: Schema.String,
  priceInIDR: Schema.Number,
}) {}

export class ProductNotFound extends Schema.TaggedError<ProductNotFound>()('ProductNotFound', {
  productId: ProductId,
}) {}

export const ExchangeRates: { readonly [key: string]: number } = {
  IDR: 1,
  USD: 0.000065,
};

export class InvoiceItemRequest extends Schema.Class<InvoiceItemRequest>('InvoiceItemRequest')({
  productId: ProductId,
  qty: Schema.Number,
}) {}

export class PreviewInvoiceRequest extends Schema.Class<PreviewInvoiceRequest>(
  'PreviewInvoiceRequest',
)({
  currency: SupportedCurrency,
  items: Schema.Array(InvoiceItemRequest),
}) {}

export class PreviewInvoiceItem extends Schema.Class<PreviewInvoiceItem>('PreviewInvoiceItem')({
  productId: ProductId,
  name: Schema.String,
  unitPriceIDR: Schema.Number,
  qty: Schema.Number,
  lineTotalIDR: Schema.Number,
}) {}

export class PreviewInvoiceResponse extends Schema.Class<PreviewInvoiceResponse>(
  'PreviewInvoiceResponse',
)({
  currency: SupportedCurrency,
  subtotalIDR: Schema.Number,
  totalInCurrency: Schema.Number,
  items: Schema.Array(PreviewInvoiceItem),
}) {}

export class ValidationError extends Schema.TaggedError<ValidationError>()(
  'ValidationError',
  {
    message: Schema.String,
    field: Schema.optional(Schema.String),
    errors: Schema.optional(
      Schema.Array(
        Schema.Struct({
          message: Schema.String,
          field: Schema.optional(Schema.String),
        }),
      ),
    ),
  },
  HttpApiSchema.annotations({ status: 400 }),
) {}
