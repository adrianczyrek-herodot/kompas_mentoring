'use client';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  HoldCountdown,
  MentorSummaryBar,
  OrderSummary,
  PageHeader,
  PolicyNotice,
  StickyContinueButton,
  Textarea,
  ToastProvider,
  useToast,
} from '@kompas/ui';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useState } from 'react';
import { BookingApiError, checkout, releaseHold } from '../../_components/booking-api.ts';

export interface CheckoutScreenProps {
  readonly mentorProfileId: string;
  readonly hold: {
    readonly id: string;
    readonly startsAt: string;
    readonly endsAt: string;
    readonly type: 'trial' | 'plan';
    readonly expiresAt: string;
    readonly price: number | null;
  };
}

/** U2: the summary, the goal and `POST /checkout` (requirement 5, Q1). */
export function CheckoutScreen(props: CheckoutScreenProps) {
  const t = useTranslations('Booking');
  return (
    <ToastProvider closeLabel={t('common.toastClose')} regionLabel={t('common.toastRegion')}>
      <CheckoutBody {...props} />
    </ToastProvider>
  );
}

function CheckoutBody({ mentorProfileId, hold }: CheckoutScreenProps) {
  const t = useTranslations('Booking');
  const router = useRouter();
  const toast = useToast();
  const goalId = useId();
  const [goal, setGoal] = useState('');
  const [region] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Warsaw',
  );
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [submitting, setSubmitting] = useState(false);
  const trimmed = goal.trim();
  const tooShort = trimmed.length > 0 && trimmed.length < 20;
  const tooLong = trimmed.length > 500;
  const canConfirm = trimmed.length >= 20 && trimmed.length <= 500 && secondsLeft > 0;

  useEffect(() => {
    const end = Date.parse(hold.expiresAt);
    const tick = () => {
      setSecondsLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => {
      clearInterval(id);
    };
  }, [hold.expiresAt]);

  const onConfirm = async () => {
    if (!canConfirm || submitting) return;
    setSubmitting(true);
    try {
      const result = await checkout({ holdId: hold.id, goal: trimmed });
      if (result.kind === 'confirmed') {
        router.push(`/rezerwacja/potwierdzenie/${result.booking.id}`);
      } else {
        toast.add({ title: t('u2.checkoutFailed') });
      }
    } catch (error) {
      if (error instanceof BookingApiError && error.code === 'scheduling.hold_expired') {
        router.push(`/rezerwacja/${mentorProfileId}?wygasla=1`);
        return;
      }
      toast.add({ title: t('u2.checkoutFailed') });
    } finally {
      setSubmitting(false);
    }
  };

  const onChangeSlot = async () => {
    try {
      await releaseHold(hold.id);
    } catch {
      // The hold may already be gone; either way the student goes back to U1.
    }
    router.push(`/rezerwacja/${mentorProfileId}`);
  };

  return (
    <div className="mx-auto flex w-full max-w-content flex-col gap-section">
      <PageHeader title={t('u2.title')} description={t('u2.lead')} />
      <MentorSummaryBar
        mentor={{ name: t('u1.mentorName'), headline: t('u1.mentorHeadline'), verified: false }}
      />
      <OrderSummary
        mentorName={t('u1.mentorName')}
        type={hold.type}
        startsAt={hold.startsAt}
        endsAt={hold.endsAt}
        timeZone={region}
        durationMinutes={hold.type === 'trial' ? 30 : 60}
        price={hold.price === null ? null : BigInt(hold.price)}
      />
      {hold.type === 'trial' ? (
        <Field>
          <FieldLabel htmlFor={goalId}>{t('u2.goalLabel')}</FieldLabel>
          <Textarea
            id={goalId}
            value={goal}
            onChange={(event) => {
              setGoal(event.target.value);
            }}
            aria-invalid={tooShort || tooLong ? true : undefined}
            aria-describedby={tooShort || tooLong ? `${goalId}-error` : `${goalId}-hint`}
          />
          {tooShort ? (
            <FieldError id={`${goalId}-error`}>{t('u2.goalTooShort')}</FieldError>
          ) : tooLong ? (
            <FieldError id={`${goalId}-error`}>{t('u2.goalTooLong')}</FieldError>
          ) : (
            <FieldDescription id={`${goalId}-hint`}>{t('u2.goalHint')}</FieldDescription>
          )}
        </Field>
      ) : null}
      <Alert variant="neutral">
        <AlertTitle>{t('u2.freePaymentTitle')}</AlertTitle>
        <AlertDescription>{t('u2.freePaymentDescription')}</AlertDescription>
      </Alert>
      <HoldCountdown
        secondsLeft={secondsLeft}
        expiresAt={hold.expiresAt}
        timeZone={region}
        onChooseAgain={() => void onChangeSlot()}
      />
      <PolicyNotice state="free" timeZone={region} />
      <StickyContinueButton
        disabled={!canConfirm || submitting}
        disabledReason={canConfirm ? null : t('u2.confirmBlocked')}
        onClick={() => void onConfirm()}
        hint={
          <button
            type="button"
            className="text-body text-text-link underline underline-offset-4"
            onClick={() => void onChangeSlot()}
          >
            {t('u2.changeSlot')}
          </button>
        }
      >
        {t('u2.confirm')}
      </StickyContinueButton>
    </div>
  );
}
