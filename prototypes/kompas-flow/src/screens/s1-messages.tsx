/** S1 · Wiadomości (KONCEPCJA §S1). Student and mentor see their own threads; admin has no inbox. */
import { Button, EmptyState, ErrorState, Link, PageHeader, Skeleton } from '@kompas/ui';
import { MessageSquare } from 'lucide-react';
import { useEffect } from 'react';
import type { Thread } from '../data/inbox';
import { mentorById } from '../data/mentors';
import { toMs } from '../lib/clock';
import { href, type Route } from '../lib/router';
import { isUpcoming } from '../state/booking-rules';
import { useDemo, useRetry } from '../state/demo-context';
import { studentNameOf } from '../state/world';
import { Composer, ContextCard, MessageList, type Side, ThreadList } from './s1-parts';

function ThreadView({ thread, side, name }: { thread: Thread; side: Side; name: string }) {
  const { state, now } = useDemo();
  const unread = thread.unread[side];
  const { dispatch } = useDemo();
  useEffect(() => {
    if (unread > 0) dispatch({ type: 'read-thread', threadId: thread.id, side });
  }, [unread, thread.id, side, dispatch]);
  const nearest = state.bookings
    .filter((b) => b.studentId === thread.studentId && b.mentorId === thread.mentorId && isUpcoming(b, now))
    .sort((a, b) => toMs(a.startsAt) - toMs(b.startsAt))[0];
  return (
    <section aria-label={`Rozmowa: ${name}`} className="flex min-w-0 flex-col gap-group">
      <div className="flex items-center gap-group">
        <Link href={href('/wiadomosci')} className="md:hidden">
          Wróć do rozmów
        </Link>
        <h2 className="text-section-title font-semibold">{name}</h2>
      </div>
      <ContextCard booking={nearest} side={side} />
      <MessageList thread={thread} side={side} />
      <Composer thread={thread} side={side} />
    </section>
  );
}

function Inbox({ threadId }: { threadId: string | undefined }) {
  const { state, account, studentId } = useDemo();
  const side: Side = account.role === 'mentor' ? 'mentor' : 'student';
  const mine = state.world.threads.filter((t) => (side === 'student' ? t.studentId === studentId : t.mentorId === account.mentorId));
  const nameOf = (t: Thread) => (side === 'student' ? (mentorById(t.mentorId)?.name ?? t.mentorId) : studentNameOf(state, t.studentId));
  const active = mine.find((t) => t.id === threadId);
  if (threadId && !active) {
    return (
      <ErrorState
        titleAs="h2"
        title="Nie znaleźliśmy tej rozmowy"
        description="Rozmowa nie istnieje albo nie jest Twoja."
        action={<Link href={href('/wiadomosci')}>Wróć do wiadomości</Link>}
      />
    );
  }
  return (
    <div className="grid gap-section md:grid-cols-3">
      <div className={`${active ? 'hidden md:block' : ''} min-w-0 md:col-span-1`}>
        <ThreadList threads={mine} side={side} activeId={threadId} nameOf={nameOf} />
      </div>
      <div className={`${active ? '' : 'hidden md:block'} min-w-0 md:col-span-2`}>
        {active ? (
          <ThreadView key={active.id} thread={active} side={side} name={nameOf(active)} />
        ) : (
          <EmptyState titleAs="h2" icon={<MessageSquare />} title="Wybierz rozmowę" description="Wiadomości z mentorami i uczniami są tutaj." />
        )}
      </div>
    </div>
  );
}

export function S1Messages({ route }: { route: Route }) {
  const { state, account, studentId } = useDemo();
  const retry = useRetry();
  const status = state.scenarios.dataState;
  const threadId = route.params['threadId'];
  const side = account.role === 'mentor' ? 'mentor' : 'student';
  const hasThreads = state.world.threads.some((t) => (side === 'student' ? t.studentId === studentId : t.mentorId === account.mentorId));
  let body;
  if (account.role === 'admin') {
    body = (
      <EmptyState
        titleAs="h2"
        icon={<MessageSquare />}
        title="To konto nie ma skrzynki wiadomości"
        description="Rozmowy uczniów z mentorami są prywatne. Zespół zaufania widzi tylko zgłoszone sprawy — w sekcji Spory."
        action={<Link href={href('/admin/spory')}>Przejdź do sporów</Link>}
      />
    );
  } else if (status === 'loading') {
    body = (
      <div aria-busy="true" className="flex flex-col gap-group">
        <p className="sr-only">Wczytujemy wiadomości…</p>
        <Skeleton className="h-control w-full" />
        <Skeleton className="h-control w-full" />
        <Skeleton className="h-control w-full" />
      </div>
    );
  } else if (status === 'error') {
    body = (
      <ErrorState
        titleAs="h2"
        title="Nie udało się wczytać wiadomości"
        description="Sprawdź połączenie i spróbuj ponownie."
        action={<Button variant="outline" onClick={retry}>Ponów</Button>}
      />
    );
  } else if (status === 'empty' || !hasThreads) {
    body = (
      <EmptyState
        titleAs="h2"
        icon={<MessageSquare />}
        title="Brak wiadomości"
        description={
          side === 'student'
            ? 'Napisz do mentora z jego profilu, żeby zapytać o szczegóły przed rezerwacją.'
            : 'Rozmowy z uczniami pojawią się tutaj, gdy ktoś do Ciebie napisze.'
        }
        action={side === 'student' ? <Link href={href('/mentorzy')}>Przeglądaj mentorów</Link> : undefined}
      />
    );
  } else {
    body = <Inbox key={account.id} threadId={threadId} />;
  }
  return (
    <div className="flex flex-col gap-section">
      <PageHeader title="Wiadomości" className={threadId && status === 'default' ? 'hidden md:flex' : ''} />
      {body}
    </div>
  );
}
