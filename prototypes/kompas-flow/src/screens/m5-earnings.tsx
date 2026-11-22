/** M5 · Zarobki i wypłaty (KONCEPCJA §M5, F5/F6). Amounts are `bigint` grosze, shown by `Money`. */
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertTitle,
  Badge,
  Button,
  DateTime,
  EmptyState,
  Link,
  Money,
  PageHeader,
  Skeleton,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from '@kompas/ui';
import { CircleX, Download, Wallet } from 'lucide-react';
import { useId, useState } from 'react';
import {
  commissionPercent,
  type Earning,
  type EarningStatus,
  KASIA_HOURS,
  nextTier,
  PAYOUT_ACCOUNT,
  PAYOUT_MINIMUM,
} from '../data/mentor-work';
import { TZ } from '../lib/clock';
import { href } from '../lib/router';
import { FailureAlert, useAction } from '../shell/request-feedback';
import { useDemo, useRetry } from '../state/demo-context';

const STATUS: Record<EarningStatus, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  available: { label: 'Dostępne', variant: 'success' },
  pending: { label: 'Oczekuje', variant: 'warning' },
  'in-transit': { label: 'W drodze', variant: 'neutral' },
  paid: { label: 'Wypłacone', variant: 'neutral' },
};

const net = (e: Earning) => e.gross - e.fee;
const sumNet = (list: Earning[]) => list.reduce((sum, e) => sum + net(e), 0n);

// DS-GAP: Progress — no progress bar in @kompas/ui; a labelled `progressbar` from tokens.
function TierProgress({ hours }: { hours: number }) {
  const labelId = useId();
  const tier = nextTier(hours);
  if (tier === null) return <p className="text-body-dense text-text-muted">Najniższy próg prowizji — niżej już nie spadnie.</p>;
  return (
    <div className="flex flex-col gap-tight">
      <div
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={tier}
        aria-valuenow={hours}
        className="h-inline overflow-hidden rounded-round bg-surface-sunken"
      >
        <div className="h-full bg-action-primary" style={{ width: `${String(Math.min(100, (hours / tier) * 100))}%` }} />
      </div>
      <p id={labelId} className="text-body-dense text-text-muted">
        {hours} h z {tier} h do progu {commissionPercent(tier)}% — zostało {tier - hours} h.
      </p>
    </div>
  );
}

function Summary({ earnings, hours, payoutBlock, onPayout }: {
  earnings: Earning[];
  hours: number;
  payoutBlock: string | null;
  onPayout: () => void;
}) {
  const reasonId = useId();
  const available = sumNet(earnings.filter((e) => e.status === 'available'));
  const pending = sumNet(earnings.filter((e) => e.status === 'pending'));
  const inTransit = sumNet(earnings.filter((e) => e.status === 'in-transit'));
  return (
    <div className="grid grid-cols-1 gap-section md:grid-cols-3">
      <section aria-labelledby={`${reasonId}-a`} className="flex flex-col gap-inline">
        <h2 id={`${reasonId}-a`} className="text-label font-medium text-text-muted">Dostępne do wypłaty</h2>
        <p className="text-page-title font-semibold"><Money amount={available} /></p>
        {inTransit > 0n ? (
          <p className="text-body-dense text-text-muted">W drodze na konto: <Money amount={inTransit} /></p>
        ) : null}
        <div className="flex flex-col items-start gap-tight">
          <Button disabled={payoutBlock !== null} focusableWhenDisabled aria-describedby={payoutBlock ? reasonId : undefined} onClick={onPayout}>
            <Wallet aria-hidden="true" />
            Wypłać
          </Button>
          {payoutBlock ? <p id={reasonId} className="max-w-measure text-body-dense text-text-muted">{payoutBlock}</p> : null}
        </div>
      </section>
      <section aria-labelledby={`${reasonId}-p`} className="flex flex-col gap-inline">
        <h2 id={`${reasonId}-p`} className="text-label font-medium text-text-muted">Oczekujące</h2>
        <p className="text-page-title font-semibold"><Money amount={pending} /></p>
        <p className="max-w-measure text-body-dense text-text-muted">Sesje do 48 h po zakończeniu. Jeśli uczeń nie zgłosi problemu, kwota staje się dostępna.</p>
      </section>
      <section aria-labelledby={`${reasonId}-c`} className="flex flex-col gap-inline">
        <h2 id={`${reasonId}-c`} className="text-label font-medium text-text-muted">Twoja prowizja</h2>
        <p className="text-page-title font-semibold">{commissionPercent(hours)}%</p>
        <TierProgress hours={hours} />
      </section>
    </div>
  );
}

