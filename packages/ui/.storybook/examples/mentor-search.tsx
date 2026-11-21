/**
 * Example of the list-with-filters pattern on P2 „Wyszukiwarka mentorów” (E2-S5), composed from
 * real @kompas/ui components. Storybook only. Filtering runs locally on fixture data; in the app
 * filters live in the URL and the server filters (KONCEPCJA §P2 „Walidacje”).
 */
import { SearchX, SlidersHorizontal } from 'lucide-react';
import { useId, useState } from 'react';
import {
  type ActiveFilter,
  ActiveFilters,
  Button,
  EmptyState,
  ErrorState,
  Field,
  FieldDescription,
  FieldLabel,
  FieldTitle,
  MentorCard,
  MentorCardSkeleton,
  type MentorSummary,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Slider,
  Switch,
} from '../../src/index';

// Categories per mentor, from the mockups (`MENTORS[].categories`).
const categoriesOf: Record<string, string[]> = {
  m1: ['Frontend', 'Kariera w IT'],
  m2: ['Przywództwo', 'Kariera w IT'],
  m3: ['Data & AI', 'Kariera w IT'],
  m4: ['Backend', 'DevOps & Cloud'],
  m5: ['UX/UI Design'],
  m6: ['Product Management', 'Kariera w IT'],
};
const CATEGORIES = [
  'Frontend',
  'Backend',
  'Data & AI',
  'Product Management',
  'UX/UI Design',
  'Kariera w IT',
  'DevOps & Cloud',
  'Przywództwo',
];

export type Filters = { category: string; price: readonly number[]; verifiedOnly: boolean };
export const noFilters: Filters = { category: 'all', price: [0, 1000], verifiedOnly: false };

const categoryItems = [
  { value: 'all', label: 'Wszystkie tematy' },
  ...CATEGORIES.map((c) => ({ value: c, label: c })),
];

function matches(mentor: MentorSummary, filters: Filters) {
  const zl = Number(mentor.rate60 / 100n);
  const [min = 0, max = 1000] = filters.price;
  return (
    (filters.category === 'all' || (categoriesOf[mentor.id] ?? []).includes(filters.category)) &&
    zl >= min &&
    zl <= max &&
    (!filters.verifiedOnly || mentor.verified)
  );
}

function activeOf(filters: Filters): (ActiveFilter & { reset: Partial<Filters> })[] {
  const list: (ActiveFilter & { reset: Partial<Filters> })[] = [];
  if (filters.category !== 'all')
    list.push({ id: 'category', label: filters.category, reset: { category: 'all' } });
  const [min = 0, max = 1000] = filters.price;
  if (min !== 0 || max !== 1000)
    list.push({
      id: 'price',
      label: `${String(min)}–${String(max)} zł`,
      reset: { price: [0, 1000] },
    });
  if (filters.verifiedOnly)
    list.push({ id: 'verified', label: 'Tylko zweryfikowani', reset: { verifiedOnly: false } });
  return list;
}

