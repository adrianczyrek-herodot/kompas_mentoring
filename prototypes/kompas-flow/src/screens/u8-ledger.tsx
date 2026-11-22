/** U8 sections: active plan card, balance per mentor, payment history. */
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  DateTime,
  formatCount,
  Link,
  Money,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from '@kompas/ui';
import { useState } from 'react';
import type { StudentId } from '../data/accounts';
import { type Mentor, mentorById, PUBLIC_MENTORS } from '../data/mentors';
import { type Payment, planPrice, type PlanStatus, type Subscription } from '../data/progress';
import { TZ } from '../lib/clock';
import { href } from '../lib/router';
import { FailureAlert, useAction } from '../shell/request-feedback';
import { completedTrialWith } from '../state/booking-rules';
import { useDemo } from '../state/demo-context';
import { CancelPlanDialog, ChangePlanDialog, TransferBalanceDialog } from './u8-dialogs';
import { calendarDate, planLabel, SESSION_FORMS } from './u8-parts';

const STATUS_BADGE: Record<PlanStatus, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  active: { label: 'Aktywny', variant: 'success' },
  paused: { label: 'Wstrzymany', variant: 'warning' },
  cancelled: { label: 'Anulowany', variant: 'neutral' },
};

// DS-GAP: ActivePlanCard (KONCEPCJA §U8) — Card with the plan facts and its actions.
export function ActivePlanCard({ subscription, mentor }: { subscription: Subscription; mentor: Mentor }) {
  const { dispatch, balanceWith } = useDemo();
  const toast = useToast();
  const action = useAction();
  const [changing, setChanging] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const badge = STATUS_BADGE[subscription.status];
  const next = subscription.nextPeriod;
  const toggle = () => {
    const status: PlanStatus = subscription.status === 'active' ? 'paused' : 'active';
    void action.run(() => {
      dispatch({ type: 'set-plan-status', id: subscription.id, status });
      toast.add({ title: status === 'paused' ? 'Plan wstrzymany' : 'Plan wznowiony', description: status === 'paused' ? 'Nie pobieramy opłat, saldo zostaje.' : undefined, type: 'success' });
    });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>{mentor.name}</CardTitle>
        <CardDescription>
          {planLabel(subscription)} · <Money amount={planPrice(mentor.rate60, subscription.perWeek, subscription.durationMin)} /> / 4 tyg.
        </CardDescription>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-inline">
        {subscription.status === 'active' ? (
          <p className="text-body">
            Następne odnowienie: <strong>{calendarDate(subscription.renewsOn)}</strong>
          </p>
        ) : subscription.status === 'paused' ? (
          <p className="text-body">Plan wstrzymany — nie pobieramy opłat, saldo zostaje.</p>
        ) : (
          <p className="text-body">Plan anulowany — nie odnowi się. Saldo sesji zostaje.</p>
        )}
        {next && subscription.status !== 'cancelled' ? (
          <p className="text-body-dense text-text-muted">
            Od kolejnego okresu: {planLabel(next)}, <Money amount={planPrice(mentor.rate60, next.perWeek, next.durationMin)} /> / 4 tyg.
          </p>
        ) : null}
        <p className="text-body-dense text-text-muted">Saldo u tego mentora: {formatCount(balanceWith(mentor.id), SESSION_FORMS)}.</p>
        <FailureAlert kind={action.failure} what="Nie zmieniliśmy planu" />
      </CardContent>
      <CardFooter className="flex flex-wrap gap-inline">
        {subscription.status === 'cancelled' ? (
          <Link href={href(`/plany?mentor=${mentor.id}`)}>Wybierz nowy plan z mentorem: {mentor.name}</Link>
        ) : (
          <>
            <Button variant="outline" onClick={() => { setChanging(true); }}>Zmień plan</Button>
            <Button variant="outline" loading={action.busy} onClick={toggle}>
              {subscription.status === 'active' ? 'Wstrzymaj plan' : 'Wznów plan'}
            </Button>
            <Button variant="ghost" onClick={() => { setCancelling(true); }}>Anuluj plan</Button>
          </>
        )}
      </CardFooter>
      <ChangePlanDialog subscription={subscription} mentor={mentor} open={changing} onOpenChange={setChanging} />
      <CancelPlanDialog subscription={subscription} mentor={mentor} balance={balanceWith(mentor.id)} open={cancelling} onOpenChange={setCancelling} />
    </Card>
  );
}

