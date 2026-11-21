import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { expect, within } from 'storybook/test';
import { Button } from '../components/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/card';
import { PolicyNotice } from '../product/policy-notice';

function Reschedule12hDemo({ hoursToSession = 36 }: { hoursToSession?: number }) {
  const isLate = hoursToSession < 12;

  return (
    <Card className="max-w-form w-full border-border-divider bg-surface-panel p-panel space-y-group">
      <CardHeader className="p-0">
        <CardTitle>Zarządzanie terminem sesji #B-1082</CardTitle>
      </CardHeader>
      <CardContent className="space-y-group p-0">
        <PolicyNotice hoursRemaining={hoursToSession} />

        <div className="flex flex-col gap-inline sm:flex-row sm:items-center sm:justify-end">
          <Button variant="outline">
            {isLate ? 'Zaproponuj nowy termin (wymaga akceptacji)' : 'Przełóż termin bezpłatnie'}
          </Button>
          <Button variant="danger">
            {isLate ? 'Odwołaj bez zwrotu środków' : 'Odwołaj z pełnym zwrotem'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const meta = {
  title: 'Wzorce/Zmiana z regułą 12 h',
  component: Reschedule12hDemo,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof Reschedule12hDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MoreThan12Hours: Story = {
  name: '1. Bezpłatna zmiana (> 12 h)',
  args: {
    hoursToSession: 48,
  },
};

export const LessThan12Hours: Story = {
  name: '2. Zmiana w oknie < 12 h (utrata kredytu)',
  args: {
    hoursToSession: 5,
  },
};

export const PolicyTextVisibleTest: Story = {
  name: 'Test: pełny tekst zasady 12 godzin widoczny na ekranie',
  args: {
    hoursToSession: 5,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/Zgodnie z zasadą 12 godzin bezpłatne anulowanie wygasło/i),
    ).toBeVisible();
    await expect(canvas.getByRole('button', { name: /Odwołaj bez zwrotu środków/i })).toBeVisible();
  },
};
