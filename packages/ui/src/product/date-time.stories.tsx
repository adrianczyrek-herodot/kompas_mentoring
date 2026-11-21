import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { StateMatrix } from '../../.storybook/blocks/component-docs';
import { NOW, TZ } from '../../.storybook/fixtures/kompas';
import { DateTime } from './date-time';

const SESSION = '2026-10-22T09:00:00+02:00';

const meta = {
  title: 'Produkt/Wspólne/DateTime',
  component: DateTime,
  args: { value: SESSION, timeZone: TZ, format: 'datetime' },
  argTypes: {
    format: { control: 'inline-radio', options: ['datetime', 'date', 'time', 'weekday'] },
    timeZone: {
      control: 'select',
      options: ['Europe/Warsaw', 'Europe/London', 'America/New_York', 'Asia/Tokyo'],
    },
  },
} satisfies Meta<typeof DateTime>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Formats: Story = {
  name: 'Formaty',
  render: () => (
    <StateMatrix
      columns={['Format', 'Wyświetlane', 'Gdzie']}
      rows={[
        {
          label: 'datetime',
          cells: [
            'datetime',
            <DateTime key="a" value={SESSION} timeZone={TZ} />,
            'listy, karty, powiadomienia',
          ],
        },
        {
          label: 'weekday',
          cells: [
            'weekday',
            <DateTime key="b" value={SESSION} timeZone={TZ} format="weekday" />,
            'nagłówki dni w SlotGrid, wiersze U4',
          ],
        },
        {
          label: 'time',
          cells: [
            'time',
            <DateTime key="c" value={SESSION} timeZone={TZ} format="time" />,
            'sloty, agenda dnia',
          ],
        },
        {
          label: 'date',
          cells: [
            'date',
            <DateTime key="d" value={NOW} timeZone={TZ} format="date" />,
            'daty bez godziny (wnioski, faktury)',
          ],
        },
      ]}
    />
  ),
};

export const TimeZones: Story = {
  name: 'Ta sama chwila w różnych strefach',
  render: () => (
    <StateMatrix
      columns={['Wyświetlane']}
      rows={['Europe/Warsaw', 'Europe/London', 'America/New_York', 'Asia/Tokyo'].map((zone) => ({
        label: zone,
        cells: [<DateTime key={zone} value={SESSION} timeZone={zone} />],
      }))}
    />
  ),
};

export const ZoneTest: Story = {
  name: 'Test: strefa ucznia, atrybut datetime',
  render: () => (
    <p>
      <DateTime value={SESSION} timeZone="Europe/London" format="time" />
    </p>
  ),
  play: async ({ canvasElement }) => {
    const time = within(canvasElement).getByText('08:00');
    await expect(time).toHaveAttribute('datetime', SESSION);
  },
};
