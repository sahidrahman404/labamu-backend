import { HttpApi, HttpApiBuilder } from '@effect/platform';
import { InvoiceApi } from '@/invoice/api.ts';

export class MyApi extends HttpApi.make('api').add(InvoiceApi).prefix('/api') {}

export const ApiLayer = HttpApiBuilder.api(MyApi);
