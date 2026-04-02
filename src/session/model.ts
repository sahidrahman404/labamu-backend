import { Schema } from 'effect';
import { UserId } from '@/user/model.ts';

export const SessionId = Schema.Int.pipe(Schema.brand('SessionId'));
export type SessionId = typeof SessionId.Type;

export class Session extends Schema.Class<Session>('Session')({
  id: SessionId,
  userId: UserId,
  token: Schema.String,
  expiresAt: Schema.String,
  createdAt: Schema.String,
}) {}

export class SessionNotFoundError extends Schema.TaggedError<SessionNotFoundError>()(
  'SessionNotFoundError',
  {
    token: Schema.optional(Schema.String),
    id: Schema.optional(SessionId),
  },
) {}

export class SessionExpiredError extends Schema.TaggedError<SessionExpiredError>()(
  'SessionExpiredError',
  {
    token: Schema.String,
  },
) {}
