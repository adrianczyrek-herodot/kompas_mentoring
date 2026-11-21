import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/card';
import { Field, FieldDescription, FieldLabel } from '../components/field';
import { RadioGroup, RadioGroupItem } from '../components/radio-group';
import { Textarea } from '../components/textarea';

function DecisionReasonDemo() {
  const [decision, setDecision] = React.useState<string>('accept');
  const [presetReason, setPresetReason] = React.useState<string>('topic_mismatch');
  const [comment, setComment] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Card className="max-w-form w-full border-border-divider bg-surface-panel p-panel">
      <CardHeader className="p-0 pb-group">
        <CardTitle>Decyzja weryfikacyjna wniosku mentora</CardTitle>
        <CardDescription>
          Wybierz rozstrzygnięcie. W przypadku odrzucenia wskaż powód, który otrzyma kandydat.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {submitted ? (
          <div className="rounded-panel border border-border-divider bg-surface-sunken p-panel">
            <p className="text-body font-medium text-text-default">
              Decyzja ({decision === 'accept' ? 'Zaakceptowano' : 'Odrzucono'}) została zapisana.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-group">
            <Field>
              <FieldLabel>Rozstrzygnięcie</FieldLabel>
              <RadioGroup
                value={decision}
                onValueChange={(val: string) => {
                  setDecision(val);
                }}
                className="space-y-tight"
              >
                <div className="flex items-center gap-inline">
                  <RadioGroupItem value="accept" id="dec-accept" />
                  <label
                    htmlFor="dec-accept"
                    className="text-body text-text-default cursor-pointer"
                  >
                    Zaakceptuj wniosek i aktywuj profil
                  </label>
                </div>
                <div className="flex items-center gap-inline">
                  <RadioGroupItem value="reject" id="dec-reject" />
                  <label
                    htmlFor="dec-reject"
                    className="text-body text-text-default cursor-pointer"
                  >
                    Odrzuć wniosek z uzasadnieniem
                  </label>
                </div>
              </RadioGroup>
            </Field>

            {decision === 'reject' ? (
              <div className="space-y-group rounded-control border border-border-divider bg-surface-sunken p-panel">
                <Field>
                  <FieldLabel>Główny powód odrzucenia</FieldLabel>
                  <RadioGroup
                    value={presetReason}
                    onValueChange={(val: string) => {
                      setPresetReason(val);
                    }}
                    className="space-y-tight"
                  >
                    <div className="flex items-center gap-inline">
                      <RadioGroupItem value="topic_mismatch" id="r-topic" />
                      <label
                        htmlFor="r-topic"
                        className="text-body-dense text-text-default cursor-pointer"
                      >
                        Tematyka spoza zakresu portalu
                      </label>
                    </div>
                    <div className="flex items-center gap-inline">
                      <RadioGroupItem value="lack_experience" id="r-exp" />
                      <label
                        htmlFor="r-exp"
                        className="text-body-dense text-text-default cursor-pointer"
                      >
                        Niewystarczający opis doświadczenia komercyjnego
                      </label>
                    </div>
                    <div className="flex items-center gap-inline">
                      <RadioGroupItem value="other" id="r-other" />
                      <label
                        htmlFor="r-other"
                        className="text-body-dense text-text-default cursor-pointer"
                      >
                        Inny powód (wymaga komentarza poniżej)
                      </label>
                    </div>
                  </RadioGroup>
                </Field>

                <Field>
                  <FieldLabel htmlFor="decision-comment">Komentarz dla kandydata</FieldLabel>
                  <Textarea
                    id="decision-comment"
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                    }}
                    placeholder="Wskaż kandydatowi, co może poprawić w profilu..."
                    rows={3}
                    showCount
                    maxCount={300}
                  />
                  <FieldDescription>
                    Wiadomość trafi bezpośrednio na podany adres e-mail.
                  </FieldDescription>
                </Field>
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-inline border-t border-border-divider pt-group">
              <Button type="button" variant="outline">
                Anuluj
              </Button>
              <Button type="submit" variant={decision === 'reject' ? 'danger' : 'default'}>
                {decision === 'reject' ? 'Odrzuć wniosek' : 'Zatwierdź decyzję'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

const meta = {
  title: 'Wzorce/Decyzja z powodem',
  component: DecisionReasonDemo,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof DecisionReasonDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AcceptFlow: Story = {
  name: '1. Akceptacja wniosku',
};

export const RejectFlowTest: Story = {
  name: '2. Odrzucenie: pojawienie się powodów i zmiana przycisku na destrukcyjny',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rejectRadio = canvas.getByLabelText(/Odrzuć wniosek z uzasadnieniem/i);
    await userEvent.click(rejectRadio);

    await expect(canvas.getByText('Główny powód odrzucenia')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Odrzuć wniosek' })).toBeVisible();
  },
};
