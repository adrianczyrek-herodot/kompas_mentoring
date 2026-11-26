'use client';

import {
  BookingApiError,
  createHold,
  fetchAvailability,
  idempotencyKeys,
  type AvailabilityView,
} from './booking-api.ts';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  browserTimeZone,
  resendVerificationLink,
  saveTimeZone,
} from '../../../_components/auth/auth-api.ts';
import { Temporal } from 'temporal-polyfill';
import { firstSlotOf, horizonEnd, nextWeekWithSlots, toWeeks } from './week.ts';
import {
  Alert,
  AlertTitle,
  EmailVerificationBanner,
  MentorSummaryBar,
  PageHeader,
  PolicyNotice,
  SlotGrid,
  StickyContinueButton,
  TimezoneSelect,
  ToastProvider,
  ToggleGroup,
  ToggleGroupItem,
  useToast,
} from '@kompas/ui';

export interface BookingScreenProps {
  readonly mentorProfileId: string;
  readonly type: 'trial' | 'plan';
  readonly signedIn: boolean;
  readonly emailVerified: boolean;
  /** The signed-in user's address: „Wyślij link ponownie” sends the new link there. */
  readonly email?: string | undefined;
  /** Q12: the zone stored on the account; `null` until the browser has written it once. */
  readonly userTimeZone?: string | null | undefined;
  /** U2 sent the student back because the hold expired („wygasla=1”). */
  readonly notice?: 'expired' | undefined;
}

const DEFAULT_ZONE = 'Europe/Warsaw';

/** Domain codes of `POST /bookings/holds` that U1 explains with a toast (key in `Booking.u1`). */
const HOLD_PROBLEMS: Record<string, 'notAcceptingNew' | 'trialRequired' | 'forbidden' | 'rateLimited'> = {
  'scheduling.not_accepting_new': 'notAcceptingNew',
  'scheduling.trial_required': 'trialRequired',
  'scheduling.forbidden': 'forbidden',
  'scheduling.hold_rate_limited': 'rateLimited',
};

/** U1 `/rezerwacja/[mentorId]`: slots in the viewer's zone, a 10-minute hold and „Dalej”. */
export function BookingScreen(props: BookingScreenProps) {
  const t = useTranslations('Booking');
  return (
    <ToastProvider closeLabel={t('common.toastClose')} regionLabel={t('common.toastRegion')}>
      <BookingBody {...props} />
    </ToastProvider>
  );
}

