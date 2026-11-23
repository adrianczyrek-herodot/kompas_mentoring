// biome-ignore-all lint/a11y/useSemanticElements: an interactive availability grid has no semantic HTML element (a table would lose the gridcell semantics).
// biome-ignore-all lint/a11y/useFocusableInteractive: rows and header cells are not focusable by design; only gridcells take the roving tabindex.
'use client';

import type * as React from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { cn } from '../lib/utils';
import {
  type AvailabilityRuleView,
  cellKey,
  cellsToRules,
  columnLabel,
  type FocusCell,
  formatWeeklyTotal,
  nextFocus,
  paintRange,
  rulesToCells,
  SLOT_INDICES,
  slotToTime,
  toggleCell,
  WEEKDAYS,
  weekdayLabel,
} from './availability-editor.logic';

export type { AvailabilityRuleView } from './availability-editor.logic';

export interface AvailabilityEditorProps {
  readonly value: readonly AvailabilityRuleView[];
  readonly onChange: (next: AvailabilityRuleView[]) => void;
  readonly disabled?: boolean;
  readonly className?: string;
}

/** Reads the `data-cell` under a pointer/focus event; `null` when the event missed a cell. */
function cellFromEvent(event: React.SyntheticEvent): FocusCell | null {
  const key = (event.target as HTMLElement).closest<HTMLElement>('[data-cell]')?.dataset['cell'];
  if (!key) return null;
  const [weekday = '0', slot = '0'] = key.split(':');
  return { weekday: Number(weekday), slot: Number(slot) };
}

/** Drag-to-paint: pointer down starts a run and fixes whether it paints or erases. */
function useDragPaint(
  cells: ReadonlySet<string>,
  onChange: (next: AvailabilityRuleView[]) => void,
  disabled: boolean,
) {
  const dragRef = useRef<boolean | null>(null);
  const apply = useCallback(
    (cell: FocusCell, paint: boolean) => {
      const key = cellKey(cell.weekday, cell.slot);
      if (cells.has(key) === paint) return;
      const next = new Set(cells);
      if (paint) next.add(key);
      else next.delete(key);
      onChange(cellsToRules(next));
    },
    [cells, onChange],
  );
  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const cell = cellFromEvent(event);
      if (!cell || disabled) return;
      event.preventDefault();
      const paint = !cells.has(cellKey(cell.weekday, cell.slot));
      dragRef.current = paint;
      apply(cell, paint);
    },
    [apply, cells, disabled],
  );
  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const cell = cellFromEvent(event);
      if (cell && dragRef.current !== null) apply(cell, dragRef.current);
    },
    [apply],
  );
  const stopDrag = () => {
    dragRef.current = null;
  };
  return { onPointerDown, onPointerMove, onPointerLeave: stopDrag, onPointerUp: stopDrag };
}

/** Keyboard: arrows move the roving focus, Space toggles, Shift+arrow paints the range. */
function useGridKeyboard(
  cells: ReadonlySet<string>,
  onChange: (next: AvailabilityRuleView[]) => void,
  focus: FocusCell,
  moveFocus: (target: FocusCell) => void,
  disabled: boolean,
) {
  const anchorRef = useRef<FocusCell | null>(null);
  return useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      const { key, shiftKey } = event;
      if (key === ' ' || key === 'Enter') {
        event.preventDefault();
        anchorRef.current = null;
        onChange(cellsToRules(toggleCell(cells, focus)));
        return;
      }
      const target = nextFocus(focus, key);
      if (!target) return;
      event.preventDefault();
      if (shiftKey) {
        const anchor = anchorRef.current ?? focus;
        anchorRef.current = anchor;
        onChange(cellsToRules(paintRange(cells, anchor, target)));
      } else {
        anchorRef.current = null;
      }
      moveFocus(target);
    },
    [cells, onChange, focus, moveFocus, disabled],
  );
}

function useMoveFocus(
  gridRef: React.RefObject<HTMLDivElement | null>,
  setFocus: (target: FocusCell) => void,
) {
  return useCallback(
    (target: FocusCell) => {
      setFocus(target);
      gridRef.current
        ?.querySelector<HTMLElement>(`[data-cell="${cellKey(target.weekday, target.slot)}"]`)
        ?.focus();
    },
    [gridRef, setFocus],
  );
}

/** Keeps the roving origin in step with the cell the browser actually focused. */
function useFocusSync(setFocus: (target: FocusCell) => void) {
  return useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      const cell = cellFromEvent(event);
      if (cell) setFocus(cell);
    },
    [setFocus],
  );
}

