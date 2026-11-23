'use client';

import type * as React from 'react';
import { useId } from 'react';
import { cn } from '../lib/utils';

interface RateInputProps extends Omit<React.ComponentProps<'input'>, 'onChange' | 'value'> {
  /** Rate for 60 minutes in grosze (the API money is minor units, spec §5). */
  readonly amount: number | null;
  readonly onChange: (amount: number | null) => void;
  /** Lowest accepted rate in grosze (40 zł = 4000). */
  readonly min?: number;
  /** Highest accepted rate in grosze (1000 zł = 100000). */
  readonly max?: number;
  /** Step in grosze — whole złoty (Q9). */
  readonly step?: number;
  /** Message under the field. */
  readonly error?: string | null;
  /** Name of the currency, read out after the number. */
  readonly currencyLabel?: string;
}

/**
 * Rate of the mentor (M1 step 4): whole złoty between 40 and 1000 (Q9). The field works in grosze
 * (the API money), the mentor sees złoty — the conversion happens in one place, here.
 */
function RateInput({
  amount,
  onChange,
  min = 4_000,
  max = 100_000,
  step = 100,
  error = null,
  currencyLabel = 'zł',
  className,
  id,
  ...props
}: RateInputProps) {
  const inputId = useId();
  const zloty = amount === null ? '' : (amount / 100).toString();

  return (
    <div data-slot="rate-input" className={cn('flex flex-col gap-tight', className)}>
      <div className="flex items-center gap-inline">
        <input
          id={id ?? inputId}
          data-slot="rate-input-field"
          type="number"
          inputMode="numeric"
          min={min / 100}
          max={max / 100}
          step={step / 100}
          value={zloty}
          aria-invalid={error !== null ? true : undefined}
          onChange={(event) => {
            const value = event.target.value;
            if (value.trim() === '') {
              onChange(null);
              return;
            }
            const parsed = Number(value);
            onChange(Number.isFinite(parsed) ? Math.round(parsed * 100) : null);
          }}
          className="h-control w-full min-w-0 rounded-control border border-border-control bg-surface-panel px-field-x text-body text-text-default transition-colors duration-fast aria-invalid:border-border-invalid"
          {...props}
        />
        <span className="text-body text-text-muted">{currencyLabel}</span>
      </div>
      {error !== null && (
        <p role="alert" data-slot="rate-input-error" className="text-body-dense text-status-danger-fg">
          {error}
        </p>
      )}
    </div>
  );
}

export { RateInput, type RateInputProps };
