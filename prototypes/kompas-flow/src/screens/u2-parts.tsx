/** U2 building blocks: order summary, simulated payment method, promo code. */
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DateTime,
  Field,
  FieldError,
  FieldLabel,
  FieldSet,
  FieldLegend,
  Input,
  Money,
  RadioGroup,
  RadioGroupItem,
} from '@kompas/ui';
import { ShieldCheck } from 'lucide-react';
import { type ReactNode, useId, useState } from 'react';
import { type Mentor, PROMO_CODE, PROMO_PERCENT, TRIAL_SERVICE_FEE } from '../data/mentors';
import type { Draft, PaymentMethod } from '../state/demo-state';

export function priceOf(mentor: Mentor, draft: Draft) {
  const price = mentor.trialPrice;
  const discount = draft.promoApplied ? (price * PROMO_PERCENT) / 100n : 0n;
  return { price, discount, fee: TRIAL_SERVICE_FEE, total: price - discount + TRIAL_SERVICE_FEE };
}

function Row({ term, children, strong }: { term: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-inline ${strong ? 'font-semibold' : ''}`}>
      <dt className={strong ? 'text-body' : 'text-body-dense text-text-muted'}>{term}</dt>
      <dd className="text-body tabular-nums">{children}</dd>
    </div>
  );
}

// DS-GAP: OrderSummary (KONCEPCJA §U2) — Card + definition list.
export function OrderSummary({
  mentor,
  draft,
  balance,
  children,
}: {
  mentor: Mentor;
  draft: Draft;
  balance: number;
  children: ReactNode;
}) {
  const { price, discount, fee, total } = priceOf(mentor, draft);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Podsumowanie</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-group">
        <dl className="flex flex-col gap-tight">
          <Row term="Mentor">{mentor.name}</Row>
          <Row term="Termin">
            {draft.startsAt ? <DateTime value={draft.startsAt} timeZone={draft.timeZone} /> : '—'}
          </Row>
          <Row term="Czas trwania">{draft.durationMin} min</Row>
          {draft.type === 'trial' ? (
            <>
              <Row term="Sesja próbna">
                <Money amount={price} />
              </Row>
              <Row term="Opłata serwisowa">
                <Money amount={fee} />
              </Row>
              {discount > 0n ? (
                <Row term={`Rabat ${PROMO_CODE}`}>
                  −<Money amount={discount} />
                </Row>
              ) : null}
              <Row term="Razem" strong>
                <Money amount={total} />
              </Row>
            </>
          ) : (
            <Row term="Saldo po rezerwacji" strong>
              {balance - 1} z {balance}
            </Row>
          )}
        </dl>
        {children}
        {draft.type === 'trial' ? (
          // DS-GAP: GuaranteeNote.
          <p className="flex items-start gap-inline text-body-dense">
            <ShieldCheck aria-hidden="true" className="size-icon-md shrink-0 text-status-success-fg" />
            Gwarancja sesji próbnej: zamiana mentora albo zwrot pieniędzy.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'card', label: 'Karta płatnicza' },
  { value: 'blik', label: 'BLIK' },
  { value: 'p24', label: 'Przelewy24' },
];

// DS-GAP: PaymentMethodSelector — in the app the operator embeds its own fields; here nothing is
// collected (task rule 4): no card number, no BLIK code, no bank login.
export function PaymentMethodSelector({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}) {
  return (
    <FieldSet>
      <FieldLegend>Metoda płatności</FieldLegend>
      <RadioGroup
        value={value}
        onValueChange={(next) => {
          onChange(next as PaymentMethod);
        }}
      >
        {METHODS.map((method) => (
          <label key={method.value} className="flex items-center gap-inline text-body">
            <RadioGroupItem value={method.value} />
            {method.label}
          </label>
        ))}
      </RadioGroup>
      <p className="rounded-control border border-border-control bg-surface-sunken p-panel text-body-dense">
        Symulacja płatności: tu operator płatności osadzi swoje pola (
        {METHODS.find((m) => m.value === value)?.label}). Prototyp nie prosi o dane karty, kod BLIK
        ani logowanie do banku i niczego nie obciąża.
      </p>
    </FieldSet>
  );
}

// DS-GAP: PromoCodeField — Field + Input + Button; the server validates codes in the app.
export function PromoCodeField({ applied, onApply }: { applied: boolean; onApply: () => void }) {
  const id = useId();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  if (applied) {
    return <p className="text-body-dense">Kod {PROMO_CODE} zastosowany: −10% ceny sesji.</p>;
  }
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>Kod rabatowy (opcjonalnie)</FieldLabel>
      <div className="flex gap-inline">
        <Input
          id={id}
          value={code}
          aria-invalid={error ? true : undefined}
          onChange={(event) => {
            setCode(event.target.value);
            setError(null);
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (code.trim().toUpperCase() === PROMO_CODE) onApply();
            else setError('Ten kod jest nieprawidłowy lub wygasł.');
          }}
        >
          Zastosuj
        </Button>
      </div>
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}
