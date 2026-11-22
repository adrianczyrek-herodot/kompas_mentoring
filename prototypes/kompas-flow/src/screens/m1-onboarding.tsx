/** M1 · Onboarding mentora, 6 kroków (KONCEPCJA §M1, F4). The step comes from the route, the draft from the demo state. */
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ErrorState,
  initialsOf,
  Link,
  PageHeader,
  Skeleton,
  useToast,
} from '@kompas/ui';
import { CircleCheck, CircleX, Clock, TriangleAlert } from 'lucide-react';
import { type SyntheticEvent, useState } from 'react';
import type { Application } from '../data/trust';
import { mentorById } from '../data/mentors';
import { href, navigate, type Route } from '../lib/router';
import { FailureAlert, useAction } from '../shell/request-feedback';
import { useDemo, useRetry } from '../state/demo-context';
import { applicationOf } from '../state/world';
import {
  draftValues,
  type Errors,
  Step1,
  Step2,
  Step3,
  Step4,
  Step5,
  Step6,
  STEP_NAMES,
  type StepProps,
  validateStep,
  type Values,
} from './m1-steps';

const STEP_KEYS: Record<number, string[]> = {
  1: ['photo', 'name', 'country', 'languages'],
  2: ['categories', 'tags', 'years', 'companies'],
  3: ['headline', 'bio', 'video', 'videoUrl'],
  4: ['rate'],
  5: ['availability'],
  6: ['linkedin', 'kyc', 'iban', 'terms'],
};

const BODIES = [Step1, Step2, Step3, Step4, Step5, Step6];

