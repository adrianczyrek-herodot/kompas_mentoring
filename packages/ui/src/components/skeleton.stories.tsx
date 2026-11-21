import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ViewportFrame } from '../../.storybook/blocks/component-docs';
import { Skeleton } from './skeleton';

function MentorRowSkeleton() {
  return (
    <div className="flex items-start gap-group border-b border-border-divider py-row-y">
      <Skeleton className="size-avatar-md rounded-round" />
      <div className="flex flex-1 flex-col gap-inline">
        <Skeleton className="h-lh w-1/3" />
        <Skeleton className="h-lh w-2/3" />
        <Skeleton className="h-lh w-1/4" />
      </div>
    </div>
  );
}

function MentorListLoading({ rows = 3 }: { rows?: number }) {
  return (
    <section aria-busy="true" aria-labelledby="mentors-loading" className="flex max-w-form flex-col">
      <p id="mentors-loading" className="sr-only">
        Wczytujemy listę mentorów…
      </p>
      {Array.from({ length: rows }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders without identity.
        <MentorRowSkeleton key={index} />
      ))}
    </section>
  );
}

const meta = {
  title: 'Komponenty bazowe/Komunikaty/Skeleton',
  render: () => <MentorListLoading />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: 'Kształty: tekst, awatar, pole, blok',
  render: () => (
    <div className="flex max-w-form flex-col gap-group">
      <Skeleton className="h-lh w-1/2" />
      <Skeleton className="size-avatar-lg rounded-round" />
      <Skeleton className="h-control w-full" />
      <Skeleton className="h-control-lg w-full rounded-panel" />
    </div>
  ),
};

export const States: Story = {
  name: 'Macierz stanów',
  parameters: {
    docs: {
      description: {
        story:
          'Jeden stan: ładowanie. Pulsowanie tylko bez `prefers-reduced-motion`. Gdy dane przyjdą, szkielet zastępuje treść bez przeskoku układu.',
      },
    },
  },
  render: () => <MentorListLoading rows={1} />,
};

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  render: () => (
    <ViewportFrame width={320}>
      <MentorListLoading rows={6} />
    </ViewportFrame>
  ),
};

export const HiddenFromReaders: Story = {
  name: 'Test: szkielet ukryty, kontener mówi „wczytujemy”',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole('region', { name: 'Wczytujemy listę mentorów…' });
    await expect(region).toHaveAttribute('aria-busy', 'true');
    for (const block of canvasElement.querySelectorAll('[data-slot=skeleton]')) {
      await expect(block).toHaveAttribute('aria-hidden', 'true');
    }
  },
};
