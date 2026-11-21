import { Input as InputPrimitive } from '@base-ui/react/input';
import type * as React from 'react';
import { cn } from '../lib/utils';

// Shared by Input and Textarea: border-control (WCAG 1.4.11), 16 px text everywhere (R05.1),
// error = danger border only (D5), disabled without opacity (D2), focus = global outline (P-T2).
const fieldControlClasses =
  'w-full min-w-0 rounded-control border border-border-control bg-surface-panel px-field-x text-body text-text-default transition-colors duration-fast placeholder:text-text-subtle aria-invalid:border-border-invalid disabled:cursor-not-allowed disabled:border-border-disabled disabled:bg-surface-disabled disabled:text-text-disabled';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        fieldControlClasses,
        'h-control file:inline-flex file:border-0 file:bg-transparent file:text-label file:font-medium file:text-text-default',
        className,
      )}
      {...props}
    />
  );
}

export { fieldControlClasses, Input };
