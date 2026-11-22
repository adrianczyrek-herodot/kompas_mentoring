/** U8 building blocks: plan picker, price breakdown, date helper (KONCEPCJA §U8). */
import {
  FieldLegend,
  FieldSet,
  formatCount,
  formatDateTime,
  Money,
  RadioGroup,
  RadioGroupItem,
  ToggleGroup,
  ToggleGroupItem,
} from '@kompas/ui';
import type { Mentor } from '../data/mentors';
import { PLAN_PER_WEEK, PLAN_WEEKS, planPrice } from '../data/progress';
import { TZ } from '../lib/clock';

type Duration = 30 | 60;
export type PlanChoice = { perWeek: number; durationMin: Duration };

export const SESSION_FORMS = { one: 'sesja', few: 'sesje', many: 'sesji' };

/** `YYYY-MM-DD` calendar date → „3 listopada 2026” (noon UTC keeps the day in every viewer zone). */
export function calendarDate(date: string): string {
  return formatDateTime(`${date}T12:00:00Z`, TZ, 'date');
}

export function planLabel(choice: PlanChoice): string {
  return `${String(choice.perWeek)}× w tygodniu, ${String(choice.durationMin)} min`;
}

// DS-GAP: PlanPicker (KONCEPCJA §U8) — ToggleGroup for the session length + RadioGroup of options
// with the 4-week price; there is no dedicated component in @kompas/ui.
export function PlanPicker({
  mentor,
  value,
  onChange,
}: {
  mentor: Mentor;
  value: PlanChoice;
  onChange: (choice: PlanChoice) => void;
}) {
  return (
    <div className="flex flex-col gap-section">
      <FieldSet>
        <FieldLegend variant="label">Długość sesji</FieldLegend>
        <ToggleGroup
          aria-label="Długość sesji"
          value={[String(value.durationMin)]}
          onValueChange={(next) => {
            const picked = next[0];
            if (picked) onChange({ ...value, durationMin: picked === '30' ? 30 : 60 });
          }}
        >
          <ToggleGroupItem value="60" className="whitespace-nowrap">60 min</ToggleGroupItem>
          <ToggleGroupItem value="30" className="whitespace-nowrap">30 min</ToggleGroupItem>
        </ToggleGroup>
      </FieldSet>
      <FieldSet>
        <FieldLegend variant="label">Ile sesji tygodniowo</FieldLegend>
        <RadioGroup
          aria-label="Ile sesji tygodniowo"
          value={String(value.perWeek)}
          onValueChange={(next) => {
            onChange({ ...value, perWeek: Number(next) });
          }}
        >
          {PLAN_PER_WEEK.map((perWeek) => (
            <label
              key={perWeek}
              className="flex items-center gap-inline rounded-panel border border-border-control bg-surface-panel p-panel text-body has-data-checked:border-selected-border has-data-checked:bg-selected-bg"
            >
              <RadioGroupItem value={String(perWeek)} />
              <span className="flex flex-1 flex-wrap items-baseline justify-between gap-inline">
                <span className="font-medium">{perWeek}× w tygodniu</span>
                <span className="text-body-dense text-text-muted">
                  <Money amount={planPrice(mentor.rate60, perWeek, value.durationMin)} /> / {PLAN_WEEKS} tyg.
                </span>
              </span>
            </label>
          ))}
        </RadioGroup>
      </FieldSet>
    </div>
  );
}

// DS-GAP: PriceBreakdown (KONCEPCJA §U8) — definition list of how the 4-week price is made.
export function PriceBreakdown({ mentor, choice }: { mentor: Mentor; choice: PlanChoice }) {
  const sessions = choice.perWeek * PLAN_WEEKS;
  const perSession = choice.durationMin === 60 ? mentor.rate60 : mentor.rate60 / 2n;
  return (
    <dl className="flex flex-col gap-tight">
      <div className="flex justify-between gap-inline">
        <dt className="text-body-dense text-text-muted">Plan</dt>
        <dd className="text-body">{planLabel(choice)}</dd>
      </div>
      <div className="flex justify-between gap-inline">
        <dt className="text-body-dense text-text-muted">Sesje w okresie</dt>
        <dd className="text-body">
          {choice.perWeek} × {PLAN_WEEKS} = {formatCount(sessions, SESSION_FORMS)}
        </dd>
      </div>
      <div className="flex justify-between gap-inline">
        <dt className="text-body-dense text-text-muted">Cena jednej sesji</dt>
        <dd className="text-body">
          <Money amount={perSession} />
        </dd>
      </div>
      <div className="flex justify-between gap-inline font-semibold">
        <dt className="text-body">Razem za {PLAN_WEEKS} tygodnie</dt>
        <dd className="text-body">
          <Money amount={planPrice(mentor.rate60, choice.perWeek, choice.durationMin)} />
        </dd>
      </div>
    </dl>
  );
}
