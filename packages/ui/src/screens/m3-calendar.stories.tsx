import type { Meta, StoryObj } from '@storybook/react-vite';
import { TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { fullscreen, ScreenShell } from '../../.storybook/examples/screen-shell';
import { TZ } from '../../.storybook/fixtures/kompas';
import {
  sessions,
  template,
  WEEK_START,
  weekExceptions,
} from '../../.storybook/fixtures/m3-calendar';
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
  AvailabilityEditor,
  type AvailabilityRuleView,
  Button,
  CalendarSyncCard,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DateTime,
  ExceptionDialog,
  type ExceptionDraft,
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  WeekCalendar,
  type WeekExceptionView,
} from '../index';

const noop = () => undefined;

function useM3State(empty: boolean) {
  const [rules, setRules] = useState<AvailabilityRuleView[]>(empty ? [] : template);
  const [exceptions, setExceptions] = useState<WeekExceptionView[]>(empty ? [] : weekExceptions);
  const [dialogOpen, setDialogOpen] = useState(false);
  const addException = (draft: ExceptionDraft) => {
    setExceptions((current) => [
      ...current,
      {
        id: `e${String(current.length + 1)}`,
        startsAt: draft.startsAt,
        endsAt: draft.endsAt,
        kind: draft.kind,
        note: draft.note,
      },
    ]);
    setDialogOpen(false);
  };
  return { rules, setRules, exceptions, dialogOpen, setDialogOpen, addException };
}

function EmptyAvailabilityBanner() {
  return (
    <Alert variant="warning" role="status">
      <TriangleAlert aria-hidden="true" />
      <AlertTitle>Uczniowie nie mogą cię zarezerwować</AlertTitle>
      <AlertDescription>
        W szablonie nie ma ani jednej godziny. Dodaj dostępność, żeby pojawiły się wolne terminy.
      </AlertDescription>
      <AlertAction>
        <Button variant="outline">Dodaj dostępność</Button>
      </AlertAction>
    </Alert>
  );
}

function LeadTimeField() {
  return (
    <Field>
      <FieldLabel htmlFor="m3-lead">Wyprzedzenie rezerwacji</FieldLabel>
      <Select defaultValue="6">
        <SelectTrigger id="m3-lead" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {['2', '4', '6', '12', '24', '48'].map((hours) => (
            <SelectItem key={hours} value={hours}>
              {hours} h
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldDescription>Ile wcześniej uczeń może zarezerwować termin.</FieldDescription>
    </Field>
  );
}

function BufferField() {
  return (
    <Field>
      <FieldLabel htmlFor="m3-buffer">Bufor między sesjami</FieldLabel>
      <Select defaultValue="0">
        <SelectTrigger id="m3-buffer" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {['0', '15', '30'].map((minutes) => (
            <SelectItem key={minutes} value={minutes}>
              {minutes} min
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldDescription>Przerwa między kolejnymi sesjami w danym dniu.</FieldDescription>
    </Field>
  );
}

function PauseField() {
  return (
    <Field orientation="horizontal">
      <Switch id="m3-pause" />
      <FieldContent>
        <FieldLabel htmlFor="m3-pause">Wstrzymaj przyjmowanie nowych uczniów</FieldLabel>
        <FieldDescription>Obecni uczniowie nadal umawiają kolejne sesje.</FieldDescription>
      </FieldContent>
    </Field>
  );
}

function SettingsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Ustawienia rezerwacji</h2>
        </CardTitle>
        <CardDescription>
          Wyprzedzenie, bufor i wstrzymanie przyjmowania nowych uczniów.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <LeadTimeField />
          <BufferField />
          <PauseField />
        </FieldGroup>
      </CardContent>
    </Card>
  );
}

function TemplateCard({
  rules,
  onChange,
}: {
  rules: AvailabilityRuleView[];
  onChange: (next: AvailabilityRuleView[]) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Tygodniowy szablon</h2>
        </CardTitle>
        <CardDescription>
          Kliknij lub przeciągnij, żeby zaznaczyć godziny dostępności.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AvailabilityEditor value={rules} onChange={onChange} />
      </CardContent>
    </Card>
  );
}

function ExceptionList({ exceptions }: { exceptions: readonly WeekExceptionView[] }) {
  if (exceptions.length === 0) {
    return <p className="text-body-dense text-text-muted">Brak wyjątków w tym tygodniu.</p>;
  }
  return (
    <ul className="flex list-none flex-col gap-inline">
      {exceptions.map((item) => (
        <li key={item.id} className="flex flex-wrap items-center justify-between gap-inline">
          <span className="text-label text-text-default">
            {item.kind === 'off' ? 'Urlop / blokada' : 'Dodatkowe godziny'}
          </span>
          <span className="text-meta text-text-muted tabular-nums">
            <DateTime value={item.startsAt} timeZone={TZ} format="datetime" />–
            <DateTime value={item.endsAt} timeZone={TZ} format="time" />
          </span>
          <Button variant="ghost" size="sm">
            Edytuj
          </Button>
        </li>
      ))}
    </ul>
  );
}

function ExceptionsSection({
  exceptions,
  onAdd,
}: {
  exceptions: readonly WeekExceptionView[];
  onAdd: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Wyjątki</h2>
        </CardTitle>
        <CardDescription>Urlopy i dodatkowe godziny poza tygodniowym szablonem.</CardDescription>
        <CardAction>
          <Button variant="outline" onClick={onAdd}>
            Dodaj wyjątek
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ExceptionList exceptions={exceptions} />
      </CardContent>
    </Card>
  );
}

function M3Screen({ empty = false }: { empty?: boolean }) {
  const { rules, setRules, exceptions, dialogOpen, setDialogOpen, addException } =
    useM3State(empty);
  return (
    <ScreenShell navRole="mentor" current="calendar">
      <PageHeader
        title="Kalendarz i dostępność"
        description="Ustaw tygodniowy szablon, wyjątki i połącz kalendarz."
        actions={<Button>Zapisz zmiany</Button>}
      />
      {rules.length === 0 ? <EmptyAvailabilityBanner /> : null}
      <WeekCalendar
        weekStart={WEEK_START}
        timeZone={TZ}
        rules={rules}
        exceptions={exceptions}
        sessions={empty ? [] : sessions}
        canGoPrevious={false}
      />
      <TemplateCard rules={rules} onChange={setRules} />
      <SettingsSection />
      <ExceptionsSection
        exceptions={exceptions}
        onAdd={() => {
          setDialogOpen(true);
        }}
      />
      <CalendarSyncCard status="disconnected" onConnect={noop} />
      <ExceptionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        timeZone={TZ}
        onSubmit={addException}
      />
    </ScreenShell>
  );
}

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/Ekrany/M3 Kalendarz i dostępność',
  component: M3Screen,
  args: { empty: false },
  argTypes: { empty: { control: 'boolean' } },
  parameters: fullscreen,
} satisfies Meta<typeof M3Screen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithAvailability: Story = { name: 'S — z dostępnością' };

export const EmptyAvailability: Story = { name: 'E — pusta dostępność', args: { empty: true } };

export const AddExceptionTest: Story = {
  name: 'Test: dodanie wyjątku otwiera dialog',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Dodaj wyjątek' }));
    const dialog = await waitFor(() => screen.getByRole('dialog', { name: 'Dodaj wyjątek' }));
    await waitFor(() => expect(within(dialog).getByLabelText('Początek')).toBeVisible());
  },
};
