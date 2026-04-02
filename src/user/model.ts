import { Schema } from 'effect';

export const UserId = Schema.Int.pipe(Schema.brand('UserId'));
export type UserId = typeof UserId.Type;

export class User extends Schema.Class<User>('User')({
  id: UserId,
  email: Schema.String,
  passwordHash: Schema.String,
  createdAt: Schema.String,
  updatedAt: Schema.String,
}) {}

export class CreateUserInput extends Schema.Class<CreateUserInput>('CreateUserInput')({
  email: Schema.String,
  password: Schema.String,
}) {}

export class UpdateUserInput extends Schema.Class<UpdateUserInput>('UpdateUserInput')({
  email: Schema.optional(Schema.String),
  password: Schema.optional(Schema.String),
}) {}

export class UserNotFoundError extends Schema.TaggedError<UserNotFoundError>()(
  'UserNotFoundError',
  {
    id: Schema.optional(UserId),
    email: Schema.optional(Schema.String),
  },
) {}

export class UserAlreadyExistsError extends Schema.TaggedError<UserAlreadyExistsError>()(
  'UserAlreadyExistsError',
  {
    email: Schema.String,
  },
) {}
