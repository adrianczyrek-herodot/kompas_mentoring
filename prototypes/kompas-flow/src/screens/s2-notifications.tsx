/** S2 · Powiadomienia (KONCEPCJA §S2, E3-S8). Deep links; opening one marks it read. */
import { Badge, Button, DateTime, EmptyState, ErrorState, PageHeader, Skeleton, useToast } from '@kompas/ui';
import { Bell, BellOff } from 'lucide-react';
import { TZ } from '../lib/clock';
import { href } from '../lib/router';
import { FailureAlert, useAction } from '../shell/request-feedback';
import { useDemo, useRetry } from '../state/demo-context';
import { byTime } from '../state/world';

export function S2Notifications() {
  const { state, dispatch, account } = useDemo();
  const toast = useToast();
  const retry = useRetry();
  const action = useAction();
  const status = state.scenarios.dataState;
  const all = state.world.notifications.filter((n) => n.accountId === account.id).sort((a, b) => byTime(b, a));
  const list = status === 'empty' ? [] : all;
  const unread = list.filter((n) => !n.read).length;
  return (
    <div className="flex flex-col gap-section">
      <PageHeader
        title="Powiadomienia"
        description={unread > 0 ? `Nieprzeczytane: ${String(unread)}` : undefined}
        actions={
          unread > 0 ? (
            <Button
              variant="outline"
              loading={action.busy}
              onClick={() =>
                void action.run(() => {
                  dispatch({ type: 'read-all-notifications', accountId: account.id });
                  toast.add({ title: 'Wszystkie powiadomienia oznaczone jako przeczytane', type: 'success' });
                })
              }
            >
              Oznacz wszystkie jako przeczytane
            </Button>
          ) : undefined
        }
      />
      <FailureAlert kind={action.failure} what="Nie oznaczyliśmy powiadomień" />
      {status === 'loading' ? (
        <div aria-busy="true" className="flex flex-col gap-inline">
          <p className="sr-only">Wczytujemy powiadomienia…</p>
          {[0, 1, 2, 3].map((row) => (
            <Skeleton key={row} className="h-control w-full" />
          ))}
        </div>
      ) : status === 'error' ? (
        <ErrorState
          titleAs="h2"
          title="Nie udało się wczytać powiadomień"
          description="Sprawdź połączenie i spróbuj ponownie."
          action={<Button variant="outline" onClick={retry}>Ponów</Button>}
        />
      ) : list.length === 0 ? (
        <EmptyState
          titleAs="h2"
          icon={all.length === 0 ? <BellOff /> : <Bell />}
          title="Wszystko przeczytane"
          description="Tutaj pojawią się przypomnienia o sesjach, wiadomości i zmiany w planie."
        />
      ) : (
        <ul aria-label="Powiadomienia" className="flex flex-col divide-y divide-border-divider rounded-panel border border-border-divider bg-surface-panel">
          {list.map((n) => (
            <li key={n.id}>
              <a
                href={href(n.link)}
                onClick={() => {
                  if (!n.read) dispatch({ type: 'read-notification', id: n.id });
                }}
                className={`flex min-h-target items-start gap-inline p-panel hover:bg-surface-hover ${n.read ? '' : 'bg-selected-bg'}`}
              >
                <Bell aria-hidden="true" className="mt-tight size-icon-md shrink-0 text-text-muted" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className={`text-body ${n.read ? '' : 'font-semibold'}`}>{n.text}</span>
                  <DateTime value={n.at} timeZone={TZ} className="text-meta text-text-muted" />
                </span>
                {n.read ? null : <Badge variant="warning">Nowe</Badge>}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