function BookingBody({
  mentorProfileId,
  type,
  signedIn,
  emailVerified,
  email,
  userTimeZone,
  notice,
}: BookingScreenProps) {
  const t = useTranslations('Booking');
  const router = useRouter();
  const toast = useToast();
  const durationId = useId();
  const [timeZone, setTimeZone] = useState(userTimeZone ?? DEFAULT_ZONE);
  const [duration, setDuration] = useState<30 | 60>(60);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [availability, setAvailability] = useState<AvailabilityView | null>(null);
  const [weekIndex, setWeekIndex] = useState(0);
  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>(undefined);
  const [holding, setHolding] = useState(false);
  // Only a signed-in student without a verified address is blocked; a guest simply logs in later.
  const [blockedEmail, setBlockedEmail] = useState(signedIn && !emailVerified);
  const [resending, setResending] = useState(false);
  // One key per chosen slot: a retry of the same „Dalej” replays the same hold (§4.6).
  const holdKey = useRef(idempotencyKeys());

  useEffect(() => {
    if (userTimeZone) return;
    const zone = browserTimeZone();
    if (zone === undefined) return;
    setTimeZone(zone);
    // Q12: an account without a stored zone takes the browser's, once.
    if (signedIn) void saveTimeZone(zone).catch(() => undefined);
  }, [signedIn, userTimeZone]);

  const onResend = async () => {
    if (email === undefined || resending) return;
    setResending(true);
    try {
      const sent = await resendVerificationLink(email);
      toast.add({ title: sent ? t('u1.resendSent') : t('u1.resendFailed') });
    } catch {
      toast.add({ title: t('u1.resendFailed') });
    } finally {
      setResending(false);
    }
  };

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const now = Temporal.Now.instant();
      const view = await fetchAvailability({
        mentorProfileId,
        from: now.toString(),
        to: now.add({ hours: 56 * 24 }).toString(),
        duration: type === 'trial' ? 30 : duration,
        type,
        timeZone,
      });
      setAvailability(view);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [mentorProfileId, type, duration, timeZone]);

  useEffect(() => {
    void load();
  }, [load]);

  const weeks = useMemo(
    () => toWeeks(availability?.slots ?? [], timeZone),
    [availability, timeZone],
  );
  const week = weeks[weekIndex];
  const hasSlotsThisWeek = week?.days.some((day) => day.slots.length > 0) ?? false;
  const nextWeekIndex = hasSlotsThisWeek ? null : nextWeekWithSlots(weeks, weekIndex + 1);
  const nextWeek = nextWeekIndex === null ? null : (weeks[nextWeekIndex] ?? null);
  const nextStart = nextWeek === null ? null : firstSlotOf(nextWeek);
  const currentWeekLabel = week?.label ?? '';

  const canGoPrev = weekIndex > 0;

  const onContinue = async () => {
    if (!signedIn) {
      const returnTo = `/rezerwacja/${mentorProfileId}${type === 'plan' ? '?typ=plan' : ''}`;
      router.push(`/logowanie?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }
    if (selectedSlotId === undefined || holding) return;
    setHolding(true);
    try {
      const input = {
        mentorProfileId,
        startsAt: selectedSlotId,
        durationMinutes: type === 'trial' ? 30 : duration,
        type,
      } as const;
      const hold = await createHold(input, holdKey.current(input));
      router.push(`/rezerwacja/${mentorProfileId}/platnosc?blokada=${hold.id}`);
    } catch (error) {
      const code = error instanceof BookingApiError ? error.code : 'unknown';
      const problem = HOLD_PROBLEMS[code];
      if (code === 'scheduling.email_not_verified') {
        setBlockedEmail(true);
      } else if (code === 'scheduling.slot_taken' || code === 'scheduling.student_busy') {
        setSelectedSlotId(undefined);
        toast.add({ title: t('u1.slotTaken'), description: t('u1.slotTakenDescription') });
        await load();
      } else if (code === 'scheduling.slot_unavailable') {
        setSelectedSlotId(undefined);
        toast.add({
          title: t('u1.slotUnavailable'),
          description: t('u1.slotUnavailableDescription'),
        });
        await load();
      } else if (problem !== undefined) {
        toast.add({ title: t(`u1.${problem}`) });
      } else {
        toast.add({ title: t('u1.holdFailed') });
      }
    } finally {
      setHolding(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-content flex-col gap-section">
      <PageHeader title={t('u1.title')} description={t('u1.lead')} />
      {notice === 'expired' ? (
        <Alert variant="warning" role="alert">
          <AlertTitle>{t('u2.expired')}</AlertTitle>
        </Alert>
      ) : null}
      {blockedEmail ? (
        <EmailVerificationBanner
          resending={resending}
          {...(email === undefined
            ? {}
            : {
                email,
                onResend: () => {
                  void onResend();
                },
              })}
        />
      ) : null}
      <MentorSummaryBar
        mentor={{
          name: t('u1.mentorName'),
          headline: t('u1.mentorHeadline'),
          verified: false,
        }}
        timeZone={availability?.mentorTimeZone}
      />
      {type === 'plan' ? (
        <div className="flex flex-col gap-tight">
          <p id={durationId} className="text-label font-medium text-text-default">
            {t('u1.duration')}
          </p>
          <ToggleGroup
            aria-labelledby={durationId}
            value={[String(duration)]}
            onValueChange={(value) => {
              const next = value[0];
              if (next === '30' || next === '60') setDuration(Number(next) as 30 | 60);
            }}
          >
            <ToggleGroupItem value="30">{t('u1.duration30')}</ToggleGroupItem>
            <ToggleGroupItem value="60">{t('u1.duration60')}</ToggleGroupItem>
          </ToggleGroup>
        </div>
      ) : (
        <p className="text-body-dense text-text-muted">{t('u1.trialFixed')}</p>
      )}
      <TimezoneSelect
        inputId="u1-zone"
        value={timeZone}
        onValueChange={setTimeZone}
        description={t('u1.zoneNote')}
      />
      <SlotGrid
        status={status}
        days={week?.days ?? []}
        timeZone={timeZone}
        weekLabel={currentWeekLabel}
        selectedSlotId={selectedSlotId}
        onSelect={(slot) => {
          setSelectedSlotId(slot.startsAt);
        }}
        canGoPrev={canGoPrev}
        onPrevWeek={() => {
          setWeekIndex((index) => Math.max(0, index - 1));
        }}
        onNextWeek={() => {
          setWeekIndex((index) => Math.min(weeks.length - 1, index + 1));
        }}
        nextAvailable={nextStart ?? undefined}
        onJumpToNext={() => {
          if (nextWeekIndex !== null) setWeekIndex(nextWeekIndex);
        }}
        onRetry={() => {
          void load();
        }}
      />
      <p className="text-meta text-text-muted">
        {t('u1.horizon', { date: horizonEnd(weeks) })}
      </p>
      <PolicyNotice state="free" timeZone={timeZone} />
      <StickyContinueButton
        disabled={selectedSlotId === undefined || blockedEmail || holding}
        disabledReason={
          blockedEmail
            ? t('u1.selectSlot')
            : selectedSlotId === undefined
              ? t('u1.selectSlot')
              : null
        }
        onClick={() => {
          void onContinue();
        }}
        hint={<p className="text-body text-text-default">{t('u1.holdHint')}</p>}
      >
        {signedIn ? t('u1.continue') : t('u1.signInToContinue')}
      </StickyContinueButton>
    </div>
  );
}
