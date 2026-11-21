import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ViewportFrame } from '../../.storybook/blocks/component-docs';
import { type ActiveFilter, ActiveFilters } from './active-filters';

const mentorForms = { one: 'mentor', few: 'mentorów', many: 'mentorów' };
const filters: ActiveFilter[] = [
  { id: 'topic', label: 'Frontend' },
  { id: 'price', label: '0–200 zł' },
  { id: 'lang', label: 'angielski' },
  { id: 'verified', label: 'Tylko zweryfikowani' },
];
const onRemove = fn();
const onClearAll = fn();

const meta = {
  title: 'Produkt/E2 Katalog i onboarding/ActiveFilters',
  component: ActiveFilters,
  args: { resultCount: 4, countForms: mentorForms, filters, onRemove, onClearAll },
  argTypes: { filters: { control: false }, countForms: { control: false } },
} satisfies Meta<typeof ActiveFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const NoFilters: Story = { name: 'Bez filtrów', args: { filters: [], resultCount: 6 } };
export const OneResult: Story = {
  name: 'Jeden wynik i jeden filtr',
  args: { filters: filters.slice(0, 1), resultCount: 1 },
};
export const ZeroResults: Story = { name: 'Zero wyników', args: { resultCount: 0 } };

export const Narrow: Story = {
  name: 'Długie teksty i 320 px',
  render: (args) => (
    <ViewportFrame width={320}>
      <ActiveFilters
        {...args}
        filters={[...filters, { id: 'days', label: 'Wieczorem (17–21) · pon., śr., pt.' }]}
      />
    </ViewportFrame>
  ),
};

function Interactive() {
  const [active, setActive] = useState(filters);
  return (
    <ActiveFilters
      resultCount={active.length * 2}
      countForms={mentorForms}
      filters={active}
      onRemove={(id) => {
        onRemove(id);
        setActive((list) => list.filter((filter) => filter.id !== id));
      }}
      onClearAll={() => {
        onClearAll();
        setActive([]);
      }}
    />
  );
}

export const RemoveTest: Story = {
  name: 'Test: usuwanie filtra klawiaturą i „Wyczyść wszystkie”',
  render: () => <Interactive />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const price = canvas.getByRole('button', { name: '0–200 zł — usuń filtr' });
    price.focus();
    onRemove.mockClear();
    await userEvent.keyboard('{Enter}');
    await expect(onRemove).toHaveBeenCalledWith('price');
    await expect(canvas.queryByRole('button', { name: '0–200 zł — usuń filtr' })).toBeNull();
    await expect(canvas.getByText('6 mentorów')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Wyczyść wszystkie' }));
    await expect(canvas.getByText('0 mentorów')).toBeVisible();
  },
};
