import { getCurrentUser } from '../../../server/session.ts';
import { BookingScreen } from './_components/booking-screen.tsx';

/**
 * U1 `/rezerwacja/[mentorId]`: the slot picker with the 10-minute hold (E3-S4). Guests see the
 * slots and „Dalej” sends them through sign-in with `returnTo`; the session comes from the cookie.
 */
export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ mentorId: string }>;
  searchParams: Promise<{ typ?: string; wygasla?: string }>;
}) {
  const { mentorId } = await params;
  const { typ, wygasla } = await searchParams;
  const user = await getCurrentUser();
  return (
    <main className="mx-auto flex w-full max-w-content flex-col gap-section px-page-x py-page-y">
      <BookingScreen
        mentorProfileId={mentorId}
        type={typ === 'plan' ? 'plan' : 'trial'}
        signedIn={user !== null}
        emailVerified={user?.emailVerified ?? false}
        email={user?.email}
        userTimeZone={user?.timeZone ?? null}
        notice={wygasla === '1' ? 'expired' : undefined}
      />
    </main>
  );
}
