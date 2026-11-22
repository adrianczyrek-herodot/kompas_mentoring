/**
 * U5 actions: cancel (12-hour rule), reschedule (SlotGrid in a Sheet), report a problem.
 * Patterns „Zmiana z regułą 12 h” and „Decyzja z powodem” from the design system.
 */
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  DateTime,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  RadioGroup,
  RadioGroupItem,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SlotGrid,
  Textarea,
  useToast,
} from '@kompas/ui';
import { useId, useState } from 'react';
import type { Booking } from '../data/accounts';
import type { Mentor } from '../data/mentors';
import { WEEKS_AHEAD, weekDays, weekLabel } from '../data/slots';
import { formatDateTime } from '@kompas/ui';
import { timeZoneLabel, TZ } from '../lib/clock';
import { FailureAlert, useAction } from '../shell/request-feedback';
import { useDemo } from '../state/demo-context';
import { liveMentor } from '../state/world';

export function CancelDialog({
  booking,
  mentor,
  late,
  open,
  onOpenChange,
}: {
  booking: Booking;
  mentor: Mentor;
  late: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { dispatch } = useDemo();
  const toast = useToast();
  const action = useAction();
  const requested = booking.status === 'requested';
  const consequence = requested
    ? 'Mentor jeszcze nie potwierdził sesji. Zwrócimy 100% płatności na Twoją kartę.'
    : late
      ? 'Do sesji zostało mniej niż 12 godzin. Jeśli ją anulujesz, przepadnie i nie wróci do salda.'
      : booking.type === 'plan'
        ? 'Sesja wróci do salda — wykorzystasz ją na inny termin.'
        : 'Zwrócimy płatność za sesję próbną na Twoją kartę.';
  return (
    <AlertDialog open={open} onOpenChange={(next) => { if (!action.busy) { action.reset(); onOpenChange(next); } }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Anulować sesję ({mentor.name}, <DateTime value={booking.startsAt} timeZone={TZ} />)?
          </AlertDialogTitle>
          <AlertDialogDescription>{consequence}</AlertDialogDescription>
        </AlertDialogHeader>
        <FailureAlert kind={action.failure} what="Sesja nie została anulowana" />
        <AlertDialogFooter>
          <Button variant="outline" disabled={action.busy} onClick={() => { onOpenChange(false); }}>
            Zostaw sesję
          </Button>
          <Button
            variant="destructive"
            loading={action.busy}
            onClick={() =>
              void action.run(() => {
                dispatch({ type: 'cancel-booking', id: booking.id, refundToBalance: !late });
                onOpenChange(false);
                toast.add({
                  title: 'Sesja anulowana',
                  description: late && !requested ? 'Sesja przepadła zgodnie z zasadą 12 godzin.' : consequence,
                });
              })
            }
          >
            {late && !requested ? 'Anuluj i strać sesję' : 'Anuluj sesję'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function RescheduleSheet({
  booking,
  mentor,
  open,
  onOpenChange,
}: {
  booking: Booking;
  mentor: Mentor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { state, dispatch, now } = useDemo();
  const toast = useToast();
  const action = useAction();
  const [week, setWeek] = useState(0);
  const [slot, setSlot] = useState<{ id: string; startsAt: string } | null>(null);
  const days = weekDays(liveMentor(state.world, mentor), week, now, state.bookings, state.takenSlots);
  return (
    <Sheet open={open} onOpenChange={(next) => { action.reset(); onOpenChange(next); }}>
      <SheetContent side="right" closeLabel="Zamknij przekładanie">
        <SheetHeader>
          <SheetTitle>Przełóż sesję</SheetTitle>
          <SheetDescription>Wybierz nowy termin. Stary zwolnimy po potwierdzeniu, mentor dostanie powiadomienie.</SheetDescription>
        </SheetHeader>
        <SlotGrid
          days={days}
          timeZone={TZ}
          timeZoneLabel={timeZoneLabel(TZ)}
          weekLabel={weekLabel(week)}
          canGoPrev={week > 0}
          selectedSlotId={slot?.id}
          onSelect={setSlot}
          onPrevWeek={() => { setWeek((w) => Math.max(0, w - 1)); }}
          {...(week < WEEKS_AHEAD - 1 ? { onNextWeek: () => { setWeek((w) => w + 1); } } : {})}
          layout="stacked"
        />
        <FailureAlert kind={action.failure} what="Sesja nie została przełożona" />
        <SheetFooter>
          <Button
            disabled={!slot}
            loading={action.busy}
            onClick={() =>
              void action.run(() => {
                if (!slot) return;
                dispatch({ type: 'reschedule-booking', id: booking.id, startsAt: slot.startsAt });
                onOpenChange(false);
                toast.add({ title: 'Sesja przełożona', description: `Nowy termin: ${formatDateTime(slot.startsAt, TZ)}.` });
              })
            }
          >
            Przełóż na wybrany termin
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

const REASONS = ['Mentor się nie pojawił', 'Sesja niezgodna z opisem', 'Problemy techniczne', 'Inny powód'];

export function ProblemDialog({
  booking,
  open,
  onOpenChange,
}: {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { dispatch } = useDemo();
  const toast = useToast();
  const action = useAction();
  const id = useId();
  const [reason, setReason] = useState(REASONS[0] ?? '');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const submit = () => {
    const length = text.trim().length;
    if (length < 30 || length > 1000) {
      setError('Opisz problem w 30–1000 znakach.');
      return;
    }
    setError(null);
    void action.run(() => {
      dispatch({ type: 'report-problem', id: booking.id, reason, description: text.trim() });
      onOpenChange(false);
      toast.add({ title: 'Zgłoszenie wysłane', description: 'Druga strona ma 48 h na odpowiedź. Decyzję podejmie zespół Kompasu.' });
    });
  };
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!action.busy) onOpenChange(next); }}>
      <DialogContent closeLabel="Zamknij">
        <DialogHeader>
          <DialogTitle>Zgłoś problem z sesją</DialogTitle>
          <DialogDescription>Zgłoszenie trafi do zespołu zaufania. Możesz je wysłać do 72 h po sesji.</DialogDescription>
        </DialogHeader>
        <FieldSet>
          <FieldLegend>Powód</FieldLegend>
          <RadioGroup value={reason} onValueChange={(next) => { setReason(String(next)); }}>
            {REASONS.map((r) => (
              <label key={r} className="flex items-center gap-inline text-body">
                <RadioGroupItem value={r} />
                {r}
              </label>
            ))}
          </RadioGroup>
        </FieldSet>
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor={id}>Opis</FieldLabel>
          <Textarea id={id} rows={4} maxLength={1000} showCount value={text} aria-invalid={error ? true : undefined} onChange={(e) => { setText(e.target.value); }} />
          {error ? <FieldError>{error}</FieldError> : null}
        </Field>
        <FailureAlert kind={action.failure} what="Zgłoszenie nie zostało wysłane" />
        <DialogFooter>
          <Button variant="outline" onClick={() => { onOpenChange(false); }}>Anuluj</Button>
          <Button loading={action.busy} onClick={submit}>Wyślij zgłoszenie</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
