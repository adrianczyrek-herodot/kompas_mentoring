import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchX } from 'lucide-react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ViewportFrame } from '../../.storybook/blocks/component-docs';
import { adam, kasia, longMentor, marek, mentors } from '../../.storybook/fixtures/kompas';
import { Button } from '../components/button';
import { EmptyState } from '../components/empty-state';
import { ErrorState } from '../components/error-state';
import { MentorCard, MentorCardSkeleton, type MentorSummary } from './mentor-card';

const onBook = fn();

/** Booking action of a row: secondary (R01.6), name extended for screen readers (WCAG 2.4.4). */
function BookAction({ mentor }: { mentor: MentorSummary }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        onBook(mentor.id);
      }}
    >
      Zarezerwuj sesję próbną<span className="sr-only"> — {mentor.name}</span>
    </Button>
  );
}

const meta = {
  title: 'Produkt/E2 Katalog i onboarding/MentorCard',
  component: MentorCard,
  args: { mentor: kasia, profileHref: '/mentorzy/m1', headingAs: 'h3', maxTags: 5 },
  argTypes: {
    headingAs: { control: 'inline-radio', options: ['h2', 'h3'] },
    maxTags: { control: { type: 'number', min: 1, max: 15 } },
    mentor: { control: false },
    action: { control: false },
  },
  render: (args) => (
    <ul className="max-w-content">
      <li>
        <MentorCard {...args} action={<BookAction mentor={args.mentor} />} />
      </li>
    </ul>
  ),
} satisfies Meta<typeof MentorCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ManyResults: Story = {
  name: 'Dużo danych (lista P2)',
  render: () => (
    <ul aria-label="Mentorzy" className="max-w-content">
      {mentors.map((mentor) => (
        <li key={mentor.id}>
          <MentorCard
            mentor={mentor}
            profileHref={`/mentorzy/${mentor.id}`}
            action={<BookAction mentor={mentor} />}
          />
        </li>
      ))}
    </ul>
  ),
};

export const Loading: Story = {
  name: 'Ładowanie',
  parameters: {
    docs: { description: { story: 'KONCEPCJA §P2 L: 6 szkieletów w miejscu listy.' } },
  },
  render: () => (
    <section aria-busy="true" aria-label="Wczytujemy mentorów" className="max-w-content">
      {[0, 1, 2, 3, 4, 5].map((row) => (
        <MentorCardSkeleton key={row} />
      ))}
    </section>
  ),
};

export const PartialData: Story = {
  name: 'Częściowe dane (bez opinii, bez zdjęcia, nie przyjmuje)',
  parameters: {
    docs: {
      description: {
        story:
          'Adam Górski nie ma jeszcze opinii → „Nowy mentor” zamiast oceny i liczby sesji. Marek Lis wstrzymał przyjmowanie uczniów → powód tekstem zamiast przycisku (D2).',
      },
    },
  },
  render: () => (
    <ul className="max-w-content">
      {[adam, marek, { ...kasia, tags: [] }].map((mentor) => (
        <li key={mentor.id + String(mentor.tags.length)}>
          <MentorCard
            mentor={mentor}
            profileHref={`/mentorzy/${mentor.id}`}
            action={<BookAction mentor={mentor} />}
          />
        </li>
      ))}
    </ul>
  ),
};

export const Empty: Story = {
  name: 'Pusto (brak wyników)',
  parameters: {
    docs: {
      description: {
        story: 'Pusty stan listy należy do wzorca „Lista z filtrami” — tu dla kompletu stanów.',
      },
    },
  },
  render: () => (
    <EmptyState
      titleAs="p"
      icon={<SearchX />}
      title="Brak mentorów dla tych filtrów"
      description="Najbardziej zawęża wyniki filtr ceny 0–100 zł."
      action={<Button variant="outline">Wyczyść filtr ceny</Button>}
    />
  ),
};

export const ErrorLoading: Story = {
  name: 'Błąd',
  render: () => (
    <ErrorState
      titleAs="p"
      title="Nie udało się wczytać listy"
      description="Sprawdź połączenie i spróbuj ponownie. Filtry zostaną zachowane."
      action={<Button variant="outline">Ponów</Button>}
    />
  ),
};

export const LongContent: Story = {
  name: 'Długie teksty i 320 px',
  render: () => (
    <ViewportFrame width={320}>
      <ul>
        <li>
          <MentorCard
            mentor={longMentor}
            profileHref="/mentorzy/long"
            action={<BookAction mentor={longMentor} />}
          />
        </li>
      </ul>
    </ViewportFrame>
  ),
};

export const KeyboardTest: Story = {
  name: 'Test: nazwa prowadzi do profilu, rezerwacja z klawiatury',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const article = canvas.getByRole('article', { name: 'Kasia Nowicka' });
    await expect(within(article).getByRole('link', { name: 'Kasia Nowicka' })).toHaveAttribute(
      'href',
      '/mentorzy/m1',
    );
    await expect(within(article).getByText('Sesja próbna 30 min:', { exact: false })).toBeVisible();
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Kasia Nowicka' })).toHaveFocus();
    await userEvent.tab();
    const book = canvas.getByRole('button', { name: 'Zarezerwuj sesję próbną — Kasia Nowicka' });
    await expect(book).toHaveFocus();
    onBook.mockClear();
    await userEvent.keyboard('{Enter}');
    await expect(onBook).toHaveBeenCalledWith('m1');
  },
};
