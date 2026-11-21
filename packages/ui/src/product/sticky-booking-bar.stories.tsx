import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { StateMatrix, ViewportFrame } from '../../.storybook/blocks/component-docs';
import { kasia, marek } from '../../.storybook/fixtures/kompas';
import { StickyBookingBar } from './sticky-booking-bar';

const onBook = fn();

const meta = {
  title: 'Produkt/E2 Katalog i onboarding/StickyBookingBar',
  component: StickyBookingBar,
  args: { trialPrice: kasia.trialPrice, acceptingNew: true, noSlotsIn14Days: false, onBook },
  argTypes: { trialPrice: { control: false }, secondary: { control: false } },
  render: (args) => (
    <div className="max-w-content">
      <StickyBookingBar {...args} />
    </div>
  ),
} satisfies Meta<typeof StickyBookingBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  name: 'Macierz stanów',
  parameters: {
    docs: {
      description: {
        story:
          'Zablokowany przycisk zostaje osiągalny klawiaturą, a powód jest napisany obok i powiązany przez `aria-describedby` (D2, KONCEPCJA §P3).',
      },
    },
  },
  render: () => (
    <StateMatrix
      columns={['Pasek']}
      rows={[
        {
          label: 'Dostępny',
          cells: [<StickyBookingBar key="a" trialPrice={kasia.trialPrice} acceptingNew />],
        },
        {
          label: 'Wstrzymane przyjmowanie',
          cells: [<StickyBookingBar key="b" trialPrice={marek.trialPrice} acceptingNew={false} />],
        },
        {
          label: 'Brak terminów w 14 dni',
          cells: [
            <StickyBookingBar key="c" trialPrice={kasia.trialPrice} acceptingNew noSlotsIn14Days />,
          ],
        },
      ]}
    />
  ),
};

export const Narrow: Story = {
  name: 'Wąski ekran 320 px',
  render: (args) => (
    <ViewportFrame width={320}>
      <StickyBookingBar {...args} acceptingNew={false} />
    </ViewportFrame>
  ),
};

export const BookTest: Story = {
  name: 'Test: rezerwacja kliknięciem, cena w nazwie przycisku',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toHaveAccessibleName(/^Zarezerwuj sesję próbną — 49\s?zł$/);
    onBook.mockClear();
    await userEvent.click(button);
    await expect(onBook).toHaveBeenCalledOnce();
  },
};

export const PausedTest: Story = {
  name: 'Test: wstrzymane — fokus na przycisku, powód w opisie',
  args: { acceptingNew: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await expect(button).toHaveAccessibleDescription(
      'Mentor wstrzymał przyjmowanie nowych uczniów. Wróć później albo wybierz innego mentora.',
    );
    onBook.mockClear();
    await userEvent.keyboard('{Enter}');
    await expect(onBook).not.toHaveBeenCalled();
  },
};
