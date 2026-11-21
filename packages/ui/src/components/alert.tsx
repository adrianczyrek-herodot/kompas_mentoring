import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '../lib/utils';

// Message about a whole screen or form (M3 "Uczniowie nie mogą cię zarezerwować", U5 12 h rule,
// form server error). Status colour + icon + text, never colour alone (WCAG 1.4.1). No role by
// default (Z8): a static banner must not interrupt the screen reader; pass role="alert" for errors
// that appear after an action, role="status" for confirmations.
const alertVariants = cva(
  "group/alert relative grid w-full gap-x-inline gap-y-tight rounded-panel px-group py-row-y text-left text-body-dense has-data-[slot=alert-action]:pr-control has-[>svg]:grid-cols-(--icon-content-columns) *:[svg]:row-span-2 *:[svg]:h-lh *:[svg]:text-current *:[svg:not([class*='size-'])]:w-icon-sm",
  {
    variants: {
      variant: {
        neutral: 'bg-status-neutral-bg text-text-default',
        success: 'bg-status-success-bg text-text-default *:[svg]:text-status-success-fg',
        warning: 'bg-status-warning-bg text-text-default *:[svg]:text-status-warning-fg',
        danger: 'bg-status-danger-bg text-text-default *:[svg]:text-status-danger-fg',
        /** @deprecated use `neutral` (kept for apps/web, BACKWARD_COMPATIBILITY.md). */
        default: 'bg-status-neutral-bg text-text-default',
        /** @deprecated use `danger` (kept for apps/web, BACKWARD_COMPATIBILITY.md). */
        destructive: 'bg-status-danger-bg text-text-default *:[svg]:text-status-danger-fg',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn('font-semibold group-has-[>svg]/alert:col-start-2', className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'max-w-measure text-text-default group-has-[>svg]/alert:col-start-2 [&_a]:text-text-link [&_a]:underline [&_a]:underline-offset-4 [&_p:not(:last-child)]:mb-inline',
        className,
      )}
      {...props}
    />
  );
}

function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-action"
      className={cn('absolute top-tight right-tight', className)}
      {...props}
    />
  );
}

export { Alert, AlertAction, AlertDescription, AlertTitle, alertVariants };
