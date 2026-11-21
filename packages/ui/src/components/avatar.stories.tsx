import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import sample from '../../.storybook/assets/avatar-sample.svg';
import { StateMatrix, ViewportFrame } from '../../.storybook/blocks/component-docs';
import { Avatar, AvatarFallback, AvatarImage, type AvatarProps } from './avatar';

const meta = {
  title: 'Komponenty bazowe/Treść/Avatar',
  component: Avatar,
  args: { size: 'md' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  render: (args) => (
    <div className="flex items-center gap-inline">
      <Avatar {...args}>
        <AvatarImage src={sample} alt="" />
        <AvatarFallback aria-hidden="true">AK</AvatarFallback>
      </Avatar>
      <span className="text-body">Anna Kowalczyk</span>
    </div>
  ),
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const sizes: { size: NonNullable<AvatarProps['size']>; where: string }[] = [
  { size: 'sm', where: 'sm 32 px — wiersz prośby (M2), kolejka (A1)' },
  { size: 'md', where: 'md 40 px — karta mentora (P2), nagłówek' },
  { size: 'lg', where: 'lg 64 px — profil mentora (P3)' },
];

export const Variants: Story = {
  name: 'Rozmiary',
  render: () => (
    <div className="flex flex-col gap-group">
      {sizes.map(({ size, where }) => (
        <div key={size} className="flex items-center gap-group">
          <Avatar size={size}>
            <AvatarImage src={sample} alt="" />
            <AvatarFallback aria-hidden="true">PN</AvatarFallback>
          </Avatar>
          <Avatar size={size}>
            <AvatarFallback aria-hidden="true">PN</AvatarFallback>
          </Avatar>
          <span className="text-meta text-text-muted">{where}</span>
        </div>
      ))}
    </div>
  ),
};

export const States: Story = {
  name: 'Macierz stanów',
  parameters: {
    docs: {
      description: {
        story:
          'Awatar nie jest interaktywny (klikalny jest otaczający link lub przycisk). Stany ładowania obrazu: zdjęcie, brak zdjęcia i błąd ładowania pokazują inicjały.',
      },
    },
  },
  render: () => (
    <StateMatrix
      columns={['Zdjęcie', 'Bez zdjęcia', 'Błąd ładowania']}
      rows={[
        {
          label: 'md',
          cells: [
            <Avatar key="a">
              <AvatarImage src={sample} alt="Anna Kowalczyk" />
              <AvatarFallback>AK</AvatarFallback>
            </Avatar>,
            <Avatar key="b">
              <AvatarFallback>AK</AvatarFallback>
            </Avatar>,
            <Avatar key="c">
              <AvatarImage src="data:," alt="Anna Kowalczyk" />
              <AvatarFallback>AK</AvatarFallback>
            </Avatar>,
          ],
        },
      ]}
    />
  ),
};

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  render: () => (
    <ViewportFrame width={320}>
      <div className="flex items-center gap-inline">
        <Avatar size="sm">
          <AvatarFallback aria-hidden="true">KW</AvatarFallback>
        </Avatar>
        <span className="min-w-0 text-body-dense">
          Katarzyna Wiśniewska-Zalewska prosi o sesję próbną we wtorek, 14:30
        </span>
      </div>
    </ViewportFrame>
  ),
};

export const FallbackOnError: Story = {
  name: 'Test: inicjały, gdy zdjęcie się nie wczyta',
  render: () => (
    <Avatar>
      <AvatarImage src="data:," alt="Anna Kowalczyk" />
      <AvatarFallback>AK</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('AK')).toBeVisible());
    await expect(canvas.queryByRole('img')).not.toBeInTheDocument();
  },
};
