'use client';

import { X } from 'lucide-react';
import type * as React from 'react';
import { useId, useState } from 'react';
import { cn } from '../lib/utils';

interface TagInputProps extends Omit<React.ComponentProps<'div'>, 'onChange' | 'defaultValue'> {
  /** Chosen tags (already normalised by the caller). */
  readonly value: readonly string[];
  readonly onChange: (tags: string[]) => void;
  /** Name of the field, e.g. "Tagi". */
  readonly label: string;
  /** Name of the button that removes a tag, e.g. "Usuń tag". */
  readonly removeLabel: string;
  /** Placeholder of the input. */
  readonly placeholder?: string;
  /** Maximum number of tags; the input stops accepting more. */
  readonly max?: number;
  /** Shortest accepted tag. */
  readonly minLength?: number;
  /** Longest accepted tag. */
  readonly maxLength?: number;
  /** Message shown when a tag cannot be added. */
  readonly error?: string;
  /** Suggestions the mentor may pick (existing tags, Q3). */
  readonly suggestions?: readonly string[];
}

/**
 * Free tags of the mentor profile (Q3): the mentor types them, the list grows with chips.
 * Enter or a comma adds a tag, Backspace on an empty field removes the last one. Every chip has
 * its own remove button with a name, so the list works with a keyboard and a screen reader.
 */
function TagInput({
  value,
  onChange,
  label,
  removeLabel,
  placeholder,
  max = 15,
  minLength = 2,
  maxLength = 30,
  error,
  suggestions = [],
  className,
  ...props
}: TagInputProps) {
  const inputId = useId();
  const [draft, setDraft] = useState('');
  const [problem, setProblem] = useState<string | null>(null);

  const add = (raw: string) => {
    const tag = raw.trim().replace(/,$/, '').toLowerCase();
    if (tag.length === 0) return;
    if (tag.length < minLength || tag.length > maxLength) {
      setProblem('tooLong');
      return;
    }
    if (value.includes(tag)) {
      setProblem('duplicate');
      return;
    }
    if (value.length >= max) {
      setProblem('tooMany');
      return;
    }
    setProblem(null);
    setDraft('');
    onChange([...value, tag]);
  };

  const remove = (tag: string) => {
    setProblem(null);
    onChange(value.filter((candidate) => candidate !== tag));
  };

  const messages: Record<string, string> = {
    tooLong: `Tag musi mieć od ${minLength} do ${maxLength} znaków.`,
    duplicate: 'Taki tag już masz na liście.',
    tooMany: `Możesz dodać najwyżej ${max} tagów.`,
  };

  return (
    <div data-slot="tag-input" className={cn('flex flex-col gap-inline', className)} {...props}>
      <div
        data-slot="tag-input-control"
        className={cn(
          'flex min-h-control w-full flex-wrap items-center gap-tight rounded-control border border-border-control bg-surface-panel px-field-x py-tight',
          'has-[input:focus-visible]:outline-(length:--focus-ring-width) has-[input:focus-visible]:outline-offset-(--focus-ring-offset) has-[input:focus-visible]:outline-focus-ring has-[input:focus-visible]:outline-solid',
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            data-slot="tag-input-chip"
            className="flex items-center gap-tight rounded-tag bg-surface-sunken py-tight pl-inline text-body-dense text-text-default"
          >
            {tag}
            <button
              type="button"
              onClick={() => {
                remove(tag);
              }}
              aria-label={`${removeLabel}: ${tag}`}
              className="flex size-icon-sm items-center justify-center rounded-tag text-text-muted hover:text-text-default"
            >
              <X aria-hidden="true" className="size-icon-sm" />
            </button>
          </span>
        ))}
        <input
          id={inputId}
          data-slot="tag-input-field"
          type="text"
          value={draft}
          placeholder={value.length >= max ? undefined : placeholder}
          disabled={value.length >= max}
          aria-label={label}
          aria-describedby={problem === null ? undefined : `${inputId}-problem`}
          onChange={(event) => {
            setDraft(event.target.value);
            setProblem(null);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault();
              add(event.currentTarget.value);
              return;
            }
            if (event.key === 'Backspace' && draft.length === 0 && value.length > 0) {
              remove(value[value.length - 1] ?? '');
            }
            return;
          }}
          onBlur={() => {
            add(draft);
          }}
          className="h-control min-w-32 flex-1 bg-transparent text-body text-text-default outline-none placeholder:text-text-subtle disabled:cursor-not-allowed"
        />
      </div>
      {problem !== null && (
        <p
          id={`${inputId}-problem`}
          role="alert"
          data-slot="tag-input-error"
          className="text-body-dense text-status-danger-fg"
        >
          {messages[problem]}
        </p>
      )}
      {error !== undefined && (
        <p data-slot="tag-input-error" className="text-body-dense text-status-danger-fg">
          {error}
        </p>
      )}
      {suggestions.length > 0 && (
        <ul data-slot="tag-input-suggestions" className="flex flex-wrap gap-tight">
          {suggestions
            .filter((suggestion) => !value.includes(suggestion))
            .map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  onClick={() => {
                    add(suggestion);
                  }}
                  className="rounded-tag border border-border-divider px-inline py-tight text-body-dense text-text-muted hover:text-text-default"
                >
                  + {suggestion}
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

export { TagInput, type TagInputProps };
