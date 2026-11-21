import { cva, type VariantProps } from 'class-variance-authority';
import { LoaderCircle } from 'lucide-react';
import type * as React from 'react';
import { cn } from '../lib/utils';

// Indeterminate wait for a short action (P4 submit, M1 saving a step). Rotation only without
// prefers-reduced-motion (WCAG 2.3.3). For loading a whole area use Skeleton.
const spinnerVariants = cva('shrink-0 text-text-muted motion-safe:animate-spin', {
  variants: { size: { sm: 'size-icon-sm', md: 'size-icon-md', lg: 'size-icon-lg' } },
  defaultVariants: { size: 'md' },
});

type SpinnerProps = Omit<React.ComponentProps<'svg'>, 'children'> &
  VariantProps<typeof spinnerVariants> & {
    /** Announced text, e.g. "Zapisujemy krok…". Omit only inside a control that already says it (aria-busy). */
    label?: string;
  };

function Spinner({ className, size, label, ...props }: SpinnerProps) {
  const icon = (
    <LoaderCircle
      data-slot="spinner"
      aria-hidden="true"
      className={cn(spinnerVariants({ size }), className)}
      {...props}
    />
  );
  if (!label) {
    return icon;
  }
  return (
    <span
      role="status"
      className="inline-flex items-center gap-inline text-body-dense text-text-muted"
    >
      {icon}
      {label}
    </span>
  );
}

export { Spinner, type SpinnerProps };
