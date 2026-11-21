import { Ban, Info, TriangleAlert } from 'lucide-react';
import type * as React from 'react';
import { Alert, AlertDescription, AlertTitle } from '../components/alert';
import { DateTime } from './date-time';

type PolicyState = 'free' | 'late' | 'started';

type PolicyNoticeProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /**
   * From the domain (`canCancelFree`, E3-S6), never computed in the UI:
   * `free` ≥ 12 h before start, `late` < 12 h, `started` — the session has begun.
   */
  state: PolicyState;
  /** Last moment of free change (start − 12 h), ISO. Required for `free`. */
  freeUntil?: string | undefined;
  timeZone: string;
};

// The 12-hour rule in full words next to the action, never as fine print (A04, KONCEPCJA Z4):
// free change until 12 h before; later the session is lost; after start nothing can change.
function PolicyNotice({ state, freeUntil, timeZone, ...props }: PolicyNoticeProps) {
  if (state === 'started') {
    return (
      <Alert variant="neutral" data-policy={state} {...props}>
        <Ban aria-hidden="true" />
        <AlertTitle>Sesja już się zaczęła</AlertTitle>
        <AlertDescription>
          Nie można jej przełożyć ani anulować. Jeśli coś poszło nie tak, zgłoś problem — masz na to
          72 godziny od końca sesji.
        </AlertDescription>
      </Alert>
    );
  }
  if (state === 'late') {
    return (
      <Alert variant="warning" data-policy={state} {...props}>
        <TriangleAlert aria-hidden="true" />
        <AlertTitle>Do sesji zostało mniej niż 12 godzin</AlertTitle>
        <AlertDescription>
          Jeśli ją teraz anulujesz albo przełożysz, sesja przepadnie i nie wróci do salda.
        </AlertDescription>
      </Alert>
    );
  }
  return (
    <Alert variant="neutral" data-policy={state} {...props}>
      <Info aria-hidden="true" />
      <AlertTitle>Zmiana bez kosztów do 12 godzin przed sesją</AlertTitle>
      <AlertDescription>
        {freeUntil ? (
          <>
            Do <DateTime value={freeUntil} timeZone={timeZone} /> możesz przełożyć lub anulować
            sesję — wtedy wraca do salda. Później sesja przepada.
          </>
        ) : (
          'Możesz przełożyć lub anulować sesję do 12 godzin przed jej początkiem — wtedy wraca do salda. Później sesja przepada.'
        )}
      </AlertDescription>
    </Alert>
  );
}

export { PolicyNotice, type PolicyNoticeProps, type PolicyState };
