import type * as React from 'react';
import { cn } from '../lib/utils';

// Panel for a section of a screen (P3, M2, S3): border-divider line, rounded-panel, no shadow
// (R01.4, A01). Never nest a Card in a Card — group inside with spacing and Separator (A01).
function Card({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<'div'> & { size?: 'default' | 'sm' }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        'group/card flex flex-col gap-panel rounded-panel border border-border-divider bg-surface-panel p-panel text-body text-text-default data-[size=sm]:gap-group data-[size=sm]:p-group',
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'grid auto-rows-min items-start gap-tight has-data-[slot=card-action]:grid-cols-(--card-header-columns)',
        className,
      )}
      {...props}
    />
  );
}

/** Pass a heading element as the child (`<h2>`) so the page outline stays correct. */
function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        'text-section-title font-semibold text-text-default group-data-[size=sm]/card:text-body',
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('max-w-measure text-body-dense text-text-muted', className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('min-w-0', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'flex flex-wrap items-center gap-inline border-t border-border-divider pt-group',
        className,
      )}
      {...props}
    />
  );
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
