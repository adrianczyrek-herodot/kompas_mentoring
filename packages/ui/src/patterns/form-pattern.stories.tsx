import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlertTriangle, CheckCircle2, WifiOff } from 'lucide-react';
import * as React from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Alert, AlertDescription, AlertTitle } from '../components/alert';
import { Button } from '../components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldOptional,
} from '../components/field';
import { Input } from '../components/input';
import { Textarea } from '../components/textarea';

interface FormApiResponse {
  status: 'idle' | 'loading' | 'success' | 'field_error' | 'server_error' | 'network_error';
}

function DemoForm({ forcedApiState = 'idle' }: { forcedApiState?: FormApiResponse['status'] }) {
  const [name, setName] = React.useState('Jan Kowalski');
  const [email, setEmail] = React.useState('');
  const [goal, setGoal] = React.useState('');

  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [apiState, setApiState] = React.useState<FormApiResponse['status']>(forcedApiState);
  const [serverFieldError, setServerFieldError] = React.useState<string | null>(
    forcedApiState === 'field_error'
      ? 'Ten adres e-mail jest już zarejestrowany w systemie.'
      : null,
  );

  const emailRef = React.useRef<HTMLInputElement>(null);
  const goalRef = React.useRef<HTMLTextAreaElement>(null);

  const isEmailEmpty = touched['email'] && email.trim() === '';
  const isGoalTooShort = touched['goal'] && goal.trim().length < 20;

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setTouched({ email: true, goal: true });

    if (email.trim() === '') {
      emailRef.current?.focus();
      return;
    }
    if (goal.trim().length < 20) {
      goalRef.current?.focus();
      return;
    }

    setApiState('loading');
    setTimeout(() => {
      if (forcedApiState === 'server_error') {
        setApiState('server_error');
      } else if (forcedApiState === 'network_error') {
        setApiState('network_error');
      } else if (forcedApiState === 'field_error') {
        setApiState('field_error');
        setServerFieldError('Ten adres e-mail jest już zajęty.');
        emailRef.current?.focus();
      } else {
        setApiState('success');
      }
    }, 400);
  };

  return (
    <Card className="max-w-form w-full border-border-divider bg-surface-panel p-panel">
      <CardHeader className="p-0 pb-group">
        <CardTitle>Rezerwacja pierwszej sesji próbnej</CardTitle>
        <CardDescription>
          Wypełnij krótki formularz, aby mentor mógł przygotować się do spotkania.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {apiState === 'server_error' ? (
          <Alert variant="danger" role="alert" className="mb-group">
            <AlertTriangle className="size-icon-sm" />
            <AlertTitle>Błąd serwera (500)</AlertTitle>
            <AlertDescription>
              Nie udało się przetworzyć zgłoszenia. Spróbuj wysłać formularz ponownie za chwilę.
            </AlertDescription>
          </Alert>
        ) : null}

        {apiState === 'network_error' ? (
          <Alert variant="danger" role="alert" className="mb-group">
            <WifiOff className="size-icon-sm" />
            <AlertTitle>Brak połączenia z siecią</AlertTitle>
            <AlertDescription>
              Sprawdź połączenie internetowe. Wpisane dane zostały zachowane.
            </AlertDescription>
          </Alert>
        ) : null}

        {apiState === 'success' ? (
          <Alert variant="success" role="status" className="mb-group">
            <CheckCircle2 className="size-icon-sm" />
            <AlertTitle>Zgłoszenie zostało pomyślnie wysłane</AlertTitle>
            <AlertDescription>
              Mentor ma 24 godziny na zatwierdzenie terminu. Szczegóły znajdziesz w zakładce Moje
              sesje.
            </AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit} noValidate className="space-y-group">
          <Field>
            <FieldLabel htmlFor="form-name">Imię i nazwisko</FieldLabel>
            <Input
              id="form-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              disabled={apiState === 'loading'}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="form-email">Adres e-mail</FieldLabel>
            <Input
              ref={emailRef}
              id="form-email"
              type="email"
              value={email}
              placeholder="np. jan.kowalski@example.com"
              onChange={(e) => {
                setEmail(e.target.value);
                setServerFieldError(null);
              }}
              onBlur={() => {
                setTouched((t) => ({ ...t, email: true }));
              }}
              aria-invalid={isEmailEmpty || Boolean(serverFieldError)}
              disabled={apiState === 'loading'}
            />
            {isEmailEmpty ? (
              <FieldError id="email-error">
                Adres e-mail jest wymagany do potwierdzenia sesji.
              </FieldError>
            ) : serverFieldError ? (
              <FieldError id="email-server-error">{serverFieldError}</FieldError>
            ) : (
              <FieldDescription>Na ten adres wyślemy link do pokoju wideo.</FieldDescription>
            )}
          </Field>

          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="form-goal">Czego dotyczy sesja?</FieldLabel>
              <FieldOptional />
            </div>
            <Textarea
              ref={goalRef}
              id="form-goal"
              value={goal}
              placeholder="Opisz krótko swój problem, cel lub pytania, które chcesz zadać mentorowi..."
              rows={4}
              showCount
              maxCount={500}
              onChange={(e) => {
                setGoal(e.target.value);
              }}
              onBlur={() => {
                setTouched((t) => ({ ...t, goal: true }));
              }}
              aria-invalid={isGoalTooShort}
              disabled={apiState === 'loading'}
            />
            {isGoalTooShort ? (
              <FieldError id="goal-error">Opisz swój cel w co najmniej 20 znakach.</FieldError>
            ) : (
              <FieldDescription>
                Pomaga mentorowi przygotować materiały i agendę spotkania.
              </FieldDescription>
            )}
          </Field>

          <div className="flex items-center justify-end gap-inline border-t border-border-divider pt-group">
            <Button type="button" variant="outline" disabled={apiState === 'loading'}>
              Wróć
            </Button>
            <Button type="submit" loading={apiState === 'loading'}>
              Zarezerwuj sesję
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

const meta = {
  title: 'Wzorce/Formularz',
  component: DemoForm,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof DemoForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: '1. Domyślny stan początkowy',
};

export const ValidationOnBlurAndSubmit: Story = {
  name: '2. Walidacja onBlur i blokada wysłania (fokus na 1. błędzie)',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submitBtn = canvas.getByRole('button', { name: 'Zarezerwuj sesję' });
    await userEvent.click(submitBtn);

    const emailInput = canvas.getByLabelText('Adres e-mail');
    await expect(emailInput).toHaveFocus();
    await expect(
      canvas.getByText('Adres e-mail jest wymagany do potwierdzenia sesji.'),
    ).toBeVisible();
  },
};

export const SubmittingState: Story = {
  name: '3. Wysyłanie (blokada podwójnego kliknięcia)',
  args: {
    forcedApiState: 'loading',
  },
};

export const ApiSuccessResponse: Story = {
  name: '4. Sukces potwierdzony z serwera',
  args: {
    forcedApiState: 'success',
  },
};

export const ApiFieldErrorResponse: Story = {
  name: '5. Błąd pola z serwera (422: zajęty e-mail)',
  args: {
    forcedApiState: 'field_error',
  },
};

export const ApiServerErrorResponse: Story = {
  name: '6. Błąd serwera (500)',
  args: {
    forcedApiState: 'server_error',
  },
};

export const ApiNetworkErrorResponse: Story = {
  name: '7. Brak sieci (dane zachowane)',
  args: {
    forcedApiState: 'network_error',
  },
};
