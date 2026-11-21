/** P2 · Wyszukiwarka mentorów (KONCEPCJA §P2, E2-S5, E2-S8). */
import {
  ActiveFilters,
  Button,
  EmptyState,
  ErrorState,
  FieldLabel,
  MentorCard,
  MentorCardSkeleton,
  PageHeader,
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
} from '@kompas/ui';
import { Heart, SearchX, SlidersHorizontal } from 'lucide-react';
import { useId } from 'react';
import { type Mentor, PUBLIC_MENTORS } from '../data/mentors';
import { href, navigate, replace, type Route, withQuery } from '../lib/router';
import { useDemo, useRetry } from '../state/demo-context';
import { FilterPanel } from './p2-filter-panel';
import {
  activeOf,
  type Filters,
  filtersFrom,
  matches,
  NO_FILTERS,
  queryOf,
  type Sort,
  SORT_LABELS,
  sorted,
} from './p2-filters';

const mentorForms = { one: 'mentor', few: 'mentorów', many: 'mentorów' };
const sortItems = (Object.keys(SORT_LABELS) as Sort[]).map((value) => ({
  value,
  label: SORT_LABELS[value],
}));

// DS-GAP: FavoriteToggle (E2-S8) — Button ghost icon with aria-pressed.
function FavoriteToggle({ mentor, returnTo }: { mentor: Mentor; returnTo: string }) {
  const { state, dispatch, account } = useDemo();
  const on = state.favorites.includes(mentor.id);
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-pressed={on}
      aria-label={on ? `Usuń z ulubionych: ${mentor.name}` : `Dodaj do ulubionych: ${mentor.name}`}
      onClick={() => {
        // Favourites need an account (POST /me/favorites).
        if (account.role === 'guest') navigate(withQuery('/logowanie', { returnTo }));
        else dispatch({ type: 'toggle-favorite', mentorId: mentor.id });
      }}
    >
      <Heart aria-hidden="true" className={on ? 'fill-current' : undefined} />
    </Button>
  );
}

function MentorActions({ mentor, returnTo }: { mentor: Mentor; returnTo: string }) {
  return (
    <div className="flex flex-wrap items-center gap-tight md:justify-end">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          navigate(`/rezerwacja/${mentor.id}`);
        }}
      >
        Zarezerwuj<span className="sr-only"> sesję — {mentor.name}</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          navigate(withQuery('/wiadomosci', { do: mentor.id }));
        }}
      >
        Napisz<span className="sr-only"> do: {mentor.name}</span>
      </Button>
      <FavoriteToggle mentor={mentor} returnTo={returnTo} />
    </div>
  );
}

function SortSelect({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const id = useId();
  return (
    <div className="flex items-center gap-inline">
      <FieldLabel htmlFor={id}>Sortuj</FieldLabel>
      <Select
        items={sortItems}
        value={filters.sort}
        onValueChange={(value) => {
          onChange({ ...filters, sort: value ?? 'trafnosc' });
        }}
      >
        <SelectTrigger id={id} className="w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Results({
  filters,
  onChange,
  returnTo,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  returnTo: string;
}) {
  const { state } = useDemo();
  const retry = useRetry();
  const status = state.scenarios.dataState;
  const results = sorted(
    PUBLIC_MENTORS.filter((m) => matches(m, filters)),
    filters.sort,
  );
  const active = activeOf(filters);
  // „Wyczyść filtr X” for the filter whose removal brings back the most results (E2-S5).
  const narrowest = active
    .map((f) => ({
      filter: f,
      count: PUBLIC_MENTORS.filter((m) => matches(m, { ...filters, ...f.reset })).length,
    }))
    .sort((a, b) => b.count - a.count)[0]?.filter;
  const reset = (id: string) => {
    const filter = active.find((f) => f.id === id);
    if (filter) onChange({ ...filters, ...filter.reset });
  };

  if (status === 'loading')
    return (
      <div aria-busy="true">
        <p className="sr-only">Wczytujemy mentorów…</p>
        {[0, 1, 2, 3, 4, 5].map((row) => (
          <MentorCardSkeleton key={row} />
        ))}
      </div>
    );
  if (status === 'error')
    return (
      <ErrorState
        titleAs="h3"
        title="Nie udało się wczytać listy"
        description="Sprawdź połączenie i spróbuj ponownie. Filtry zostaną zachowane."
        action={
          <Button variant="outline" onClick={retry}>
            Ponów
          </Button>
        }
      />
    );
  const list = status === 'empty' ? [] : results;
  return (
    <>
      <ActiveFilters
        resultCount={list.length}
        countForms={mentorForms}
        filters={active}
        onRemove={reset}
        onClearAll={() => {
          onChange({ ...NO_FILTERS, sort: filters.sort });
        }}
      />
      {list.length === 0 ? (
        <EmptyState
          titleAs="h3"
          icon={<SearchX />}
          title="Brak mentorów dla tych filtrów"
          description={
            narrowest
              ? `Najbardziej zawęża wyniki filtr: ${narrowest.label}.`
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
          {list.map((mentor) => (
            <li key={mentor.id}>
              <MentorCard
                mentor={mentor}
                profileHref={href(`/mentorzy/${mentor.id}`)}
                action={<MentorActions mentor={mentor} returnTo={returnTo} />}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function P2Search({ route }: { route: Route }) {
  const filters = filtersFrom(route.query);
  const resultsId = useId();
  const returnTo = withQuery(route.path, queryOf(filters));
  const onChange = (next: Filters) => {
    replace(withQuery('/mentorzy', queryOf(next)));
  };
  return (
    <>
      <PageHeader
        title="Mentorzy"
        description="Porównaj mentorów i wybierz 1–3 do obejrzenia. Filtry są w adresie — możesz go udostępnić."
      />
      <div className="flex flex-col gap-group md:flex-row md:gap-section">
        <aside aria-label="Filtry" className="hidden md:block md:w-1/4 md:shrink-0">
          <FilterPanel filters={filters} onChange={onChange} />
        </aside>
        <div className="flex flex-wrap items-center justify-between gap-inline md:hidden">
          <Sheet>
            <SheetTrigger render={<Button variant="outline" />}>
              <SlidersHorizontal aria-hidden="true" />
              Filtry
            </SheetTrigger>
            <SheetContent side="bottom" closeLabel="Zamknij filtry">
              <SheetHeader>
                <SheetTitle>Filtry</SheetTitle>
              </SheetHeader>
              <FilterPanel filters={filters} onChange={onChange} />
              <SheetFooter>
                <SheetClose render={<Button />}>Pokaż wyniki</SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
        <section aria-labelledby={`${resultsId}-h`} className="flex min-w-0 flex-1 flex-col gap-inline">
          <div className="flex flex-wrap items-center justify-between gap-inline">
            <h2 id={`${resultsId}-h`} className="text-section-title font-semibold">
              Wyniki
            </h2>
            <SortSelect filters={filters} onChange={onChange} />
          </div>
          <Results filters={filters} onChange={onChange} returnTo={returnTo} />
          <p className="text-meta text-text-muted">
            To wszyscy mentorzy w danych demo — paginacja nieskończona nie ma tu czego doczytać.
          </p>
        </section>
      </div>
    </>
  );
}
