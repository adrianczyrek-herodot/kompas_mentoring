/** M4 · Uczniowie i notatki — lista (KONCEPCJA §M4); szczegóły ucznia w `m4-detail.tsx`. */
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  EmptyState,
  ErrorState,
  formatCount,
  initialsOf,
  Link,
  PageHeader,
  Skeleton,
  ToggleGroup,
  ToggleGroupItem,
} from '@kompas/ui';
import { Users } from 'lucide-react';
import { useState } from 'react';
import { KASIA_STUDENTS, type MentorStudent } from '../data/mentor-work';
import { STUDENT_NAMES } from '../data/accounts';
import { href, type Route } from '../lib/router';
import { useDemo, useRetry } from '../state/demo-context';
import { M4StudentDetail, planOf, STATUS_LABEL } from './m4-detail';

type Filter = 'all' | MentorStudent['status'];

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Wszyscy' },
  { value: 'active', label: 'Aktywni' },
  { value: 'trial', label: 'Próbni' },
  { value: 'inactive', label: 'Nieaktywni' },
];

const SESSION_FORMS = { one: 'sesja', few: 'sesje', many: 'sesji' };

function Row({ student, mentorId }: { student: MentorStudent; mentorId: string }) {
  const { state } = useDemo();
  const name = STUDENT_NAMES[student.studentId];
  const status = STATUS_LABEL[student.status];
  const goal = state.world.goals[student.studentId]?.text ?? student.goal;
  const balance = state.balances[student.studentId][mentorId] ?? 0;
  return (
    <li className="flex items-start gap-inline border-b border-border-divider py-row-y">
      <Avatar size="sm"><AvatarFallback>{initialsOf(name)}</AvatarFallback></Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-tight">
        <p className="flex flex-wrap items-center gap-inline text-body-dense font-medium">
          <Link href={href(`/mentor/uczniowie/${student.studentId}`)}>{name}</Link>
          <Badge variant={status.variant}>{status.label}</Badge>
        </p>
        <p className="text-body-dense text-text-muted">{goal}</p>
        <p className="text-meta text-text-muted">
          Plan: {planOf(student, state.world.subscriptions, mentorId)} · saldo: {formatCount(balance, SESSION_FORMS)} · razem {formatCount(student.sessionsCount, SESSION_FORMS)}
        </p>
      </div>
    </li>
  );
}

function List() {
  const { account } = useDemo();
  const [filter, setFilter] = useState<Filter>('all');
  const mentorId = account.mentorId ?? 'm1';
  const visible = KASIA_STUDENTS.filter((s) => filter === 'all' || s.status === filter);
  return (
    <>
      <ToggleGroup
        aria-label="Filtr uczniów"
        value={[filter]}
        onValueChange={(value) => { setFilter((value[0] as Filter | undefined) ?? 'all'); }}
        className="flex-wrap"
      >
        {FILTERS.map((f) => (
          <ToggleGroupItem key={f.value} value={f.value}>
            {f.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {visible.length === 0 ? (
        <p className="py-group text-body text-text-muted">Nie ma uczniów w tym filtrze.</p>
      ) : (
        <ul aria-label="Uczniowie">
          {visible.map((s) => <Row key={s.studentId} student={s} mentorId={mentorId} />)}
        </ul>
      )}
    </>
  );
}

export function M4Students({ route }: { route: Route }) {
  const { state } = useDemo();
  const retry = useRetry();
  const status = state.scenarios.dataState;
  const id = route.params['id'];
  if (id) return <M4StudentDetail studentId={id} />;
  return (
    <>
      <PageHeader title="Uczniowie" description="Cel, historia sesji i notatki każdego ucznia." />
      {status === 'loading' ? (
        <div aria-busy="true" className="flex flex-col gap-inline">
          <p className="sr-only">Wczytujemy uczniów…</p>
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-control-lg w-full" />)}
        </div>
      ) : status === 'error' ? (
        <ErrorState titleAs="h2" title="Nie udało się wczytać uczniów" description="Sprawdź połączenie i spróbuj ponownie." action={<Button variant="outline" onClick={retry}>Ponów</Button>} />
      ) : status === 'empty' ? (
        <EmptyState titleAs="h2" icon={<Users />} title="Nie masz jeszcze uczniów" description="Pierwsi uczniowie pojawią się po przyjęciu prośby o sesję próbną." action={<Link href={href('/mentor')}>Wróć do panelu</Link>} />
      ) : (
        <List />
      )}
    </>
  );
}
