import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { TZ } from '../../.storybook/fixtures/kompas';
import { TimezoneSelect } from './timezone-select';

function Interactive() {
  const [zone, setZone] = useState(TZ);
  return (
    <TimezoneSelect
      inputId="story-zone"
      value={zone}
      onValueChange={setZone}
      description="Zmiana dotyczy tylko tego widoku. Strefę domyślną ustawisz w profilu."
    />
  );
}

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/TimezoneSelect',
  component: TimezoneSelect,
  args: { value: TZ, onValueChange: fn() },
  render: () => <Interactive />,
} satisfies Meta<typeof TimezoneSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: 'Wybór strefy' };
export const Disabled: Story = {
  name: 'Zablokowany',
  render: () => (
    <TimezoneSelect inputId="story-zone-disabled" value={TZ} onValueChange={fn()} disabled />
  ),
};
