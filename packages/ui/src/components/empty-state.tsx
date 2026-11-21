import type * as React from 'react';
import { cn } from '../lib/utils';

type EmptyStateProps = Omit<React.ComponentProps<'div'>, 'title'> & {
  /** Functional lucide icon (aria-hidden); optional — never decorative illustrations (A01). */
  icon?: React.ReactNode;
  /** Why it is empty, e.g. "Brak sesji dzisiaj". */
  title: React.ReactNode;
  /** What to do next. Humour allowed here only (K5). */
  description?: React.ReactNode;
  /** The next step: one Button or Link. */
  action?: React.ReactNode;
  /** Heading level of the title in the page outline. */
  titleAs?: 'h2' | 'h3' | 'p';
};

// "Nothing here yet" (state E of every screen): why it is empty and the next step (prompt, Content).
function EmptyState({
  className,
  icon,
  title,
  description,
  action,
  titleAs: Title = 'h2',
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn('flex flex-col items-start gap-inline py-section', className)}
      {...props}
    >
      {icon ? <div className="flex text-text-muted [&>svg]:size-icon-lg">{icon}</div> : null}
      <Title className="text-section-title font-semibold text-text-default">{title}</Title>
      {description ? (
        <p className="max-w-measure text-body text-text-muted">{description}</p>
      ) : null}
      {action ? <div className="pt-inline">{action}</div> : null}
    </div>
  );
}

export { EmptyState, type EmptyStateProps };
