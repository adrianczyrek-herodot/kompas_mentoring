/**
 * A2 · Spory i zwroty — detail and resolution. The queue lives in `a2-disputes.tsx`; this file
 * holds the dispute panel, the room-event timeline, the statements and the resolution form.
 */
import {
  Badge,
  Button,
  Card,
  DateTime,
  Field,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  formatMoney,
  Input,
  Money,
  RadioGroup,
  RadioGroupItem,
  Textarea,
  useToast,
} from '@kompas/ui';
import { useId, useState } from 'react';
import type { Dispute, DisputeOutcome } from '../data/trust';
import { TZ } from '../lib/clock';
import { FailureAlert, useAction } from '../shell/request-feedback';
import { useDemo } from '../state/demo-context';

const OUTCOME_LABEL: Record<DisputeOutcome, string> = {
  balance: 'Zwrot sesji do salda ucznia',
  card: 'Zwrot na kartę',
  partial: 'Zwrot częściowy',
  none: 'Bez zwrotu',
};

const OUTCOMES: { value: DisputeOutcome; label: string; hint: string }[] = [
  {
    value: 'balance',
    label: 'Zwrot sesji do salda ucznia',
    hint: 'Jedna sesja wraca do salda ucznia.',
  },
  { value: 'card', label: 'Zwrot na kartę', hint: 'Zwracamy pełną wartość sesji.' },
  {
    value: 'partial',
    label: 'Zwrot częściowy',
    hint: 'Podaj kwotę nie większą niż wartość sesji.',
  },
  { value: 'none', label: 'Bez zwrotu', hint: 'Spór zamyka się bez zwrotu.' },
];

