import type * as React from 'react';
import { cn } from '../lib/utils';

// Dense data table (A1 queue, later M5): rows separated by lines, not cards (R01.4), dense text and
// row padding (K1, space-row-y), numbers right-aligned in tabular figures (R01.3, R03.3).
function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn('w-full caption-bottom border-collapse text-left text-body-dense', className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn('bg-surface-sunken [&_tr]:border-b-border-control', className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" className={cn(className)} {...props} />;
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b border-border-divider aria-selected:bg-selected-bg data-[state=selected]:bg-selected-bg',
        className,
      )}
      {...props}
    />
  );
}

type CellProps = {
  /** Right-aligned, tabular figures: amounts, counts, durations. */ numeric?: boolean;
};

function TableHead({
  className,
  numeric = false,
  ...props
}: React.ComponentProps<'th'> & CellProps) {
  return (
    <th
      data-slot="table-head"
      scope="col"
      className={cn(
        'px-inline py-row-y align-bottom text-label font-medium whitespace-nowrap text-text-muted',
        numeric && 'text-right',
        className,
      )}
      {...props}
    />
  );
}

function TableCell({
  className,
  numeric = false,
  ...props
}: React.ComponentProps<'td'> & CellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'px-inline py-row-y align-middle text-text-default',
        numeric && 'text-right tabular-nums',
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('pt-inline text-left text-meta text-text-muted', className)}
      {...props}
    />
  );
}

export { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow };
