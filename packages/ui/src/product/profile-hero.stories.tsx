import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ViewportFrame } from '../../.storybook/blocks/component-docs';
import { adam, kasia, longMentor, marek } from '../../.storybook/fixtures/kompas';
import { Button } from '../components/button';
import { ErrorState } from '../components/error-state';
import { ProfileHero, ProfileHeroSkeleton } from './profile-hero';
import { StickyBookingBar } from './sticky-booking-bar';

const meta = {
  title: 'Produkt/E2 Katalog i onboarding/ProfileHero',
  component: ProfileHero,
  args: { mentor: kasia },
  argTypes: { mentor: { control: false } },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ProfileHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Loading: Story = {
  name: 'Ładowanie',
  render: () => (
    <section aria-busy="true" aria-label="Wczytujemy profil">
      <ProfileHeroSkeleton />
    </section>
  ),
};

export const NewMentor: Story = {
  name: 'Częściowe dane (Nowy mentor, bez weryfikacji)',
  parameters: {
    docs: {
      description: {
        story:
          'Bez opinii nie pokazujemy oceny, liczby sesji ani odsetka wracających — tylko „Nowy mentor” (KONCEPCJA §P3, stan E).',
      },
    },
  },
  args: { mentor: adam },
};

export const Paused: Story = {
  name: 'Nie przyjmuje nowych uczniów',
  args: { mentor: marek },
};

export const NotFound: Story = {
  name: 'Błąd (profil niedostępny)',
  parameters: {
    docs: {
      description: {
        story:
          'KONCEPCJA §P3 Er: 404 „Profil niedostępny” + podobni mentorzy (wzorzec „Widok szczegółów”).',
      },
    },
  },
  render: () => (
    <ErrorState
      titleAs="h1"
      title="Profil niedostępny"
      description="Ten mentor nie przyjmuje teraz rezerwacji albo profil został usunięty. Zobacz mentorów o podobnych kompetencjach."
      action={<Button variant="outline">Pokaż podobnych mentorów</Button>}
    />
  ),
};

export const LongContent: Story = {
  name: 'Długie teksty i 320 px',
  render: () => (
    <ViewportFrame width={320}>
      <ProfileHero mentor={longMentor} />
    </ViewportFrame>
  ),
};

export const HeadingTest: Story = {
  name: 'Test: imię to jedyny h1, statystyki jako lista opisów',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    await expect(canvas.getByRole('heading', { level: 1, name: 'Kasia Nowicka' })).toBeVisible();
    await expect(canvas.getAllByRole('term')[0]).toHaveTextContent('Ocena');
    await expect(canvas.getByText('Zweryfikowany')).toBeVisible();
  },
};

const onBook = fn();

export const BookingBar: Story = {
  name: 'StickyBookingBar: dostępny, wstrzymany, brak terminów',
  parameters: {
    docs: {
      description: {
        story:
          'Główna akcja P3 (KONCEPCJA §P3 „sticky CTA”). Zablokowany przycisk zostaje osiągalny klawiaturą, a powód jest napisany obok i powiązany przez `aria-describedby` (D2).',
      },
    },
  },
  render: () => (
    <div className="flex max-w-content flex-col gap-section">
      <StickyBookingBar trialPrice={kasia.trialPrice} acceptingNew onBook={onBook} />
      <StickyBookingBar trialPrice={marek.trialPrice} acceptingNew={false} />
      <StickyBookingBar trialPrice={kasia.trialPrice} acceptingNew noSlotsIn14Days />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [available, paused] = canvas.getAllByRole('button');
    if (!available || !paused) throw new Error('Expected booking buttons');
    await expect(available).toHaveAccessibleName(/^Zarezerwuj sesję próbną — 49\s?zł$/);
    onBook.mockClear();
    await userEvent.click(available);
    await expect(onBook).toHaveBeenCalledOnce();
    await expect(paused).toHaveAttribute('aria-disabled', 'true');
    await expect(paused).toHaveAccessibleDescription(
      'Mentor wstrzymał przyjmowanie nowych uczniów. Wróć później albo wybierz innego mentora.',
    );
  },
};
