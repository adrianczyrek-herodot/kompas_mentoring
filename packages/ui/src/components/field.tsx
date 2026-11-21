'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { CircleAlert } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '../lib/utils';

import { Label } from './label';
import { Separator } from './separator';

function FieldSet({ className, ...props }: React.ComponentProps<'fieldset'>) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        'flex flex-col gap-group has-[>[data-slot=checkbox-group]]:gap-inline has-[>[data-slot=radio-group]]:gap-inline',
        className,
      )}
      {...props}
    />
  );
}

function FieldLegend({
  className,
  variant = 'legend',
  ...props
}: React.ComponentProps<'legend'> & { variant?: 'legend' | 'label' }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        'mb-inline text-text-default data-[variant=label]:text-label data-[variant=label]:font-medium data-[variant=legend]:text-section-title data-[variant=legend]:font-semibold',
        className,
      )}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        'group/field-group @container/field-group flex w-full flex-col gap-group data-[slot=checkbox-group]:gap-inline *:data-[slot=field-group]:gap-group',
        className,
      )}
      {...props}
    />
  );
}

const fieldVariants = cva('group/field flex w-full gap-inline', {
  variants: {
    orientation: {
      vertical: 'flex-col *:w-full [&>.sr-only]:w-auto',
      horizontal:
        'flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto',
      responsive:
        'flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

function Field({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof fieldVariants>) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: shadcn Field groups one control with its label; a fieldset would add native styling and different semantics (FieldSet covers real groups).
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

function FieldContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-content"
      className={cn('group/field-content flex flex-1 flex-col gap-tight', className)}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        'group/field-label peer/field-label flex w-fit gap-inline group-data-[disabled=true]/field:text-text-disabled has-[>[data-slot=field]]:rounded-panel has-[>[data-slot=field]]:border has-[>[data-slot=field]]:border-border-control has-[>[data-slot=field]]:bg-surface-panel has-[>[data-slot=field]]:not-has-[:disabled,[data-disabled]]:hover:bg-surface-hover has-[>[data-slot=field]]:has-data-checked:border-selected-border has-[>[data-slot=field]]:has-data-checked:bg-selected-bg *:data-[slot=field]:p-field-x',
        'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col',
        className,
      )}
      {...props}
    />
  );
}

function FieldTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        'flex w-fit items-center gap-inline text-label font-medium text-text-default group-data-[disabled=true]/field:text-text-disabled',
        className,
      )}
      {...props}
    />
  );
}

/** "(opcjonalnie)" after a label: only optional fields are marked; required is the default. */
function FieldOptional({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="field-optional"
      className={cn('font-normal text-text-muted', className)}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        'max-w-measure text-left text-body-dense font-normal text-text-muted group-has-data-horizontal/field:text-balance',
        '[&>a]:text-text-link [&>a]:underline [&>a]:underline-offset-4',
        className,
      )}
      {...props}
    />
  );
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  children?: React.ReactNode;
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn('relative text-body-dense', className)}
      {...props}
    >
      <Separator className="absolute inset-x-0 top-1/2" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-surface-page px-inline text-text-muted"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  );
}

type FieldErrorItem = { message?: string } | undefined;

/** One message as text, several as a list; duplicates (same message) collapsed. */
function renderErrors(errors: FieldErrorItem[] | undefined): React.ReactNode {
  if (!errors?.length) {
    return null;
  }
  const uniqueErrors = [...new Map(errors.map((error) => [error?.message, error])).values()];
  if (uniqueErrors.length === 1) {
    return uniqueErrors[0]?.message;
  }
  return (
    <ul className="flex list-disc flex-col gap-tight pl-group">
      {uniqueErrors.map((error) => error?.message && <li key={error.message}>{error.message}</li>)}
    </ul>
  );
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<'div'> & {
  errors?: FieldErrorItem[];
}) {
  const content = useMemo(() => children ?? renderErrors(errors), [children, errors]);

  if (!content) {
    return null;
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn(
        'flex items-start gap-inline text-body-dense font-normal text-status-danger-fg',
        className,
      )}
      {...props}
    >
      <span className="flex h-lh shrink-0 items-center">
        <CircleAlert aria-hidden="true" className="size-icon-sm" />
      </span>
      <div>{content}</div>
    </div>
  );
}

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldOptional,
  FieldSeparator,
  FieldSet,
  FieldTitle,
};