function GridCell({
  weekday,
  slot,
  covered,
  focused,
  disabled,
}: {
  weekday: number;
  slot: number;
  covered: boolean;
  focused: boolean;
  disabled: boolean;
}) {
  return (
    <div
      role="gridcell"
      data-cell={cellKey(weekday, slot)}
      aria-label={`${weekdayLabel(weekday)} ${slotToTime(slot)}`}
      aria-selected={covered}
      aria-disabled={disabled || undefined}
      tabIndex={focused && !disabled ? 0 : -1}
      className={cn(
        'h-8 w-6 shrink-0 border-r border-b border-border-divider last:border-r-0',
        covered ? 'bg-selected-bg' : 'bg-surface-panel',
      )}
    />
  );
}

function GridRow({
  weekday,
  cells,
  focus,
  disabled,
}: {
  weekday: number;
  cells: ReadonlySet<string>;
  focus: FocusCell;
  disabled: boolean;
}) {
  return (
    <div role="row" className="flex">
      <div
        role="rowheader"
        className="sticky left-0 z-1 w-24 shrink-0 border-r border-b border-border-divider bg-surface-panel px-inline text-left text-label text-text-default"
      >
        {weekdayLabel(weekday)}
      </div>
      {SLOT_INDICES.map((slot) => (
        <GridCell
          key={slot}
          weekday={weekday}
          slot={slot}
          covered={cells.has(cellKey(weekday, slot))}
          focused={focus.weekday === weekday && focus.slot === slot}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

function GridHeader() {
  return (
    <div role="row" className="sticky top-0 z-2 flex bg-surface-panel">
      <div
        role="columnheader"
        className="sticky left-0 z-1 w-24 shrink-0 border-r border-b border-border-divider bg-surface-panel px-inline text-left text-meta text-text-muted"
      >
        Dzień
      </div>
      {SLOT_INDICES.map((slot) => (
        <div
          key={slot}
          role="columnheader"
          aria-label={slotToTime(slot)}
          className="w-6 shrink-0 border-b border-border-divider text-center text-meta text-text-muted tabular-nums"
        >
          <span className={slot % 2 === 0 ? undefined : 'sr-only'}>{columnLabel(slot)}</span>
        </div>
      ))}
    </div>
  );
}

function EditorSummary({ cells }: { cells: ReadonlySet<string> }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-inline">
      <p aria-live="polite" className="text-label font-medium text-text-default">
        Suma tygodniowa: <span className="tabular-nums">{formatWeeklyTotal(cells)}</span>
      </p>
      <p className="text-meta text-text-muted">
        Zaznacz strzałkami i spacją; Shift+strzałka maluje zakres.
      </p>
    </div>
  );
}

function AvailabilityGrid({
  gridRef,
  cells,
  focus,
  disabled,
  onKeyDown,
  onFocus,
  drag,
}: {
  gridRef: React.RefObject<HTMLDivElement | null>;
  cells: ReadonlySet<string>;
  focus: FocusCell;
  disabled: boolean;
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  onFocus: (event: React.FocusEvent<HTMLDivElement>) => void;
  drag: ReturnType<typeof useDragPaint>;
}) {
  return (
    <div
      ref={gridRef}
      role="grid"
      aria-label="Tygodniowy szablon dostępności"
      aria-readonly={disabled || undefined}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      {...drag}
      className={cn(
        'max-h-128 overflow-auto rounded-control border border-border-control bg-surface-panel',
        disabled && 'pointer-events-none',
      )}
    >
      <GridHeader />
      {WEEKDAYS.map((weekday) => (
        <GridRow key={weekday} weekday={weekday} cells={cells} focus={focus} disabled={disabled} />
      ))}
    </div>
  );
}

/** Weekly 30-minute template editor (DS-05): click/drag, full keyboard, weekly total. */
function AvailabilityEditor({
  value,
  onChange,
  disabled = false,
  className,
  ...props
}: AvailabilityEditorProps) {
  const cells = useMemo(() => rulesToCells(value), [value]);
  const [focus, setFocus] = useState<FocusCell>({ weekday: 1, slot: 0 });
  const gridRef = useRef<HTMLDivElement>(null);
  const moveFocus = useMoveFocus(gridRef, setFocus);
  const drag = useDragPaint(cells, onChange, disabled);
  const onKeyDown = useGridKeyboard(cells, onChange, focus, moveFocus, disabled);
  const onFocus = useFocusSync(setFocus);

  return (
    <section
      data-slot="availability-editor"
      className={cn('flex flex-col gap-inline', className)}
      {...props}
    >
      <EditorSummary cells={cells} />
      {cells.size === 0 ? (
        <p className="text-body-dense text-text-muted">
          Brak dostępności w szablonie. Zaznacz godziny w siatce poniżej.
        </p>
      ) : null}
      <AvailabilityGrid
        gridRef={gridRef}
        cells={cells}
        focus={focus}
        disabled={disabled}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        drag={drag}
      />
    </section>
  );
}

export { AvailabilityEditor };
