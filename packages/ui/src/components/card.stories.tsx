import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ViewportFrame } from '../../.storybook/blocks/component-docs';
import { Badge } from './badge';
import { Button } from './button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';
import { Separator } from './separator';

type PlaygroundArgs = { size: 'default' | 'sm'; title: string; description: string };

const meta = {
  title: 'Komponenty bazowe/Treść/Card',
  args: {
    size: 'default',
    title: 'Profil',
    description: 'Tak zobaczą Cię mentorzy i uczniowie.',
  },
  argTypes: { size: { control: 'inline-radio', options: ['default', 'sm'] } },
  render: ({ size, title, description }) => (
    <Card size={size} className="max-w-form">
      <CardHeader>
        <CardTitle>
          <h2>{title}</h2>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-body">Anna Kowalczyk · anna@example.com</p>
      </CardContent>
    </Card>
  ),
} satisfies Meta<PlaygroundArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

function PrivacyCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Prywatność</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-group">
        <p className="text-body">Pobierz kopię swoich danych albo usuń konto.</p>
        <Separator />
        <p className="text-body-dense text-text-muted">
          Usunięcie konta jest nieodwracalne. Aktywny plan zostanie anulowany.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline">Pobierz moje dane</Button>
        <Button variant="ghost">Usuń konto</Button>
      </CardFooter>
    </Card>
  );
}

export const Variants: Story = {
  name: 'Odmiany: z akcją, ze stopką, mała',
  render: () => (
    <div className="flex max-w-form flex-col gap-group">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Status profilu</h2>
          </CardTitle>
          <CardDescription>Wysłano do weryfikacji 18 listopada.</CardDescription>
          <CardAction>
            <Badge variant="warning">W weryfikacji</Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-body">Zwykle odpowiadamy do 2 dni roboczych.</p>
        </CardContent>
      </Card>
      <PrivacyCard />
      <Card size="sm">
        <CardHeader>
          <CardTitle>
            <h3>Dzisiaj</h3>
          </CardTitle>
          <CardDescription>2 sesje · 1 prośba o sesję próbną</CardDescription>
        </CardHeader>
      </Card>
    </div>
  ),
};

export const States: Story = {
  name: 'Macierz stanów',
  parameters: {
    docs: {
      description: {
        story:
          'Karta nie jest interaktywna — nie ma najechania, fokusu ani wciśnięcia. Stany danych pokazują komponenty produktu w etapie 3; tu: pusta treść i długa treść.',
      },
    },
  },
  render: () => (
    <div className="flex max-w-form flex-col gap-group">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Sesje dzisiaj</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-body text-text-muted">
            Brak sesji dzisiaj. Uzupełnij dostępność, żeby uczniowie mogli Cię zarezerwować.
          </p>
        </CardContent>
      </Card>
    </div>
  ),
};

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  render: () => (
    <ViewportFrame width={320}>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Weryfikacja wniosku Katarzyny Wiśniewskiej-Zalewskiej</h2>
          </CardTitle>
          <CardDescription>
            Senior Frontend Developer — pomagam przejść z juniora na mida w 6 miesięcy
          </CardDescription>
          <CardAction>
            <Badge>Nowy</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" className="w-full">
            Otwórz wniosek
          </Button>
        </CardFooter>
      </Card>
    </ViewportFrame>
  ),
};

export const HeadingOutline: Story = {
  name: 'Test: tytuł karty jest nagłówkiem',
  play: async ({ canvasElement }) => {
    const heading = within(canvasElement).getByRole('heading', { level: 2, name: 'Profil' });
    await expect(heading).toBeVisible();
  },
};
