import type { Meta, StoryObj } from '@storybook/react-vite';
import { Compass, Search } from 'lucide-react';
import * as React from 'react';
import { Button } from '../components/button';
import { EmptyState } from '../components/empty-state';
import { ErrorState } from '../components/error-state';
import { Input } from '../components/input';
import { MentorCard, MentorCardSkeleton } from '../product/mentor-card';

const sampleMentors = [
  {
    id: 'm1',
    name: 'Piotr Nowak',
    title: 'Lead Architect w Chmurze · 12 lat doświadczenia',
    initials: 'PN',
    tags: ['Architektura', 'System Design', 'TypeScript', 'AWS'],
    trialRate: '90 zł',
    standardRate: '180 zł',
    rating: '4.95',
    reviewCount: 28,
  },
  {
    id: 'm2',
    name: 'Marta Kowalczyk',
    title: 'Senior Product Designer w FinTech',
    initials: 'MK',
    tags: ['Figma', 'Design System', 'Audyt UX', 'Warsztaty'],
    trialRate: '75 zł',
    standardRate: '150 zł',
    isNew: true,
  },
];

function P2CatalogScreenView({
  state = 'ready',
}: {
  state?: 'ready' | 'loading' | 'no_results' | 'error';
}) {
  return (
    <div className="min-h-screen bg-surface-page flex flex-col">
      {/* App Header per R02.6 / 5 navigation items */}
      <header className="border-b border-border-divider bg-surface-panel px-panel py-tight sticky top-0 z-10">
        <div className="mx-auto flex max-w-content items-center justify-between">
          <div className="flex items-center gap-inline">
            <Compass className="size-icon-md text-action-primary" />
            <span className="text-body font-medium text-text-default">Kompas</span>
          </div>
          <nav className="hidden sm:flex items-center gap-group text-body-dense font-medium text-text-muted">
            <a href="#katalog" className="text-text-default">
              Katalog mentorów
            </a>
            <a href="#sesje">Moje sesje</a>
            <a href="#portfel">Portfel</a>
            <a href="#notatki">Notatki</a>
            <a href="#konto">Konto</a>
          </nav>
          <div className="flex items-center gap-tight">
            <Button variant="outline" size="sm">
              Zostań mentorem
            </Button>
          </div>
        </div>
      </header>

      {/* Main Catalog View */}
      <main className="mx-auto w-full max-w-content flex-1 p-panel space-y-group">
        <div className="space-y-tight">
          <h1 className="text-page-title font-medium text-text-default">Znajdź mentora 1:1</h1>
          <p className="text-body text-text-muted">
            Praktycy z wiodących zespołów technologicznych. Zarezerwuj pierwszą sesję próbną.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-inline">
          <div className="relative flex-1">
            <Input
              placeholder="Szukaj po technologii, roli lub nazwisku (np. System Design, Next.js)..."
              className="pl-9"
            />
            <Search className="absolute left-3 top-3 size-icon-sm text-text-muted pointer-events-none" />
          </div>
          <Button variant="outline">Filtry</Button>
        </div>

        {/* Content States */}
        {state === 'loading' ? (
          <div className="space-y-group">
            <MentorCardSkeleton />
            <MentorCardSkeleton />
          </div>
        ) : state === 'no_results' ? (
          <EmptyState
            title="Brak mentorów dla wybranych kryteriów"
            description="Spróbuj poszerzyć zapytanie lub zresetować filtry wyszukiwania."
            action={<Button variant="outline">Wyczyść filtry</Button>}
          />
        ) : state === 'error' ? (
          <ErrorState
            title="Nie udało się załadować listy mentorów"
            description="Wystąpił problem z połączeniem z bazą danych. Spróbuj ponownie za chwilę."
            action={<Button>Ponów próbę</Button>}
          />
        ) : (
          <div className="space-y-group">
            <p className="text-meta text-text-muted tabular-nums">
              Dostępnych mentorów: {sampleMentors.length}
            </p>
            {sampleMentors.map((m) => (
              <MentorCard key={m.id} {...m} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const meta = {
  title: 'Produkt/E2 Katalog i onboarding/Ekrany/P2 Wyszukiwarka',
  component: P2CatalogScreenView,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof P2CatalogScreenView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StateReady: Story = {
  name: 'Stan: Wyniki (Ready)',
  args: {
    state: 'ready',
  },
};

export const StateLoading: Story = {
  name: 'Stan: Ładowanie (Loading)',
  args: {
    state: 'loading',
  },
};

export const StateNoResults: Story = {
  name: 'Stan: Brak wyników (Empty)',
  args: {
    state: 'no_results',
  },
};

export const StateError: Story = {
  name: 'Stan: Awaria połączenia (Error)',
  args: {
    state: 'error',
  },
};
