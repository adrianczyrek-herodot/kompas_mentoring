import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ViewportFrame } from '../../.storybook/blocks/component-docs';
import { Button } from '../components/button';
import { Link } from '../components/link';
import { PageHeader } from './page-header';

const meta = {
  title: 'Produkt/Wspólne/PageHeader',
  component: PageHeader,
  args: {
    title: 'Moje sesje',
    description: 'Nadchodzące i minione sesje ze wszystkimi mentorami.',
    actions: <Button>Znajdź mentora</Button>,
  },
  argTypes: { actions: { control: false } },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const TitleOnly: Story = {
  name: 'Tylko tytuł',
  args: { title: 'Panel', description: undefined, actions: undefined },
};

export const SecondaryAction: Story = {
  name: 'Z akcją drugorzędną',
  args: {
    title: 'Szczegóły sesji',
    description: undefined,
    actions: <Link href="/sesje">Wróć do listy sesji</Link>,
  },
};

export const LongContent: Story = {
  name: 'Długie teksty i 320 px',
  render: (args) => (
    <ViewportFrame width={320}>
      <PageHeader
        {...args}
        title="Sesja próbna z Małgorzatą Brzęczyszczykiewicz-Wróblewską"
        description="Szczegóły, cel sesji i to, co możesz zrobić przed jej rozpoczęciem."
      />
    </ViewportFrame>
  ),
};

export const HeadingTest: Story = {
  name: 'Test: jeden h1 i akcja obok',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 1, name: 'Moje sesje' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Znajdź mentora' })).toBeVisible();
  },
};
