import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ViewportFrame } from '../../.storybook/blocks/component-docs';
import { MentorCard, MentorCardSkeleton } from './mentor-card';

const meta = {
  title: 'Produkt/E2 Katalog i onboarding/MentorCard',
  component: MentorCard,
  args: {
    name: 'Piotr Nowak',
    title: 'Lead Architect w Chmurze · 12 lat doświadczenia',
    initials: 'PN',
    tags: ['Architektura', 'System Design', 'TypeScript', 'AWS'],
    trialRate: '90 zł',
    standardRate: '180 zł',
    rating: '4.95',
    reviewCount: 28,
    availableSoon: true,
    onBookTrial: fn(),
    onViewProfile: fn(),
  },
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof MentorCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NewMentor: Story = {
  name: 'Nowy mentor (bez ocen)',
  args: {
    name: 'Marta Kowalczyk',
    title: 'Senior Product Designer w FinTech',
    initials: 'MK',
    tags: ['Figma', 'Design System', 'Audyt UX', 'Warsztaty'],
    trialRate: '75 zł',
    standardRate: '150 zł',
    isNew: true,
    rating: undefined,
    reviewCount: undefined,
  },
};

export const NoAvailability: Story = {
  name: 'Brak dostępnych terminów',
  args: {
    availableSoon: false,
  },
};

export const LongContent: Story = {
  name: 'Długa treść (320 px)',
  render: (args) => (
    <ViewportFrame width={320}>
      <MentorCard
        {...args}
        name="Aleksandra Dąbrowska-Kołodziejczyk"
        title="Principal Software Engineer & Technical Director w rozproszonych systemach bankowych"
        tags={['Mikroserwisy', 'Event-Driven', 'Kubernetes', 'DDD', 'Kafka', 'Bezpieczeństwo']}
      />
    </ViewportFrame>
  ),
};

export const Loading: Story = {
  name: 'Stan ładowania (Skeleton)',
  render: () => (
    <div className="max-w-xl">
      <MentorCardSkeleton />
    </div>
  ),
};

export const BookTrialAction: Story = {
  name: 'Test: kliknięcie rezerwacji i profilu',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const bookButton = canvas.getByRole('button', { name: 'Zarezerwuj sesję próbną' });
    await userEvent.click(bookButton);
    await expect(args.onBookTrial).toHaveBeenCalledTimes(1);

    const profileButton = canvas.getByRole('button', { name: 'Profil' });
    await userEvent.click(profileButton);
    await expect(args.onViewProfile).toHaveBeenCalledTimes(1);
  },
};