function FilterPanel({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
}) {
  const id = useId();
  const [min = 0, max = 1000] = filters.price;
  return (
    <div className="flex flex-col gap-group">
      <Field>
        <FieldLabel htmlFor={`${id}-topic`}>Temat</FieldLabel>
        <Select
          items={categoryItems}
          value={filters.category}
          onValueChange={(value) => {
            onChange({ ...filters, category: String(value) });
          }}
        >
          <SelectTrigger id={`${id}-topic`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <div className="flex items-baseline justify-between gap-inline">
          <FieldTitle id={`${id}-price`}>Cena za 60 minut</FieldTitle>
          <output className="text-body-dense tabular-nums">
            {min}–{max} zł
          </output>
        </div>
        <Slider
          aria-labelledby={`${id}-price`}
          thumbLabels={['Cena od', 'Cena do']}
          min={0}
          max={1000}
          step={10}
          largeStep={100}
          value={filters.price}
          onValueChange={(next) => {
            onChange({ ...filters, price: Array.isArray(next) ? next : [next as number] });
          }}
        />
        <FieldDescription>Od 0 do 1000 zł.</FieldDescription>
      </Field>
      <Field orientation="horizontal" className="justify-between">
        <FieldLabel htmlFor={`${id}-verified`}>Tylko zweryfikowani</FieldLabel>
        <Switch
          id={`${id}-verified`}
          checked={filters.verifiedOnly}
          onCheckedChange={(checked) => {
            onChange({ ...filters, verifiedOnly: checked });
          }}
        />
      </Field>
    </div>
  );
}

const mentorForms = { one: 'mentor', few: 'mentorów', many: 'mentorów' };

export function MentorSearch({
  mentors,
  initialFilters = noFilters,
  status = 'ready',
  onRetry,
}: {
  mentors: MentorSummary[];
  initialFilters?: Filters;
  status?: 'ready' | 'loading' | 'error';
  onRetry?: () => void;
}) {
  const [filters, setFilters] = useState(initialFilters);
  const resultsId = useId();
  const results = mentors.filter((mentor) => matches(mentor, filters));
  const active = activeOf(filters);
  // „Wyczyść filtr X” for the filter whose removal brings back the most results (E2-S5 T3).
  const narrowest = active
    .map((filter) => ({
      filter,
      count: mentors.filter((m) => matches(m, { ...filters, ...filter.reset })).length,
    }))
    .sort((a, b) => b.count - a.count)[0]?.filter;

  const reset = (id: string) => {
    const filter = active.find((f) => f.id === id);
    if (filter) setFilters((current) => ({ ...current, ...filter.reset }));
  };

  return (
    <div className="flex flex-col gap-group md:flex-row md:gap-section">
      <aside aria-label="Filtry" className="hidden md:block md:w-1/4 md:shrink-0">
        <FilterPanel filters={filters} onChange={setFilters} />
      </aside>
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger render={<Button variant="outline" />}>
            <SlidersHorizontal aria-hidden="true" />
            Filtry
          </SheetTrigger>
          <SheetContent side="bottom" closeLabel="Zamknij filtry">
            <SheetHeader>
              <SheetTitle>Filtry</SheetTitle>
            </SheetHeader>
            <FilterPanel filters={filters} onChange={setFilters} />
            <SheetFooter>
              <SheetClose render={<Button />}>Pokaż wyniki</SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <section
        aria-labelledby={`${resultsId}-h`}
        className="flex min-w-0 flex-1 flex-col gap-inline"
      >
        <h2 id={`${resultsId}-h`} className="sr-only">
          Wyniki
        </h2>
        {status === 'ready' ? (
          <ActiveFilters
            resultCount={results.length}
            countForms={mentorForms}
            filters={active}
            onRemove={reset}
            onClearAll={() => {
              setFilters(noFilters);
            }}
          />
        ) : null}
        {status === 'loading' ? (
          <div aria-busy="true">
            <p className="sr-only">Wczytujemy mentorów…</p>
            {[0, 1, 2, 3, 4, 5].map((row) => (
              <MentorCardSkeleton key={row} />
            ))}
          </div>
        ) : status === 'error' ? (
          <ErrorState
            titleAs="h3"
            title="Nie udało się wczytać listy"
            description="Sprawdź połączenie i spróbuj ponownie. Filtry zostaną zachowane."
            action={
              <Button variant="outline" onClick={onRetry}>
                Ponów
              </Button>
            }
          />
        ) : results.length === 0 ? (
          <EmptyState
            titleAs="h3"
            icon={<SearchX />}
            title="Brak mentorów dla tych filtrów"
            description={
              narrowest
                ? `Najbardziej zawęża wyniki filtr „${narrowest.label}”.`
                : 'Spróbuj szerszego tematu.'
            }
            action={
              narrowest ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    reset(narrowest.id);
                  }}
                >
                  Wyczyść filtr: {narrowest.label}
                </Button>
              ) : null
            }
          />
        ) : (
          <ul aria-label="Mentorzy">
            {results.map((mentor) => (
              <li key={mentor.id}>
                <MentorCard
                  mentor={mentor}
                  profileHref={`/mentorzy/${mentor.id}`}
                  action={
                    <Button variant="outline" size="sm">
                      Zarezerwuj sesję próbną<span className="sr-only"> — {mentor.name}</span>
                    </Button>
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
