import * as React from 'react';
import { Avatar, AvatarFallback } from '../components/avatar';
import { Button } from '../components/button';
import { initialsOf } from '../lib/format';
import { cn } from '../lib/utils';
import { DateTime } from './date-time';

type TrialRequest = {
  id: string;
  student: string;
  startsAt: string;
  /** Student's goal for the trial („Z czym przychodzisz?”, 20–500 characters, KONCEPCJA §U2). */
  goal: string;
  /** Requested at + 24 h: after that the request is accepted automatically if the slot is free. */
  respondBy: string;
};

type TrialRequestCardProps = Omit<React.ComponentProps<'li'>, 'children'> & {
  request: TrialRequest;
  timeZone: string;
  onAccept?: () => void;
  /** Opens the decision-with-reason dialog (pattern „Decyzja z powodem”). */
  onDecline?: () => void;
  /** Accept request in flight: blocks a double click (KONCEPCJA §P4 L). */
  accepting?: boolean;
};

// A trial request in M2 (E3-S7). The 24 h SLA is stated as a fact with its consequence, not as a
// countdown or red urgency (A02). Both actions are secondary: M2 has several requests (R01.6).
function TrialRequestCard({
  request,
  timeZone,
  onAccept,
  onDecline,
  accepting = false,
  className,
  ...props
}: TrialRequestCardProps) {
  const nameId = React.useId();
  return (
    <li
      data-slot="trial-request-card"
      className={cn('flex flex-col gap-inline border-b border-border-divider py-row-y', className)}
      {...props}
    >
      <div className="flex items-start gap-inline">
        <Avatar size="sm">
          <AvatarFallback>{initialsOf(request.student)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-tight">
          <p id={nameId} className="text-body-dense font-medium text-text-default">
            {request.student}
            <span className="font-normal text-text-muted">
              {' '}
              · Sesja próbna 30 min · <DateTime value={request.startsAt} timeZone={timeZone} />
            </span>
          </p>
          <blockquote className="max-w-measure text-body-dense text-text-default">
            {request.goal}
          </blockquote>
          <p className="text-meta text-text-muted">
            Odpowiedz do <DateTime value={request.respondBy} timeZone={timeZone} />. Bez odpowiedzi
            prośba zostanie przyjęta automatycznie, jeśli termin będzie wolny.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-inline">
        <Button
          variant="outline"
          size="sm"
          loading={accepting}
          onClick={onAccept}
          aria-describedby={nameId}
        >
          Przyjmij
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={accepting}
          onClick={onDecline}
          aria-describedby={nameId}
        >
          Odrzuć…
        </Button>
      </div>
    </li>
  );
}

export { type TrialRequest, TrialRequestCard, type TrialRequestCardProps };
