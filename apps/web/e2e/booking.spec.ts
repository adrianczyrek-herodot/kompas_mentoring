import type { Page } from '@playwright/test';
import {
  emailVerificationToken,
  expect,
  expectNoSeriousA11yViolations,
  requireDatabase,
  signUpUserViaApi,
  test,
} from './support.ts';

/** One seeded bookable mentor per Playwright project, so the two viewports never race for a slot. */
const MENTOR_BY_PROJECT: Record<string, string> = {
  'mobile-360': '018f0000-0000-7000-8000-0000000000a1',
  'desktop-1280': '018f0000-0000-7000-8000-0000000000a2',
};

const mentorProfileId = (): string =>
  MENTOR_BY_PROJECT[test.info().project.name] ?? '018f0000-0000-7000-8000-0000000000a1';

/** A fresh, verified student — one trial per pair (Q6) would block a reused account. */
const signUpVerifiedStudent = async (page: Page) => {
  const { email, id } = await signUpUserViaApi(page.request, { name: 'Ola', as: 'student' });
  const token = emailVerificationToken(email, id);
  await page.goto(`/api/auth/verify-email?token=${token}&callbackURL=%2Fweryfikacja-email`);
  await expect(page).toHaveURL(/\/weryfikacja-email$/);
};

/** Clicks the first free slot of the week, jumping to the next week when this one is empty. */
const pickFirstSlot = async (page: Page) => {
  const slots = page.getByRole('button', { name: /^\d{2}:\d{2}$/ });
  const jump = page.getByRole('button', { name: /Następny wolny termin/ });
  // Wait for the grid to leave the loading state before deciding (fetch happens on the client).
  await expect(slots.first().or(jump)).toBeVisible({ timeout: 20_000 });
  if ((await slots.count()) === 0) {
    await jump.click();
  }
  await slots.first().click();
};

const fillGoalAndConfirm = async (page: Page) => {
  await page
    .getByLabel('Z czym przychodzisz?')
    .fill('Chcę przygotować się do rozmowy na senior frontend i uporządkować architekturę.');
  await page.getByRole('button', { name: 'Potwierdź rezerwację' }).click();
};

test.beforeEach(() => {
  requireDatabase();
});

test('U1 → U2 → U3: a trial is requested without payment, in the student’s zone', async ({
  page,
}) => {
  await signUpVerifiedStudent(page);
  await page.goto(`/rezerwacja/${mentorProfileId()}`);

  // U1: the grid shows slots in the viewer's zone and the 12 h rule.
  await expect(page.getByRole('heading', { level: 1, name: 'Wybierz termin' })).toBeVisible();
  await expect(page.getByText('Zmiana bez kosztów do 12 godzin')).toBeVisible();
  await pickFirstSlot(page);
  await page.getByRole('button', { name: 'Dalej' }).click();

  // U2: the summary, the goal and no payment.
  await expect(page).toHaveURL(/\/platnosc\?blokada=/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Podsumowanie rezerwacji' }),
  ).toBeVisible();
  await expect(
    page.getByText('Płatności uruchomimy wkrótce — ta rezerwacja jest bezpłatna'),
  ).toBeVisible();
  await fillGoalAndConfirm(page);

  // U3: „Prośba wysłana” and the calendar file.
  await expect(page).toHaveURL(/\/rezerwacja\/potwierdzenie\//);
  await expect(page.getByRole('heading', { name: /Prośba wysłana/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Dodaj do kalendarza/ })).toBeVisible();
});

test('U1 blocks an unverified student and offers the resend link (Q19)', async ({ page }) => {
  await signUpUserViaApi(page.request, { name: 'Ola', as: 'student' });
  await page.goto(`/rezerwacja/${mentorProfileId()}`);
  await expect(
    page.getByText('Potwierdź e-mail, zanim zarezerwujesz pierwszą sesję'),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Wyślij link ponownie' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Dalej' })).toHaveAttribute('aria-disabled', 'true');
});

test('U1 „Wyślij link ponownie” sends a new verification link and stays on U1 (GAP-05)', async ({
  page,
}) => {
  const { email } = await signUpUserViaApi(page.request, { name: 'Ola', as: 'student' });
  await page.goto(`/rezerwacja/${mentorProfileId()}`);

  const sent = page.waitForResponse(
    (response) =>
      response.url().includes('/api/auth/send-verification-email') &&
      response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Wyślij link ponownie' }).click();
  const response = await sent;
  // Better Auth calls the `EmailVerificationSender` port for the signed-in student's address.
  expect(response.status()).toBe(200);
  expect(response.request().postDataJSON()).toMatchObject({
    email,
    callbackURL: '/weryfikacja-email',
  });
  await expect(page.getByText('Wysłaliśmy nowy link. Sprawdź skrzynkę.')).toBeVisible();
  // Before the fix the button navigated to s10, which said „E-mail zweryfikowany”.
  await expect(page).toHaveURL(new RegExp(`/rezerwacja/${mentorProfileId()}$`));
});

test('the 21st hold in an hour answers 429 with Retry-After (Q18)', async ({ page }) => {
  await signUpVerifiedStudent(page);
  const from = new Date().toISOString();
  const to = new Date(Date.now() + 56 * 24 * 3600 * 1000).toISOString();
  const availability = await page.request.get(
    `/api/mentors/${mentorProfileId()}/availability?from=${from}&to=${to}&duration=30&type=trial`,
  );
  const { slots } = (await availability.json()) as { slots: { startsAt: string }[] };
  const startsAt = slots[0]?.startsAt;
  expect(startsAt).toBeDefined();

  const takeHold = () =>
    page.request.post('/api/bookings/holds', {
      headers: { 'idempotency-key': crypto.randomUUID() },
      data: { mentorProfileId: mentorProfileId(), startsAt, durationMinutes: 30, type: 'trial' },
    });
  // Each hold releases the previous one (Q18), so the same slot can be held 20 times in a row.
  let lastHoldId = '';
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const held = await takeHold();
    expect(held.status()).toBe(200);
    lastHoldId = ((await held.json()) as { id: string }).id;
  }
  const limited = await takeHold();
  expect(limited.status()).toBe(429);
  expect(limited.headers()['retry-after']).toBe('3600');
  expect(((await limited.json()) as { data?: { code?: string } }).data?.code).toBe(
    'scheduling.hold_rate_limited',
  );
  // Leave the slot free for the next test of this project.
  await page.request.delete(`/api/bookings/holds/${lastHoldId}`);
});

test('a guest sees the slots and „Dalej” leads through sign-in', async ({ page }) => {
  await page.goto(`/rezerwacja/${mentorProfileId()}`);
  await pickFirstSlot(page);
  const cta = page.getByRole('button', { name: 'Zaloguj się, żeby zarezerwować' });
  await expect(cta).toBeVisible();
  await cta.click();
  await expect(page).toHaveURL(/\/logowanie\?returnTo=/);
});

test('U1, U2 and U3 have no serious accessibility violations', async ({ page }) => {
  await signUpVerifiedStudent(page);
  await page.goto(`/rezerwacja/${mentorProfileId()}`);
  await expectNoSeriousA11yViolations(page);

  await pickFirstSlot(page);
  await page.getByRole('button', { name: 'Dalej' }).click();
  await expect(page).toHaveURL(/\/platnosc\?blokada=/);
  await expectNoSeriousA11yViolations(page);

  await fillGoalAndConfirm(page);
  await expect(page).toHaveURL(/\/rezerwacja\/potwierdzenie\//);
  await expectNoSeriousA11yViolations(page);
});
