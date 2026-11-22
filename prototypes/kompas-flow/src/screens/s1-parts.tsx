/** S1 building blocks: thread list, context card, message bubbles and the composer. */
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  DateTime,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  initialsOf,
  Link,
  Textarea,
} from '@kompas/ui';
import { CalendarClock, Send, ShieldAlert } from 'lucide-react';
import { type SyntheticEvent, useEffect, useId, useRef, useState } from 'react';
import type { Booking } from '../data/accounts';
import { OFF_PLATFORM, type Message, type Thread } from '../data/inbox';
import { TZ } from '../lib/clock';
import { href } from '../lib/router';
import { FailureAlert, useAction } from '../shell/request-feedback';
import { useDemo } from '../state/demo-context';

export type Side = 'student' | 'mentor';

const MAX_LENGTH = 2000;

// DS-GAP: ThreadList (KONCEPCJA §S1) — list of links with the last message and an unread badge.
export function ThreadList({
  threads,
  side,
  activeId,
  nameOf,
}: {
  threads: Thread[];
  side: Side;
  activeId: string | undefined;
  nameOf: (thread: Thread) => string;
}) {
  return (
    <ul aria-label="Rozmowy" className="flex flex-col divide-y divide-border-divider rounded-panel border border-border-divider bg-surface-panel">
      {threads.map((thread) => {
        const last = thread.messages.at(-1);
        const unread = thread.unread[side];
        const name = nameOf(thread);
        return (
          <li key={thread.id}>
            <a
              href={href(`/wiadomosci/${thread.id}`)}
              aria-current={thread.id === activeId ? 'page' : undefined}
              className="flex min-h-target items-center gap-inline p-panel hover:bg-surface-hover aria-[current=page]:bg-selected-bg"
            >
              <Avatar size="md" aria-hidden="true">
                <AvatarFallback>{initialsOf(name)}</AvatarFallback>
              </Avatar>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center justify-between gap-inline">
                  <span className={`truncate text-body ${unread > 0 ? 'font-semibold' : 'font-medium'}`}>{name}</span>
                  {last ? <DateTime value={last.at} timeZone={TZ} format="weekday" className="text-meta text-text-muted" /> : null}
                </span>
                <span className="truncate text-body-dense text-text-muted">{last?.text ?? 'Nowa rozmowa'}</span>
              </span>
              {unread > 0 ? (
                <Badge variant="warning">
                  {unread}
                  <span className="sr-only"> nieprzeczytane</span>
                </Badge>
              ) : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

// DS-GAP: ContextCard (KONCEPCJA §S1) — the pair's nearest session as a link.
export function ContextCard({ booking, side }: { booking: Booking | undefined; side: Side }) {
  return (
    <div className="flex items-center gap-inline rounded-panel bg-surface-sunken p-panel text-body-dense">
      <CalendarClock aria-hidden="true" className="size-icon-md shrink-0 text-text-muted" />
      {booking ? (
        <p>
          Najbliższa sesja: <DateTime value={booking.startsAt} timeZone={TZ} />,{' '}
          <Link href={href(side === 'student' ? `/sesje/${booking.id}` : '/mentor/kalendarz')}>
            {side === 'student' ? 'szczegóły sesji' : 'kalendarz'}
          </Link>
        </p>
      ) : (
        <p className="text-text-muted">Brak zaplanowanych sesji w tej parze.</p>
      )}
    </div>
  );
}

function Bubble({ message, threadId, side }: { message: Message; threadId: string; side: Side }) {
  const { dispatch } = useDemo();
  const retry = useAction();
  const mine = message.from === side;
  return (
    <li className={`flex max-w-measure flex-col gap-tight ${mine ? 'items-end self-end' : 'items-start self-start'}`}>
      <p className={`rounded-panel px-field-x py-tight text-body ${mine ? 'bg-selected-bg' : 'bg-surface-sunken'}`}>{message.text}</p>
      {message.failed ? (
        <div className="flex flex-col items-end gap-tight">
          <p className="flex items-center gap-inline text-meta text-status-danger-fg">
            Nie wysłano
            <Button
              variant="link"
              loading={retry.busy}
              onClick={() => { void retry.run(() => { dispatch({ type: 'retry-message', threadId, messageId: message.id }); }); }}
            >
              Ponów
            </Button>
          </p>
          <FailureAlert kind={retry.failure} what="Wiadomość nadal nie została wysłana" />
        </div>
      ) : (
        <DateTime value={message.at} timeZone={TZ} format="time" className="text-meta text-text-muted" />
      )}
    </li>
  );
}

export function MessageList({ thread, side }: { thread: Thread; side: Side }) {
  const box = useRef<HTMLUListElement>(null);
  const count = thread.messages.length;
  useEffect(() => {
    const el = box.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [count]);
  if (count === 0) {
    return <p className="py-group text-body text-text-muted">Przedstaw się i napisz, z czym przychodzisz. Mentorzy odpowiadają zwykle w ciągu kilku godzin.</p>;
  }
  return (
    <ul ref={box} aria-label="Wiadomości" className="flex max-h-96 min-h-32 flex-col gap-group overflow-y-auto py-tight pr-tight">
      {thread.messages.map((message) => (
        <Bubble key={message.id} message={message} threadId={thread.id} side={side} />
      ))}
    </ul>
  );
}

// DS-GAP: OffPlatformWarning (KONCEPCJA §S1) — Alert shown while the draft looks like contact details.
function OffPlatformWarning() {
  return (
    <Alert variant="warning">
      <ShieldAlert aria-hidden="true" />
      <AlertTitle>Rozliczaj się tylko przez Kompas</AlertTitle>
      <AlertDescription>
        Poza platformą nie działa gwarancja ani zwroty. Nie przekazuj danych kontaktowych ani płatniczych w wiadomościach.
      </AlertDescription>
    </Alert>
  );
}

export function Composer({ thread, side }: { thread: Thread; side: Side }) {
  const { dispatch } = useDemo();
  const action = useAction();
  const id = useId();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const pending = useRef<string | null>(null);
  const failure = action.failure;
  // A failed send keeps the text as a message with „Ponów” (KONCEPCJA §S1 Er) and empties the field.
  useEffect(() => {
    const draft = pending.current;
    if (!failure || draft === null) return;
    pending.current = null;
    dispatch({ type: 'send-message', threadId: thread.id, from: side, text: draft, failed: true });
    setText('');
  }, [failure, dispatch, thread.id, side]);

  const send = (event: SyntheticEvent) => {
    event.preventDefault();
    const value = text.trim();
    if (value.length === 0) {
      setError('Wiadomość nie może być pusta.');
      return;
    }
    if (value.length > MAX_LENGTH) {
      setError(`Wiadomość może mieć najwyżej ${String(MAX_LENGTH)} znaków.`);
      return;
    }
    pending.current = value;
    void action.run(() => {
      pending.current = null;
      dispatch({ type: 'send-message', threadId: thread.id, from: side, text: value, failed: false });
      setText('');
    }, 500);
  };
  return (
    <form noValidate onSubmit={send} className="flex flex-col gap-inline">
      {OFF_PLATFORM.test(text) ? <OffPlatformWarning /> : null}
      <FailureAlert kind={action.failure} what="Nie wysłaliśmy wiadomości" />
      <Field data-invalid={error ? true : undefined}>
        <FieldLabel htmlFor={id}>Napisz wiadomość</FieldLabel>
        <Textarea
          id={id}
          rows={3}
          maxLength={MAX_LENGTH}
          showCount
          value={text}
          aria-invalid={error ? true : undefined}
          onChange={(event) => { setText(event.target.value); setError(null); }}
        />
        {error ? <FieldError>{error}</FieldError> : null}
        <FieldDescription>Rozmowa zostaje w Kompasie: 1–2000 znaków.</FieldDescription>
      </Field>
      <div>
        <Button type="submit" loading={action.busy}>
          <Send aria-hidden="true" />
          Wyślij
        </Button>
      </div>
    </form>
  );
}
