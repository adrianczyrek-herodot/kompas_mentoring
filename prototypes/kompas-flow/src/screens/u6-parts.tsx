/**
 * U6 building blocks: device check, video stage, control bar, chat and shared notes, the end and
 * no-show confirmations. Video, camera, microphone and files are simulated — nothing is read from
 * the device (the video provider is embedded in the product, spec decision Z6).
 */
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Avatar,
  AvatarFallback,
  Button,
  DateTime,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  initialsOf,
  Input,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  useToast,
} from '@kompas/ui';
import { Check, Mic, MicOff, MonitorUp, Paperclip, PhoneOff, Send, Video, VideoOff } from 'lucide-react';
import { type SyntheticEvent, useEffect, useId, useState } from 'react';
import type { Booking } from '../data/accounts';
import type { Mentor } from '../data/mentors';
import { toMs, TZ } from '../lib/clock';
import { navigate } from '../lib/router';
import { FailureAlert, useAction } from '../shell/request-feedback';
import { useDemo } from '../state/demo-context';

const NO_SHOW_AFTER_SECONDS = 10 * 60;
const MAX_CHAT_LENGTH = 500;

export function clock(seconds: number): string {
  const total = Math.abs(seconds);
  const minutes = String(Math.floor(total / 60)).padStart(2, '0');
  return `${minutes}:${String(total % 60).padStart(2, '0')}`;
}

/** Seconds since the session start on the demo clock, ticking in real time while the room is open. */
export function useElapsedSeconds(booking: Booking, now: string): number {
  const [ticks, setTicks] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setTicks((count) => count + 1);
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, []);
  return Math.floor((toMs(now) - toMs(booking.startsAt)) / 1000) + ticks;
}

// DS-GAP: DeviceCheck (KONCEPCJA §U6) — Card-like panel from tokens; the test is a simulation.
type CheckState = 'idle' | 'testing' | 'done';

