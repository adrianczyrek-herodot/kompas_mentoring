import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { VideoFacade } from './video-facade';

const meta = {
  title: 'Produkt/E2 Katalog i onboarding/VideoFacade',
  component: VideoFacade,
  args: {
    provider: 'youtube',
    videoId: 'dQw4w9WgXcQ',
    title: 'O mnie — krótkie intro',
  },
  render: (args) => (
    <div className="max-w-content">
      <VideoFacade {...args} />
    </div>
  ),
} satisfies Meta<typeof VideoFacade>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Vimeo: Story = {
  args: { provider: 'vimeo', videoId: '123456789', title: 'Moje podejście do mentoringu' },
};

export const LoadsOnlyAfterClick: Story = {
  name: 'Test: odtwarzacz ładuje się dopiero po kliknięciu',
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('iframe')).toBeNull();
    const button = within(canvasElement).getByRole('button', { name: /O mnie/ });
    await userEvent.click(button);
    const frame = canvasElement.querySelector('iframe');
    await expect(frame?.getAttribute('src')).toContain('youtube-nocookie.com');
  },
};
