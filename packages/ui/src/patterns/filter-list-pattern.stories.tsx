import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus, X } from 'lucide-react';
import * as React from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { EmptyState } from '../components/empty-state';
import { MentorCard, MentorCardSkeleton } from '../product/mentor-card';

const initialMentors = [
  {
    id: 'm1',
    name: 'Kamil Lewandowski',
    title: 'Staff Engineer w Chmurze',
    initials: 'KL',
    tags: ['TypeScript', 'Node.js', 'Architektura'],
    trialRate: '80 zł',
    standardRate: '160 zł',
  },
  {
    id: 'm2',
    name: 'Karolina Mazur',
    title: 'Tech Lead & Frontend Architect',
    initials: 'KM',
    tags: ['React', 'Design Systems', 'Next.js'],
    trialRate: '90 zł',
    standardRate: '180 zł',
  },
];

function FilterListDemo({
  mode = 'results',
}: {
  mode?: 'results' | 'no_filter_match' | 'empty_collection' | 'loading';
}) {
  const [activeFilters, setActiveFilters] = React.useState<string[]>(
    mode === 'no_filter_match'
      ? ['Rust', 'Kompilatory', 'Wycena < 50 zł']
      : ['TypeScript', 'Architektura'],
  );

  const removeFilter = (filter: string) => {
    setActiveFilters((f) => f.filter((x) => x !== filter));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
  };

  if (mode === 'loading') {
    return (
      <div className="max-w-content space-y-group p-panel">
        <div className="flex items-center justify-between border-b border-border-divider pb-tight">
          <span className="text-label text-text-muted">Szukanie mentorów...</span>
        </div>
        <div className="space-y-group">
          <MentorCardSkeleton />
          <MentorCardSkeleton />
        </div>
      </div>
    );
  }

  if (mode === 'empty_collection') {
    return (
      <div className="max-w-content space-y-group p-panel">
        <div className="flex items-center justify-between border-b border-border-divider pb-tight">
          <h2 className="text-section-title font-medium text-text-default">Katalog mentorów</h2>
        </div>
        <EmptyState
          title="Jeszcze nic tu nie ma"
          description="Brak zarejestrowanych mentorów w wybranej kategorii. Bądź pierwszym mentorem w tym obszarze!"
          action={
            <Button className="gap-tight">
              <Plus className="size-icon-sm" />
              Zostań mentorem
            </Button>
          }
        />
      </div>
    );
  }

  const hasNoResults = mode === 'no_filter_match' || activeFilters.length === 3;

  return (
    <div className="max-w-content space-y-group p-panel">
      <div className="flex flex-col gap-tight border-b border-border-divider pb-group sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-tight">
          <h2 className="text-section-title font-medium text-text-default">Dostępni mentorzy</h2>
          <p className="text-meta text-text-muted tabular-nums">
            {hasNoResults ? '0 wyników' : `Znaleziono: ${initialMentors.length} mentorów`}
          </p>
        </div>

        {activeFilters.length > 0 ? (
          <div className="flex flex-wrap items-center gap-inline">
            <span className="text-meta text-text-muted">Aktywne filtry:</span>
            {activeFilters.map((f) => (
              <Badge key={f} variant="neutral" className="gap-tight pl-inline pr-tight">
                <span>{f}</span>
                <button
                  type="button"
                  onClick={() => {
                    removeFilter(f);
                  }}
                  aria-label={`Usuń filtr ${f}`}
                  className="rounded-tag hover:text-text-danger"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-meta">
              Wyczyść filtry
            </Button>
          </div>
        ) : null}
      </div>

      {hasNoResults ? (
        <EmptyState
          title="Brak wyników dla wybranych filtrów"
          description="Żaden mentor nie spełnia wszystkich wybranych kryteriów. Spróbuj usunąć część filtrów lub poszerzyć zakres stawek."
          action={
            <Button variant="outline" onClick={clearAllFilters}>
              Wyczyść wszystkie filtry
            </Button>
          }
        />
      ) : (
        <div className="space-y-group">
          {initialMentors.map((m) => (
            <MentorCard key={m.id} {...m} />
          ))}
        </div>
      )}
    </div>
  );
}

const meta = {
  title: 'Wzorce/Lista z filtrami',
  component: FilterListDemo,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof FilterListDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithResults: Story = {
  name: '1. Wyniki z aktywnymi filtrami',
  args: {
    mode: 'results',
  },
};

export const NoFilterMatch: Story = {
  name: '2. Brak wyników dla filtrów (z akcją wyczyść)',
  args: {
    mode: 'no_filter_match',
  },
};

export const EmptyCollection: Story = {
  name: '3. Jeszcze nic tu nie ma (pusta kolekcja)',
  args: {
    mode: 'empty_collection',
  },
};

export const LoadingState: Story = {
  name: '4. Stan ładowania (Skeleton)',
  args: {
    mode: 'loading',
  },
};

export const ClearFilterTest: Story = {
  name: 'Test: usunięcie filtra chipem i przyciskiem wyczyść',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const removeBtn = canvas.getByRole('button', { name: 'Usuń filtr TypeScript' });
    await userEvent.click(removeBtn);
    await expect(canvas.queryByText('TypeScript')).not.toBeInTheDocument();
  },
};
