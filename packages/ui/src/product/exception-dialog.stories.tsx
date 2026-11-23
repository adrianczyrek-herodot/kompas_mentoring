import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../components/button';
import {
  ExceptionDialog,
  type ExceptionDialogProps,
  type ExceptionDraft,
} from './exception-dialog';

const onSubmit = fn();

const editValue: Partial<ExceptionDraft> = {
  startsAt: '2026-10-21T09:00',
  endsAt: '2026-10-21T17:00',
  kind: 'off',
  note: 'Sprawy rodzinne',
};

function Demo(props: Partial<ExceptionDialogProps>) {
  const [open, setOpen] = useState(true);
  const [submitted, setSubmitted] = useState<ExceptionDraft | null>(null);
  return (
    <div className="flex flex-col gap-group">
      <Button
        variant="outline"
        onClick={() => {
          setOpen(true);
        }}
      >
        Dodaj wyjątek
      </Button>
      <ExceptionDialog
        {...props}
        open={open}
        onOpenChange={setOpen}
        onSubmit={(value) => {
          setSubmitted(value);
          onSubmit(value);
          setOpen(false);
        }}
      />
      {submitted ? (
        <p className="text-body-dense text-text-muted">Zgłoszono: {JSON.stringify(submitted)}</p>
      ) : null}
    </div>
  );
}

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/ExceptionDialog',
  component: ExceptionDialog,
  args: {
    open: true,
    onOpenChange: fn(),
    onSubmit,
  },
  argTypes: { open: { control: false }, onOpenChange: { control: false } },
  render: (args) => <Demo {...args} />,
} satisfies Meta<typeof ExceptionDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = { name: 'Dodawanie wyjątku' };

export const Edit: Story = {
  name: 'Edycja wyjątku',
  args: { mode: 'edit', initialValue: editValue },
};

export const Pending: Story = {
  name: 'Zapisywanie (pending)',
  args: { mode: 'edit', initialValue: editValue, pending: true },
};

export const ServerError: Story = {
  name: 'Er — błąd z serwera (kolizja z sesją)',
  args: {
    mode: 'edit',
    initialValue: editValue,
    errors: [
      { field: 'endsAt', problem: 'Ten zakres nachodzi na zaplanowaną sesję — potwierdź zapis.' },
    ],
  },
};

export const SubmitTest: Story = {
  name: 'Test: submit z wartościami',
  args: { mode: 'edit', initialValue: editValue },
  play: async () => {
    onSubmit.mockClear();
    const dialog = await screen.findByRole('dialog', { name: 'Edytuj wyjątek' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Zapisz zmiany' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        startsAt: '2026-10-21T09:00',
        endsAt: '2026-10-21T17:00',
        kind: 'off',
        note: 'Sprawy rodzinne',
      }),
    );
  },
};

export const ValidationTest: Story = {
  name: 'Test: walidacja wymaganych pól',
  play: async () => {
    const dialog = await screen.findByRole('dialog', { name: 'Dodaj wyjątek' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Dodaj wyjątek' }));
    await expect(within(dialog).getByText('Podaj datę i godzinę początku.')).toBeVisible();
    await expect(within(dialog).getByText('Podaj datę i godzinę końca.')).toBeVisible();
  },
};
