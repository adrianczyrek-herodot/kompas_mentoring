import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { ViewportFrame } from '../../.storybook/blocks/component-docs';
import { Checkbox } from './checkbox';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldOptional,
  FieldSeparator,
  FieldSet,
} from './field';
import { Input } from './input';

type PlaygroundArgs = {
  label: string;
  description: string;
  error: string;
  optional: boolean;
  disabled: boolean;
};

const meta = {
  title: 'Komponenty bazowe/Formularze/Field',
  args: {
    label: 'Imię',
    description: 'Tak zobaczą Cię mentorzy i uczniowie.',
    error: '',
    optional: false,
    disabled: false,
  },
  render: ({ label, description, error, optional, disabled }) => {
    const describedBy = [description && 'pg-hint', error && 'pg-error'].filter(Boolean).join(' ');
    return (
      <Field className="max-w-form" data-disabled={disabled || undefined}>
        <FieldLabel htmlFor="pg-input">
          {label} {optional ? <FieldOptional>(opcjonalnie)</FieldOptional> : null}
        </FieldLabel>
        <Input
          id="pg-input"
          disabled={disabled}
          required={!optional}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
        />
        {description ? <FieldDescription id="pg-hint">{description}</FieldDescription> : null}
        {error ? <FieldError id="pg-error">{error}</FieldError> : null}
      </Field>
    );
  },
} satisfies Meta<PlaygroundArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: 'Układy: pionowy, poziomy, grupa',
  render: () => (
    <FieldGroup className="max-w-form">
      <Field>
        <FieldLabel htmlFor="v-email">E-mail</FieldLabel>
        <Input id="v-email" type="email" autoComplete="email" />
      </Field>
      <Field orientation="horizontal">
        <Checkbox id="v-verified" />
        <FieldLabel htmlFor="v-verified">Tylko zweryfikowani mentorzy</FieldLabel>
      </Field>
      <FieldSeparator>lub e-mailem</FieldSeparator>
      <FieldSet>
        <FieldLegend>Zgody</FieldLegend>
        <Field orientation="horizontal">
          <Checkbox id="v-terms" required />
          <FieldLabel htmlFor="v-terms">Akceptuję regulamin i politykę prywatności</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="v-marketing" />
          <FieldContent>
            <FieldLabel htmlFor="v-marketing">
              Chcę dostawać wskazówki i oferty <FieldOptional>(opcjonalnie)</FieldOptional>
            </FieldLabel>
            <FieldDescription>
              Najwyżej jedna wiadomość w tygodniu. Wypiszesz się w ustawieniach konta.
            </FieldDescription>
          </FieldContent>
        </Field>
      </FieldSet>
    </FieldGroup>
  ),
};

function ErrorAndDisabledFields() {
  return (
    <>
      <Field>
        <FieldLabel htmlFor="s-error">Błąd — e-mail</FieldLabel>
        <Input
          id="s-error"
          type="email"
          defaultValue="anna@"
          aria-invalid
          aria-describedby="s-error-text"
        />
        <FieldError id="s-error-text">Podaj poprawny adres e-mail.</FieldError>
      </Field>
      <Field data-disabled>
        <FieldLabel htmlFor="s-disabled">Zablokowany — e-mail</FieldLabel>
        <Input
          id="s-disabled"
          defaultValue="anna@example.com"
          disabled
          aria-describedby="s-disabled-why"
        />
        <FieldDescription id="s-disabled-why">
          Zmiana e-maila wymaga weryfikacji — będzie dostępna wkrótce.
        </FieldDescription>
      </Field>
    </>
  );
}

export const States: Story = {
  name: 'Macierz stanów',
  render: () => (
    <FieldGroup className="max-w-form">
      <Field>
        <FieldLabel htmlFor="s-default">Domyślny — imię</FieldLabel>
        <Input id="s-default" defaultValue="Anna" />
      </Field>
      <Field>
        <FieldLabel htmlFor="s-hint">Z podpowiedzią — hasło</FieldLabel>
        <Input id="s-hint" type="password" aria-describedby="s-hint-text" />
        <FieldDescription id="s-hint-text">Min. 10 znaków</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="s-optional">
          Opcjonalne — kod rabatowy <FieldOptional>(opcjonalnie)</FieldOptional>
        </FieldLabel>
        <Input id="s-optional" />
      </Field>
      <ErrorAndDisabledFields />
    </FieldGroup>
  ),
};

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  render: () => (
    <ViewportFrame width={320}>
      <Field>
        <FieldLabel htmlFor="long-rate">
          Stawka za 60 minut sesji, którą zobaczą uczniowie{' '}
          <FieldOptional>(opcjonalnie)</FieldOptional>
        </FieldLabel>
        <Input
          id="long-rate"
          inputMode="numeric"
          defaultValue="1200"
          aria-invalid
          aria-describedby="long-rate-hint long-rate-error"
        />
        <FieldDescription id="long-rate-hint">
          Od 40 do 1000 zł. Prowizję platformy zobaczysz w podglądzie zarobku w następnym kroku.
        </FieldDescription>
        <FieldError id="long-rate-error">
          Stawka może wynosić najwyżej 1000 zł. Wpisz niższą kwotę.
        </FieldError>
      </Field>
    </ViewportFrame>
  ),
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function BlurValidationDemo() {
  const [error, setError] = useState('');
  return (
    <Field className="max-w-form">
      <FieldLabel htmlFor="blur-email">E-mail</FieldLabel>
      <Input
        id="blur-email"
        type="email"
        required
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? 'blur-email-error' : undefined}
        onBlur={(event) => {
          const value = event.currentTarget.value;
          setError(
            !value
              ? 'To pole jest wymagane.'
              : EMAIL.test(value)
                ? ''
                : 'Podaj poprawny adres e-mail.',
          );
        }}
      />
      {error ? <FieldError id="blur-email-error">{error}</FieldError> : null}
    </Field>
  );
}

export const ValidateOnBlur: Story = {
  name: 'Test: walidacja po opuszczeniu pola',
  render: () => <BlurValidationDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'E-mail' });
    await userEvent.type(input, 'anna@');
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
    await userEvent.tab();
    const error = await canvas.findByRole('alert');
    await expect(error).toHaveTextContent('Podaj poprawny adres e-mail.');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription('Podaj poprawny adres e-mail.');
    await userEvent.type(input, 'example.com');
    await userEvent.tab();
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};
