'use client';

import type { MentorCalendarView } from '@kompas/contracts/scheduling';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  CalendarSyncCard,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader,
  ToastProvider,
  useToast,
  WeekCalendar,
} from '@kompas/ui';
import { useTranslations } from 'next-intl';
import type * as React from 'react';
import { useState } from 'react';
import {
  AvailabilityTemplateForm,
  toEditorRules,
} from '../../_components/availability-template-form.tsx';
import { ExceptionsSection } from './exceptions-section.tsx';
import { SettingsForm } from './settings-form.tsx';

/** Horizon of a booking (Q10) — M3 lets the mentor scroll at most this far ahead. */
const HORIZON_WEEKS = 8;

const isoDate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** Monday of the week that contains `date`, as `YYYY-MM-DD` (M3 shows weeks Monday–Sunday). */
const mondayOf = (date: Date): string => {
  const monday = new Date(date);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return isoDate(monday);
};

const shiftWeek = (monday: string, weeks: number): string => {
  const [year, month, day] = monday.split('-').map(Number);
  return isoDate(new Date(year ?? 0, (month ?? 1) - 1, (day ?? 1) + weeks * 7));
};

const weeksBetween = (from: string, to: string): number =>
  Math.round((Date.parse(to) - Date.parse(from)) / (7 * 24 * 3600 * 1000));

export interface CalendarScreenProps {
  /** The calendar the RSC loaded; mutations replace it with the server's fresh copy. */
  readonly initialCalendar: MentorCalendarView;
}

/** M3 `/mentor/kalendarz`: the week, the template, the exceptions and the settings (E3-S2). */
export function CalendarScreen({ initialCalendar }: CalendarScreenProps) {
  const t = useTranslations('Availability');
  return (
    <ToastProvider closeLabel={t('toastClose')} regionLabel={t('toastRegion')}>
      <CalendarBody initialCalendar={initialCalendar} />
    </ToastProvider>
  );
}

function CalendarBody({ initialCalendar }: CalendarScreenProps) {
  const t = useTranslations('Availability');
  const toast = useToast();
  const [calendar, setCalendar] = useState(initialCalendar);
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const weeksAhead = weeksBetween(mondayOf(new Date()), weekStart);

  const onSaved = (next: MentorCalendarView) => {
    setCalendar(next);
    toast.add({ title: t('saved'), type: 'success' });
  };
  const goToTemplate = () => {
    document.getElementById('availability-template')?.scrollIntoView();
  };

  return (
    <main className="mx-auto flex w-full max-w-content flex-col gap-section px-4 py-8">
      <PageHeader title={t('title')} description={t('lead')} />
      {calendar.rules.length === 0 && <EmptyAvailabilityBanner onAction={goToTemplate} />}
      <WeekCard
        calendar={calendar}
        weekStart={weekStart}
        canGoPrevious={weeksAhead > 0}
        canGoNext={weeksAhead < HORIZON_WEEKS}
        onPreviousWeek={() => {
          setWeekStart((week) => shiftWeek(week, -1));
        }}
        onNextWeek={() => {
          setWeekStart((week) => shiftWeek(week, 1));
        }}
      />
      <SectionCard id="availability-template" title={t('templateSection')}>
        <p className="text-body text-text-muted">{t('templateHelp')}</p>
        <AvailabilityTemplateForm
          rules={toEditorRules(calendar.rules)}
          expectedVersion={calendar.settings.version}
          onSaved={onSaved}
        />
      </SectionCard>
      <SectionCard title={t('exceptionsSection')}>
        <ExceptionsSection
          exceptions={calendar.exceptions}
          timeZone={calendar.settings.timeZone}
          onSaved={onSaved}
        />
      </SectionCard>
      <SectionCard title={t('settingsSection')}>
        <SettingsForm settings={calendar.settings} onSaved={onSaved} />
      </SectionCard>
      <CalendarSyncCard status="disconnected" />
    </main>
  );
}

function SectionCard({
  id,
  title,
  children,
}: {
  readonly id?: string;
  readonly title: string;
  readonly children: React.ReactNode;
}) {
  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle>
          <h2 className="text-xl">{title}</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-group">{children}</CardContent>
    </Card>
  );
}

function WeekCard({
  calendar,
  weekStart,
  canGoPrevious,
  canGoNext,
  onPreviousWeek,
  onNextWeek,
}: {
  readonly calendar: MentorCalendarView;
  readonly weekStart: string;
  readonly canGoPrevious: boolean;
  readonly canGoNext: boolean;
  readonly onPreviousWeek: () => void;
  readonly onNextWeek: () => void;
}) {
  const t = useTranslations('Availability');
  return (
    <SectionCard title={t('weekSection')}>
      <WeekCalendar
        weekStart={weekStart}
        timeZone={calendar.settings.timeZone}
        rules={toEditorRules(calendar.rules)}
        exceptions={calendar.exceptions}
        sessions={calendar.sessions}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        onPreviousWeek={onPreviousWeek}
        onNextWeek={onNextWeek}
      />
    </SectionCard>
  );
}

/** Requirement 1: an empty template means nobody can book the mentor — say it and offer the fix. */
function EmptyAvailabilityBanner({ onAction }: { readonly onAction: () => void }) {
  const t = useTranslations('Availability');
  return (
    <Alert variant="warning" data-testid="empty-availability">
      <AlertTitle>{t('emptyTitle')}</AlertTitle>
      <AlertDescription className="flex flex-col gap-inline">
        {t('emptyLead')}
        <button type="button" className="w-fit underline underline-offset-4" onClick={onAction}>
          {t('emptyAction')}
        </button>
      </AlertDescription>
    </Alert>
  );
}
