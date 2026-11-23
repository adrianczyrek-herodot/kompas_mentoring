import { TriangleAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/alert';
import { Button } from '../components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/card';
import { DateTime } from './date-time';

export type CalendarSyncStatus = 'disconnected' | 'connected' | 'error';

export interface CalendarSyncCardProps {
  readonly status: CalendarSyncStatus;
  readonly lastSyncedAt?: string | null;
  readonly lastError?: string | null;
  readonly onConnect?: () => void;
  readonly onDisconnect?: () => void;
  readonly onReconnect?: () => void;
  readonly pending?: boolean;
  readonly className?: string;
}

/** The mentor's browser zone — this card has no zone prop, and the viewer is the mentor. */
const VIEWER_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

function DisconnectedBody() {
  return (
    <p className="text-body-dense text-text-muted">
      Połącz z Google Calendar, żeby zajęte przedziały nie dawały uczniom wolnych terminów.
    </p>
  );
}

function ErrorBody({ lastError }: { lastError?: string | null | undefined }) {
  return (
    <div className="flex flex-col gap-tight">
      <Alert variant="warning" role="status">
        <TriangleAlert aria-hidden="true" />
        <AlertTitle>Nie udało się odświeżyć kalendarza</AlertTitle>
        <AlertDescription>
          Terminy liczymy teraz bez kalendarza — połącz ponownie, żeby zajęte przedziały znów
          blokowały rezerwacje.
        </AlertDescription>
      </Alert>
      {lastError ? <p className="text-meta text-text-muted">Powód: {lastError}</p> : null}
    </div>
  );
}

function ConnectedBody({ lastSyncedAt }: { lastSyncedAt?: string | null | undefined }) {
  return (
    <div className="flex flex-col gap-tight">
      <p className="text-body-dense text-text-muted">
        Kalendarz jest połączony. Zajęte przedziały nie dają wolnych terminów.
      </p>
      {lastSyncedAt ? (
        <p className="text-meta text-text-muted">
          Ostatnia synchronizacja: <DateTime value={lastSyncedAt} timeZone={VIEWER_ZONE} />
        </p>
      ) : null}
    </div>
  );
}

function StatusBody({
  status,
  lastSyncedAt,
  lastError,
}: {
  status: CalendarSyncStatus;
  lastSyncedAt?: string | null | undefined;
  lastError?: string | null | undefined;
}) {
  if (status === 'disconnected') return <DisconnectedBody />;
  if (status === 'error') return <ErrorBody lastError={lastError} />;
  return <ConnectedBody lastSyncedAt={lastSyncedAt} />;
}

function StatusAction({
  status,
  pending,
  onConnect,
  onDisconnect,
  onReconnect,
}: {
  status: CalendarSyncStatus;
  pending: boolean;
  onConnect?: (() => void) | undefined;
  onDisconnect?: (() => void) | undefined;
  onReconnect?: (() => void) | undefined;
}) {
  if (status === 'disconnected') {
    return (
      <Button loading={pending} onClick={onConnect}>
        Połącz
      </Button>
    );
  }
  if (status === 'error') {
    return (
      <Button loading={pending} onClick={onReconnect}>
        Połącz ponownie
      </Button>
    );
  }
  return (
    <Button variant="outline" disabled={pending} onClick={onDisconnect}>
      Rozłącz
    </Button>
  );
}

/** Google Calendar connection (M3, E3-S10): disconnected / connected / error (fail-open, Q17). */
function CalendarSyncCard({
  status,
  lastSyncedAt,
  lastError,
  onConnect,
  onDisconnect,
  onReconnect,
  pending = false,
  className,
}: CalendarSyncCardProps) {
  return (
    <Card data-slot="calendar-sync-card" className={className}>
      <CardHeader>
        <CardTitle>
          <h3>Google Calendar</h3>
        </CardTitle>
        <CardDescription>
          Zajęte przedziały z kalendarza nie dają uczniom wolnych terminów (zakres
          calendar.freebusy).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StatusBody status={status} lastSyncedAt={lastSyncedAt} lastError={lastError} />
      </CardContent>
      <CardFooter>
        <StatusAction
          status={status}
          pending={pending}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          onReconnect={onReconnect}
        />
      </CardFooter>
    </Card>
  );
}

export { CalendarSyncCard };
