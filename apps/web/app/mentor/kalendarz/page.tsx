import type { Metadata } from 'next';
import { forbidden } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { loadMentorCalendar } from '../../../server/availability-actions.ts';
import { CalendarScreen } from './_components/calendar-screen.tsx';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Availability');
  return { title: t('title') };
}

/**
 * M3 (requirement 1): the mentor's week, the weekly template, the exceptions and the settings.
 * The mentor guard is in `app/mentor/layout.tsx` (`mentor.access`); the owner always comes from
 * the session, so a mentor can only ever open their own calendar.
 */
export default async function MentorCalendarPage() {
  const calendar = await loadMentorCalendar();
  if (calendar === null) forbidden();
  return <CalendarScreen initialCalendar={calendar} />;
}
