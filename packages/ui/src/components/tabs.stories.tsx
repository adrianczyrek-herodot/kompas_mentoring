import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import {
  type PreviewState,
  StateMatrix,
  ViewportFrame,
} from '../../.storybook/blocks/component-docs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

type PlaygroundArgs = { onValueChange: (value: unknown) => void };

const meta = {
  title: 'Komponenty bazowe/Treść/Tabs',
  args: { onValueChange: fn() },
  render: ({ onValueChange }) => (
    <Tabs defaultValue="upcoming" onValueChange={onValueChange} className="max-w-form">
      <TabsList aria-label="Moje sesje">
        <TabsTrigger value="upcoming">Nadchodzące</TabsTrigger>
        <TabsTrigger value="past">Minione</TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming">
        <p className="text-body">Wtorek, 25 listopada, 18:00 — sesja próbna z Anną Kowalczyk.</p>
      </TabsContent>
      <TabsContent value="past">
        <p className="text-body">
          Czwartek, 13 listopada — notatka po sesji czeka na uzupełnienie.
        </p>
      </TabsContent>
    </Tabs>
  ),
} satisfies Meta<PlaygroundArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: 'Odmiany: dwie zakładki, zablokowana zakładka',
  render: () => (
    <div className="flex max-w-form flex-col gap-section">
      <Tabs defaultValue="login">
        <TabsList aria-label="Logowanie lub rejestracja">
          <TabsTrigger value="login">Logowanie</TabsTrigger>
          <TabsTrigger value="register">Rejestracja</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <p className="text-body">Formularz logowania.</p>
        </TabsContent>
        <TabsContent value="register">
          <p className="text-body">Formularz rejestracji.</p>
        </TabsContent>
      </Tabs>
      <Tabs defaultValue="profile">
        <TabsList aria-label="Ustawienia mentora">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="calendar">Kalendarz</TabsTrigger>
          <TabsTrigger value="payouts" disabled>
            Wypłaty
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <p className="text-body-dense text-text-muted">
            Wypłaty będą dostępne po weryfikacji danych do wypłat.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  ),
};

const columns: { column: string; preview?: PreviewState; disabled?: boolean }[] = [
  { column: 'Domyślny' },
  { column: 'Najechanie', preview: 'hover' },
  { column: 'Fokus', preview: 'focus' },
  { column: 'Zablokowany', disabled: true },
];

export const States: Story = {
  name: 'Macierz stanów',
  render: () => (
    <StateMatrix
      columns={columns.map((c) => c.column)}
      rows={[
        { label: 'Nieaktywna', active: false },
        { label: 'Aktywna', active: true },
      ].map((row) => ({
        label: row.label,
        cells: columns.map((c) => (
          <Tabs key={c.column} defaultValue={row.active ? 'a' : 'other'}>
            <TabsList aria-label={`${row.label}, ${c.column}`} className="border-b-0">
              <TabsTrigger value="a" data-preview-state={c.preview} disabled={c.disabled}>
                Minione
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )),
      }))}
    />
  ),
};

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  render: () => (
    <ViewportFrame width={320}>
      <Tabs defaultValue="upcoming">
        <TabsList aria-label="Moje sesje">
          <TabsTrigger value="upcoming">Nadchodzące</TabsTrigger>
          <TabsTrigger value="past">Minione</TabsTrigger>
          <TabsTrigger value="cancelled">Anulowane i przełożone</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <p className="text-body-dense">Na 320 px lista zakładek przewija się w poziomie.</p>
        </TabsContent>
      </Tabs>
    </ViewportFrame>
  ),
};

export const ArrowsAndActivate: Story = {
  name: 'Test: strzałki i aktywacja',
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const upcoming = canvas.getByRole('tab', { name: 'Nadchodzące' });
    const past = canvas.getByRole('tab', { name: 'Minione' });
    await expect(upcoming).toHaveAttribute('aria-selected', 'true');
    // Tab lands on the active tab: roving tabindex (0 on the active tab, -1 on the others).
    await expect(upcoming).toHaveAttribute('tabindex', '0');
    await expect(past).toHaveAttribute('tabindex', '-1');
    upcoming.focus();
    await expect(upcoming).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(past).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(past).toHaveAttribute('aria-selected', 'true');
    await expect(args.onValueChange).toHaveBeenCalledWith('past', expect.anything());
    // The previous panel stays mounted during its exit transition.
    await waitFor(() => expect(canvas.getByRole('tabpanel')).toHaveTextContent(/notatka po sesji/));
  },
};
