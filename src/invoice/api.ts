import { HttpApiEndpoint, HttpApiGroup } from '@effect/platform';
import { Schema } from 'effect';
import {
  Product,
  PreviewInvoiceRequest,
  PreviewInvoiceResponse,
  ValidationError,
} from '@/invoice/model.ts';

export class InvoiceApi extends HttpApiGroup.make('invoice')
  .add(HttpApiEndpoint.get('getProducts', '/products').addSuccess(Schema.Array(Product)))
  .add(
    HttpApiEndpoint.post('previewInvoice', '/invoices/preview')
      .setPayload(PreviewInvoiceRequest)
      .addSuccess(PreviewInvoiceResponse)
      .addError(ValidationError),
  ) {}
