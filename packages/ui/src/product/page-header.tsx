import type * as React from 'react';
import { cn } from '../lib/utils';

type PageHeaderProps = Omit<React.ComponentProps<'header'>, 'title'> & {
  title: React.ReactNode;
  /** One sentence: what the screen is for. Optional. */
  description?: React.ReactNode;
  /** The screen's primary action (at most one, R01.6) and optional secondary ones. */
  actions?: React.ReactNode;
};

// Top of every screen: the single h1 (WCAG 2.4.6, 1.3.1) and the primary action above the fold.
function PageHeader({ title, description, actions, className, ...props }: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className={cn(
        'flex flex-col gap-group pb-group md:flex-row md:items-end md:justify-between',
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-tight">
        <h1 className="text-page-title font-semibold text-text-default">{title}</h1>
        {description ? (
          <p className="max-w-measure text-body text-text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-inline">{actions}</div> : null}
    </header>
  );
}

export { PageHeader, type PageHeaderProps };
