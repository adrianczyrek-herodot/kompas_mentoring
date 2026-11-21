import { X } from 'lucide-react';
import type * as React from 'react';
import { Button } from '../components/button';
import { type CountForms, formatCount } from '../lib/format';
import { cn } from '../lib/utils';

type ActiveFilter = { id: string; label: string };

type ActiveFiltersProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** Number of results for the current filters; announced politely when it changes. */
  resultCount: number;
  /** Noun forms for the count, e.g. mentor / mentorów / mentorów. */
  countForms: CountForms;
  filters: ActiveFilter[];
  onRemove?: (id: string) => void;
  onClearAll?: () => void;
};

// Result count + active filters as removable buttons (KONCEPCJA §P2 ResultCount, ActiveFilterChips).
// Each filter is a real button named „<label> — usuń filtr” (WCAG 2.5.3, 4.1.2).
function ActiveFilters({
  resultCount,
  countForms,
  filters,
  onRemove,
  onClearAll,
  className,
  ...props
}: ActiveFiltersProps) {
  return (
    <div
      data-slot="active-filters"
      className={cn('flex flex-col gap-inline md:flex-row md:items-center', className)}
      {...props}
    >
      <p aria-live="polite" className="text-label font-medium text-text-default tabular-nums">
        {formatCount(resultCount, countForms)}
      </p>
      {filters.length > 0 ? (
        <ul aria-label="Aktywne filtry" className="flex flex-wrap items-center gap-inline">
          {filters.map((filter) => (
            <li key={filter.id}>
              <Button
                variant="outline"
                size="sm"
                aria-label={`${filter.label} — usuń filtr`}
                onClick={() => onRemove?.(filter.id)}
              >
                {filter.label}
                <X aria-hidden="true" />
              </Button>
            </li>
          ))}
          {filters.length > 1 ? (
            <li>
              <Button variant="link" size="sm" onClick={onClearAll}>
                Wyczyść wszystkie
              </Button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}

export { type ActiveFilter, ActiveFilters, type ActiveFiltersProps };
