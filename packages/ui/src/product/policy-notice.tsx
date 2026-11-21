import { AlertTriangle, Info } from 'lucide-react';
import * as React from 'react';
import { Alert, AlertDescription, AlertTitle } from '../components/alert';

export interface PolicyNoticeProps extends React.ComponentProps<'div'> {
  hoursRemaining: number;
}

export function PolicyNotice({ hoursRemaining, className, ...props }: PolicyNoticeProps) {
  const isLate = hoursRemaining < 12;

  if (isLate) {
    return (
      <Alert variant="warning" className={className} {...props}>
        <AlertTriangle className="size-icon-sm" />
        <AlertTitle>Do sesji zostało mniej niż 12 godzin ({hoursRemaining} h)</AlertTitle>
        <AlertDescription>
          Zgodnie z zasadą 12 godzin bezpłatne anulowanie wygasło. Jeśli odwołasz to spotkanie
          teraz, opłata nie zostanie zwrócona na Twoje konto, a mentor otrzyma wynagrodzenie za
          zarezerwowany czas.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="neutral" className={className} {...props}>
      <Info className="size-icon-sm" />
      <AlertTitle>Zasada 12 godzin: bezpłatna zmiana terminu</AlertTitle>
      <AlertDescription>
        Do spotkania zostało ponad 12 godzin ({hoursRemaining} h). Możesz bezpłatnie przełożyć
        termin lub odwołać sesję z pełnym zwrotem środków do portfela.
      </AlertDescription>
    </Alert>
  );
}
