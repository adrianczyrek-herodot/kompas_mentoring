import type * as React from 'react';
import { cn } from '../lib/utils';
import { Money } from '../product/money';

interface EarningsPreviewProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /** Rate for 60 minutes in grosze. */
  readonly rate60Amount: bigint;
  /** Rate for 30 minutes in grosze (half of the hour, rounded down). */
  readonly rate30Amount: bigint;
  /** Note about the platform commission (Q9: the amount after the commission is not known yet). */
  readonly note?: string;
  /** Name of the 60-minute price, e.g. "Sesja 60 minut". */
  readonly hourLabel?: string;
  /** Name of the 30-minute price, e.g. "Sesja 30 minut". */
  readonly halfHourLabel?: string;
}

/**
 * Preview of what the mentor earns (M1 step 4, Q9): the price of a 60-minute and a 30-minute
 * session. The amount after the platform commission is deliberately not shown — the model of the
 * commission is still open, and a promise without a decision would be worse than no number.
 */
function EarningsPreview({
  rate60Amount,
  rate30Amount,
  note = 'Prowizja platformy: zasady ogłosimy przed uruchomieniem płatności.',
  hourLabel = 'Sesja 60 minut',
  halfHourLabel = 'Sesja 30 minut',
  className,
  ...props
}: EarningsPreviewProps) {
  return (
    <div
      data-slot="earnings-preview"
      className={cn('flex flex-col gap-tight rounded-panel border border-border-divider p-panel', className)}
      {...props}
    >
      <dl className="flex flex-col gap-tight">
        <div className="flex items-baseline justify-between gap-inline">
          <dt className="text-body-dense text-text-muted">{hourLabel}</dt>
          <dd className="text-label font-medium text-text-default">
            <Money amount={rate60Amount} />
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-inline">
          <dt className="text-body-dense text-text-muted">{halfHourLabel}</dt>
          <dd className="text-label font-medium text-text-default">
            <Money amount={rate30Amount} />
          </dd>
        </div>
      </dl>
      <p data-slot="earnings-preview-note" className="text-body-dense text-text-muted">
        {note}
      </p>
    </div>
  );
}

export { EarningsPreview, type EarningsPreviewProps };
