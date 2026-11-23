import { BookingId, createRequestScope } from '@kompas/core';
import { redirect } from 'next/navigation';
import { getContainer } from '../../../../server/runtime.ts';
import { getCurrentUser } from '../../../../server/session.ts';
import { CheckoutScreen } from './_components/checkout-screen.tsx';

/**
 * U2 `/rezerwacja/[mentorId]/platnosc?blokada=<holdId>`: the summary and the goal before
 * `POST /checkout` (requirement 5). A missing or expired hold sends the student back to U1.
 */
export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ mentorId: string }>;
  searchParams: Promise<{ blokada?: string }>;
}) {
  const { mentorId } = await params;
  const { blokada } = await searchParams;
  const user = await getCurrentUser();
  const backToU1 = `/rezerwacja/${mentorId}?wygasla=1`;
  if (user === null) {
    const returnTo = `/rezerwacja/${mentorId}/platnosc?blokada=${blokada ?? ''}`;
    redirect(`/logowanie?returnTo=${encodeURIComponent(returnTo)}`);
  }
  const parsed = blokada === undefined ? undefined : BookingId.safeParse(blokada);
  if (parsed === undefined) redirect(backToU1);
  if (!parsed.success) redirect(backToU1);

  const scope = createRequestScope(getContainer(), { requestId: crypto.randomUUID() });
  const result = await scope.cradle.getBooking(user, parsed.data);
  const hold = result.isOk() ? result.value : null;
  if (hold === null) redirect(backToU1);
  if (hold.status !== 'hold') redirect(backToU1);
  if (hold.holdExpiresAt === null) redirect(backToU1);

  return (
    <main className="mx-auto flex w-full max-w-content flex-col gap-section px-page-x py-page-y">
      <CheckoutScreen
        mentorProfileId={mentorId}
        hold={{
          id: hold.id,
          startsAt: hold.startsAt.toString(),
          endsAt: hold.endsAt.toString(),
          type: hold.type === 'trial' ? 'trial' : 'plan',
          expiresAt: hold.holdExpiresAt.toString(),
          price: hold.price === null ? null : Number(hold.price.amount),
        }}
      />
    </main>
  );
}
