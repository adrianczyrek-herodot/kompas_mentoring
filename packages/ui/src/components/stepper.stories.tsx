import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Stepper, type StepperStep } from './stepper';

const steps: StepperStep[] = [
  { id: 'about', label: 'O mnie', state: 'completed', href: '/mentor/onboarding/o-mnie' },
  { id: 'skills', label: 'Kompetencje', state: 'completed', href: '/mentor/onboarding/kompetencje' },
  { id: 'bio', label: 'Opis i wideo', state: 'current', href: '/mentor/onboarding/opis-i-wideo' },
  { id: 'rate', label: 'Stawka', state: 'upcoming', href: '/mentor/onboarding/stawka' },
  { id: 'availability', label: 'Dostępność', state: 'upcoming' },
  { id: 'verification', label: 'Weryfikacja', state: 'upcoming' },
];

const meta = {
  title: 'Produkt/E2 Katalog i onboarding/Stepper',
  component: Stepper,
  args: { steps, label: 'Kroki onboardingu' },
  render: (args) => (
    <div className="max-w-content">
      <Stepper {...args} />
    </div>
  ),
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const FirstStep: Story = {
  name: 'Pierwszy krok (nic nie wypełnione)',
  args: {
    steps: steps.map((step, index) => ({
      id: step.id,
      label: step.label,
      state: index === 0 ? ('current' as const) : ('upcoming' as const),
    })),
  },
};

export const WithError: Story = {
  name: 'Krok z błędem',
  args: {
    steps: [
      { id: 'about', label: 'O mnie', state: 'completed' },
      { id: 'skills', label: 'Kompetencje', state: 'error' },
      { id: 'bio', label: 'Opis i wideo', state: 'upcoming' },
      { id: 'rate', label: 'Stawka', state: 'upcoming' },
      { id: 'availability', label: 'Dostępność', state: 'upcoming' },
      { id: 'verification', label: 'Weryfikacja', state: 'upcoming' },
    ],
  },
};

export const AnnouncesCurrentStep: Story = {
  name: 'Test: czytnik ogłasza bieżący krok',
  play: async ({ canvasElement }) => {
    const current = canvasElement.querySelector('[aria-current="step"]');
    await expect(current?.textContent).toContain('Opis i wideo');
  },
};
