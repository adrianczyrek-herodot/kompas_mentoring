import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ViewportFrame } from '../../.storybook/blocks/component-docs';
import { Separator } from './separator';

const meta = {
  title: 'Komponenty bazowe/Treść/Separator',
  component: Separator,
  args: { orientation: 'horizontal' },
  argTypes: { orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] } },
  render: (args) => (
    <div
      className={`flex max-w-form gap-group text-body ${args.orientation === 'vertical' ? 'flex-row items-center' : 'flex-col'}`}
    >
      <span>Sesje</span>
      <Separator {...args} />
      <span>Notatki</span>
    </div>
  ),
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: 'Odmiany: pozioma, pionowa, z tekstem',
  render: () => (
    <div className="flex max-w-form flex-col gap-section text-body">
      <div className="flex flex-col gap-group">
        <p>Anna Kowalczyk — React, TypeScript</p>
        <Separator />
        <p>Piotr Nowak — Product management</p>
      </div>
      <div className="flex items-center gap-group text-body-dense text-text-muted">
        <span>180 zł / 60 min</span>
        <Separator orientation="vertical" className="h-icon-md self-center" />
        <span>polski, angielski</span>
      </div>
      <div className="flex items-center gap-inline text-body-dense text-text-muted">
        <Separator className="flex-1" />
        lub e-mailem
        <Separator className="flex-1" />
      </div>
    </div>
  ),
};

export const States: Story = {
  name: 'Macierz stanów',
  parameters: {
    docs: { description: { story: 'Separator nie ma stanów — to linia dekoracyjna (R01.4).' } },
  },
  render: () => (
    <div className="flex max-w-form flex-col gap-group">
      <Separator />
    </div>
  ),
};

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  render: () => (
    <ViewportFrame width={320}>
      <div className="flex items-center gap-inline text-body-dense text-text-muted">
        <Separator className="flex-1" />
        lub kontynuuj adresem e-mail
        <Separator className="flex-1" />
      </div>
    </ViewportFrame>
  ),
};

export const Semantics: Story = {
  name: 'Test: rola separatora',
  play: async ({ canvasElement }) => {
    const separator = within(canvasElement).getByRole('separator');
    await expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
  },
};
