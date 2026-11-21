import type * as React from 'react';
import { type Currency, formatMoney } from '../lib/format';
import { cn } from '../lib/utils';

type MoneyProps = Omit<React.ComponentProps<'data'>, 'value' | 'children'> & {
  /** Amount in minor units (grosze) — never a float. */
  amount: bigint;
  currency?: Currency;
};

// Amount with tabular figures so prices line up in lists (R01.3).
function Money({ amount, currency = 'PLN', className, ...props }: MoneyProps) {
  return (
    <data
      data-slot="money"
      value={amount.toString()}
      className={cn('whitespace-nowrap tabular-nums', className)}
      {...props}
    >
      {formatMoney(amount, currency)}
    </data>
  );
}

export { Money, type MoneyProps };
