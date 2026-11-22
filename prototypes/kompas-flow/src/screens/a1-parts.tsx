/**
 * A1 · Weryfikacja mentorów — detail and shared bits. The queue lives in `a1-verification.tsx`;
 * this file holds the application panel, the audit log and the helpers both use.
 */
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  Checkbox,
  DateTime,
  Field,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  initialsOf,
  RadioGroup,
  RadioGroupItem,
  Textarea,
  useToast,
} from '@kompas/ui';
import { Play, ShieldCheck } from 'lucide-react';
import { useId, useState } from 'react';
import {
  type Application,
  type AuditEntry,
  FIELDS_TO_FIX,
  type Kyc,
  VERIFICATION_CHECKLIST,
} from '../data/trust';
import { TZ, toMs } from '../lib/clock';
import { replace } from '../lib/router';
import { FailureAlert, useAction } from '../shell/request-feedback';
import { useDemo } from '../state/demo-context';

export type Decision = 'approve' | 'changes' | 'reject';

export const KYC: Record<Kyc, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  verified: { label: 'KYC: zweryfikowano', variant: 'success' },
  pending: { label: 'KYC: oczekuje', variant: 'warning' },
  mismatch: { label: 'KYC: niezgodność', variant: 'danger' },
};

const DECISION_TOAST: Record<Decision, { title: string; description: string }> = {
  approve: {
    title: 'Profil opublikowany',
    description: 'Kandydat może już korzystać z panelu mentora.',
  },
  changes: {
    title: 'Wysłano prośbę o zmiany',
    description: 'Kandydat dostanie listę pól i komentarz w M1.',
  },
  reject: { title: 'Zgłoszenie odrzucone', description: 'Kandydat dostanie powód odrzucenia.' },
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Age of the application in calendar days, counted from „now” of the demo clock. */
export function ageInDays(submitted: string, now: string): number {
  return Math.max(0, Math.floor((toMs(now) - toMs(`${submitted}T00:00:00+02:00`)) / DAY_MS));
}

export function ageText(days: number): string {
  if (days === 0) return 'dziś';
  if (days === 1) return '1 dzień';
  return `${String(days)} dni`;
}

export function SubmittedDate({ date }: { date: string }) {
  return <DateTime value={`${date}T12:00:00+02:00`} timeZone={TZ} format="date" />;
}

// DS-GAP: AuditLog (KONCEPCJA §A1) — the DS has no log component; a plain list of `world.audit`.
export function AuditLog({ entries }: { entries: AuditEntry[] }) {
  return (
    <section aria-labelledby="a1-audit" className="flex flex-col gap-inline">
      <h2 id="a1-audit" className="text-section-title font-semibold text-text-default">
        Dziennik audytu
      </h2>
      {entries.length === 0 ? (
        <p className="text-body text-text-muted">
          Brak wpisów — pojawią się tutaj po pierwszych decyzjach.
        </p>
      ) : (
        <ul className="flex flex-col">
          {entries.slice(0, 8).map((entry, index) => (
            <li
              key={`${entry.at}-${String(index)}`}
              className="flex flex-wrap items-baseline justify-between gap-inline border-b border-border-divider py-row-y text-body-dense"
            >
              <span>
                <DateTime value={entry.at} timeZone={TZ} /> ·{' '}
                <span className="text-text-muted">{entry.actor}</span> {entry.action}
              </span>
              <span className="text-text-muted">{entry.subject}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Checklist({
  app,
  checked,
  onChange,
}: {
  app: Application;
  checked: string[];
  onChange: (item: string, on: boolean) => void;
}) {
  return (
    <FieldSet>
      <FieldLegend>Checklista weryfikacji</FieldLegend>
      <ul className="flex flex-col gap-inline">
        {VERIFICATION_CHECKLIST.map((item, index) => {
          const id = `${app.id}-chk-${String(index)}`;
          return (
            <li key={item} className="flex items-start gap-inline">
              <Checkbox
                id={id}
                checked={checked.includes(item)}
                onCheckedChange={(on) => {
                  onChange(item, on);
                }}
              />
              <label htmlFor={id} className="text-body">
                {item}
              </label>
            </li>
          );
        })}
      </ul>
    </FieldSet>
  );
}

function VideoPanel() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap items-center gap-group rounded-panel border border-border-divider bg-surface-sunken p-group">
      <Play aria-hidden="true" className="size-icon-lg text-text-muted" />
      <div className="flex min-w-0 flex-col gap-tight">
        <p className="text-body font-medium">Wideo powitalne</p>
        <p className="text-body-dense text-text-muted">
          Symulacja — w prototypie nie odtwarzamy nagrania kandydata.
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="md:ml-auto"
        onClick={() => {
          toast.add({
            title: 'Wideo powitalne (symulacja)',
            description:
              'W prototypie nie odtwarzamy wideo — oceń je na podstawie wniosku kandydata.',
          });
        }}
      >
        Odtwórz (symulacja)
      </Button>
    </div>
  );
}

export function ApplicationDetail({ app, now }: { app: Application; now: string }) {
  const { dispatch } = useDemo();
  const toast = useToast();
  const action = useAction();
  const commentId = useId();
  const [decision, setDecision] = useState<Decision | ''>('');
  const [fields, setFields] = useState<string[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const age = ageInDays(app.submitted, now);
  const kyc = KYC[app.kyc];
  const allChecked = VERIFICATION_CHECKLIST.every((item) => checked.includes(item));
  const needsComment = decision === 'changes' || decision === 'reject';

  const clearError = (key: string) => {
    setErrors((current) =>
      Object.fromEntries(Object.entries(current).filter(([name]) => name !== key)),
    );
  };

  const submit = () => {
    const found: Record<string, string> = {};
    if (!decision) found['decision'] = 'Wybierz decyzję.';
    else if (decision === 'approve' && app.kyc !== 'verified') {
      found['decision'] = 'Nie można zatwierdzić bez pozytywnej weryfikacji KYC.';
    } else if (decision === 'approve' && !allChecked) {
      found['decision'] = 'Odhacz całą checklistę przed zatwierdzeniem.';
    }
    if (decision === 'changes' && fields.length === 0) {
      found['fields'] = 'Wskaż co najmniej jedno pole do poprawy.';
    }
    if (needsComment) {
      const length = comment.trim().length;
      if (length < 10 || length > 1000) found['comment'] = 'Komentarz musi mieć 10–1000 znaków.';
    }
    setErrors(found);
    if (!decision || Object.keys(found).length > 0) return;
    void action.run(() => {
      dispatch({
        type: 'decide-application',
        id: app.id,
        decision,
        fields,
        comment: comment.trim(),
      });
      replace('/admin/weryfikacja');
      toast.add(DECISION_TOAST[decision]);
    });
  };

  return (
    <Card>
      <header className="flex flex-wrap items-start gap-group">
        <Avatar size="lg">
          <AvatarFallback>{initialsOf(app.name)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-tight">
          <h2 className="text-section-title font-semibold text-text-default">{app.name}</h2>
          <p className="text-body text-text-muted">{app.headline}</p>
          <div className="flex flex-wrap items-center gap-inline">
            <Badge variant={kyc.variant}>{kyc.label}</Badge>
            <Badge variant="neutral">{app.linkedin ? 'LinkedIn podany' : 'Brak LinkedIn'}</Badge>
            {app.categories.map((category) => (
              <Badge key={category} variant="neutral">
                {category}
              </Badge>
            ))}
          </div>
          <p className="text-meta text-text-muted">
            Zgłoszono <SubmittedDate date={app.submitted} /> · {ageText(age)} temu
          </p>
        </div>
      </header>

      <VideoPanel />

      <Checklist
        app={app}
        checked={checked}
        onChange={(item, on) => {
          setChecked((current) => (on ? [...current, item] : current.filter((x) => x !== item)));
          clearError('decision');
        }}
      />

      <FieldSet data-invalid={errors['decision'] ? true : undefined}>
        <FieldLegend>Decyzja</FieldLegend>
        <RadioGroup
          value={decision}
          onValueChange={(next) => {
            setDecision(String(next) as Decision);
            clearError('decision');
          }}
        >
          <label className="flex items-center gap-inline text-body">
            <RadioGroupItem value="approve" />
            Zatwierdź profil
          </label>
          <label className="flex items-center gap-inline text-body">
            <RadioGroupItem value="changes" />
            Poproś o zmiany
          </label>
          <label className="flex items-center gap-inline text-body">
            <RadioGroupItem value="reject" />
            Odrzuć wniosek
          </label>
        </RadioGroup>
        {errors['decision'] ? <FieldError>{errors['decision']}</FieldError> : null}
      </FieldSet>

      {decision === 'changes' ? (
        <FieldSet data-invalid={errors['fields'] ? true : undefined}>
          <FieldLegend variant="label">Pola do poprawy</FieldLegend>
          <div className="flex flex-wrap gap-group">
            {FIELDS_TO_FIX.map((field, index) => {
              const id = `${app.id}-fix-${String(index)}`;
              return (
                <div key={field} className="flex items-center gap-inline">
                  <Checkbox
                    id={id}
                    checked={fields.includes(field)}
                    onCheckedChange={(on) => {
                      setFields((current) =>
                        on ? [...current, field] : current.filter((x) => x !== field),
                      );
                      clearError('fields');
                    }}
                  />
                  <label htmlFor={id} className="text-body">
                    {field}
                  </label>
                </div>
              );
            })}
          </div>
          {errors['fields'] ? <FieldError>{errors['fields']}</FieldError> : null}
        </FieldSet>
      ) : null}

      {needsComment ? (
        <Field data-invalid={errors['comment'] ? true : undefined}>
          <FieldLabel htmlFor={commentId}>
            {decision === 'reject'
              ? 'Powód odrzucenia (10–1000 znaków)'
              : 'Komentarz dla kandydata (10–1000 znaków)'}
          </FieldLabel>
          <Textarea
            id={commentId}
            rows={4}
            maxLength={1000}
            showCount
            value={comment}
            aria-invalid={errors['comment'] ? true : undefined}
            onChange={(event) => {
              setComment(event.target.value);
              clearError('comment');
            }}
          />
          {errors['comment'] ? <FieldError>{errors['comment']}</FieldError> : null}
        </Field>
      ) : null}

      <FailureAlert kind={action.failure} what="Decyzja nie została zapisana" />
      <div className="flex flex-wrap items-center gap-inline">
        <Button loading={action.busy} onClick={submit}>
          Zapisz decyzję
        </Button>
        <p className="flex items-center gap-tight text-body-dense text-text-muted">
          <ShieldCheck aria-hidden="true" className="size-icon-sm" />
          Każda decyzja trafia do dziennika audytu.
        </p>
      </div>
    </Card>
  );
}
