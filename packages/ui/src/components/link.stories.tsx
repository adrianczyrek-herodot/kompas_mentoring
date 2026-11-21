import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
  type PreviewState,
  StateMatrix,
  ViewportFrame,
} from '../../.storybook/blocks/component-docs';
import { Link } from './link';

const meta = {
  title: 'Komponenty bazowe/Akcje/Link',
  component: Link,
  args: { href: '#zasady-anulowania', children: 'Zasady przekładania i anulowania' },
  argTypes: { children: { control: 'text' }, href: { control: 'text' } },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: 'Warianty: w tekście i samodzielny',
  render: () => (
    <div className="flex max-w-measure flex-col gap-group text-body text-text-default">
      <p>
        Sesję możesz bezpłatnie przełożyć do 12 godzin przed startem.{' '}
        <Link href="#zasady">Zasady przekładania i anulowania</Link>
      </p>
      <p className="text-body-dense">
        <Link href="#reset">Nie pamiętasz hasła?</Link>
      </p>
      <p className="text-body-dense">
        Masz doświadczenie, którym chcesz się dzielić? <Link href="#mentor">Zostań mentorem</Link>
      </p>
    </div>
  ),
};

const states: { column: string; preview?: PreviewState }[] = [
  { column: 'Domyślny' },
  { column: 'Najechanie', preview: 'hover' },
  { column: 'Fokus', preview: 'focus' },
];

export const States: Story = {
  name: 'Macierz stanów',
  parameters: {
    docs: {
      description: {
        story:
          'Link nie ma stanu zablokowanego: jeśli cel nie istnieje, nie renderuj linku i napisz dlaczego.',
      },
    },
  },
  render: () => (
    <StateMatrix
      columns={states.map((state) => state.column)}
      rows={[
        {
          label: 'Link',
          cells: states.map((state) => (
            <Link key={state.column} href="#profil" data-preview-state={state.preview}>
              Zobacz profil
            </Link>
          )),
        },
      ]}
    />
  ),
};

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  render: () => (
    <ViewportFrame width={320}>
      <p className="text-body text-text-default">
        Przed pierwszą rezerwacją potwierdź adres e-mail.{' '}
        <Link href="#wyslij">
          Wyślij ponownie link weryfikacyjny na adres katarzyna.wisniewska@example.com
        </Link>
      </p>
    </ViewportFrame>
  ),
};

export const KeyboardFocus: Story = {
  name: 'Test: fokus z klawiatury',
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', {
      name: 'Zasady przekładania i anulowania',
    });
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(link).toHaveAttribute('href', '#zasady-anulowania');
  },
};
