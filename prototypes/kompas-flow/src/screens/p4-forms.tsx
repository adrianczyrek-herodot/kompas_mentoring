/**
 * P4 forms. Validation from KONCEPCJA §P4: e-mail, password ≥ 10 characters, name 2–50, terms
 * required, marketing optional and unchecked. Typed values survive a failed request.
 */
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Checkbox,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
  FieldLegend,
  Input,
  RadioGroup,
  RadioGroupItem,
} from '@kompas/ui';
import { CircleX } from 'lucide-react';
import { type SyntheticEvent, useId, useState } from 'react';
import { useFakeRequest } from '../state/demo-context';

type Errors = Partial<Record<'name' | 'email' | 'password' | 'terms', string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RequestError({ kind }: { kind: 'network' | 'server' | null }) {
  if (!kind) return null;
  return (
    <Alert variant="danger" role="alert">
      <CircleX aria-hidden="true" />
      <AlertTitle>Nie udało się wysłać formularza</AlertTitle>
      <AlertDescription>
        {kind === 'network'
          ? 'Brak połączenia z internetem. Wpisane dane zostały — spróbuj ponownie.'
          : 'To błąd po naszej stronie. Wpisane dane zostały — spróbuj ponownie za chwilę.'}
      </AlertDescription>
    </Alert>
  );
}

function TextField({
  label,
  type = 'text',
  value,
  error,
  description,
  autoComplete,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  error: string | undefined;
  description?: string;
  autoComplete: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
      {error ? <FieldError>{error}</FieldError> : null}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
    </Field>
  );
}

// DS-GAP: PasswordField with a strength meter — strength as text, never colour alone.
function strengthOf(password: string): string {
  if (password.length < 10) return 'za krótkie (minimum 10 znaków)';
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;
  return kinds >= 3 ? 'dobre' : 'średnie — dodaj cyfry, wielkie litery lub znaki specjalne';
}

export function LoginForm({ onSuccess, onForgot }: { onSuccess: () => void; onForgot: () => void }) {
  const request = useFakeRequest();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<'network' | 'server' | null>(null);

  const submit = async (event: SyntheticEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!EMAIL.test(email.trim())) next.email = 'Podaj adres e-mail w formacie nazwa@domena.pl.';
    if (!password) next.password = 'Podaj hasło.';
    setErrors(next);
    if (Object.keys(next).length > 0 || busy) return;
    setBusy(true);
    setFailure(null);
    const answer = await request();
    setBusy(false);
    if (answer.ok) onSuccess();
    else setFailure(answer.kind);
  };

  return (
    <form noValidate onSubmit={(e) => void submit(e)} className="flex flex-col gap-group pt-group">
      <RequestError kind={failure} />
      <TextField
        label="E-mail"
        type="email"
        value={email}
        error={errors.email}
        autoComplete="off"
        onChange={setEmail}
      />
      <TextField
        label="Hasło"
        type="password"
        value={password}
        error={errors.password}
        autoComplete="off"
        onChange={setPassword}
      />
      <div className="flex flex-wrap items-center gap-group">
        <Button type="submit" loading={busy}>
          Zaloguj się
        </Button>
        <Button type="button" variant="link" onClick={onForgot}>
          Nie pamiętam hasła
        </Button>
      </div>
    </form>
  );
}

type RegisterValues = {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'mentor';
  terms: boolean;
  marketing: boolean;
};

function validateRegister(v: RegisterValues): Errors {
  const errors: Errors = {};
  const name = v.name.trim();
  if (name.length < 2 || name.length > 50) errors.name = 'Imię musi mieć od 2 do 50 znaków.';
  if (!EMAIL.test(v.email.trim())) errors.email = 'Podaj adres e-mail w formacie nazwa@domena.pl.';
  if (v.password.length < 10) errors.password = 'Hasło musi mieć co najmniej 10 znaków.';
  if (!v.terms) errors.terms = 'Zaakceptuj regulamin, żeby założyć konto.';
  return errors;
}

