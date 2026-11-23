import * as React from 'react';
import { Button } from '../components/button';
import { cn } from '../lib/utils';

type StickyContinueButtonProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  children: React.ReactNode;
  disabled?: boolean;
  /** Why the button is blocked; announced and linked through `aria-describedby` (requirement 3). */
  disabledReason?: string | null;
  onClick?: () => void;
  /** Text next to the button, e.g. the 12 h rule (U1). */
  hint?: React.ReactNode;
};

// The one primary action of U1/U2, always reachable: sticks to the bottom of the viewport on mobile
// and sits in the page flow from `md` up (KONCEPCJA §U1 „Dalej”, R01.6). The reason is never fine
// print: it is linked to the button so a screen reader reads both.
function StickyContinueButton({
  children,
  disabled = false,
  disabledReason = null,
  onClick,
  hint,
  className,
  ...props
}: StickyContinueButtonProps) {
  const reasonId = React.useId();
  return (
    <div
      data-slot="sticky-continue-button"
      className={cn(
        'sticky bottom-0 flex flex-col gap-inline border-t border-border-divider bg-surface-panel px-panel py-group md:static md:flex-row md:items-center md:justify-between md:border md:rounded-panel',
        className,
      )}
      {...props}
    >
      <Button
        size="lg"
        disabled={disabled}
        focusableWhenDisabled
        onClick={onClick}
        aria-describedby={disabled && disabledReason ? reasonId : undefined}
      >
        {children}
      </Button>
      {disabled && disabledReason ? (
        <p id={reasonId} className="text-body-dense text-text-muted md:max-w-measure">
          {disabledReason}
        </p>
      ) : (
        hint
      )}
    </div>
  );
}

export { StickyContinueButton, type StickyContinueButtonProps };
