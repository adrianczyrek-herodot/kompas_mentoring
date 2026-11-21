import type { Meta, StoryObj } from '@storybook/react-vite';
import { CalendarX2, CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { StateMatrix, ViewportFrame } from '../../.storybook/blocks/component-docs';
import { Alert, AlertAction, AlertDescription, AlertTitle } from './alert';
import { Button } from './button';
import { Link } from './link';

type Variant = 'neutral' | 'success' | 'warning' | 'danger';
type PlaygroundArgs = { variant: Variant; title: string; description: string };

const icons: Record<Variant, React.ReactNode> = {
  neutral: <Info aria-hidden="true" />,
  success: <CircleCheck aria-hidden="true" />,
  warning: <TriangleAlert aria-hidden="true" />,
  danger: <CircleAlert aria-hidden="true" />,
};

const meta = {
  title: 'Komponenty bazowe/Komunikaty/Alert',
  args: {
    variant: 'warning',
    title: 'Uczniowie nie mogą cię zarezerwować',
    description: 'Nie masz dostępności w najbliższych 14 dniach. Dodaj godziny w kalendarzu.',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['neutral', 'success', 'warning', 'danger'] },
  },
  render: ({ variant, title, description }) => (
    <Alert variant={variant} className="max-w-form">
      {icons[variant]}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  ),
} satisfies Meta<PlaygroundArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: 'Warianty',
  render: () => (
    <div className="flex max-w-form flex-col gap-group">
      <Alert variant="neutral">
        {icons.neutral}
        <AlertTitle>Zasady przekładania</AlertTitle>
        <AlertDescription>
          Sesję możesz bezpłatnie przełożyć lub anulować do 12 godzin przed startem.{' '}
          <Link href="#zasady">Pełne zasady</Link>
        </AlertDescription>
      </Alert>
      <Alert variant="success" role="status">
        {icons.success}
        <AlertTitle>Wysłano do weryfikacji</AlertTitle>
        <AlertDescription>Zwykle odpowiadamy do 2 dni roboczych.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <CalendarX2 aria-hidden="true" />
        <AlertTitle>Uczniowie nie mogą cię zarezerwować</AlertTitle>
        <AlertDescription>Dodaj dostępność w kalendarzu.</AlertDescription>
        <AlertAction>
          <Button size="sm" variant="outline">
            Dodaj dostępność
          </Button>
        </AlertAction>
      </Alert>
      <Alert variant="danger" role="alert">
        {icons.danger}
        <AlertTitle>Nieprawidłowy e-mail lub hasło.</AlertTitle>
        <AlertDescription>Sprawdź dane i spróbuj ponownie.</AlertDescription>
      </Alert>
    </div>
  ),
};

export const States: Story = {
  name: 'Macierz stanów: statyczny i dynamiczny',
  parameters: {
    docs: {
      description: {
        story:
          'Alert nie jest interaktywny. Różnica stanu to rola: baner obecny przy wczytaniu strony — bez roli; błąd po akcji — `role="alert"`; potwierdzenie po akcji — `role="status"` (Z8).',
      },
    },
  },
  render: () => (
    <StateMatrix
      columns={['Bez roli (baner)', 'role="status"', 'role="alert"']}
      rows={[
        {
          label: 'Przykład',
          cells: [
            <Alert key="a" variant="neutral">
              {icons.neutral}
              <AlertDescription>Zasada 12 h przy sesji (U5).</AlertDescription>
            </Alert>,
            <Alert key="b" variant="success" role="status">
              {icons.success}
              <AlertDescription>Zapisano zmiany.</AlertDescription>
            </Alert>,
            <Alert key="c" variant="danger" role="alert">
              {icons.danger}
              <AlertDescription>Nie udało się zapisać.</AlertDescription>
            </Alert>,
          ],
        },
      ]}
    />
  ),
};

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  render: () => (
    <ViewportFrame width={320}>
      <Alert variant="warning">
        {icons.warning}
        <AlertTitle>
          Do sesji z Katarzyną Wiśniewską-Zalewską zostało mniej niż 12 godzin
        </AlertTitle>
        <AlertDescription>
          Anulowanie teraz oznacza, że kredyt za sesję nie wróci na saldo. Przełożenie jest już
          niedostępne.
        </AlertDescription>
      </Alert>
    </ViewportFrame>
  ),
};

function SubmitErrorDemo() {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex max-w-form flex-col gap-group">
      {failed ? (
        <Alert variant="danger" role="alert">
          {icons.danger}
          <AlertTitle>Coś poszło nie tak. Spróbuj ponownie.</AlertTitle>
        </Alert>
      ) : null}
      <Button
        className="self-start"
        onClick={() => {
          setFailed(true);
        }}
      >
        Zapisz
      </Button>
    </div>
  );
}

export const AnnouncedAfterAction: Story = {
  name: 'Test: błąd po akcji ma rolę alert, baner nie',
  render: () => (
    <div className="flex flex-col gap-group">
      <Alert variant="neutral">
        {icons.neutral}
        <AlertDescription>Zasady przekładania: do 12 godzin przed startem.</AlertDescription>
      </Alert>
      <SubmitErrorDemo />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Zapisz' }));
    await expect(canvas.getByRole('alert')).toHaveTextContent('Coś poszło nie tak');
  },
};
