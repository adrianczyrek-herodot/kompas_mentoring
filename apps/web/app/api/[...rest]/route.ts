import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { router } from '../../../server/router.ts';

// oRPC mounted in a Next.js route handler (spec §2.5): a thin adapter without business logic.
const handler = new OpenAPIHandler(router);

async function handle(request: Request): Promise<Response> {
  const { matched, response } = await handler.handle(request, { prefix: '/api' });
  return matched ? response : new Response('Not found', { status: 404 });
}

export const GET = handle;
export const POST = handle;