function RoleChoice({
  value,
  onChange,
}: {
  value: 'student' | 'mentor';
  onChange: (role: 'student' | 'mentor') => void;
}) {
  // DS-GAP: RoleChoice — FieldSet + RadioGroup with descriptions.
  return (
    <FieldSet>
      <FieldLegend>Po co zakładasz konto?</FieldLegend>
      <RadioGroup
        value={value}
        onValueChange={(next) => {
          onChange(next as 'student' | 'mentor');
        }}
      >
        <label className="flex items-center gap-inline text-body">
          <RadioGroupItem value="student" />
          Chcę się uczyć
        </label>
        <label className="flex items-center gap-inline text-body">
          <RadioGroupItem value="mentor" />
          Chcę mentorować (profil publiczny po weryfikacji)
        </label>
      </RadioGroup>
    </FieldSet>
  );
}

function Consents({
  values,
  error,
  onChange,
}: {
  values: RegisterValues;
  error: string | undefined;
  onChange: (patch: Partial<RegisterValues>) => void;
}) {
  const termsId = useId();
  const marketingId = useId();
  // DS-GAP: ConsentField — Checkbox + label; terms required, marketing optional and unchecked.
  return (
    <div className="flex flex-col gap-inline">
      <Field orientation="horizontal" data-invalid={error ? true : undefined}>
        <Checkbox
          id={termsId}
          checked={values.terms}
          aria-invalid={error ? true : undefined}
          onCheckedChange={(terms) => {
            onChange({ terms });
          }}
        />
        <FieldLabel htmlFor={termsId}>Akceptuję regulamin i politykę prywatności (wymagane)</FieldLabel>
      </Field>
      {error ? <FieldError>{error}</FieldError> : null}
      <Field orientation="horizontal">
        <Checkbox
          id={marketingId}
          checked={values.marketing}
          onCheckedChange={(marketing) => {
            onChange({ marketing });
          }}
        />
        <FieldLabel htmlFor={marketingId}>Chcę dostawać informacje o nowościach (opcjonalne)</FieldLabel>
      </Field>
    </div>
  );
}

export function RegisterForm({
  defaultRole,
  onStudent,
  onMentor,
}: {
  defaultRole: 'student' | 'mentor';
  onStudent: (name: string) => void;
  onMentor: () => void;
}) {
  const request = useFakeRequest();
  const [values, setValues] = useState<RegisterValues>({
    name: '',
    email: '',
    password: '',
    role: defaultRole,
    terms: false,
    marketing: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<'network' | 'server' | null>(null);
  const set = (patch: Partial<RegisterValues>) => {
    setValues((current) => ({ ...current, ...patch }));
  };

  const submit = async (event: SyntheticEvent) => {
    event.preventDefault();
    const next = validateRegister(values);
    setErrors(next);
    if (Object.keys(next).length > 0 || busy) return;
    setBusy(true);
    setFailure(null);
    const answer = await request();
    setBusy(false);
    if (!answer.ok) setFailure(answer.kind);
    else if (values.role === 'mentor') onMentor();
    else onStudent(values.name.trim());
  };

  return (
    <form noValidate onSubmit={(e) => void submit(e)} className="flex flex-col gap-group pt-group">
      <RequestError kind={failure} />
      <RoleChoice
        value={values.role}
        onChange={(role) => {
          set({ role });
        }}
      />
      <TextField label="Imię" value={values.name} error={errors.name} autoComplete="off" onChange={(name) => { set({ name }); }} />
      <TextField label="E-mail" type="email" value={values.email} error={errors.email} autoComplete="off" onChange={(email) => { set({ email }); }} />
      <TextField
        label="Hasło"
        type="password"
        value={values.password}
        error={errors.password}
        autoComplete="off"
        description={`Siła hasła: ${strengthOf(values.password)}.`}
        onChange={(password) => {
          set({ password });
        }}
      />
      <Consents values={values} error={errors.terms} onChange={set} />
      {values.role === 'mentor' ? (
        <p className="text-body-dense text-text-muted">
          W prototypie rejestracja mentora otwiera konto demo Adam Górski (wniosek w weryfikacji).
        </p>
      ) : null}
      <div>
        <Button type="submit" loading={busy}>
          Załóż konto
        </Button>
      </div>
    </form>
  );
}
