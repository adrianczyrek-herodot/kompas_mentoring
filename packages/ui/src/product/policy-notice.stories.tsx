import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { StateMatrix, ViewportFrame } from '../../.storybook/blocks/component-docs';
import { TZ } from '../../.storybook/fixtures/kompas';
import { PolicyNotice } from './policy-notice';

// Session s2 (Fri 23 Oct, 18:00): free change until 06:00 the same day.
const FREE_UNTIL = '2026-10-23T06:00:00+02:00';

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/PolicyNotice',
  component: PolicyNotice,
  args: { state: 'free', freeUntil: FREE_UNTIL, timeZone: TZ },
  argTypes: { state: { control: 'inline-radio', options: ['free', 'late', 'started'] } },
} satisfies Meta<typeof PolicyNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  name: 'Macierz stanów (reguła 12 h)',
  render: () => (
    <StateMatrix
      columns={['Komunikat']}
      rows={[
        {
          label: '≥ 12 h (free)',
          cells: [<PolicyNotice key="f" state="free" freeUntil={FREE_UNTIL} timeZone={TZ} />],
        },
        { label: '< 12 h (late)', cells: [<PolicyNotice key="l" state="late" timeZone={TZ} />] },
        {
          label: 'po starcie (started)',
          cells: [<PolicyNotice key="s" state="started" timeZone={TZ} />],
        },
      ]}
    />
  ),
};

export const Narrow: Story = {
  name: 'Wąski ekran 320 px',
  render: () => (
    <ViewportFrame width={320}>
      <PolicyNotice state="late" timeZone={TZ} />
    </ViewportFrame>
  ),
};

export const FullTextTest: Story = {
  name: 'Test: termin bezpłatnej zmiany pełnym tekstem w strefie ucznia',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const time = canvas.getByText('pt., 23 paź, 06:00');
    await expect(time.tagName).toBe('TIME');
    await expect(time).toHaveAttribute('datetime', FREE_UNTIL);
    await expect(canvas.getByText(/Później sesja przepada\./)).toBeVisible();
  },
};
