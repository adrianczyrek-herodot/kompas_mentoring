import type { Meta, StoryObj } from '@storybook/react-vite';
import { CircleCheck, CircleX, Clock } from 'lucide-react';
import { expect, within } from 'storybook/test';
import { StateMatrix, ViewportFrame } from '../../.storybook/blocks/component-docs';
import { Badge, type BadgeProps } from './badge';

const meta = {
  title: 'Komponenty bazowe/Treść/Badge',
  component: Badge,
  args: { variant: 'success', children: 'Potwierdzona' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['neutral', 'success', 'warning', 'danger'] },
    children: { control: 'text' },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const variants: { variant: NonNullable<BadgeProps['variant']>; label: string; text: string }[] = [
  { variant: 'neutral', label: 'neutral — informacja', text: 'Nowy mentor' },
  { variant: 'success', label: 'success — gotowe, potwierdzone', text: 'Potwierdzona' },
  { variant: 'warning', label: 'warning — czeka na kogoś', text: 'Oczekuje na mentora' },
  { variant: 'danger', label: 'danger — anulowane, odrzucone', text: 'Anulowana' },
];

export const Variants: Story = {
  name: 'Warianty',
  render: () => (
    <div className="flex flex-col gap-group">
      {variants.map(({ variant, label, text }) => (
        <div key={variant} className="flex flex-col items-start gap-tight">
          <span className="text-meta text-text-muted">{label}</span>
          <Badge variant={variant}>{text}</Badge>
        </div>
      ))}
      <div className="flex flex-wrap gap-inline">
        <Badge variant="success">
          <CircleCheck aria-hidden="true" />
          Zatwierdzony
        </Badge>
        <Badge variant="warning">
          <Clock aria-hidden="true" />
          Poproszono o zmiany
        </Badge>
        <Badge variant="danger">
          <CircleX aria-hidden="true" />
          Odrzucony
        </Badge>
      </div>
    </div>
  ),
};

const statusMap: {
  variant: NonNullable<BadgeProps['variant']>;
  session: string;
  application: string;
}[] = [
  { variant: 'neutral', session: 'Zakończona', application: 'Szkic' },
  { variant: 'warning', session: 'Oczekuje na mentora', application: 'W weryfikacji' },
  { variant: 'success', session: 'Potwierdzona', application: 'Zatwierdzony' },
  { variant: 'danger', session: 'Anulowana', application: 'Odrzucony' },
];

export const States: Story = {
  name: 'Macierz stanów (statusy z backlogu)',
  parameters: {
    docs: {
      description: {
        story:
          'Znacznik nie jest interaktywny. Macierz pokazuje mapowanie statusów sesji (U4, U5) i wniosku mentora (M1, A1) na warianty.',
      },
    },
  },
  render: () => (
    <StateMatrix
      columns={['Sesja (U4, U5)', 'Wniosek mentora (M1, A1)']}
      rows={statusMap.map(({ variant, session, application }) => ({
        label: variant,
        cells: [
          <Badge key="session" variant={variant}>
            {session}
          </Badge>,
          <Badge key="application" variant={variant}>
            {application}
          </Badge>,
        ],
      }))}
    />
  ),
};

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  render: () => (
    <ViewportFrame width={320}>
      <div className="flex flex-wrap gap-inline">
        <Badge variant="warning">Poproszono o zmiany</Badge>
        <Badge variant="warning" className="whitespace-normal">
          Oczekuje na potwierdzenie mentora do jutra, 14:30
        </Badge>
      </div>
    </ViewportFrame>
  ),
};

export const TextNotColour: Story = {
  name: 'Test: status ma tekst',
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Potwierdzona')).toBeVisible();
  },
};
