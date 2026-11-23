import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { fullscreen, ScreenShell } from '../../.storybook/examples/screen-shell';
import { withToasts } from '../../.storybook/examples/with-toasts';
import { kasia, TZ, TZ_LABEL } from '../../.storybook/fixtures/kompas';
import { Alert, AlertDescription, AlertTitle } from '../components/alert';
import { Field, FieldDescription, FieldError, FieldLabel } from '../components/field';
import { Textarea } from '../components/textarea';
import { HoldCountdown } from '../product/hold-countdown';
import { MentorSummaryBar } from '../product/mentor-summary-bar';
import { OrderSummary } from '../product/order-summary';
import { PageHeader } from '../product/page-header';
import { PolicyNotice } from '../product/policy-notice';
import { StickyContinueButton } from '../product/sticky-continue-button';

const GOAL =
  'Chcę przygotować się do rozmowy na senior frontend. Zależy mi na architekturze i systemie projektowym.';
const ACCEPT_BY = '2026-10-21T09:00:00+02:00';
const FREE_UNTIL = '2026-10-21T21:00:00+02:00';

type Args = { goalState: 'empty' | 'tooShort' | 'ready' };

function U2Screen({ goalState }: Args) {
  const [goal, setGoal] = useState(goalState === 'ready' ? GOAL : '');
  const tooShort = goal.length > 0 && goal.length < 20;
  return (
    <ScreenShell navRole="student" current="search">
      <PageHeader
        title="Podsumowanie rezerwacji"
        description="Sprawdź szczegóły i potwierdź. Termin trzymamy jeszcze 10 minut."
      />
      <div className="mx-auto flex w-full max-w-content flex-col gap-section">
        <MentorSummaryBar mentor={kasia} timeZone={TZ} timeZoneLabel={TZ_LABEL} />
        <OrderSummary
          mentorName={kasia.name}
          type="trial"
          startsAt="2026-10-22T09:00:00+02:00"
          endsAt="2026-10-22T09:30:00+02:00"
          timeZone={TZ}
          durationMinutes={30}
          price={4900n}
        />
        <Field>
          <FieldLabel htmlFor="u2-goal">Z czym przychodzisz?</FieldLabel>
          <Textarea
            id="u2-goal"
            value={goal}
            onChange={(event) => {
              setGoal(event.target.value);
            }}
            aria-invalid={tooShort ? true : undefined}
            aria-describedby="u2-goal-help"
            placeholder="Cel sesji — 20 do 500 znaków."
          />
          {tooShort ? (
            <FieldError>Cel jest za krótki — napisz co najmniej 20 znaków.</FieldError>
          ) : (
            <FieldDescription id="u2-goal-help">Mentor zobaczy to przed sesją.</FieldDescription>
          )}
        </Field>
        <PolicyNotice state="free" freeUntil={FREE_UNTIL} timeZone={TZ} />
        <Alert variant="neutral">
          <AlertTitle>Płatności uruchomimy wkrótce — ta rezerwacja jest bezpłatna</AlertTitle>
          <AlertDescription>
            Na razie potwierdzasz termin bez płatności. Nic nie zapłacisz.
          </AlertDescription>
        </Alert>
        <HoldCountdown secondsLeft={600} expiresAt={ACCEPT_BY} timeZone={TZ} />
        <StickyContinueButton
          disabled={goal.length < 20}
          disabledReason="Wpisz cel sesji (20–500 znaków), żeby potwierdzić."
          onClick={fn()}
        >
          Potwierdź rezerwację
        </StickyContinueButton>
      </div>
    </ScreenShell>
  );
}

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/Ekrany/U2 Podsumowanie',
  component: U2Screen,
  decorators: [withToasts],
  args: { goalState: 'empty' },
  argTypes: { goalState: { control: 'inline-radio', options: ['empty', 'tooShort', 'ready'] } },
  parameters: fullscreen,
} satisfies Meta<typeof U2Screen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: 'Cel pusty — „Potwierdź” zablokowane' };
export const TooShort: Story = {
  name: 'Cel za krótki',
  args: { goalState: 'tooShort' },
};
export const Ready: Story = { name: 'Gotowe do potwierdzenia', args: { goalState: 'ready' } };
