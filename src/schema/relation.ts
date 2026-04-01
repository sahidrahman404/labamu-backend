import { defineRelations } from 'drizzle-orm';
import * as schema from '@/schema/index.ts';

export const relations = defineRelations(schema, (r) => ({
  user: {
    sessions: r.many.session(),
  },
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
}));
