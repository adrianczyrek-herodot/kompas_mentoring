import { BookingId, createRequestScope } from '@kompas/core';
import { BookingConfirmation, PageHeader } from '@kompas/ui';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getContainer } from '../../../../server/runtime.ts';
import { getCurrentUser } from '../../../../server/session.ts';

/**
 * U3 `/rezerwacja/potwierdzenie/[bookingId]`: status and the `.ics` (requirement 6). The dynamic
 * segment sits under `potwierdzenie/` because Next allows only one segment name at `rezerwacja/`.
 */
export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const user = await getCurrentUser();
  if (user === null) {
    redirect(`/logowanie?returnTo=${encodeURIComponent(`/rezerwacja/potwierdzenie/${bookingId}`)}`);
  }
  const parsed = BookingId.safeParse(bookingId);
  if (!parsed.success) notFound();

  const scope = createRequestScope(getContainer(), { requestId: crypto.randomUUID() });
  const result = await scope.cradle.getBooking(user, parsed.data);
  if (result.isErr()) notFound();
  const booking = result.value;
  const t = await getTranslations('Booking');

  return (
    <main className="mx-auto flex w-full max-w-content flex-col gap-section px-page-x py-page-y">
      <PageHeader title={t('u3.title')} />
      <BookingConfirmation
        status={booking.status === 'requested' ? 'requested' : 'scheduled'}
        startsAt={booking.startsAt.toString()}
        endsAt={booking.endsAt.toString()}
        timeZone={user.timeZone ?? 'Europe/Warsaw'}
        acceptDeadlineAt={booking.acceptDeadlineAt?.toString() ?? null}
        icsHref={`/api/bookings/${booking.id}/ics`}
      />
    </main>
  );
}
