/** Browser client of the booking API (U1/U2). Plain fetch: the UI needs no typed oRPC client. */

export interface AvailabilitySlot {
  readonly startsAt: string;
  readonly endsAt: string;
  readonly localStart: string;
  readonly localEnd: string;
}

export interface AvailabilityView {
  readonly mentorTimeZone: string;
  readonly timeZone: string;
  readonly durationMinutes: number;
  readonly slots: readonly AvailabilitySlot[];
  readonly nextAvailableAt: string | null;
}

export interface BookingView {
  readonly id: string;
  readonly mentorId: string;
  readonly studentId: string;
  readonly type: 'trial' | 'plan' | 'single';
  readonly status: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly goal: string | null;
  readonly price: { readonly amountMinorUnits: number; readonly currency: 'PLN' } | null;
  readonly paymentMode: string | null;
  readonly acceptDeadlineAt: string | null;
  readonly rescheduleCount: number;
}

/** A problem answered by the API; `code` is the domain code (`scheduling.*`, `idempotency.*`). */
export class BookingApiError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(code);
    this.name = 'BookingApiError';
    this.code = code;
  }
}

const codeOf = async (response: Response): Promise<string> => {
  try {
    const body = (await response.json()) as {
      message?: string;
      data?: { code?: string };
    };
    return body.data?.code ?? body.message ?? `http_${response.status}`;
  } catch {
    return `http_${response.status}`;
  }
};

const expectOk = async (response: Response): Promise<BookingView> => {
  if (!response.ok) throw new BookingApiError(await codeOf(response));
  return (await response.json()) as BookingView;
};

/** U1: the public availability of one mentor profile, in the viewer's zone (Q12). */
export const fetchAvailability = async (input: {
  mentorProfileId: string;
  from: string;
  to: string;
  duration: 30 | 60;
  type: 'trial' | 'plan';
  timeZone: string;
}): Promise<AvailabilityView> => {
  const query = new URLSearchParams({
    from: input.from,
    to: input.to,
    duration: String(input.duration),
    type: input.type,
    timeZone: input.timeZone,
  });
  const response = await fetch(
    `/api/mentors/${input.mentorProfileId}/availability?${query.toString()}`,
  );
  if (!response.ok) throw new BookingApiError(await codeOf(response));
  return (await response.json()) as AvailabilityView;
};

/** U1 „Dalej”: takes the hold with an Idempotency-Key so a retry returns the same hold (§4.6). */
export const createHold = async (input: {
  mentorProfileId: string;
  startsAt: string;
  durationMinutes: 30 | 60;
  type: 'trial' | 'plan';
}): Promise<BookingView> => {
  const response = await fetch('/api/bookings/holds', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'idempotency-key': crypto.randomUUID(),
    },
    body: JSON.stringify(input),
  });
  return expectOk(response);
};

/** U2 „Zmień termin”: releases the student's own hold. */
export const releaseHold = async (holdId: string): Promise<void> => {
  const response = await fetch(`/api/bookings/holds/${holdId}`, { method: 'DELETE' });
  if (!response.ok) throw new BookingApiError(await codeOf(response));
};

/** Q1: F3 always answers `confirmed`; `payment_required` is F4's branch of the same route. */
export type CheckoutView =
  | { readonly kind: 'confirmed'; readonly booking: BookingView }
  | { readonly kind: 'payment_required'; readonly clientSecret: string };

/** U2 „Potwierdź rezerwację”: confirms the hold. */
export const checkout = async (input: {
  holdId: string;
  goal: string;
}): Promise<CheckoutView> => {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'idempotency-key': crypto.randomUUID(),
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new BookingApiError(await codeOf(response));
  return (await response.json()) as CheckoutView;
};
