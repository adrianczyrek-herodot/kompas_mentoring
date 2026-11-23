'use client';

import type { MentorCalendarView, MentorScheduleSettings } from '@kompas/contracts/scheduling';
import {
  Alert,
  AlertDescription,
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kompas/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useTransition } from 'react';
import { updateMentorSettingsAction } from '../../../../server/availability-actions.ts';

/** The zones the mentor may pick; the browser reports its own on the first login (Q12, S3). */
const TIME_ZONES = [
  { value: 'Europe/Warsaw', label: 'Warszawa (Europe/Warsaw)' },
  { value: 'Europe/London', label: 'Londyn (Europe/London)' },
  { value: 'Europe/Berlin', label: 'Berlin (Europe/Berlin)' },
  { value: 'Europe/Madrid', label: 'Madryt (Europe/Madrid)' },
  { value: 'Europe/Kyiv', label: 'Kijów (Europe/Kyiv)' },
  { value: 'America/New_York', label: 'Nowy Jork (America/New_York)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (America/Los_Angeles)' },
  { value: 'Asia/Kolkata', label: 'Kolkata (Asia/Kolkata)' },
  { value: 'Asia/Tokyo', label: 'Tokio (Asia/Tokyo)' },
  { value: 'Australia/Sydney', label: 'Sydney (Australia/Sydney)' },
  { value: 'UTC', label: 'UTC' },
];

const NOTICE_HOURS = [2, 4, 6, 8, 12, 24, 48];
const BUFFER_MINUTES = [0, 5, 10, 15, 20, 25, 30];

export interface SettingsFormProps {
  readonly settings: MentorScheduleSettings;
  readonly onSaved: (calendar: MentorCalendarView) => void;
}

/** M3 settings (requirement 1): booking notice (Q9), buffer after a session and the time zone (Q12). */
export function SettingsForm({ settings, onSaved }: SettingsFormProps) {
  const t = useTranslations('Availability');
  const [timeZone, setTimeZone] = useState(settings.timeZone);
  const [noticeHours, setNoticeHours] = useState(settings.minNoticeMinutes / 60);
  const [bufferMinutes, setBufferMinutes] = useState(settings.bufferMinutes);
  const [error, setError] = useState<string | null>(null);
  const [busy, startSaving] = useTransition();

  useEffect(() => {
    setTimeZone(settings.timeZone);
    setNoticeHours(settings.minNoticeMinutes / 60);
    setBufferMinutes(settings.bufferMinutes);
  }, [settings]);

  const save = () => {
    setError(null);
    startSaving(async () => {
      const result = await updateMentorSettingsAction({
        timeZone,
        minNoticeMinutes: noticeHours * 60,
        bufferMinutes,
        expectedVersion: settings.version,
      });
      if (result.ok) onSaved(result.calendar);
      else setError(result.kind === 'conflict' ? t('conflict') : t('error'));
    });
  };

  return (
    <div className="flex flex-col gap-group">
      {error !== null && (
        <Alert variant="danger" role="alert" data-testid="settings-error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Field>
        <FieldLabel htmlFor="time-zone">{t('timeZone')}</FieldLabel>
        <Select
          items={TIME_ZONES}
          value={timeZone}
          onValueChange={(value) => {
            setTimeZone(typeof value === 'string' ? value : timeZone);
          }}
        >
          <SelectTrigger id="time-zone">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_ZONES.map((zone) => (
              <SelectItem key={zone.value} value={zone.value}>
                {zone.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="notice">{t('notice')}</FieldLabel>
        <Select
          items={NOTICE_HOURS.map((hours) => ({ value: String(hours), label: `${hours} h` }))}
          value={String(noticeHours)}
          onValueChange={(value) => {
            setNoticeHours(Number(value));
          }}
        >
          <SelectTrigger id="notice">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NOTICE_HOURS.map((hours) => (
              <SelectItem key={hours} value={String(hours)}>
                {hours} h
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldDescription>{t('noticeHelp')}</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="buffer">{t('buffer')}</FieldLabel>
        <Select
          items={BUFFER_MINUTES.map((minutes) => ({
            value: String(minutes),
            label: `${minutes} min`,
          }))}
          value={String(bufferMinutes)}
          onValueChange={(value) => {
            setBufferMinutes(Number(value));
          }}
        >
          <SelectTrigger id="buffer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BUFFER_MINUTES.map((minutes) => (
              <SelectItem key={minutes} value={String(minutes)}>
                {minutes} min
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldDescription>{t('bufferHelp')}</FieldDescription>
      </Field>
      <Button
        type="button"
        className="self-start"
        data-testid="settings-save"
        disabled={busy}
        onClick={save}
      >
        {busy ? t('saving') : t('save')}
      </Button>
    </div>
  );
}
