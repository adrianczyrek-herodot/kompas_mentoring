import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { PhotoUploader } from './photo-uploader';

const onSelect = fn();

const meta = {
  title: 'Produkt/E2 Katalog i onboarding/PhotoUploader',
  component: PhotoUploader,
  args: {
    onSelect,
    chooseLabel: 'Wybierz zdjęcie',
    retryLabel: 'Spróbuj ponownie',
    description: 'JPG lub PNG, co najmniej 400×400 px, maksymalnie 5 MB.',
    state: 'idle',
  },
  render: (args) => (
    <div className="max-w-form">
      <PhotoUploader {...args} />
    </div>
  ),
} satisfies Meta<typeof PhotoUploader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithPreview: Story = {
  name: 'Z podglądem',
  args: {
    previewUrl:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="%23efeae0"/></svg>',
      ),
    fileName: 'anna-kowalska.jpg',
  },
};

export const Uploading: Story = {
  args: { state: 'uploading', fileName: 'anna-kowalska.jpg' },
};

export const WithError: Story = {
  args: {
    state: 'error',
    error: 'Ten plik ma 320×320 px. Potrzebujemy co najmniej 400×400 px.',
  },
};
