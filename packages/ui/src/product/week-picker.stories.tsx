import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { WeekPicker } from './week-picker';

const WEEKS = ['13–19 października', '20–26 października', '27 października – 2 listopada'];

function Interactive() {
  const [index, setIndex] = useState(1);
  return (
    <WeekPicker
      label={WEEKS[index] ?? ''}
      canGoPrev={index > 0}
      canGoNext={index < WEEKS.length - 1}
      onPrev={() => {
        setIndex((value) => Math.max(0, value - 1));
      }}
      onNext={() => {
        setIndex((value) => Math.min(WEEKS.length - 1, value + 1));
      }}
      horizonLabel="Terminy do 15 grudnia"
    />
  );
}

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/WeekPicker',
  component: WeekPicker,
  args: { label: '20–26 października' },
  render: () => <Interactive />,
} satisfies Meta<typeof WeekPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: 'Środek horyzontu' };
export const FirstWeek: Story = {
  name: 'Pierwszy tydzień („wstecz” wyłączone)',
  render: () => (
    <WeekPicker label="13–19 października" canGoNext horizonLabel="Terminy do 15 grudnia" />
  ),
};
