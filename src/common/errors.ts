import { HttpApiSchema } from '@effect/platform';
import { Schema } from 'effect';

export class InternalServerError extends Schema.TaggedError<InternalServerError>()(
  'InternalServerError',
  { message: Schema.optional(Schema.String) },
  HttpApiSchema.annotations({ status: 500 }),
) {}
