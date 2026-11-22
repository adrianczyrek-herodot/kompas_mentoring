/** U8 dialogs: cancel plan, change plan from the next period, transfer balance to another mentor. */
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FieldLabel,
  formatCount,
  Money,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from '@kompas/ui';
import { useId, useState } from 'react';
import type { StudentId } from '../data/accounts';
import { type Mentor } from '../data/mentors';
import { type Subscription, transferSessions } from '../data/progress';
import { FailureAlert, useAction } from '../shell/request-feedback';
import { useDemo } from '../state/demo-context';
import { calendarDate, PlanPicker, planLabel, type PlanChoice, PriceBreakdown, SESSION_FORMS } from './u8-parts';

type DialogProps = { open: boolean; onOpenChange: (open: boolean) => void };

export function CancelPlanDialog({
  subscription,
  mentor,
  balance,
  open,
  onOpenChange,
}: DialogProps & { subscription: Subscription; mentor: Mentor; balance: number }) {
  const { dispatch } = useDemo();
  const toast = useToast();
  const action = useAction();
  return (
    <AlertDialog open={open} onOpenChange={(next) => { if (!action.busy) { action.reset(); onOpenChange(next); } }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Anulować plan z mentorem: {mentor.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Plan nie odnowi się {calendarDate(subscription.renewsOn)}. Sesje, które masz w saldzie ({formatCount(balance, SESSION_FORMS)}), zostają — wykorzystasz je na umówienie sesji.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <FailureAlert kind={action.failure} what="Plan nie został anulowany" />
        <AlertDialogFooter>
          <Button variant="outline" disabled={action.busy} onClick={() => { onOpenChange(false); }}>
            Zostaw plan
          </Button>
          <Button
            variant="destructive"
            loading={action.busy}
            onClick={() =>
              void action.run(() => {
                dispatch({ type: 'set-plan-status', id: subscription.id, status: 'cancelled' });
                onOpenChange(false);
                toast.add({ title: 'Plan anulowany', description: 'Saldo sesji zostaje.' });
              })
            }
          >
            Anuluj plan
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ChangePlanDialog({
  subscription,
  mentor,
  open,
  onOpenChange,
}: DialogProps & { subscription: Subscription; mentor: Mentor }) {
  const { dispatch } = useDemo();
  const toast = useToast();
  const action = useAction();
  const current = subscription.nextPeriod ?? subscription;
  const [choice, setChoice] = useState<PlanChoice>({ perWeek: current.perWeek, durationMin: current.durationMin });
  const unchanged = choice.perWeek === subscription.perWeek && choice.durationMin === subscription.durationMin && !subscription.nextPeriod;
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!action.busy) { action.reset(); onOpenChange(next); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Zmień plan — {mentor.name}</DialogTitle>
          <DialogDescription>
            Zmiana obowiązuje od kolejnego okresu rozliczeniowego ({calendarDate(subscription.renewsOn)}). Bieżący okres i saldo zostają bez zmian.
          </DialogDescription>
        </DialogHeader>
        <PlanPicker mentor={mentor} value={choice} onChange={setChoice} />
        <PriceBreakdown mentor={mentor} choice={choice} />
        <FailureAlert kind={action.failure} what="Plan nie został zmieniony" />
        <DialogFooter>
          <Button variant="outline" disabled={action.busy} onClick={() => { onOpenChange(false); }}>
            Anuluj
          </Button>
          <Button
            loading={action.busy}
            disabled={unchanged}
            onClick={() =>
              void action.run(() => {
                dispatch({ type: 'change-plan', id: subscription.id, ...choice });
                onOpenChange(false);
                toast.add({
                  title: 'Plan zmieniony od kolejnego okresu',
                  description: `${planLabel(choice)}, od ${calendarDate(subscription.renewsOn)}.`,
                  type: 'success',
                });
              })
            }
          >
            Zmień od kolejnego okresu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// DS-GAP: TransferBalanceDialog (KONCEPCJA §U8) — Dialog + Select; the result of the conversion is
// shown before the student confirms.
export function TransferBalanceDialog({
  studentId,
  from,
  sessions,
  targets,
  open,
  onOpenChange,
}: DialogProps & { studentId: StudentId; from: Mentor; sessions: number; targets: Mentor[] }) {
  const { dispatch } = useDemo();
  const toast = useToast();
  const action = useAction();
  const selectId = useId();
  const [toId, setToId] = useState(targets[0]?.id ?? '');
  const to = targets.find((m) => m.id === toId) ?? targets[0];
  const moved = to ? transferSessions(sessions, from.id, to.id) : 0;
  const items = targets.map((m) => ({ value: m.id, label: m.name }));
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!action.busy) { action.reset(); onOpenChange(next); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Przenieś saldo od: {from.name}</DialogTitle>
          <DialogDescription>
            Przenosisz całe saldo. Wartość sesji przeliczamy według stawki nowego mentora, wynik zaokrąglamy w dół. Możesz przenieść saldo tylko do mentora, z którym masz sesję próbną.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-inline">
          <FieldLabel htmlFor={selectId}>Do mentora</FieldLabel>
          <Select items={items} value={to?.id ?? ''} onValueChange={(next) => { setToId(next ?? ''); }}>
            <SelectTrigger id={selectId} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {to ? (
          <p role="status" className="rounded-panel bg-surface-sunken p-panel text-body">
            {formatCount(sessions, SESSION_FORMS)} ({from.name}, <Money amount={from.rate60} />/h) → {formatCount(moved, SESSION_FORMS)} ({to.name},{' '}
            <Money amount={to.rate60} />/h)
          </p>
        ) : null}
        {to && moved === 0 ? (
          <p className="text-body-dense text-status-danger-fg">Po przeliczeniu nie wychodzi ani jedna sesja — nie ma czego przenieść.</p>
        ) : null}
        <FailureAlert kind={action.failure} what="Saldo nie zostało przeniesione" />
        <DialogFooter>
          <Button variant="outline" disabled={action.busy} onClick={() => { onOpenChange(false); }}>
            Anuluj
          </Button>
          <Button
            loading={action.busy}
            disabled={!to || moved === 0}
            onClick={() =>
              to
                ? void action.run(() => {
                    dispatch({ type: 'transfer-balance', studentId, fromMentorId: from.id, toMentorId: to.id });
                    onOpenChange(false);
                    toast.add({ title: 'Saldo przeniesione', description: `${formatCount(moved, SESSION_FORMS)} — ${to.name}.`, type: 'success' });
                  })
                : undefined
            }
          >
            Przenieś saldo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
