import type * as React from 'react';
import { type DateTimeStyle, formatDateTime } from '../lib/format';
import { cn } from '../lib/utils';

type DateTimeProps = Omit<React.ComponentProps<'time'>, 'dateTime' | 'children'> & {
  /** ISO instant, e.g. `2026-10-22T09:00:00+02:00`. */
  value: string;
  /** IANA zone of the viewer (brief rule 10) — never the server's or the mentor's. */
  timeZone: string;
  format?: DateTimeStyle;
};

// A point in time shown in the viewer's zone, with tabular figures (R01.3).
function DateTime({ value, timeZone, format = 'datetime', className, ...props }: DateTimeProps) {
  return (
    <time
      data-slot="date-time"
      dateTime={value}
      className={cn('whitespace-nowrap tabular-nums', className)}
      {...props}
    >
      {formatDateTime(value, timeZone, format)}
    </time>
  );
}

export { DateTime, type DateTimeProps };