// DS-GAP: OnboardingStepper (KONCEPCJA §M1) — an ordered list with aria-current and text state.
function Stepper({ step }: { step: number }) {
  return (
    <nav aria-label="Postęp onboardingu">
      <p className="text-meta text-text-muted">Krok {step} z 6</p>
      <ol className="flex flex-wrap gap-x-group gap-y-tight text-body-dense">
        {STEP_NAMES.map((name, index) => {
          const n = index + 1;
          return (
            <li key={name} aria-current={n === step ? 'step' : undefined} className={n === step ? 'font-semibold text-text-link' : n < step ? 'text-text-default' : 'text-text-muted'}>
              {n}. {name}
              {n < step ? <span className="sr-only"> (ukończony)</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** The value, or the placeholder while the field is still empty. */
const orText = (value: string | undefined, placeholder: string) => (value?.trim() ? value : placeholder);

function PreviewDialog({ values, open, onOpenChange }: { values: Values; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel="Zamknij podgląd">
        <DialogHeader>
          <DialogTitle>Podgląd karty w wynikach</DialogTitle>
          <DialogDescription>Tak zobaczą Cię uczniowie na liście mentorów (na podstawie wpisanych danych).</DialogDescription>
        </DialogHeader>
        <div className="flex items-start gap-inline">
          <Avatar size="md"><AvatarFallback>{initialsOf(orText(values['name'], 'Nowy mentor'))}</AvatarFallback></Avatar>
          <div className="flex flex-col gap-tight">
            <p className="text-body font-semibold">{orText(values['name'], 'Twoje imię')}</p>
            <p className="text-body-dense">{orText(values['headline'], 'Twój nagłówek')}</p>
            <p className="text-body-dense text-text-muted">{orText(values['bio'], 'Twój opis…').slice(0, 180)}{(values['bio'] ?? '').length > 180 ? '…' : ''}</p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => { onOpenChange(false); }}>Zamknij</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DecisionBanner({ application }: { application: Application }) {
  const decision = application.decision;
  return (
    <Alert variant="warning" role="status">
      <TriangleAlert aria-hidden="true" />
      <AlertTitle>Zespół zaufania prosi o poprawki</AlertTitle>
      <AlertDescription>
        {decision?.comment ? <p>{decision.comment}</p> : null}
        {decision?.fields.length ? (
          <p className="flex flex-wrap items-center gap-tight">
            Do poprawy: {decision.fields.map((f) => <Badge key={f} variant="warning">{f}</Badge>)}
          </p>
        ) : null}
        <p>Popraw dane w krokach i wyślij wniosek ponownie w ostatnim kroku.</p>
      </AlertDescription>
    </Alert>
  );
}

function Wizard({ step, application }: { step: number; application: Application | undefined }) {
  const { state, dispatch, account } = useDemo();
  const toast = useToast();
  const save = useAction();
  const sim = useAction();
  const mentor = mentorById(account.mentorId);
  const stored = draftValues(mentor, state.world.onboardingDraft);
  const [values, setValues] = useState<Values>(stored);
  const [errors, setErrors] = useState<Errors>({});
  const [skipped, setSkipped] = useState<number[]>([]);
  const [simBusy, setSimBusy] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const Body = BODIES[step - 1] ?? Step1;
  const set = (key: string, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => k !== key)));
  };
  const patchOf = (n: number): Values => Object.fromEntries((STEP_KEYS[n] ?? []).map((k) => [k, values[k] ?? '']));
  const f: StepProps = {
    values,
    errors,
    set,
    simBusy,
    simulate: (key, value) => {
      setSimBusy(key);
      void sim.run(() => { set(key, value); }, 900).finally(() => { setSimBusy(null); });
    },
  };

  const submit = (event: SyntheticEvent) => {
    event.preventDefault();
    const found = validateStep(step, values);
    setErrors(found);
    setSkipped([]);
    if (Object.keys(found).length > 0) return;
    if (step < 6) {
      void save.run(() => {
        dispatch({ type: 'save-onboarding', patch: patchOf(step) });
        toast.add({ title: 'Zapisano szkic', description: `Krok ${String(step)} z 6 gotowy.` });
        navigate(`/mentor/onboarding/${String(step + 1)}`);
      });
      return;
    }
    // Last step: every earlier step must hold valid data too (a direct link can skip steps).
    const all = { ...stored, ...values };
    const bad = [1, 2, 3, 4, 5].filter((n) => Object.keys(validateStep(n, all)).length > 0);
    if (bad.length > 0) {
      setSkipped(bad);
      return;
    }
    void save.run(() => {
      dispatch({ type: 'save-onboarding', patch: patchOf(6) });
      dispatch({ type: 'submit-application', accountId: account.id });
      toast.add({ title: 'Wysłano do weryfikacji', description: 'Zwykle sprawdzamy wnioski do 2 dni roboczych.' });
    });
  };

  const back = () => {
    // Going back keeps what was typed: the draft is saved without validation.
    dispatch({ type: 'save-onboarding', patch: patchOf(step) });
    navigate(`/mentor/onboarding/${String(step - 1)}`);
  };

  const count = Object.keys(errors).length;
  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-group">
      <h2 className="text-section-title font-semibold">{STEP_NAMES[step - 1]}</h2>
      {count > 0 ? (
        <Alert variant="danger" role="alert">
          <CircleX aria-hidden="true" />
          <AlertTitle>Popraw {count === 1 ? 'zaznaczone pole' : 'zaznaczone pola'}</AlertTitle>
          <AlertDescription>Nic nie zostało zapisane. Wpisane dane zostały w formularzu.</AlertDescription>
        </Alert>
      ) : null}
      {skipped.length > 0 ? (
        <Alert variant="danger" role="alert">
          <CircleX aria-hidden="true" />
          <AlertTitle>Wniosek ma niepełne kroki</AlertTitle>
          <AlertDescription>
            <ul>
              {skipped.map((n) => (
                <li key={n}><Link href={href(`/mentor/onboarding/${String(n)}`)}>Krok {n}: {STEP_NAMES[n - 1]}</Link> — uzupełnij dane</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : null}
      <FailureAlert kind={sim.failure} what="Nie udało się dodać pliku (symulacja)" />
      <Body f={f} />
      <FailureAlert kind={save.failure} what={step === 6 ? 'Wniosek nie został wysłany' : 'Krok nie został zapisany'} />
      <div className="flex flex-wrap items-center justify-between gap-inline">
        {step > 1 ? <Button type="button" variant="ghost" disabled={save.busy} onClick={back}>Wstecz</Button> : <span />}
        <div className="flex flex-wrap gap-inline">
          {step === 3 ? <Button type="button" variant="outline" onClick={() => { setPreview(true); }}>Podgląd profilu</Button> : null}
          <Button type="submit" loading={save.busy}>
            {step === 6 ? (application?.status === 'changes_requested' ? 'Wyślij ponownie' : 'Wyślij do weryfikacji') : 'Zapisz i dalej'}
          </Button>
        </div>
      </div>
      <p className="text-meta text-text-muted">Szkic zapisuje się po każdym kroku — możesz wrócić później.</p>
      <PreviewDialog values={values} open={preview} onOpenChange={setPreview} />
    </form>
  );
}

function StatusView({ application }: { application: Application | undefined }) {
  const { account } = useDemo();
  if (!application) {
    // An approved mentor without an application of their own (Kasia).
    return (
      <Alert variant="success" role="status">
        <CircleCheck aria-hidden="true" />
        <AlertTitle>Profil zatwierdzony</AlertTitle>
        <AlertDescription>
          Twój profil jest publiczny, nie musisz nic uzupełniać. <Link href={href('/mentor')}>Przejdź do panelu mentora</Link>
        </AlertDescription>
      </Alert>
    );
  }
  const decision = application.decision;
  if (application.status === 'approved') {
    return (
      <Alert variant="success" role="status">
        <CircleCheck aria-hidden="true" />
        <AlertTitle>Profil zatwierdzony</AlertTitle>
        <AlertDescription>Gratulacje, {account.name} — Twój profil jest publiczny. <Link href={href('/mentor')}>Przejdź do panelu mentora</Link></AlertDescription>
      </Alert>
    );
  }
  if (application.status === 'rejected') {
    return (
      <Alert variant="danger" role="alert">
        <CircleX aria-hidden="true" />
        <AlertTitle>Wniosek odrzucony</AlertTitle>
        <AlertDescription>
          {decision?.comment ? <p>Powód: {decision.comment}</p> : <p>Zespół zaufania nie podał powodu.</p>}
          {decision?.fields.length ? <p className="flex flex-wrap items-center gap-tight">Dotyczy: {decision.fields.map((f) => <Badge key={f} variant="danger">{f}</Badge>)}</p> : null}
        </AlertDescription>
      </Alert>
    );
  }
  return (
    <div className="flex flex-col gap-group">
      <Alert variant="neutral" role="status">
        <Clock aria-hidden="true" />
        <AlertTitle>W weryfikacji, zwykle do 2 dni roboczych</AlertTitle>
        <AlertDescription>
          Wniosek wysłany {application.submitted}. Damy znać w powiadomieniach i e-mailem — jeśli czegoś zabraknie, wskażemy konkretne pola. Panel, kalendarz i zarobki otworzą się po zatwierdzeniu.
        </AlertDescription>
      </Alert>
      <ol className="flex flex-wrap gap-group text-body-dense" aria-label="Status wniosku">
        <li>Szkic — gotowe</li>
        <li className="font-semibold text-text-link" aria-current="step">Weryfikacja — w toku</li>
        <li className="text-text-muted">Profil publiczny</li>
      </ol>
      <p className="max-w-measure text-body-dense text-text-muted">W prototypie wniosek rozpatruje konto „Zespół zaufania” (przełącz konto demo w pasku przeglądu) — Twój profil zmieni status od razu.</p>
    </div>
  );
}

export function M1Onboarding({ route }: { route: Route }) {
  const { state, account } = useDemo();
  const retry = useRetry();
  const status = state.scenarios.dataState;
  const application = applicationOf(state.world, account.id);
  const requested = Number(route.params['krok']);
  const step = Math.min(6, Math.max(1, Number.isInteger(requested) ? requested : 1));
  const editable = application ? application.status === 'changes_requested' : !account.approved;
  return (
    <>
      <PageHeader title="Zostań mentorem" description="Sześć krótkich kroków, a potem weryfikacja zespołu zaufania." />
      {status === 'loading' ? (
        <div aria-busy="true" className="flex flex-col gap-group">
          <p className="sr-only">Wczytujemy szkic…</p>
          <Skeleton className="h-lh w-1/2" />
          <Skeleton className="h-control-lg w-full" />
          <Skeleton className="h-control-lg w-full" />
        </div>
      ) : status === 'error' ? (
        <ErrorState titleAs="h2" title="Nie udało się wczytać szkicu" description="Sprawdź połączenie i spróbuj ponownie." action={<Button variant="outline" onClick={retry}>Ponów</Button>} />
      ) : !editable ? (
        <StatusView application={application} />
      ) : (
        <div className="flex max-w-form flex-col gap-group">
          {application?.status === 'changes_requested' ? <DecisionBanner application={application} /> : null}
          <Stepper step={step} />
          <Wizard key={step} step={step} application={application} />
        </div>
      )}
    </>
  );
}

