import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { StateMatrix, ViewportFrame } from '../../.storybook/blocks/component-docs';
import { Spinner } from './spinner';

const meta = {
  title: 'Komponenty bazowe/Komunikaty/Spinner',
  component: Spinner,
  args: { size: 'md', label: 'Zapisujemy krok…' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: 'Rozmiary',
  render: () => (
    <StateMatrix
      columns={['sm 16 px', 'md 20 px', 'lg 24 px']}
      rows={[
        {
          label: 'Z tekstem',
          cells: [
            <Spinner key="sm" size="sm" label="Wczytujemy…" />,
            <Spinner key="md" size="md" label="Wczytujemy…" />,
            <Spinner key="lg" size="lg" label="Wczytujemy…" />,
          ],
        },
      ]}
    />
  ),
};

export const States: Story = {
  name: 'Macierz stanów',
  parameters: {
    docs: {
      description: {
        story:
          'Jeden stan: trwa. W przycisku używaj `Button loading` (wskaźnik + `aria-busy`), nie osobnego Spinnera.',
      },
    },
  },
  render: () => <Spinner label="Zapisujemy krok…" />,
};

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  render: () => (
    <ViewportFrame width={320}>
      <Spinner label="Potwierdzamy płatność — może to potrwać do 30 sekund. Nie zamykaj tej strony." />
    </ViewportFrame>
  ),
};

export const Announced: Story = {
  name: 'Test: tekst ogłaszany przez status',
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('Zapisujemy krok…');
  },
};
