/**
 * A1 · Weryfikacja mentorów (KONCEPCJA §A1, F4, E2-S4). The trust team works through the queue of
 * submitted mentor applications; the detail panel and audit log live in `a1-parts.tsx`.
 */
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kompas/ui';
import { Inbox } from 'lucide-react';
import type { Application } from '../data/trust';
import { type Route, replace, withQuery } from '../lib/router';
import { useDemo, useRetry } from '../state/demo-context';
import { ApplicationDetail, AuditLog, ageInDays, ageText, KYC, SubmittedDate } from './a1-parts';

function QueueSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-section">
      <p className="sr-only">Wczytujemy kolejkę zgłoszeń…</p>
      <Skeleton className="h-control-lg w-full" />
      <Skeleton className="h-lh w-2/3" />
      <Skeleton className="h-lh w-full" />
      <Skeleton className="h-lh w-full" />
    </div>
  );
}

// DS-GAP: ApplicationQueue (KONCEPCJA §A1) — a dense queue table from DS `Table`; the row name
// selects the application in `?id=` (same-screen query, so `replace` keeps history clean).
function ApplicationQueue({
  list,
  selectedId,
  now,
}: {
  list: Application[];
  selectedId: string | undefined;
  now: string;
}) {
  return (
    <Table>
      <TableCaption>
        Zgłoszenia czekają na decyzję. SLA: 2 dni robocze od wysłania wniosku.
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Kandydat</TableHead>
          <TableHead>Zgłoszono</TableHead>
          <TableHead numeric>Wiek</TableHead>
          <TableHead>KYC</TableHead>
          <TableHead>LinkedIn</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.map((app) => {
          const age = ageInDays(app.submitted, now);
          const selected = app.id === selectedId;
          return (
            <TableRow key={app.id} className={selected ? 'bg-selected-bg' : undefined}>
              <TableCell>
                <Button
                  variant="link"
                  aria-current={selected ? 'true' : undefined}
                  onClick={() => {
                    replace(withQuery('/admin/weryfikacja', { id: app.id }));
                  }}
                >
                  {app.name}
                </Button>
                <span className="block text-meta text-text-muted">{app.headline}</span>
              </TableCell>
              <TableCell>
                <SubmittedDate date={app.submitted} />
              </TableCell>
              <TableCell numeric>
                {ageText(age)}
                {age > 2 ? (
                  <Badge variant="warning" className="ml-inline">
                    Po SLA
                  </Badge>
                ) : null}
              </TableCell>
              <TableCell>
                <Badge variant={KYC[app.kyc].variant}>{KYC[app.kyc].label}</Badge>
              </TableCell>
              <TableCell>{app.linkedin ? 'Podany' : 'Brak'}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export function A1Verification({ route }: { route: Route }) {
  const { state, now } = useDemo();
  const retry = useRetry();
  const status = state.scenarios.dataState;
  const submitted = state.world.applications.filter((app) => app.status === 'submitted');
  const list = status === 'empty' ? [] : submitted;
  const requestedId = route.query.get('id') ?? undefined;
  const selected = list.find((app) => app.id === requestedId) ?? list[0];

  return (
    <>
      <PageHeader
        title="Weryfikacja mentorów"
        description="Zatwierdź, poproś o zmiany albo odrzuć wniosek mentora. SLA: 2 dni robocze."
      />
      {status === 'loading' ? (
        <QueueSkeleton />
      ) : status === 'error' ? (
        <ErrorState
          titleAs="h2"
          title="Nie udało się wczytać kolejki"
          description="Sprawdź połączenie i spróbuj ponownie."
          action={
            <Button variant="outline" onClick={retry}>
              Ponów
            </Button>
          }
        />
      ) : list.length === 0 ? (
        <EmptyState
          titleAs="h2"
          icon={<Inbox />}
          title="Kolejka pusta"
          description="Wszystkie zgłoszenia zostały rozpatrzone. Nowe pojawią się tutaj po wysłaniu wniosku przez mentora."
        />
      ) : (
        <div className="flex flex-col gap-section">
          <section aria-labelledby="a1-queue" className="flex flex-col gap-inline">
            <h2 id="a1-queue" className="text-section-title font-semibold text-text-default">
              Kolejka zgłoszeń
            </h2>
            <ApplicationQueue list={list} selectedId={selected?.id} now={now} />
          </section>
          {selected ? <ApplicationDetail key={selected.id} app={selected} now={now} /> : null}
          <AuditLog entries={state.world.audit} />
        </div>
      )}
    </>
  );
}