/** „12,50” / „12.5” → grosze, or null when the text is not a positive amount. */
function parseZl(text: string): bigint | null {
  const normalized = text.trim().replace(/\s/g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const [whole = '0', frac = ''] = normalized.split('.');
  return BigInt(whole) * 100n + BigInt(`${frac}00`.slice(0, 2));
}

// DS-GAP: SessionEventTimeline (KONCEPCJA §A2) — the DS has no timeline; an ordered list of the
// room events that prove who joined and when.
function EventTimeline({ events }: { events: string[] }) {
  if (events.length === 0) {
    return <p className="text-body text-text-muted">Brak zapisanych zdarzeń z pokoju.</p>;
  }
  return (
    <ol className="flex flex-col gap-inline border-l border-border-divider pl-group text-body-dense tabular-nums">
      {events.map((event, index) => (
        <li key={`${String(index)}-${event}`}>{event}</li>
      ))}
    </ol>
  );
}

function Statements({ dispute }: { dispute: Dispute }) {
  return (
    <div className="grid grid-cols-1 gap-group md:grid-cols-2">
      <div className="flex flex-col gap-tight rounded-panel border border-border-divider bg-surface-sunken p-group">
        <p className="text-label font-medium text-text-muted">Uczeń · {dispute.studentName}</p>
        <p className="text-body">{dispute.studentSays}</p>
      </div>
      <div className="flex flex-col gap-tight rounded-panel border border-border-divider bg-surface-sunken p-group">
        <p className="text-label font-medium text-text-muted">Mentor · {dispute.mentorName}</p>
        {dispute.mentorSays ? (
          <p className="text-body">{dispute.mentorSays}</p>
        ) : (
          <p className="text-body text-text-muted">Czeka na stanowisko mentora (48 h).</p>
        )}
      </div>
    </div>
  );
}

function Resolution({ dispute }: { dispute: Dispute }) {
  const resolution = dispute.resolution;
  if (!resolution) return null;
  return (
    <section aria-labelledby="a2-resolution" className="flex flex-col gap-inline">
      <h3 id="a2-resolution" className="text-section-title font-semibold text-text-default">
        Rozstrzygnięcie
      </h3>
      <p className="text-body">
        Wynik: <span className="font-medium">{OUTCOME_LABEL[resolution.outcome]}</span>
      </p>
      {resolution.outcome === 'balance' ? (
        <p className="text-body">Jedna sesja wróciła do salda ucznia (widoczne w „Moje sesje”).</p>
      ) : resolution.refund > 0n ? (
        <p className="text-body">
          Kwota zwrotu: <Money amount={resolution.refund} className="font-semibold" />
        </p>
      ) : (
        <p className="text-body text-text-muted">Bez zwrotu.</p>
      )}
      <p className="max-w-measure text-body">{resolution.message}</p>
    </section>
  );
}

function ResolutionForm({
  dispute,
  onResolved,
}: {
  dispute: Dispute;
  onResolved: (id: string) => void;
}) {
  const { dispatch } = useDemo();
  const toast = useToast();
  const action = useAction();
  const amountId = useId();
  const messageId = useId();
  const [outcome, setOutcome] = useState<DisputeOutcome | ''>('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (key: string) => {
    setErrors((current) =>
      Object.fromEntries(Object.entries(current).filter(([name]) => name !== key)),
    );
  };

  const submit = () => {
    const found: Record<string, string> = {};
    if (!outcome) found['outcome'] = 'Wybierz rozstrzygnięcie.';
    if (outcome === 'partial') {
      const parsed = parseZl(amount);
      if (parsed === null || parsed <= 0n || parsed > dispute.amount) {
        found['amount'] =
          `Podaj kwotę od 1 do ${formatMoney(dispute.amount)} (nie więcej niż wartość sesji).`;
      }
    }
    const length = message.trim().length;
    if (length < 20 || length > 1000) found['message'] = 'Uzasadnienie musi mieć 20–1000 znaków.';
    setErrors(found);
    if (!outcome || Object.keys(found).length > 0) return;
    const refund =
      outcome === 'card' ? dispute.amount : outcome === 'partial' ? (parseZl(amount) ?? 0n) : 0n;
    void action.run(() => {
      dispatch({
        type: 'resolve-dispute',
        id: dispute.id,
        outcome,
        refund,
        message: message.trim(),
      });
      onResolved(dispute.id);
      toast.add({
        title: 'Spór rozstrzygnięty',
        description: 'Obie strony dostały powiadomienie, decyzja jest w dzienniku audytu.',
      });
    });
  };

  const active = OUTCOMES.find((item) => item.value === outcome);

  return (
    <FieldSet data-invalid={errors['outcome'] ? true : undefined}>
      <FieldLegend>Rozstrzygnięcie</FieldLegend>
      <RadioGroup
        value={outcome}
        onValueChange={(next) => {
          setOutcome(String(next) as DisputeOutcome);
          clearError('outcome');
        }}
      >
        {OUTCOMES.map((item) => (
          <label key={item.value} className="flex flex-col gap-tight text-body">
            <span className="flex items-center gap-inline">
              <RadioGroupItem value={item.value} />
              {item.label}
            </span>
            <span className="pl-group text-body-dense text-text-muted">{item.hint}</span>
          </label>
        ))}
      </RadioGroup>
      {errors['outcome'] ? <FieldError>{errors['outcome']}</FieldError> : null}

      {outcome === 'card' ? (
        <p className="text-body-dense">
          Zwrócimy pełną wartość sesji: <Money amount={dispute.amount} className="font-medium" />.
        </p>
      ) : null}
      {outcome === 'balance' ? (
        <p className="text-body-dense">Uczeń odzyska 1 sesję (nie kwotę).</p>
      ) : null}
      {outcome === 'none' ? (
        <p className="text-body-dense">Bez zwrotu — strony dostaną uzasadnienie.</p>
      ) : null}
      {outcome === 'partial' ? (
        <Field data-invalid={errors['amount'] ? true : undefined}>
          <FieldLabel htmlFor={amountId}>
            Kwota zwrotu w zł (maks. {formatMoney(dispute.amount)})
          </FieldLabel>
          <Input
            id={amountId}
            inputMode="decimal"
            placeholder="np. 120,00"
            value={amount}
            aria-invalid={errors['amount'] ? true : undefined}
            onChange={(event) => {
              setAmount(event.target.value);
              clearError('amount');
            }}
          />
          {errors['amount'] ? <FieldError>{errors['amount']}</FieldError> : null}
        </Field>
      ) : null}

      <Field data-invalid={errors['message'] ? true : undefined}>
        <FieldLabel htmlFor={messageId}>Wiadomość do stron (20–1000 znaków)</FieldLabel>
        <Textarea
          id={messageId}
          rows={4}
          maxLength={1000}
          showCount
          value={message}
          aria-invalid={errors['message'] ? true : undefined}
          onChange={(event) => {
            setMessage(event.target.value);
            clearError('message');
          }}
        />
        {errors['message'] ? (
          <FieldError>{errors['message']}</FieldError>
        ) : (
          <p className="text-body-dense text-text-muted">
            Obie strony zobaczą tę wiadomość razem z decyzją.
          </p>
        )}
      </Field>

      <FailureAlert kind={action.failure} what="Spór nie został rozstrzygnięty" />
      <div className="flex flex-wrap items-center gap-inline">
        <Button loading={action.busy} onClick={submit}>
          Rozstrzygnij spór
        </Button>
        {active ? (
          <p className="text-body-dense text-text-muted">Wybrano: {active.label}.</p>
        ) : null}
      </div>
    </FieldSet>
  );
}

export function DisputeDetail({
  dispute,
  onResolved,
}: {
  dispute: Dispute;
  onResolved: (id: string) => void;
}) {
  const resolved = dispute.status === 'resolved';
  return (
    <Card>
      <header className="flex flex-wrap items-start justify-between gap-group">
        <div className="flex flex-col gap-tight">
          <h2 className="text-section-title font-semibold text-text-default">{dispute.reason}</h2>
          <p className="text-body-dense text-text-muted">
            Sesja {dispute.sessionLabel} · {dispute.studentName} ↔ {dispute.mentorName} · zgłoszono{' '}
            <DateTime value={dispute.opened} timeZone={TZ} />
          </p>
        </div>
        <Badge variant={resolved ? 'success' : 'warning'}>
          {resolved ? 'Rozstrzygnięty' : 'Otwarty'}
        </Badge>
      </header>

      <p className="text-body">
        Wartość sesji: <Money amount={dispute.amount} className="font-semibold" />
      </p>

      <section aria-labelledby="a2-timeline" className="flex flex-col gap-inline">
        <h3 id="a2-timeline" className="text-section-title font-semibold text-text-default">
          Oś zdarzeń pokoju
        </h3>
        <EventTimeline events={dispute.events} />
      </section>

      <Statements dispute={dispute} />

      {resolved ? (
        <Resolution dispute={dispute} />
      ) : (
        <ResolutionForm dispute={dispute} onResolved={onResolved} />
      )}
    </Card>
  );
}
