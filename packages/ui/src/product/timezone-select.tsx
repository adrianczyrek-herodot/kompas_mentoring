import type * as React from 'react';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '../components/combobox';
import { Field, FieldDescription, FieldLabel } from '../components/field';
import { cn } from '../lib/utils';

/** Common zones first; the viewer's own zone is prepended by the caller when it is missing. */
const DEFAULT_TIME_ZONES = [
  'Europe/Warsaw',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Europe/Madrid',
  'Europe/Kyiv',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'UTC',
] as const;

type TimezoneSelectProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  value: string;
  onValueChange: (value: string) => void;
  /** Full list to offer; the selected value is always included. */
  zones?: readonly string[];
  label?: string;
  description?: string;
  disabled?: boolean;
  /** `id` of the input, for a `FieldLabel htmlFor`. */
  inputId?: string;
};

// U1/Q12: the viewer switches the zone of the grid for this visit only; the profile default lives
// in S3. Built on Combobox (DS-20) so the long IANA list stays searchable.
function TimezoneSelect({
  value,
  onValueChange,
  zones = DEFAULT_TIME_ZONES,
  label = 'Strefa czasowa',
  description,
  disabled,
  inputId,
  className,
  ...props
}: TimezoneSelectProps) {
  const options = zones.includes(value) ? zones : [value, ...zones];
  return (
    <div data-slot="timezone-select" className={cn('w-full max-w-form', className)} {...props}>
      <Field>
        <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
        <Combobox
          items={options}
          value={value}
          onValueChange={(next) => {
            if (next !== null) onValueChange(next);
          }}
          disabled={disabled}
        >
          <ComboboxInput
            id={inputId}
            placeholder="np. Europe/Warsaw"
            triggerLabel="Pokaż strefy czasowe"
            clearLabel="Wyczyść strefę"
          />
          <ComboboxContent>
            <ComboboxEmpty>Nie znaleziono takiej strefy. Spróbuj np. „Europe/Warsaw”.</ComboboxEmpty>
            <ComboboxList>
              {(zone: string) => (
                <ComboboxItem key={zone} value={zone}>
                  {zone}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        {description ? <FieldDescription>{description}</FieldDescription> : null}
      </Field>
    </div>
  );
}

export { DEFAULT_TIME_ZONES, TimezoneSelect, type TimezoneSelectProps };
