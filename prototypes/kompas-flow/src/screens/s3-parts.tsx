/** S3 sections: payment methods (simulation) and data & privacy (export, delete account). */
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  useToast,
} from '@kompas/ui';
import { useId, useState } from 'react';
import { navigate } from '../lib/router';
import { FailureAlert, useAction } from '../shell/request-feedback';
import { useDemo } from '../state/demo-context';

type Card = { label: string; note: string; expiring: boolean };

const EXPIRING_CARD: Card = { label: 'Visa •••• 4242', note: 'ważna do 10/26', expiring: true };
const NEW_CARD: Card = { label: 'Nowa karta (symulacja)', note: 'ważna do 12/29', expiring: false };

// DS-GAP: PaymentMethodList (KONCEPCJA §S3) — list rows from tokens. Nothing is collected: the
// payment operator embeds its own form in the product; the card here lives only in this view.
export function PaymentMethods() {
  const toast = useToast();
  const action = useAction();
  const [cards, setCards] = useState<Card[]>([EXPIRING_CARD]);
  const [adding, setAdding] = useState(false);
  return (
    <section aria-labelledby="s3-cards" className="flex max-w-form flex-col gap-group">
      <h2 id="s3-cards" className="sr-only">Metody płatności</h2>
      <FailureAlert kind={action.failure} what="Nie zmieniliśmy metody płatności" />
      {cards.length === 0 ? (
        <p className="text-body text-text-muted">Nie masz zapisanej metody płatności.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border-divider rounded-panel border border-border-divider bg-surface-panel">
          {cards.map((card) => (
            <li key={card.label} className="flex flex-wrap items-center justify-between gap-inline p-panel">
              <span className="flex flex-wrap items-center gap-inline text-body">
                {card.label}, {card.note}
                {card.expiring ? <Badge variant="warning">Wygasa</Badge> : null}
              </span>
              <Button
                variant="outline"
                size="sm"
                loading={action.busy}
                onClick={() =>
                  void action.run(() => {
                    setCards((list) => list.filter((c) => c !== card));
                    toast.add({ title: 'Metoda płatności usunięta (symulacja)' });
                  })
                }
              >
                Usuń<span className="sr-only"> {card.label}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div>
        <Button variant="outline" onClick={() => { setAdding(true); }}>Dodaj kartę</Button>
      </div>
      <p className="text-body-dense text-text-muted">W prototypie karty nie są zapisywane — zmiany znikną po odświeżeniu.</p>
      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj kartę</DialogTitle>
            <DialogDescription>
              Tu operator płatności osadzi swój bezpieczny formularz. Prototyp nie prosi o numer karty, datę ani kod CVC.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAdding(false); }}>Anuluj</Button>
            <Button
              onClick={() => {
                setCards([NEW_CARD]);
                setAdding(false);
                toast.add({ title: 'Karta dodana (symulacja)', description: 'Nowa karta zastępuje wygasającą.', type: 'success' });
              }}
            >
              Zasymuluj dodanie karty
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function DeleteAccountDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { state, dispatch, account, studentId } = useDemo();
  const toast = useToast();
  const action = useAction();
  const checkId = useId();
  const [sure, setSure] = useState(false);
  const hasPlan = studentId !== null && state.world.subscriptions.some((s) => s.studentId === studentId && s.status !== 'cancelled');
  return (
    <AlertDialog open={open} onOpenChange={(next) => { if (!action.busy) { action.reset(); setSure(false); onOpenChange(next); } }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Usunąć konto: {account.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Usuniemy Twoje dane osobowe zgodnie z RODO. Tej operacji nie da się cofnąć.
            {hasPlan ? ' Aktywny plan zostanie anulowany.' : ''}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center gap-inline">
          <Checkbox id={checkId} checked={sure} onCheckedChange={setSure} />
          <label htmlFor={checkId} className="text-body">Rozumiem, że konta nie da się odzyskać</label>
        </div>
        <FailureAlert kind={action.failure} what="Konto nie zostało usunięte" />
        <AlertDialogFooter>
          <Button variant="outline" disabled={action.busy} onClick={() => { onOpenChange(false); }}>Zostaw konto</Button>
          <Button
            variant="destructive"
            disabled={!sure}
            loading={action.busy}
            onClick={() =>
              void action.run(() => {
                dispatch({ type: 'delete-account' });
                toast.add({ title: 'Konto usunięte (symulacja)', description: 'W pasku przeglądu konto demo nadal jest dostępne.' });
                navigate('/');
              }, 800)
            }
          >
            Usuń konto
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function DataAndPrivacy() {
  const toast = useToast();
  const action = useAction();
  const [deleting, setDeleting] = useState(false);
  return (
    <section aria-labelledby="s3-data" className="flex max-w-form flex-col gap-group">
      <h2 id="s3-data" className="text-section-title font-semibold">Twoje dane (RODO)</h2>
      <FailureAlert kind={action.failure} what="Nie zleciliśmy eksportu danych" />
      <div className="flex flex-col gap-inline">
        <p className="text-body">Pobierz kopię swoich danych. Wyślemy link e-mailem w ciągu 24 godzin.</p>
        <div>
          <Button
            variant="outline"
            loading={action.busy}
            onClick={() =>
              void action.run(() => {
                toast.add({ title: 'Eksport danych zlecony (symulacja)', description: 'W prototypie e-mail nie jest wysyłany.', type: 'success' });
              }, 700)
            }
          >
            Pobierz moje dane
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-inline">
        <p className="text-body">Usunięcie konta jest nieodwracalne.</p>
        <div>
          <Button variant="destructive" onClick={() => { setDeleting(true); }}>Usuń konto</Button>
        </div>
      </div>
      <DeleteAccountDialog open={deleting} onOpenChange={setDeleting} />
    </section>
  );
}
