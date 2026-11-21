import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { StateMatrix, ViewportFrame } from '../../.storybook/blocks/component-docs';
import { TZ } from '../../.storybook/fixtures/kompas';
import { HoldCountdown } from './hold-countdown';

const EXPIRES = '2026-10-20T14:10:00+02:00';
const onChooseAgain = fn();

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/HoldCountdown',
  component: HoldCountdown,
  args: { secondsLeft: 512, expiresAt: EXPIRES, timeZone: TZ, onChooseAgain },
  argTypes: { secondsLeft: { control: { type: 'range', min: 0, max: 600, step: 1 } } },
} satisfies Meta<typeof HoldCountdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  name: 'Macierz stanów',
  parameters: {
    docs: {
      description: {
        story:
          'Spokojnie przez większość czasu; bursztyn z ikoną dopiero w ostatnich 2 minutach (A02 — bez sztucznej presji); po wygaśnięciu komunikat z następnym krokiem.',
      },
    },
  },
  render: () => (
    <StateMatrix
      columns={['Podgląd']}
      rows={[
        {
          label: 'Trwa (> 2 min)',
          cells: [<HoldCountdown key="a" secondsLeft={512} expiresAt={EXPIRES} timeZone={TZ} />],
        },
        {
          label: 'Ostatnie 2 min',
          cells: [<HoldCountdown key="b" secondsLeft={95} expiresAt={EXPIRES} timeZone={TZ} />],
        },
        {
          label: 'Wygasła',
          cells: [
            <HoldCountdown
              key="c"
              secondsLeft={0}
              expiresAt={EXPIRES}
              timeZone={TZ}
              onChooseAgain={onChooseAgain}
            />,
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
      <HoldCountdown {...args} secondsLeft={95} />
    </ViewportFrame>
  ),
};

function Ticking({ from }: { from: number }) {
  const [left, setLeft] = useState(from);
  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((value) => value - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);
  return (
    <HoldCountdown
      secondsLeft={left}
      expiresAt={EXPIRES}
      timeZone={TZ}
      onChooseAgain={onChooseAgain}
    />
  );
}

export const ExpiryTest: Story = {
  name: 'Test: wygaśnięcie ogłasza się i prowadzi do wyboru terminu',
  render: () => <Ticking from={2} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('timer', { name: 'Pozostały czas blokady' })).toHaveTextContent(
      '00:02',
    );
    const alert = await waitFor(() => canvas.getByRole('alert'), { timeout: 4000 });
    await expect(alert).toHaveTextContent('Blokada terminu wygasła');
    onChooseAgain.mockClear();
    await userEvent.click(canvas.getByRole('button', { name: 'Wybierz termin ponownie' }));
    await expect(onChooseAgain).toHaveBeenCalledOnce();
  },
};
