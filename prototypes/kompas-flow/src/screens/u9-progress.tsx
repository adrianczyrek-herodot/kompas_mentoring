/** U9 · Postępy (KONCEPCJA §U9, wyróżnik). Goal and milestones, tasks from sessions, mentor notes. */
import { Button, EmptyState, ErrorState, PageHeader, Skeleton } from '@kompas/ui';
import { Target } from 'lucide-react';
import { toMs } from '../lib/clock';
import { useDemo, useRetry } from '../state/demo-context';
import { ActionItemChecklist, GoalCard, GoalForm, SessionNotesTimeline } from './u9-parts';

export function U9Progress() {
  const { state, myBookings, studentId } = useDemo();
  const retry = useRetry();
  const status = state.scenarios.dataState;
  if (!studentId) return null;
  const forcedEmpty = status === 'empty';
  const goal = forcedEmpty ? undefined : state.world.goals[studentId];
  const withNotes = forcedEmpty ? [] : myBookings.filter((b) => b.note).sort((a, b) => toMs(b.startsAt) - toMs(a.startsAt));
  const rows = withNotes.flatMap((booking) => (booking.actionItems ?? []).map((item, index) => ({ booking, item, index })));
  return (
    <div className="flex flex-col gap-section">
      <PageHeader title="Postępy" description="Cel, kamienie milowe, zadania i notatki mentora w jednym miejscu." />
      {status === 'loading' ? (
        <div aria-busy="true" className="flex flex-col gap-group">
          <p className="sr-only">Wczytujemy postępy…</p>
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : status === 'error' ? (
        <ErrorState
          titleAs="h2"
          title="Nie udało się wczytać postępów"
          description="Sprawdź połączenie i spróbuj ponownie."
          action={<Button variant="outline" onClick={retry}>Ponów</Button>}
        />
      ) : (
        <>
          {goal ? (
            <GoalCard key={studentId} studentId={studentId} goal={goal} />
          ) : (
            <section aria-labelledby="u9-empty" className="flex flex-col gap-group">
              <EmptyState
                titleAs="h2"
                icon={<Target />}
                title="Ustal cel z mentorem na pierwszej sesji"
                description="Cel pomaga mentorowi zaplanować kolejne sesje. Możesz go też zapisać już teraz."
                className="pb-0"
              />
              <h2 id="u9-empty" className="sr-only">Formularz celu</h2>
              <GoalForm key={studentId} studentId={studentId} />
            </section>
          )}
          <div className="grid gap-section md:grid-cols-2">
            <ActionItemChecklist key={studentId} rows={rows} />
            <SessionNotesTimeline bookings={withNotes} />
          </div>
        </>
      )}
    </div>
  );
}
