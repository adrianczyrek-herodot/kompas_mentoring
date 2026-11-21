import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ViewportFrame } from '../../.storybook/blocks/component-docs';
import { type ApiScenario, apiScenarios, fakeRequest } from '../../.storybook/examples/api';
import { ProfileForm, type ProfileValues } from '../../.storybook/examples/profile-form';
import { kasia } from '../../.storybook/fixtures/kompas';

// Kasia's bio from the mockups is 275 characters; one sentence added to pass the 300 minimum.
const bio = `${kasia.bio} Pracujemy na Twoim kodzie, nie na przykładach z kursu.`;
const filled: ProfileValues = { headline: kasia.headline, bio, video: '' };
const onRequest = fn();

type Args = { api: ApiScenario };

function Example({ api, initial }: Args & { initial?: ProfileValues }) {
  return (
    <ProfileForm
      initial={initial}
      onSubmit={(values) => {
        onRequest(values);
        return fakeRequest(api, {
          field: 'headline',
          message:
            'Nagłówek nie może zawierać e-maila, telefonu ani linku — kontakt odbywa się w Kompasie.',
        });
      }}
    />
  );
}

const meta = {
  title: 'Wzorce/Formularz',
  args: { api: 'success' },
  argTypes: { api: { control: 'inline-radio', options: apiScenarios, name: 'Odpowiedź API' } },
  render: (args) => <Example {...args} />,
  parameters: {
    docs: {
      description: {
        component:
          'Formularz kroku „Opis i wideo” onboardingu mentora (M1, E2-S2). Etykieta zawsze widoczna, placeholder to przykład; walidacja po opuszczeniu pola i przy wysłaniu; po nieudanym wysłaniu fokus na pierwszym błędzie; dane zostają; blokada podwójnego wysłania; sukces dopiero po odpowiedzi serwera.',
      },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { name: 'Pusty formularz' };

export const Filled: Story = {
  name: 'Wypełniony',
  render: (args) => <Example {...args} initial={filled} />,
};

async function submitFilled(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: 'Zapisz szkic' }));
  return canvas;
}

export const BlurValidation: Story = {
  name: 'Walidacja po opuszczeniu pola',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const headline = canvas.getByLabelText('Nagłówek profilu');
    await userEvent.type(headline, 'Frontend');
    await expect(canvas.queryByText(/potrzeba co najmniej 20/)).toBeNull();
    await userEvent.tab();
    await expect(headline).toHaveAttribute('aria-invalid', 'true');
    await expect(headline).toHaveAccessibleDescription(
      /Nagłówek ma 8 znaków — potrzeba co najmniej 20\./,
    );
    await userEvent.type(headline, ' Engineer · React, TypeScript');
    await expect(headline).not.toHaveAttribute('aria-invalid');
  },
};

export const SubmitErrors: Story = {
  name: 'Błędy przy wysłaniu — fokus na pierwszym',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const video = canvas.getByLabelText(/Link do filmu/);
    await userEvent.type(video, 'mojfilm.pl/intro');
    onRequest.mockClear();
    await submitFilled(canvasElement);
    await expect(onRequest).not.toHaveBeenCalled();
    await expect(canvas.getByLabelText('Nagłówek profilu')).toHaveFocus();
    await expect(canvas.getAllByRole('alert')).toHaveLength(3);
    await expect(video).toHaveValue('mojfilm.pl/intro');
  },
};

export const Pending: Story = {
  name: 'API: oczekiwanie (blokada podwójnego wysłania)',
  args: { api: 'pending' },
  render: (args) => <Example {...args} initial={filled} />,
  play: async ({ canvasElement }) => {
    onRequest.mockClear();
    const canvas = await submitFilled(canvasElement);
    const button = canvas.getByRole('button', { name: 'Zapisz szkic' });
    await waitFor(() => expect(button).toHaveAttribute('aria-busy', 'true'));
    await userEvent.click(button);
    await expect(onRequest).toHaveBeenCalledOnce();
    await expect(canvas.queryByRole('status')).toBeNull();
  },
};

export const Success: Story = {
  name: 'API: sukces po potwierdzeniu serwera',
  render: (args) => <Example {...args} initial={filled} />,
  play: async ({ canvasElement }) => {
    const canvas = await submitFilled(canvasElement);
    await expect(canvas.queryByText('Zapisaliśmy szkic profilu')).toBeNull();
    await expect(await canvas.findByText('Zapisaliśmy szkic profilu')).toBeVisible();
    await expect(canvas.getByLabelText('Nagłówek profilu')).toHaveValue(kasia.headline);
  },
};

export const FieldErrorFromServer: Story = {
  name: 'API: błąd pola',
  args: { api: 'field-error' },
  render: (args) => <Example {...args} initial={filled} />,
  play: async ({ canvasElement }) => {
    const canvas = await submitFilled(canvasElement);
    const headline = canvas.getByLabelText('Nagłówek profilu');
    await waitFor(() => expect(headline).toHaveFocus());
    await expect(headline).toHaveAccessibleDescription(/nie może zawierać e-maila/);
  },
};

export const ServerError: Story = {
  name: 'API: błąd serwera',
  args: { api: 'server-error' },
  render: (args) => <Example {...args} initial={filled} />,
  play: async ({ canvasElement }) => {
    const canvas = await submitFilled(canvasElement);
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Nie udało się zapisać szkicu',
    );
    await expect(canvas.getByLabelText('Opis')).toHaveValue(bio);
    await expect(canvas.getByRole('button', { name: 'Zapisz szkic' })).toBeEnabled();
  },
};

export const Offline: Story = {
  name: 'API: brak sieci',
  args: { api: 'offline' },
  render: (args) => <Example {...args} initial={filled} />,
  play: async ({ canvasElement }) => {
    const canvas = await submitFilled(canvasElement);
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Brak połączenia z internetem',
    );
    await expect(canvas.getByLabelText('Nagłówek profilu')).toHaveValue(kasia.headline);
  },
};

export const Narrow: Story = {
  name: 'Wąski ekran 320 px',
  render: (args) => (
    <ViewportFrame width={320}>
      <Example {...args} initial={filled} />
    </ViewportFrame>
  ),
};
