import { HttpApi, HttpApiBuilder } from '@effect/platform';

export class MyApi extends HttpApi.make('api').prefix('/api') {}

export const ApiLayer = HttpApiBuilder.api(MyApi);
