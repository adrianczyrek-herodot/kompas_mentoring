import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Checkbox,
  Field,
  FieldDescription,
  FieldLabel,
  Input,
  Label,
} from '../../../src';
import { contrastPairs } from '../../blocks/color-data';

/**
 * Test-only stories for the Foundations: every text/background pair is rendered as real text,
 * so the a11y test (axe `color-contrast`) checks the tokens in both themes.
 */
const meta = {
  title: 'Podstawy/Testy podstaw',
  tags: ['!autodocs'],
  parameters: { docs: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ParyKontrastuTekstu: Story = {
  name: 'Pary kontrastu tekstu',
  render: () => (
    <ul className="flex flex-col gap-inline">
      {contrastPairs
        .filter((pair) => pair.min === 4.5)
        .map((pair) => (
          <li
            key={pair.label}
            className="rounded-control p-panel text-body-dense"
            style={{ color: `var(--${pair.fg})`, background: `var(--${pair.bg})` }}
          >
            {pair.label}: {pair.fg} na {pair.bg}
          </li>
        ))}
    </ul>
  ),
};

export const KomponentyWMotywie: Story = {
  name: 'Komponenty w bieżącym motywie',
  render: () => (
    <div className="flex max-w-form flex-col gap-group">
      <Field>
        <FieldLabel htmlFor="goal">Z czym przychodzisz?</FieldLabel>
        <Input id="goal" placeholder="np. przygotowanie do rozmowy na stanowisko junior frontend" />
        <FieldDescription>Od 20 do 500 znaków. Mentor przeczyta to przed sesją.</FieldDescription>
      </Field>
      <Label className="gap-inline">
        <Checkbox /> Akceptuję regulamin i politykę prywatności
      </Label>
      <Alert>
        <AlertTitle>Bezpłatnie przełożysz do 12 godzin przed sesją</AlertTitle>
        <AlertDescription>Później sesja przepada (reguła 4 briefu).</AlertDescription>
      </Alert>
      <div className="flex flex-wrap gap-inline">
        <Button>Zarezerwuj sesję próbną</Button>
        <Button variant="outline">Napisz wiadomość</Button>
      </div>
    </div>
  ),
};
