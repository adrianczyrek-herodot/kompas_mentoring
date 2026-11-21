import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ViewportFrame } from '../../.storybook/blocks/component-docs';
import { ProfileHero, ProfileHeroSkeleton } from './profile-hero';

const meta = {
  title: 'Produkt/E2 Katalog i onboarding/ProfileHero',
  component: ProfileHero,
  args: {
    name: 'Anna Kowalczyk',
    headline: 'Staff Frontend Engineer w FinTech · Praktyk Design Systems i Next.js',
    bio: 'Pomagam programistom wejść na poziom seniorski i staff: architektura aplikacji frontendowych, projektowanie design systemów na tokenach, przygotowanie do rekrutacji system design oraz porządkowanie procesów inżynieryjnych.',
    initials: 'AK',
    tags: ['React', 'Next.js', 'TypeScript', 'Design Systems', 'Architektura'],
    trialRate: '95 zł',
    standardRate: '190 zł',
    responseTime: 'do 12 godzin',
    languages: ['polski', 'angielski'],
    onBookClick: fn(),
  },
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ProfileHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NewMentor: Story = {
  name: 'Nowy mentor',
  args: {
    name: 'Jan Brzozowski',
    headline: 'Senior Cloud DevOps Engineer',
    bio: 'Wdrażam Kubernetes, Terraform i CI/CD w skalowalnych środowiskach produkcyjnych. Pomagam w automatyzacji infrastruktury.',
    initials: 'JB',
    tags: ['DevOps', 'Kubernetes', 'AWS', 'Terraform'],
    trialRate: '80 zł',
    standardRate: '160 zł',
    isNew: true,
  },
};

export const NarrowScreen: Story = {
  name: 'Ekran 320 px',
  render: (args) => (
    <ViewportFrame width={320}>
      <ProfileHero {...args} />
    </ViewportFrame>
  ),
};

export const Loading: Story = {
  name: 'Stan ładowania (Skeleton)',
  render: () => <ProfileHeroSkeleton />,
};

export const BookAction: Story = {
  name: 'Test: kliknięcie wyboru terminu',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Wybierz termin sesji' });
    await userEvent.click(button);
    await expect(args.onBookClick).toHaveBeenCalledTimes(1);
  },
};
