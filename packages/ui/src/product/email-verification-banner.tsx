import { MailWarning } from 'lucide-react';
import type * as React from 'react';
import { Alert, AlertAction, AlertDescription, AlertTitle } from '../components/alert';
import { Button } from '../components/button';
import { cn } from '../lib/utils';

type EmailVerificationBannerProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** The address the link goes to, shown when known. */
  email?: string;
  /** „Wyślij link ponownie” (GAP-05); without it the banner is informational only. */
  onResend?: () => void;
  /** True while the resend request is in flight, so the button reports `aria-busy`. */
  resending?: boolean;
};

// Requirement 14/Q19: „Potwierdź e-mail, zanim zarezerwujesz pierwszą sesję”. The booking flow
// blocks and offers the resend link; the banner appears in U1 (and later U4/P3).
function EmailVerificationBanner({
  email,
  onResend,
  resending = false,
  className,
  ...props
}: EmailVerificationBannerProps) {
  return (
    <Alert variant="warning" className={cn(className)} {...props}>
      <MailWarning aria-hidden="true" />
      <AlertTitle>Potwierdź e-mail, zanim zarezerwujesz pierwszą sesję</AlertTitle>
      <AlertDescription>
        Wysłaliśmy link{email ? ` na ${email}` : ''}. Kliknij go, aby potwierdzić konto. Nie widzisz
        wiadomości? Sprawdź folder spam.
      </AlertDescription>
      {onResend ? (
        <AlertAction>
          <Button variant="outline" onClick={onResend} loading={resending}>
            Wyślij link ponownie
          </Button>
        </AlertAction>
      ) : null}
    </Alert>
  );
}

export { EmailVerificationBanner, type EmailVerificationBannerProps };
