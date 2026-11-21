import { CircleAlert } from 'lucide-react';
import type * as React from 'react';
import { cn } from '../lib/utils';

type ErrorStateProps = Omit<React.ComponentProps<'div'>, 'title'> & {
  /** What happened, e.g. "Nie udało się wczytać listy". */
  title: React.ReactNode;
  /** What to do; no technical codes (R05.2). */
  description?: React.ReactNode;
  /** Usually a Button "Ponów" (KONCEPCJA, state Er). */
  action?: React.ReactNode;
  titleAs?: 'h2' | 'h3' | 'p';
};

// Area that failed to load (state Er). role="alert": it replaces content after a failed request, so
// the screen reader announces it (Z8). Never for form field errors (FieldError) or toasts.
function ErrorState({
  className,
  title,
  description,
  action,
  titleAs: Title = 'h2',
  ...props
}: ErrorStateProps) {
  return (
    <div
      data-slot="error-state"
      role="alert"
      className={cn('flex flex-col items-start gap-inline py-section', className)}
      {...props}
    >
      <CircleAlert aria-hidden="true" className="size-icon-lg text-status-danger-fg" />
      <Title className="text-section-title font-semibold text-text-default">{title}</Title>
      {description ? <p className="max-w-measure text-body text-text-muted">{description}</p> : null}
      {action ? <div className="pt-inline">{action}</div> : null}
    </div>
  );
}

export { ErrorState, type ErrorStateProps };
