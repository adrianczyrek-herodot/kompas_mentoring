import * as React from 'react';
import { Button } from '../components/button';
import { formatMoney } from '../lib/format';
import { cn } from '../lib/utils';

type StickyBookingBarProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** Trial price, minor units — part of the button label (KONCEPCJA §P3). */
  trialPrice: bigint;
  /** Mentor paused new students: the button is disabled and the reason is shown (D2). */
  acceptingNew: boolean;
  /** No free slots in 14 days (KONCEPCJA §P3, state E). */
  noSlotsIn14Days?: boolean;
  onBook?: () => void;
  /** Optional secondary content, e.g. a link to the availability section. */
  secondary?: React.ReactNode;
};

// The one primary action of P3, always reachable: sticks to the bottom of the viewport
// (KONCEPCJA §P3 „sticky CTA”, R01.6). On wide screens it sits in the page flow.
function StickyBookingBar({
  trialPrice,
  acceptingNew,
  noSlotsIn14Days = false,
  onBook,
  secondary,
  className,
  ...props
}: StickyBookingBarProps) {
  const reason = acceptingNew
    ? noSlotsIn14Days
      ? 'Brak wolnych terminów w najbliższych 14 dniach. Napisz do mentora, by ustalić termin.'
      : null
    : 'Mentor wstrzymał przyjmowanie nowych uczniów. Wróć później albo wybierz innego mentora.';
  const reasonId = React.useId();

  return (
    <div
      data-slot="sticky-booking-bar"
      className={cn(
        'sticky bottom-0 flex flex-col gap-inline border-t border-border-divider bg-surface-panel px-panel py-group md:static md:flex-row md:items-center md:justify-between md:border md:rounded-panel',
        className,
      )}
      {...props}
    >
      <Button
        size="lg"
        disabled={reason !== null}
        focusableWhenDisabled
        onClick={onBook}
        aria-describedby={reason ? reasonId : undefined}
      >
        Zarezerwuj sesję próbną — {formatMoney(trialPrice)}
      </Button>
      {reason ? (
        <p id={reasonId} className="text-body-dense text-text-muted md:max-w-measure">
          {reason}
        </p>
      ) : (
        <p className="text-body-dense text-text-muted">
          30 minut · możesz przełożyć lub anulować bez kosztów do 12 h przed sesją
        </p>
      )}
      {secondary}
    </div>
  );
}

export { StickyBookingBar, type StickyBookingBarProps };
