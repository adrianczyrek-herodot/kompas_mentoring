/** S3 · Konto i ustawienia (KONCEPCJA §S3). Works for every role; payment methods are for students. */
import {
  Button,
  ErrorState,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
} from '@kompas/ui';
import { type SyntheticEvent, useId, useState } from 'react';
import { TIME_ZONES } from '../lib/clock';
import type { Route } from '../lib/router';
import { FailureAlert, useAction } from '../shell/request-feedback';
import { useDemo, useRetry } from '../state/demo-context';
import { DataAndPrivacy, PaymentMethods } from './s3-parts';

const NAME_MIN = 2;
const NAME_MAX = 50;

function ProfileForm() {
  const { state, dispatch, account } = useDemo();
  const toast = useToast();
  const action = useAction();
  const nameId = useId();
  const zoneId = useId();
  const profile = state.world.profiles[account.id];
  const [name, setName] = useState(account.name);
  const [timeZone, setTimeZone] = useState(profile?.timeZone ?? TIME_ZONES[0].value);
  const [error, setError] = useState<string | null>(null);
  const items = TIME_ZONES.map((zone) => ({ value: zone.value, label: zone.label }));
  const submit = (event: SyntheticEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < NAME_MIN || trimmed.length > NAME_MAX) {
      setError(`Imię ma mieć ${String(NAME_MIN)}–${String(NAME_MAX)} znaków.`);
      return;
    }
    void action.run(() => {
      dispatch({ type: 'update-profile', accountId: account.id, patch: { name: trimmed, timeZone } });
      toast.add({ title: 'Profil zapisany', type: 'success' });
    });
  };
  return (
    <form noValidate onSubmit={submit} className="flex max-w-form flex-col gap-group">
      <FailureAlert kind={action.failure} what="Nie zapisaliśmy profilu" />
      <Field data-invalid={error ? true : undefined}>
        <FieldLabel htmlFor={nameId}>Imię i nazwisko</FieldLabel>
        <Input id={nameId} value={name} maxLength={NAME_MAX + 10} aria-invalid={error ? true : undefined} onChange={(event) => { setName(event.target.value); setError(null); }} />
        {error ? <FieldError>{error}</FieldError> : null}
      </Field>
      <Field>
        <FieldLabel htmlFor={zoneId}>Strefa czasowa</FieldLabel>
        <Select items={items} value={timeZone} onValueChange={(next) => { setTimeZone(next ?? TIME_ZONES[0].value); }}>
          <SelectTrigger id={zoneId} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldDescription>W tej strefie pokazujemy godziny sesji.</FieldDescription>
      </Field>
      <div>
        <Button type="submit" loading={action.busy}>Zapisz profil</Button>
      </div>
    </form>
  );
}

const NOTIFICATION_TYPES = [
  { key: 'reminders', label: 'Przypomnienia o sesjach', email: true, push: true },
  { key: 'messages', label: 'Wiadomości', email: true, push: true },
  { key: 'bookings', label: 'Zmiany w rezerwacjach', email: true, push: false },
  { key: 'tips', label: 'Wskazówki i oferty', email: false, push: false },
] as const;

function NotificationPrefs() {
  const { state, dispatch, account } = useDemo();
  const action = useAction();
  const saved = state.world.profiles[account.id]?.notify ?? {};
  const valueOf = (type: (typeof NOTIFICATION_TYPES)[number], channel: 'email' | 'push') => saved[`${type.key}.${channel}`] ?? type[channel];
  const everything = Object.fromEntries(NOTIFICATION_TYPES.flatMap((t) => (['email', 'push'] as const).map((c) => [`${t.key}.${c}`, valueOf(t, c)])));
  return (
    <div className="flex max-w-form flex-col gap-group">
      <FailureAlert kind={action.failure} what="Nie zapisaliśmy ustawień" />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rodzaj</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Push</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {NOTIFICATION_TYPES.map((type) => (
            <TableRow key={type.key}>
              <TableCell>{type.label}</TableCell>
              {(['email', 'push'] as const).map((channel) => (
                <TableCell key={channel}>
                  <Switch
                    aria-label={`${type.label}, ${channel === 'email' ? 'e-mail' : 'push'}`}
                    checked={valueOf(type, channel)}
                    disabled={action.busy}
                    onCheckedChange={(checked) => {
                      void action.run(() => {
                        dispatch({ type: 'update-profile', accountId: account.id, patch: { notify: { ...everything, [`${type.key}.${channel}`]: checked } } });
                      }, 250);
                    }}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-body-dense text-text-muted">Ważne powiadomienia o sesji i płatnościach wysyłamy zawsze. W prototypie nic nie jest wysyłane.</p>
    </div>
  );
}

/** `?tab=platnosci` (the link in U8's failed-renewal banner) opens the payment methods tab. */
function startTab(route: Route, student: boolean): string {
  const tab = route.query.get('tab');
  return tab === 'platnosci' && student ? 'payments' : 'profile';
}

export function S3Account({ route }: { route: Route }) {
  const { state, account, studentId } = useDemo();
  const retry = useRetry();
  const status = state.scenarios.dataState;
  if (status === 'loading') {
    return (
      <div aria-busy="true" className="flex flex-col gap-group">
        <p className="sr-only">Wczytujemy ustawienia…</p>
        <Skeleton className="h-lh w-1/2 text-page-title" />
        <Skeleton className="h-control w-full" />
        <Skeleton className="h-control w-full" />
      </div>
    );
  }
  if (status === 'error') {
    return (
      <ErrorState
        titleAs="h1"
        title="Nie udało się wczytać ustawień konta"
        description="Sprawdź połączenie i spróbuj ponownie."
        action={<Button variant="outline" onClick={retry}>Ponów</Button>}
      />
    );
  }
  return (
    <div className="flex flex-col gap-section">
      <PageHeader title="Konto i ustawienia" description={account.name} />
      <Tabs key={account.id} defaultValue={startTab(route, studentId !== null)}>
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="notifications">Powiadomienia</TabsTrigger>
          {studentId ? <TabsTrigger value="payments">Płatności</TabsTrigger> : null}
          <TabsTrigger value="data">Dane</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileForm />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationPrefs />
        </TabsContent>
        {studentId ? (
          <TabsContent value="payments">
            <PaymentMethods />
          </TabsContent>
        ) : null}
        <TabsContent value="data">
          <DataAndPrivacy />
        </TabsContent>
      </Tabs>
    </div>
  );
}