function EarningsTable({ earnings }: { earnings: Earning[] }) {
  const rows = [...earnings].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <Table>
      <TableCaption>Sesja próbna w całości jest prowizją platformy — nie trafia do wypłaty.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Uczeń</TableHead>
          <TableHead>Rodzaj</TableHead>
          <TableHead numeric>Brutto</TableHead>
          <TableHead numeric>Prowizja</TableHead>
          <TableHead numeric>Netto</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((e) => (
          <TableRow key={e.id}>
            <TableCell><DateTime value={`${e.date}T12:00:00+02:00`} timeZone={TZ} format="date" /></TableCell>
            <TableCell>{e.studentName}</TableCell>
            <TableCell>{e.type}</TableCell>
            <TableCell numeric><Money amount={e.gross} /></TableCell>
            <TableCell numeric>−<Money amount={e.fee} /></TableCell>
            <TableCell numeric className="font-semibold"><Money amount={net(e)} /></TableCell>
            <TableCell><Badge variant={STATUS[e.status].variant}>{STATUS[e.status].label}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function PayoutDialog({ amount, open, onOpenChange }: { amount: bigint; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { dispatch, account } = useDemo();
  const toast = useToast();
  const action = useAction();
  return (
    <AlertDialog open={open} onOpenChange={(next) => { if (!action.busy) { action.reset(); onOpenChange(next); } }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Wypłacić <Money amount={amount} />?</AlertDialogTitle>
          <AlertDialogDescription>
            Przelew trafi na konto {PAYOUT_ACCOUNT}. Środki zwykle docierają w 1–2 dni robocze. Limit: jedna ręczna wypłata na dobę.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <FailureAlert kind={action.failure} what="Wypłata nie została zlecona" />
        <AlertDialogFooter>
          <Button variant="outline" disabled={action.busy} onClick={() => { onOpenChange(false); }}>Anuluj</Button>
          <Button
            loading={action.busy}
            onClick={() =>
              void action.run(() => {
                dispatch({ type: 'request-payout', mentorId: account.mentorId ?? 'm1' });
                onOpenChange(false);
                toast.add({ title: 'Wypłata zlecona', description: `Przelew na konto ${PAYOUT_ACCOUNT} jest w drodze.` });
              })
            }
          >
            Zleć wypłatę
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function PayoutHistory() {
  const { state, account } = useDemo();
  const payouts = state.world.payouts.filter((p) => p.mentorId === (account.mentorId ?? 'm1'));
  return (
    <section aria-labelledby="payouts-h" className="flex flex-col gap-inline">
      <h2 id="payouts-h" className="text-section-title font-semibold">Zlecone wypłaty</h2>
      {payouts.length === 0 ? (
        <p className="text-body text-text-muted">Nie zlecono jeszcze żadnej wypłaty w tej sesji prototypu.</p>
      ) : (
        <ul>
          {payouts.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-group border-b border-border-divider py-row-y text-body-dense">
              <span><DateTime value={p.at} timeZone={TZ} /> · na konto {PAYOUT_ACCOUNT}</span>
              <Money amount={p.amount} className="font-semibold" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function PayoutFailedBanner() {
  const retry = useRetry();
  return (
    <Alert variant="danger" role="alert">
      <CircleX aria-hidden="true" />
      <AlertTitle>Ostatnia wypłata nie powiodła się</AlertTitle>
      <AlertDescription>
        Bank odrzucił przelew (nieprawidłowy numer konta). Środki nadal są u Ciebie.{' '}
        <Link href={href('/konto')}>Zaktualizuj dane do wypłat</Link>
      </AlertDescription>
      <AlertAction>
        <Button variant="ghost" size="sm" onClick={retry}>Ukryj komunikat</Button>
      </AlertAction>
    </Alert>
  );
}

function Loaded() {
  const { state, account, now } = useDemo();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const mentorId = account.mentorId ?? 'm1';
  const earnings = state.scenarios.dataState === 'empty' ? [] : state.world.earnings.filter((e) => e.mentorId === mentorId);
  const available = sumNet(earnings.filter((e) => e.status === 'available'));
  const today = now.slice(0, 10);
  const doneToday = state.world.payouts.some((p) => p.mentorId === mentorId && p.at.slice(0, 10) === today);
  const payoutBlock = doneToday
    ? 'Dziś zlecono już wypłatę — limit to jedna ręczna wypłata na dobę. Kolejną zlecisz jutro.'
    : available < PAYOUT_MINIMUM
      ? 'Minimalna kwota wypłaty to 100 zł. Gdy dostępne środki ją osiągną, przycisk się odblokuje.'
      : null;
  return (
    <>
      {state.scenarios.dataState === 'error' ? <PayoutFailedBanner /> : null}
      <Summary earnings={earnings} hours={KASIA_HOURS} payoutBlock={payoutBlock} onPayout={() => { setConfirm(true); }} />
      <section aria-labelledby="history-h" className="flex flex-col gap-inline">
        <div className="flex flex-wrap items-center justify-between gap-inline">
          <h2 id="history-h" className="text-section-title font-semibold">Historia sesji</h2>
          <div className="flex flex-wrap gap-inline">
            <Button variant="outline" size="sm" onClick={() => { toast.add({ title: 'Eksport CSV (symulacja)', description: 'W prototypie nie pobieramy pliku zarobki-2026-10.csv.' }); }}>
              <Download aria-hidden="true" />
              Eksport CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => { toast.add({ title: 'Dane do faktur', description: 'W prototypie nie działa — dane firmy dopisze się w ustawieniach konta.' }); }}>
              Dane do faktur (w prototypie nie działa)
            </Button>
          </div>
        </div>
        {earnings.length === 0 ? (
          <EmptyState
            titleAs="h3"
            icon={<Wallet />}
            title="Brak zarobków"
            description="Rozliczone sesje pojawią się tutaj po pierwszej zakończonej sesji."
            action={<Link href={href('/mentor/kalendarz')}>Sprawdź swoją dostępność</Link>}
          />
        ) : (
          <EarningsTable earnings={earnings} />
        )}
      </section>
      <PayoutHistory />
      <PayoutDialog amount={available} open={confirm} onOpenChange={setConfirm} />
    </>
  );
}

export function M5Earnings() {
  const { state } = useDemo();
  const status = state.scenarios.dataState;
  return (
    <>
      <PageHeader title="Zarobki i wypłaty" description="Kwoty netto po prowizji platformy. Wypłata i eksport w prototypie są symulowane." />
      {status === 'loading' ? (
        <div aria-busy="true" className="flex flex-col gap-section">
          <p className="sr-only">Wczytujemy zarobki…</p>
          <div className="grid grid-cols-1 gap-section md:grid-cols-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-control-lg" />)}
          </div>
          <Skeleton className="h-lh w-full" />
          <Skeleton className="h-lh w-full" />
        </div>
      ) : (
        <Loaded />
      )}
    </>
  );
}
