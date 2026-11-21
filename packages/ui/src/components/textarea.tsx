'use client';

import type * as React from 'react';
import { useId, useState } from 'react';
import { cn } from '../lib/utils';
import { fieldControlClasses } from './input';

type TextareaProps = React.ComponentProps<'textarea'> & {
  /**
   * Shows "length / maxLength" under the field (needs `maxLength`). The counter is linked with
   * `aria-describedby`, so screen readers read it on focus, not on every keystroke.
   */
  showCount?: boolean;
};

function CharacterCount({ id, length, max }: { id: string; length: number; max: number }) {
  return (
    <p
      id={id}
      data-slot="textarea-count"
      className="self-end text-meta text-text-muted tabular-nums"
    >
      {length} / {max}
    </p>
  );
}

function joinIds(...ids: (string | undefined)[]): string | undefined {
  return ids.filter(Boolean).join(' ') || undefined;
}

/** Length of the current text, for both controlled (`value`) and uncontrolled use. */
function useCharacterCount(
  value: TextareaProps['value'],
  defaultValue: TextareaProps['defaultValue'],
): [number, (length: number) => void] {
  const [uncontrolledLength, setUncontrolledLength] = useState(
    () => String(defaultValue ?? '').length,
  );
  return [value === undefined ? uncontrolledLength : String(value).length, setUncontrolledLength];
}

function Textarea({
  className,
  showCount = false,
  maxLength,
  value,
  defaultValue,
  onChange,
  rows = 4,
  ...props
}: TextareaProps) {
  const counterId = useId();
  const [length, setUncontrolledLength] = useCharacterCount(value, defaultValue);
  const withCount = showCount && maxLength !== undefined;
  const describedBy = joinIds(props['aria-describedby'], withCount ? counterId : undefined);

  const textarea = (
    <textarea
      data-slot="textarea"
      rows={rows}
      maxLength={maxLength}
      value={value}
      defaultValue={defaultValue}
      onChange={(event) => {
        setUncontrolledLength(event.currentTarget.value.length);
        onChange?.(event);
      }}
      className={cn(fieldControlClasses, 'block resize-y py-field-y', className)}
      {...props}
      aria-describedby={describedBy}
    />
  );

  if (!withCount) {
    return textarea;
  }
  return (
    <div data-slot="textarea-wrapper" className="flex w-full flex-col gap-inline">
      {textarea}
      <CharacterCount id={counterId} length={length} max={maxLength} />
    </div>
  );
}

export { Textarea, type TextareaProps };
