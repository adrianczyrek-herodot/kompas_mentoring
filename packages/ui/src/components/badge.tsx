import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '../lib/utils';

// Status label: always text (and optionally an icon), never colour alone (WCAG 1.4.1).
// rounded-tag, not a pill (A01); no blue "info" — neutral uses muted text (P-T3, K4).
const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center gap-tight rounded-tag px-inline py-tight text-meta font-medium whitespace-nowrap [&>svg]:size-icon-sm [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        neutral: 'bg-status-neutral-bg text-status-neutral-fg',
        success: 'bg-status-success-bg text-status-success-fg',
        warning: 'bg-status-warning-bg text-status-warning-fg',
        danger: 'bg-status-danger-bg text-status-danger-fg',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

type BadgeProps = React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, type BadgeProps, badgeVariants };
