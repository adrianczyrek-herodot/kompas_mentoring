/**
 * U8 — Plany i saldo.
 * DS-GAP: PlanPicker, TransferBalanceDialog
 */
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Money,
  RadioGroup,
  RadioGroupItem,
} from '@kompas/ui';
import { useState } from 'react';
import type { Route } from '../lib/router';
const zl = (value: number) => BigInt(value) * 100n;
import { useDemo } from '../state/demo-context';

export function U8Plans({ route }: { route: Route }) {
  const { state, account, balanceWith } = useDemo();
  if (account.role !== 'student') return null;

  const [transferOpen, setTransferOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const studentId = account.id as string;
  const currentBalance = balanceWith('m1');

  const plans = [
    {
      id: 'basic',
      name: 'Podstawowy',
      sessionsPerMonth: 1,
      durationMin: 60,
      price: zl(180),
      features: ['1 sesja/miesiąc', '60 minut', 'Kontakt przez wiadomości'],
    },
    {
      id: 'standard',
      name: 'Standardowy',
      sessionsPerMonth: 2,
      durationMin: 60,
      price: zl(340),
      features: ['2 sesje/miesiąc', '60 minut', 'Kontakt przez wiadomości', 'Notatki po sesji'],
    },
    {
      id: 'premium',
      name: 'Premium',
      sessionsPerMonth: 4,
      durationMin: 60,
      price: zl(640),
      features: [
        '4 sesje/miesiąc',
        '60 minut',
        'Kontakt przez wiadomości',
        'Notatki po sesji',
        'Priorytetowe terminy',
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Balance card */}
      <Card className="border-surface-border bg-surface-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-heading-md text-text-primary">Saldo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-dense text-text-muted">Dostępne sesje z mentorem Kasia Nowicka</p>
              <p className="mt-1 text-3xl font-bold text-text-primary">{currentBalance}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setTransferOpen(true); }}
            >
              Przenieś saldo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transfer dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Przeniesienie salda</DialogTitle>
            <DialogDescription>
              Przenieś niewykorzystane sesje do innego mentora.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <label className="text-body-dense text-text-primary">Mentor docelowy</label>
            <select className="rounded border border-surface-border bg-surface-primary px-3 py-2 text-body">
              <option value="">Wybierz mentora...</option>
              <option value="m2">Tomasz Wierzbicki</option>
              <option value="m3">Ewa Sadowska</option>
              <option value="m5">Natalia Kurek</option>
            </select>
            <p className="text-meta text-text-muted">
              Obecnie masz {currentBalance} sesji z Kasią Nowicką.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setTransferOpen(false); }}>
              Anuluj
            </Button>
            <Button disabled>Anuluj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plans */}
      <Card className="border-surface-border bg-surface-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-heading-md text-text-primary">Wybierz plan</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup className="flex flex-col gap-3">
            {plans.map((plan) => (
              <label
                key={plan.id}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-surface-border p-4 hover:border-surface-hover"
              >
                <RadioGroupItem value={plan.id} />
                <div className="flex-1">
                  <p className="text-body-semibold text-text-primary">{plan.name}</p>
                  <p className="mt-1 text-body-dense text-text-muted">
                    {plan.sessionsPerMonth} × {plan.durationMin} min/miesiąc
                  </p>
                  <ul className="mt-2 flex flex-col gap-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="text-meta text-text-muted">
                        • {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-right">
                  <p className="text-body-semibold text-text-primary">
                    <Money amount={plan.price} /> zł
                  </p>
                  <p className="text-meta text-text-muted">/miesiąc</p>
                </div>
              </label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}
