'use client';

import type * as React from 'react';
import { cn } from '../lib/utils';

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: generic wrapper; callers pass htmlFor or nest the control.
    <label
      data-slot="label"
      className={cn(
        'flex items-center gap-inline text-label font-medium text-text-default select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:text-text-disabled peer-disabled:cursor-not-allowed peer-disabled:text-text-disabled peer-data-disabled:text-text-disabled',
        className,
      )}
      {...props}
    />
  );
}

export { Label };
