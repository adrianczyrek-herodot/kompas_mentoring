import type * as React from 'react';
import { cn } from '../lib/utils';

// Placeholder in the shape of content that is loading (state L of every screen). surface-sunken,
// pulse only without prefers-reduced-motion. Hidden from screen readers: the container says
// "loading" (aria-busy + text).
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn('rounded-control bg-surface-sunken motion-safe:animate-pulse', className)}
      {...props}
    />
  );
}

export { Skeleton };
