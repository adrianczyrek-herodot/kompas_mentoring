import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { StateMatrix } from '../../.storybook/blocks/component-docs';
import { Money } from './money';

const meta = {
  title: 'Produkt/Wspólne/Money',
  component: Money,
  args: { amount: 4900n, currency: 'PLN' },
  argTypes: { amount: { control: false } },
} satisfies Meta<typeof Money>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Formats: Story = {
  name: 'Formaty (kwoty z mockupów)',
  render: () => (
    <StateMatrix
      columns={['Grosze (bigint)', 'Wyświetlane']}
      rows={[
        { label: 'Sesja próbna', cells: ['4900n', <Money key="a" amount={4900n} />] },
        { label: 'Sesja 60 min', cells: ['18000n', <Money key="b" amount={18000n} />] },
        { label: 'Z groszami', cells: ['4950n', <Money key="c" amount={4950n} />] },
        { label: 'Prowizja (zwrot)', cells: ['-3600n', <Money key="d" amount={-3600n} />] },
        { label: 'Duża kwota', cells: ['123456700n', <Money key="e" amount={123456700n} />] },
      ]}
    />
  ),
};

export const FormatTest: Story = {
  name: 'Test: grosze → złote bez ułamków binarnych',
  render: () => (
    <p>
      <Money amount={4950n} /> · <Money amount={18000n} />
    </p>
  ),
  play: async ({ canvasElement }) => {
    const [half, full] = canvasElement.querySelectorAll('data');
    await expect(half).toHaveTextContent(/^49,50\s?zł$/);
    await expect(half).toHaveAttribute('value', '4950');
    await expect(full).toHaveTextContent(/^180\s?zł$/);
  },
};