// DS-GAP: BalanceTable (KONCEPCJA §U8) — Table with a transfer action per mentor.
export function BalanceTable({ studentId }: { studentId: StudentId }) {
  const { state, myBookings } = useDemo();
  const [from, setFrom] = useState<Mentor | null>(null);
  const rows = Object.entries(state.balances[studentId]).filter(([, count]) => count > 0);
  const targetsFor = (mentorId: string) =>
    PUBLIC_MENTORS.filter((m) => m.id !== mentorId && m.acceptingNew && completedTrialWith(myBookings, m.id));
  const fromSessions = from ? (state.balances[studentId][from.id] ?? 0) : 0;
  return (
    <section aria-labelledby="u8-balance" className="flex flex-col gap-group">
      <h2 id="u8-balance" className="text-section-title font-semibold">Saldo sesji</h2>
      {rows.length === 0 ? (
        <p className="text-body text-text-muted">Saldo jest puste. Sesje z planu pojawią się tu po opłaceniu planu.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mentor</TableHead>
              <TableHead numeric>Sesje</TableHead>
              <TableHead>
                <span className="sr-only">Akcje</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(([mentorId, count]) => {
              const mentor = mentorById(mentorId);
              const targets = targetsFor(mentorId);
              return (
                <TableRow key={mentorId}>
                  <TableCell>{mentor?.name ?? mentorId}</TableCell>
                  <TableCell numeric>{count}</TableCell>
                  <TableCell className="text-right">
                    {mentor ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={targets.length === 0}
                        focusableWhenDisabled
                        aria-describedby={targets.length === 0 ? 'u8-transfer-hint' : undefined}
                        onClick={() => { setFrom(mentor); }}
                      >
                        Przenieś saldo<span className="sr-only"> do innego mentora</span>
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableCaption>Saldo możesz przenieść tylko do mentora, z którym odbyła się sesja próbna.</TableCaption>
        </Table>
      )}
      {rows.some(([mentorId]) => targetsFor(mentorId).length === 0) ? (
        <p id="u8-transfer-hint" className="text-body-dense text-text-muted">
          Przeniesienie jest niedostępne: nie ma innego mentora, z którym odbyła się sesja próbna.
        </p>
      ) : null}
      {from ? (
        <TransferBalanceDialog
          key={from.id}
          studentId={studentId}
          from={from}
          sessions={fromSessions}
          targets={targetsFor(from.id)}
          open
          onOpenChange={(open) => { if (!open) setFrom(null); }}
        />
      ) : null}
    </section>
  );
}

// DS-GAP: InvoiceList (KONCEPCJA §U8) — payment history rows with a „Faktura” action; the PDF is
// a simulation.
export function PaymentHistory({ payments }: { payments: Payment[] }) {
  const toast = useToast();
  return (
    <section aria-labelledby="u8-payments" className="flex flex-col gap-group">
      <h2 id="u8-payments" className="text-section-title font-semibold">Historia płatności</h2>
      {payments.length === 0 ? (
        <p className="text-body text-text-muted">Nie masz jeszcze płatności.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden md:table-cell">Data</TableHead>
              <TableHead>Opis</TableHead>
              <TableHead numeric>Kwota</TableHead>
              <TableHead>
                <span className="sr-only">Faktura</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="hidden md:table-cell">
                  <DateTime value={payment.at} timeZone={TZ} format="weekday" />
                </TableCell>
                <TableCell>
                  <DateTime value={payment.at} timeZone={TZ} format="weekday" className="block text-meta text-text-muted md:hidden" />
                  {payment.description}
                  {payment.kind === 'refund' ? <Badge variant="neutral" className="ml-inline">Zwrot</Badge> : null}
                </TableCell>
                <TableCell numeric>
                  {payment.kind === 'refund' ? '−' : ''}
                  <Money amount={payment.amount} />
                </TableCell>
                <TableCell className="text-right">
                  {payment.kind === 'payment' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast.add({ title: 'Faktura PDF (symulacja)', description: 'W prototypie plik nie powstaje — w produkcie pobierzesz tu fakturę.' });
                      }}
                    >
                      Faktura
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
