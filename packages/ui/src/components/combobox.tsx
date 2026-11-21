'use client';

import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { CheckIcon, ChevronDownIcon, XIcon } from 'lucide-react';
import {
  itemIndicatorClasses,
  listItemClasses,
  popupClasses,
  positionerClasses,
} from '../lib/overlay';
import { cn } from '../lib/utils';

const Combobox = ComboboxPrimitive.Root;
const ComboboxValue = ComboboxPrimitive.Value;

// The input group carries the field look (border-control, 44 px); the focus outline moves to the
// group so it wraps the input and the buttons (P-T2).
const inputGroupClasses =
  'flex min-h-control w-full items-center rounded-control border border-border-control bg-surface-panel pl-field-x text-body text-text-default transition-colors duration-fast has-[input:focus-visible]:outline-(length:--focus-ring-width) has-[input:focus-visible]:outline-offset-(--focus-ring-offset) has-[input:focus-visible]:outline-focus-ring has-[input:focus-visible]:outline-solid has-aria-invalid:border-border-invalid has-disabled:cursor-not-allowed has-disabled:border-border-disabled has-disabled:bg-surface-disabled has-disabled:text-text-disabled';

const iconButtonClasses =
  'flex size-control items-center justify-center rounded-control text-text-muted hover:text-text-default data-disabled:hidden [&>svg]:size-icon-sm';

type ComboboxInputProps = ComboboxPrimitive.Input.Props & {
  /** Accessible name of the clear button, e.g. "Wyczyść temat". Without it there is no clear button. */
  clearLabel?: string;
  /** Accessible name of the open button, e.g. "Pokaż tematy". */
  triggerLabel: string;
  /** Selected values as chips (multiple mode), rendered before the input. */
  chips?: React.ReactNode;
};

/** Text field with the list button (and optional clear button and chips). */
function ComboboxInput({
  className,
  clearLabel,
  triggerLabel,
  chips,
  ...props
}: ComboboxInputProps) {
  return (
    <ComboboxPrimitive.InputGroup data-slot="combobox-input-group" className={inputGroupClasses}>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-tight">
        {chips}
        <ComboboxPrimitive.Input
          data-slot="combobox-input"
          className={cn(
            'h-control min-w-0 flex-1 bg-transparent outline-none placeholder:text-text-subtle disabled:cursor-not-allowed',
            className,
          )}
          {...props}
        />
      </div>
      <div className="flex shrink-0">
        {clearLabel ? (
          <ComboboxPrimitive.Clear className={iconButtonClasses} aria-label={clearLabel}>
            <XIcon aria-hidden="true" />
          </ComboboxPrimitive.Clear>
        ) : null}
        <ComboboxPrimitive.Trigger className={iconButtonClasses} aria-label={triggerLabel}>
          <ChevronDownIcon aria-hidden="true" />
        </ComboboxPrimitive.Trigger>
      </div>
    </ComboboxPrimitive.InputGroup>
  );
}

function ComboboxChip({
  className,
  children,
  removeLabel,
  ...props
}: ComboboxPrimitive.Chip.Props & { removeLabel: string }) {
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      className={cn(
        'flex items-center gap-tight rounded-tag bg-surface-sunken py-tight pl-inline text-body-dense text-text-default data-highlighted:outline-solid data-highlighted:outline-(length:--focus-ring-width) data-highlighted:outline-focus-ring',
        className,
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ChipRemove
        aria-label={removeLabel}
        className="relative flex size-icon-md items-center justify-center rounded-tag text-text-muted after:absolute after:top-1/2 after:left-1/2 after:size-target after:-translate-1/2 hover:text-text-default [&>svg]:size-icon-sm"
      >
        <XIcon aria-hidden="true" />
      </ComboboxPrimitive.ChipRemove>
    </ComboboxPrimitive.Chip>
  );
}

/** Row of selected values; wraps onto more lines at narrow widths. */
function ComboboxChips({ className, ...props }: ComboboxPrimitive.Chips.Props) {
  return (
    <ComboboxPrimitive.Chips
      data-slot="combobox-chips"
      className={cn('flex flex-wrap items-center gap-tight py-tight', className)}
      {...props}
    />
  );
}

function ComboboxContent({
  className,
  children,
  sideOffset = 4,
  ...props
}: ComboboxPrimitive.Popup.Props & { sideOffset?: number }) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner className={positionerClasses} sideOffset={sideOffset}>
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          className={cn(popupClasses, className)}
          {...props}
        >
          {children}
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

/** Shown when the filter matches nothing; say what to try instead (R05.2). */
function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn('px-field-x py-inline text-body-dense text-text-muted empty:hidden', className)}
      {...props}
    />
  );
}

const ComboboxList = ComboboxPrimitive.List;

function ComboboxItem({ className, children, ...props }: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(listItemClasses, className)}
      {...props}
    >
      <span className="min-w-0 flex-1">{children}</span>
      <ComboboxPrimitive.ItemIndicator className={itemIndicatorClasses}>
        <CheckIcon aria-hidden="true" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  );
}

export {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  type ComboboxInputProps,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
};
