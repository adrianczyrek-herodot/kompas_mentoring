import type { Meta, StoryObj } from '@storybook/react-vite';
import type * as React from 'react';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { EarningsPreview } from './earnings-preview';
import { Field, FieldLabel } from './field';
import { RateInput } from './rate-input';

const onChange = fn();

/** The field with its preview — the state lives in a component, not in the story. */
function RateField(args: React.ComponentProps<typeof RateInput>) {
  const [amount, setAmount] = useState<number | null>(args.amount ?? null);
  return (
    <div className="flex max-w-form flex-col gap-group">
      <Field>
        <FieldLabel htmlFor="rate">Stawka za 60 minut</FieldLabel>
        <RateInput
          {...args}
          id="rate"
          amount={amount}
          onChange={(next) => {
            setAmount(next);
            onChange(next);
          }}
        />
      </Field>
      <EarningsPreview
        rate60Amount={BigInt(amount ?? 0)}
        rate30Amount={BigInt(Math.floor((amount ?? 0) / 2))}
      />
    </div>
  );
}

const meta = {
  title: 'Produkt/E2 Katalog i onboarding/RateInput',
  component: RateInput,
  args: {
    amount: 15_000,
    onChange,
    currencyLabel: 'zł za 60 minut',
  },
  render: (args) => <RateField {...args} />,
} satisfies Meta<typeof RateInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Empty: Story = {
  args: { amount: null },
};

export const WithError: Story = {
  args: { error: 'Stawka musi mieścić się między 40 a 1000 zł.' },
};

export const ConvertsToGrosze: Story = {
  name: 'Test: wpisane złoty wracają jako grosze',
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('spinbutton');
    await userEvent.clear(input);
    await userEvent.type(input, '250');
    await expect(onChange).toHaveBeenCalledWith(25_000);
  },
};