export function DeviceCheck({ mentor, booking }: { mentor: Mentor; booking: Booking }) {
  const [check, setCheck] = useState<CheckState>('idle');
  useEffect(() => {
    if (check !== 'testing') return;
    const timer = window.setTimeout(() => {
      setCheck('done');
    }, 900);
    return () => {
      window.clearTimeout(timer);
    };
  }, [check]);
  return (
    <section aria-labelledby="u6-check" className="flex flex-col gap-group rounded-panel border border-border-divider bg-surface-panel p-panel">
      <h2 id="u6-check" className="text-section-title font-semibold">Test sprzętu</h2>
      <p className="text-body-dense text-text-muted">
        To symulacja: prototyp nie włącza kamery ani mikrofonu. W produkcie sprawdzimy tu Twoją kamerę, mikrofon i łącze, zanim wejdziesz do pokoju.
      </p>
      <div className="flex aspect-video items-center justify-center rounded-panel bg-surface-sunken text-body-dense text-text-muted">
        Podgląd kamery (symulacja)
      </div>
      <dl className="flex flex-col gap-tight">
        {(['Kamera', 'Mikrofon', 'Połączenie'] as const).map((label) => (
          <div key={label} className="flex items-center justify-between gap-inline">
            <dt className="text-body">{label}</dt>
            <dd className="flex items-center gap-tight text-body-dense">
              {check === 'done' ? (
                <>
                  <Check aria-hidden="true" className="size-icon-sm text-status-success-fg" />
                  {label === 'Połączenie' ? 'dobre (38 ms)' : 'działa'}
                </>
              ) : check === 'testing' ? (
                <Spinner size="sm" label={`Sprawdzamy: ${label.toLowerCase()}`} />
              ) : (
                <span className="text-text-muted">nie sprawdzono</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap items-center gap-inline">
        <Button
          variant="outline"
          loading={check === 'testing'}
          onClick={() => {
            setCheck('testing');
          }}
        >
          {check === 'done' ? 'Przetestuj ponownie' : 'Uruchom test sprzętu'}
        </Button>
        <p className="text-body-dense text-text-muted">
          {mentor.name}, <DateTime value={booking.startsAt} timeZone={TZ} />, {booking.durationMin} min · {booking.goal}
        </p>
      </div>
      <span className="sr-only" aria-live="polite">
        {check === 'done' ? 'Test sprzętu zakończony: kamera, mikrofon i połączenie działają.' : ''}
      </span>
    </section>
  );
}

// DS-GAP: VideoStage — placeholder tiles; the embedded provider fills them in the product.
export function VideoStage({
  mentor,
  mentorHere,
  micOn,
  cameraOn,
  sharing,
  reconnecting,
}: {
  mentor: Mentor;
  mentorHere: boolean;
  micOn: boolean;
  cameraOn: boolean;
  sharing: boolean;
  reconnecting: boolean;
}) {
  return (
    <div className="flex flex-col gap-inline">
      <div className="relative flex min-h-56 flex-col items-center justify-center gap-inline rounded-panel md:aspect-video border border-border-divider bg-surface-panel p-panel text-center">
        {reconnecting ? (
          <div role="status" className="flex items-center gap-inline text-body">
            <Spinner label="Łączymy ponownie" />
            Utracono połączenie — łączymy ponownie. Sesja nie kończy się przed czasem.
          </div>
        ) : mentorHere ? (
          <>
            <Avatar size="lg" aria-hidden="true">
              <AvatarFallback>{initialsOf(mentor.name)}</AvatarFallback>
            </Avatar>
            <p className="text-body font-medium">{mentor.name}</p>
            <p className="max-w-measure text-body-dense text-text-muted">
              Symulacja: tu osadzony dostawca wideo pokaże obraz mentora{sharing ? ' i udostępniony ekran' : ''}.
            </p>
          </>
        ) : (
          <div role="status" className="flex flex-col items-center gap-inline">
            <Spinner size="lg" label="Czekamy na mentora" />
            <p className="text-body">{mentor.name} jeszcze nie ma w pokoju.</p>
          </div>
        )}
        <div className="flex items-center gap-inline rounded-panel border border-border-divider bg-surface-sunken px-field-x py-tight text-meta text-text-muted md:absolute md:right-inline md:bottom-inline">
          <Avatar size="sm" aria-hidden="true">
            <AvatarFallback>Ty</AvatarFallback>
          </Avatar>
          {cameraOn ? 'Ty (kamera włączona)' : 'Ty (kamera wyłączona)'}
          {micOn ? null : ', bez dźwięku'}
        </div>
      </div>
    </div>
  );
}

export function ControlBar({
  micOn,
  cameraOn,
  sharing,
  chatOnly,
  onMic,
  onCamera,
  onShare,
  onReconnect,
  onEnd,
}: {
  micOn: boolean;
  cameraOn: boolean;
  sharing: boolean;
  chatOnly: boolean;
  onMic: () => void;
  onCamera: () => void;
  onShare: () => void;
  onReconnect: () => void;
  onEnd: () => void;
}) {
  return (
    <div role="toolbar" aria-label="Sterowanie pokojem" className="flex flex-wrap items-center gap-inline">
      <Button variant="outline" aria-pressed={micOn} disabled={chatOnly} focusableWhenDisabled onClick={onMic}>
        {micOn ? <Mic aria-hidden="true" /> : <MicOff aria-hidden="true" />}
        {micOn ? 'Mikrofon włączony' : 'Mikrofon wyłączony'}
      </Button>
      <Button variant="outline" aria-pressed={cameraOn} disabled={chatOnly} focusableWhenDisabled onClick={onCamera}>
        {cameraOn ? <Video aria-hidden="true" /> : <VideoOff aria-hidden="true" />}
        {cameraOn ? 'Kamera włączona' : 'Kamera wyłączona'}
      </Button>
      <Button variant="outline" aria-pressed={sharing} disabled={chatOnly} focusableWhenDisabled onClick={onShare}>
        <MonitorUp aria-hidden="true" />
        {sharing ? 'Zatrzymaj udostępnianie' : 'Udostępnij ekran'}
      </Button>
      <Button variant="ghost" onClick={onReconnect}>
        Symuluj utratę połączenia
      </Button>
      <Button variant="destructive" onClick={onEnd}>
        <PhoneOff aria-hidden="true" />
        Zakończ sesję
      </Button>
    </div>
  );
}

type ChatMessage = { id: number; text: string; file: boolean };

// DS-GAP: ChatPanel — local list; messages are not stored in the prototype.
function ChatPanel() {
  const id = useId();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const send = (event: SyntheticEvent) => {
    event.preventDefault();
    const value = text.trim();
    if (value.length === 0) {
      setError('Wiadomość nie może być pusta.');
      return;
    }
    setMessages((list) => [...list, { id: list.length + 1, text: value, file: false }]);
    setText('');
  };
  return (
    <div className="flex flex-col gap-group">
      <ul aria-label="Wiadomości w czacie" className="flex min-h-32 flex-col gap-tight">
        {messages.length === 0 ? (
          <li className="text-body-dense text-text-muted">Czat jest pusty. Napisz wiadomość lub wyślij link do materiału.</li>
        ) : null}
        {messages.map((message) => (
          <li key={message.id} className="self-end rounded-panel bg-selected-bg px-field-x py-tight text-body-dense">
            {message.file ? `Plik: ${message.text}` : message.text}
          </li>
        ))}
      </ul>
      <form noValidate onSubmit={send} className="flex flex-col gap-inline">
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor={id}>Wiadomość</FieldLabel>
          <div className="flex gap-inline">
            <Input
              id={id}
              value={text}
              maxLength={MAX_CHAT_LENGTH}
              aria-invalid={error ? true : undefined}
              onChange={(event) => {
                setText(event.target.value);
                setError(null);
              }}
            />
            <Button type="submit" size="icon">
              <Send aria-hidden="true" />
              <span className="sr-only">Wyślij</span>
            </Button>
          </div>
          {error ? <FieldError>{error}</FieldError> : null}
          <FieldDescription>Linki i pliki do 10 MB. W prototypie czat się nie zapisuje.</FieldDescription>
        </Field>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setMessages((list) => [...list, { id: list.length + 1, text: 'materialy-z-sesji.pdf · 2,1 MB (symulacja)', file: true }]);
          }}
        >
          <Paperclip aria-hidden="true" />
          Załącz plik (symulacja)
        </Button>
      </form>
    </div>
  );
}

// DS-GAP: SharedNotes — one Textarea; in the product the notes sync live with the mentor.
function SharedNotes() {
  const id = useId();
  const [notes, setNotes] = useState('');
  return (
    <Field>
      <FieldLabel htmlFor={id}>Wspólne notatki</FieldLabel>
      <Textarea id={id} rows={8} maxLength={2000} showCount value={notes} onChange={(event) => { setNotes(event.target.value); }} />
      <FieldDescription>W prototypie notatki nie są zapisywane — znikną po wyjściu z pokoju.</FieldDescription>
    </Field>
  );
}

export function SidePanel() {
  return (
    <Tabs defaultValue="chat">
      <TabsList>
        <TabsTrigger value="chat">Czat</TabsTrigger>
        <TabsTrigger value="notes">Wspólne notatki</TabsTrigger>
      </TabsList>
      <TabsContent value="chat">
        <ChatPanel />
      </TabsContent>
      <TabsContent value="notes">
        <SharedNotes />
      </TabsContent>
    </Tabs>
  );
}

export function EndSessionDialog({
  booking,
  open,
  onOpenChange,
}: {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { dispatch } = useDemo();
  const action = useAction();
  return (
    <AlertDialog open={open} onOpenChange={(next) => { if (!action.busy) { action.reset(); onOpenChange(next); } }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Zakończyć sesję?</AlertDialogTitle>
          <AlertDialogDescription>
            Sesja zostanie oznaczona jako zakończona i rozliczona. Wrócić do pokoju się nie da — po zakończeniu poprosimy Cię o ocenę.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <FailureAlert kind={action.failure} what="Nie zakończyliśmy sesji" />
        <AlertDialogFooter>
          <Button variant="outline" disabled={action.busy} onClick={() => { onOpenChange(false); }}>
            Wróć do pokoju
          </Button>
          <Button
            variant="destructive"
            loading={action.busy}
            onClick={() =>
              void action.run(() => {
                dispatch({ type: 'end-session', id: booking.id });
                navigate(`/sesje/${booking.id}/ocena`);
              })
            }
          >
            Zakończ sesję
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function NoShowControl({ booking, mentor, elapsed }: { booking: Booking; mentor: Mentor; elapsed: number }) {
  const { dispatch } = useDemo();
  const toast = useToast();
  const action = useAction();
  const reasonId = useId();
  const [open, setOpen] = useState(false);
  const ready = elapsed >= NO_SHOW_AFTER_SECONDS;
  const refund = booking.type === 'plan' ? 'Sesja wróci do Twojego salda.' : 'Zwrócimy 100% płatności za sesję próbną.';
  return (
    <section aria-labelledby={`${reasonId}-h`} className="flex flex-col gap-inline rounded-panel border border-border-divider bg-surface-panel p-panel">
      <h2 id={`${reasonId}-h`} className="text-label font-semibold">Mentor się nie pojawił?</h2>
      <p id={reasonId} className="text-body-dense text-text-muted">
        {ready
          ? `Minęło ponad 10 minut od startu. Możesz zgłosić nieobecność: ${refund}`
          : 'Przycisk uaktywni się po 10 minutach od planowanego startu sesji.'}
      </p>
      <div>
        <Button variant="outline" disabled={!ready} focusableWhenDisabled aria-describedby={reasonId} onClick={() => { setOpen(true); }}>
          Mentor się nie pojawił
        </Button>
      </div>
      <AlertDialog open={open} onOpenChange={(next) => { if (!action.busy) { action.reset(); setOpen(next); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zgłosić nieobecność: {mentor.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {refund} Zespół zaufania zobaczy zapis zdarzeń z pokoju i sprawdzi sprawę.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <FailureAlert kind={action.failure} what="Nie wysłaliśmy zgłoszenia" />
          <AlertDialogFooter>
            <Button variant="outline" disabled={action.busy} onClick={() => { setOpen(false); }}>
              Czekam dalej
            </Button>
            <Button
              variant="destructive"
              loading={action.busy}
              onClick={() =>
                void action.run(() => {
                  dispatch({ type: 'report-no-show', id: booking.id });
                  toast.add({ title: 'Zgłoszono nieobecność mentora', description: refund, type: 'success' });
                  navigate(`/sesje/${booking.id}`);
                })
              }
            >
              Zgłoś nieobecność
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
