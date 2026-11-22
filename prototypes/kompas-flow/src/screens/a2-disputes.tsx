/**
 * A2 · Spory i zwroty (KONCEPCJA §A2, F6, E3-S6). The trust team reads the queue of disputes and
 * resolves them; the detail panel and resolution form live in `a2-parts.tsx`. Resolving a
 * plan-session dispute returns a session to the student's balance (visible in U4).
 */
import {
  Badge,
  Button,
  DateTime,
  EmptyState,
  ErrorState,
  Money,
  PageHeader,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@kompas/ui';
import { Inbox } from 'lucide-react';
import { useState } from 'react';
import type { Dispute } from '../data/trust';
import { TZ } from '../lib/clock';
import { type Route, replace, withQuery } from '../lib/router';
import { useDemo, useRetry } from '../state/demo-context';
import { DisputeDetail } from './a2-parts';

function QueueSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-section">
      <p className="sr-only">Wczytujemy kolejki sporów…</p>
      <Skeleton className="h-control-lg w-full" />
      <Skeleton className="h-lh w-full" />
      <Skeleton className="h-lh w-2/3" />
    </div>
  );
}

// DS-GAP: DisputeQueue (KONCEPCJA §A2) — a selectable list; the item sets `?id=` on the same screen.
function DisputeQueue({
  list,
  selectedId,
  onSelect,
}: {
  list: Dispute[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}) {
  if (list.length === 0) {
    return <p className="py-group text-body text-text-muted">Brak sporów w tym widoku.</p>;
  }
  return (
    <ul className="flex flex-col">
      {list.map((dispute) => {
        const selected = dispute.id === selectedId;
        const resolved = dispute.status === 'resolved';
        return (
          <li key={dispute.id} className="border-b border-border-divider last:border-b-0">
            <Button
              variant="ghost"
              aria-current={selected ? 'true' : undefined}
              className={`w-full py-row-y${selected ? ' bg-selected-bg' : ''}`}
              onClick={() => {
                onSelect(dispute.id);
              }}
            >
              <span className="flex w-full flex-col items-start gap-tight whitespace-normal text-left">
                <span className="text-body font-medium text-text-default">{dispute.reason}</span>
                <span className="text-meta text-text-muted">
                  {dispute.studentName} ↔ {dispute.mentorName} ·{' '}
                  <DateTime value={dispute.opened} timeZone={TZ} format="date" />
                </span>
                <span className="flex flex-wrap items-center gap-inline">
                  <Money amount={dispute.amount} className="text-meta" />
                  <Badge variant={resolved ? 'success' : 'warning'}>
                    {resolved ? 'Rozstrzygnięty' : 'Otwarty'}
                  </Badge>
                </span>
              </span>
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

export function A2Disputes({ route }: { route: Route }) {
  const { state } = useDemo();
  const retry = useRetry();
  const status = state.scenarios.dataState;
  const all = state.world.disputes;
  const open = all.filter((dispute) => dispute.status === 'open');
  const resolved = all.filter((dispute) => dispute.status === 'resolved');
  const requestedId = route.query.get('id') ?? undefined;
  const [tab, setTab] = useState<'open' | 'resolved'>(() =>
    requestedId && resolved.some((dispute) => dispute.id === requestedId) ? 'resolved' : 'open',
  );
  const visible = tab === 'open' ? open : resolved;
  const selected = all.find((dispute) => dispute.id === requestedId) ?? visible[0];

  return (
    <>
      <PageHeader
        title="Spory i zwroty"
        description="Przeczytaj oś zdarzeń i stanowiska stron, potem rozstrzygnij spór. Obie strony dostają wiadomość."
      />
      {status === 'loading' ? (
        <QueueSkeleton />
      ) : status === 'error' ? (
        <ErrorState
          titleAs="h2"
          title="Nie udało się wczytać sporów"
          description="Sprawdź połączenie i spróbuj ponownie."
          action={
            <Button variant="outline" onClick={retry}>
              Ponów
            </Button>
          }
        />
      ) : status === 'empty' || all.length === 0 ? (
        <EmptyState
          titleAs="h2"
          icon={<Inbox />}
          title="Brak otwartych sporów"
          description="Nowe zgłoszenia problemów z sesji pojawią się tutaj."
        />
      ) : (
        <div className="flex flex-col gap-section">
          <section aria-labelledby="a2-queue" className="flex flex-col gap-inline">
            <h2 id="a2-queue" className="text-section-title font-semibold text-text-default">
              Kolejka sporów
            </h2>
            <Tabs
              value={tab}
              onValueChange={(next) => {
                setTab(next as 'open' | 'resolved');
              }}
            >
              <TabsList>
                <TabsTrigger value="open">Otwarte</TabsTrigger>
                <TabsTrigger value="resolved">Rozstrzygnięte</TabsTrigger>
              </TabsList>
              <TabsContent value="open">
                <DisputeQueue
                  list={open}
                  selectedId={selected?.id}
                  onSelect={(id) => {
                    replace(withQuery('/admin/spory', { id }));
                  }}
                />
              </TabsContent>
              <TabsContent value="resolved">
                <DisputeQueue
                  list={resolved}
                  selectedId={selected?.id}
                  onSelect={(id) => {
                    replace(withQuery('/admin/spory', { id }));
                  }}
                />
              </TabsContent>
            </Tabs>
          </section>
          {selected ? (
            <DisputeDetail
              key={selected.id}
              dispute={selected}
              onResolved={(id) => {
                replace(withQuery('/admin/spory', { id }));
                setTab('resolved');
              }}
            />
          ) : null}
        </div>
      )}
    </>
  );
}
