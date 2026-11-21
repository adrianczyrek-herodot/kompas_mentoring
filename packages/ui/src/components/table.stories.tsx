import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ViewportFrame } from '../../.storybook/blocks/component-docs';
import { Avatar, AvatarFallback } from './avatar';
import { Badge } from './badge';
import { Button } from './button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

type Application = {
  id: string;
  name: string;
  initials: string;
  category: string;
  sent: string;
  hours: number;
  status: 'new' | 'changes' | 'overdue';
};

const applications: Application[] = [
  {
    id: '1',
    name: 'Anna Kowalczyk',
    initials: 'AK',
    category: 'IT',
    sent: '19 lis, 09:12',
    hours: 6,
    status: 'new',
  },
  {
    id: '2',
    name: 'Piotr Nowak',
    initials: 'PN',
    category: 'Biznes',
    sent: '18 lis, 16:40',
    hours: 22,
    status: 'changes',
  },
  {
    id: '3',
    name: 'Katarzyna Wiśniewska-Zalewska',
    initials: 'KW',
    category: 'Design',
    sent: '17 lis, 11:05',
    hours: 50,
    status: 'overdue',
  },
];

const statusBadge: Record<Application['status'], React.ReactNode> = {
  new: <Badge>Nowy</Badge>,
  changes: <Badge variant="warning">Poprawiony po zmianach</Badge>,
  overdue: <Badge variant="danger">Po terminie</Badge>,
};

function QueueRow({ row }: { row: Application }) {
  return (
    <TableRow>
      <TableCell>
        <span className="flex items-center gap-inline">
          <Avatar size="sm">
            <AvatarFallback aria-hidden="true">{row.initials}</AvatarFallback>
          </Avatar>
          {row.name}
        </span>
      </TableCell>
      <TableCell>{row.category}</TableCell>
      <TableCell className="tabular-nums">{row.sent}</TableCell>
      <TableCell numeric>{row.hours}</TableCell>
      <TableCell>{statusBadge[row.status]}</TableCell>
      <TableCell>
        <Button size="sm" variant="outline" aria-label={`Otwórz wniosek: ${row.name}`}>
          Otwórz
        </Button>
      </TableCell>
    </TableRow>
  );
}

function QueueTable({ rows, caption }: { rows: Application[]; caption: string }) {
  return (
    <Table>
      <TableCaption>{caption}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Mentor</TableHead>
          <TableHead>Kategoria</TableHead>
          <TableHead>Wysłano</TableHead>
          <TableHead numeric>Czeka (h)</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>
            <span className="sr-only">Akcje</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <QueueRow key={row.id} row={row} />
        ))}
      </TableBody>
    </Table>
  );
}

const meta = {
  title: 'Komponenty bazowe/Treść/Table',
  render: () => (
    <QueueTable rows={applications} caption="Kolejka weryfikacji: 3 wnioski, najstarsze na dole." />
  ),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: 'Odmiany: z akcjami i zaznaczonym wierszem',
  render: () => (
    <Table>
      <TableCaption>Rozliczenie tygodnia (przykład kolumn liczbowych).</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Dzień</TableHead>
          <TableHead numeric>Sesje</TableHead>
          <TableHead numeric>Godziny</TableHead>
          <TableHead numeric>Kwota</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Poniedziałek</TableCell>
          <TableCell numeric>2</TableCell>
          <TableCell numeric>1,5</TableCell>
          <TableCell numeric>270,00 zł</TableCell>
        </TableRow>
        <TableRow aria-selected="true">
          <TableCell>Wtorek</TableCell>
          <TableCell numeric>3</TableCell>
          <TableCell numeric>2,5</TableCell>
          <TableCell numeric>450,00 zł</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const States: Story = {
  name: 'Macierz stanów',
  parameters: {
    docs: {
      description: {
        story:
          'Tabela nie ma własnych stanów interakcji (mają je przyciski w wierszach). Wiersz wybrany: `aria-selected` → `selected-bg`. Stany danych (ładowanie, pusto, błąd) pokazuje wzorzec „Lista z filtrami” w etapie 3; tu: jeden wiersz i pusty wynik.',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-section">
      <QueueTable rows={applications.slice(0, 1)} caption="Jeden wniosek w kolejce." />
      <QueueTable rows={[]} caption="Brak wniosków do weryfikacji. Nowe pojawią się tutaj." />
    </div>
  ),
};

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  render: () => (
    <ViewportFrame width={320}>
      <QueueTable rows={applications} caption="Na 320 px tabela przewija się w poziomie." />
    </ViewportFrame>
  ),
};

export const HeadersAndAction: Story = {
  name: 'Test: nagłówki kolumn i akcja wiersza',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('columnheader')).toHaveLength(6);
    await expect(canvas.getByRole('button', { name: 'Otwórz wniosek: Piotr Nowak' })).toBeVisible();
    await expect(canvas.getByRole('table')).toHaveAccessibleName(/Kolejka weryfikacji/);
  },
};
