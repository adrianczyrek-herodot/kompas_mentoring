import { getContainer } from '../../../../server/runtime.ts';

// Better Auth endpoints (sign-in, sign-up, OAuth callbacks, sign-out) — a thin adapter.
// The container is resolved per request, so `next build` never needs the environment.
const handle = (request: Request): Promise<Response> => getContainer().cradle.auth.handler(request);

export const GET = handle;
export const POST = handle;
