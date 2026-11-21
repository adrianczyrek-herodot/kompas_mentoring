import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { fullscreen, ScreenShell } from '../../.storybook/examples/screen-shell';
import {
  adam,
  emptyWeek,
  kasia,
  marek,
  TZ,
  TZ_LABEL,
  WEEK_LABEL,
  week,
} from '../../.storybook/fixtures/kompas';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { ErrorState } from '../components/error-state';
import { Separator } from '../components/separator';
import { DateTime } from '../product/date-time';
import { ProfileHero, ProfileHeroSkeleton } from '../product/profile-hero';
import { SlotGrid, SlotGridSkeleton } from '../product/slot-grid';
import { StickyBookingBar } from '../product/sticky-booking-bar';

// Reviews from the mockups (`MENTORS[].reviews`): Kasia (m1) and Marek (m4).
const kasiaReviews = [
  {
    author: 'Michał',
    rating: 5,
    date: '2026-10-02T12:00:00+02:00',
    text: 'Po trzech sesjach przepisałem swój projekt portfolio i dostałem pierwszą ofertę. Konkretne uwagi, zero lania wody.',
  },
  {
    author: 'Ola',
    rating: 5,
    date: '2026-09-18T12:00:00+02:00',
    text: 'Świetnie tłumaczy, dlaczego coś jest problemem, zamiast dawać gotowe rozwiązanie.',
  },
  {
    author: 'Piotr',
    rating: 4,
    date: '2026-09-01T12:00:00+02:00',
    text: 'Bardzo dobra sesja próbna, chciałbym więcej wolnych terminów wieczorem.',
  },
];
const marekReviews = [
  {
    author: 'Bartek',
    rating: 5,
    date: '2026-09-22T12:00:00+02:00',
    text: 'System design przerobiony na prawdziwych przykładach.',
  },
];

const onBook = fn();
type Variant = 'full' | 'new' | 'paused' | 'no-slots' | 'loading' | 'not-found';

function P3Screen({ variant }: { variant: Variant }) {
  const mentor = variant === 'new' ? adam : variant === 'paused' ? marek : kasia;
  if (variant === 'not-found') {
    return (
      <ScreenShell role="student" current="search">
        <ErrorState
          titleAs="h1"
          title="Profil niedostępny"
          description="Ten mentor nie przyjmuje teraz rezerwacji albo profil został usunięty. Zobacz mentorów o podobnych kompetencjach."
          action={<Button variant="outline">Pokaż podobnych mentorów</Button>}
        />
      </ScreenShell>
    );
  }
  if (variant === 'loading') {
    return (
      <ScreenShell role="student" current="search">
        <div aria-busy="true" className="flex flex-col gap-section">
          <p className="sr-only">Wczytujemy profil…</p>
          <ProfileHeroSkeleton />
          <SlotGridSkeleton />
        </div>
      </ScreenShell>
    );
  }
  const reviews = variant === 'paused' ? marekReviews : variant === 'new' ? [] : kasiaReviews;
  return (
    <ScreenShell role="student" current="search">
      <ProfileHero mentor={mentor} />
      <StickyBookingBar
        trialPrice={mentor.trialPrice}
        acceptingNew={mentor.acceptingNew}
        noSlotsIn14Days={variant === 'no-slots'}
        onBook={onBook}
      />
      <section aria-labelledby="about-h" className="flex flex-col gap-inline">
        <h2 id="about-h" className="text-section-title font-semibold">
          O mnie
        </h2>
        <p className="max-w-measure text-body">{mentor.bio}</p>
        <ul aria-label="Kompetencje" className="flex flex-wrap gap-tight pt-inline">
          {mentor.tags.map((tag) => (
            <li key={tag}>
              <Badge variant="neutral">{tag}</Badge>
            </li>
          ))}
        </ul>
      </section>
      <Separator />
      <SlotGrid
        days={variant === 'no-slots' ? emptyWeek : week}
        timeZone={TZ}
        timeZoneLabel={TZ_LABEL}
        weekLabel={WEEK_LABEL}
        canGoPrev={false}
      />
      <Separator />
      <section aria-labelledby="reviews-h" className="flex flex-col gap-inline">
        <h2 id="reviews-h" className="text-section-title font-semibold">
          Opinie
        </h2>
        {reviews.length > 0 ? (
          <ul>
            {reviews.map((review) => (
              <li
                key={review.author}
                className="flex flex-col gap-tight border-b border-border-divider py-row-y"
              >
                <p className="text-body-dense font-medium">
                  {review.author}
                  <span className="font-normal text-text-muted">
                    {' '}
                    · ocena {review.rating}/5 ·{' '}
                    <DateTime value={review.date} timeZone={TZ} format="date" />
                  </span>
                </p>
                <p className="max-w-measure text-body">{review.text}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body text-text-muted">
            Nowy mentor — jeszcze bez opinii. Sesja próbna to najprostszy sposób, żeby sprawdzić,
            czy się dogadacie.
          </p>
        )}
      </section>
    </ScreenShell>
  );
}

const meta = {
  title: 'Produkt/E2 Katalog i onboarding/Ekrany/P3 Profil mentora',
  component: P3Screen,
  args: { variant: 'full' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['full', 'new', 'paused', 'no-slots', 'loading', 'not-found'],
    },
  },
  parameters: fullscreen,
} satisfies Meta<typeof P3Screen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Full: Story = { name: 'S — pełny profil' };
export const NewMentor: Story = { name: 'E — nowy mentor bez opinii', args: { variant: 'new' } };
export const NoSlots: Story = { name: 'E — brak terminów w 14 dni', args: { variant: 'no-slots' } };
export const Paused: Story = { name: 'Wstrzymane przyjmowanie', args: { variant: 'paused' } };
export const Loading: Story = { name: 'L — ładowanie', args: { variant: 'loading' } };
export const NotFound: Story = {
  name: 'Er — profil niedostępny (404)',
  args: { variant: 'not-found' },
};

export const ScreenTest: Story = {
  name: 'Test: imię jako h1 i główna akcja bez przewijania',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 1, name: 'Kasia Nowicka' })).toBeVisible();
    const book = canvas.getByRole('button', { name: /^Zarezerwuj sesję próbną — 49\s?zł$/ });
    onBook.mockClear();
    await userEvent.click(book);
    await expect(onBook).toHaveBeenCalledOnce();
  },
};
