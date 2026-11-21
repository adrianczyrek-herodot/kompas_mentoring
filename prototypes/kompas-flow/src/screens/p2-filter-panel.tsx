/**
 * DS-GAP: FilterPanel — listed in packages/ui/POSTEP.md, but only an unexported Storybook example
 * exists (.storybook/examples/mentor-search.tsx). Rebuilt here from the same DS primitives.
 */
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
  ToggleGroup,
  ToggleGroupItem,
} from '@kompas/ui';
import { useId } from 'react';
import { CATEGORIES } from '../data/mentors';
import { type Filters, PRICE_MAX, TIME_LABELS, type TimeOfDay } from './p2-filters';

const categoryItems = [
  { value: '', label: 'Wszystkie tematy' },
  ...CATEGORIES.map((c) => ({ value: c, label: c })),
];
const languageItems = [
  { value: '', label: 'Dowolny' },
  { value: 'polski', label: 'polski' },
  { value: 'angielski', label: 'angielski' },
];
const yearsItems = [
  { value: '0', label: 'Dowolne' },
  { value: '5', label: 'Co najmniej 5 lat' },
  { value: '8', label: 'Co najmniej 8 lat' },
  { value: '10', label: 'Co najmniej 10 lat' },
];

function SimpleSelect({
  id,
  label,
  items,
  value,
  onChange,
}: {
  id: string;
  label: string;
  items: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        items={items}
        value={value}
        onValueChange={(next) => {
          onChange(next ?? '');
        }}
      >
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

function PriceField({ filters, onChange }: { filters: Filters; onChange: (next: Filters) => void }) {
  const id = useId();
  const [min, max] = filters.price;
  return (
    <Field>
      <div className="flex items-baseline justify-between gap-inline">
        <FieldTitle id={id}>Cena za 60 minut</FieldTitle>
        <output className="text-body-dense tabular-nums">
          {min}–{max} zł
        </output>
      </div>
      <Slider
        aria-labelledby={id}
        thumbLabels={['Cena od', 'Cena do']}
        min={0}
        max={PRICE_MAX}
        step={10}
        largeStep={100}
        value={filters.price}
        onValueChange={(next: number | readonly number[]) => {
          const [from = 0, to = PRICE_MAX] = typeof next === 'number' ? [next] : next;
          onChange({ ...filters, price: [Math.min(from, to), Math.max(from, to)] });
        }}
      />
      <FieldDescription>Od 0 do 1000 zł.</FieldDescription>
    </Field>
  );
}

function TimeField({ filters, onChange }: { filters: Filters; onChange: (next: Filters) => void }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-tight">
      <FieldTitle id={id}>Dostępność — pora dnia</FieldTitle>
      <ToggleGroup
        aria-labelledby={id}
        multiple
        value={filters.times}
        onValueChange={(value) => {
          onChange({ ...filters, times: value as TimeOfDay[] });
        }}
        className="flex-wrap"
      >
        {(Object.keys(TIME_LABELS) as TimeOfDay[]).map((time) => (
          <ToggleGroupItem key={time} value={time}>
            {TIME_LABELS[time]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

export function FilterPanel({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-group">
      <Field>
        <FieldLabel htmlFor={`${id}-q`}>Szukana fraza</FieldLabel>
        <Input
          id={`${id}-q`}
          type="search"
          value={filters.topic}
          placeholder="np. React"
          onChange={(event) => {
            onChange({ ...filters, topic: event.target.value });
          }}
        />
      </Field>
      <SimpleSelect
        id={`${id}-cat`}
        label="Temat"
        items={categoryItems}
        value={filters.category}
        onChange={(category) => {
          onChange({ ...filters, category });
        }}
      />
      <PriceField filters={filters} onChange={onChange} />
      <TimeField filters={filters} onChange={onChange} />
      <SimpleSelect
        id={`${id}-lang`}
        label="Język sesji"
        items={languageItems}
        value={filters.language}
        onChange={(language) => {
          onChange({ ...filters, language });
        }}
      />
      <SimpleSelect
        id={`${id}-years`}
        label="Lata doświadczenia"
        items={yearsItems}
        value={String(filters.minYears)}
        onChange={(years) => {
          onChange({ ...filters, minYears: Number(years) });
        }}
      />
      <Field orientation="horizontal" className="justify-between">
        <FieldLabel htmlFor={`${id}-verified`}>Tylko zweryfikowani</FieldLabel>
        <Switch
          id={`${id}-verified`}
          checked={filters.verifiedOnly}
          onCheckedChange={(verifiedOnly) => {
            onChange({ ...filters, verifiedOnly });
          }}
        />
      </Field>
    </div>
  );
}
