import { BookingId, createRequestScope } from '@kompas/core';
import { toIcs } from '@kompas/core/scheduling';
import { getContainer } from '../../../../../server/runtime.ts';

/**
 * `GET /api/bookings/{id}/ics` (requirement 20): streams the calendar file of one booking. A Next
 * route handler, not an oRPC procedure, because the response is `text/calendar`, not JSON; it sits
 * beside the oRPC catch-all at `/api` and takes precedence for this path.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  const scope = createRequestScope(getContainer(), { requestId: crypto.randomUUID() });
  const actor = await scope.cradle.getCurrentUser(request.headers);
  if (actor === null) return new Response('Unauthorized', { status: 401 });

  const parsed = BookingId.safeParse(id);
  if (!parsed.success) return new Response('Not found', { status: 404 });
  const result = await scope.cradle.getBooking(actor, parsed.data);
  // One answer for a foreign and an unknown booking (spec §8).
  if (result.isErr()) return new Response('Not found', { status: 404 });

  const ics = toIcs(result.value);
  return new Response(ics.content, {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': `attachment; filename="${ics.filename}"`,
    },
  });
}
