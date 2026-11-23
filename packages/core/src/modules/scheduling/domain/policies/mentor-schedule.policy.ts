import { err, ok, type Result } from '../../../../shared/domain/index.ts';
import type { AvailabilityIssue, InvalidAvailability } from '../booking.errors.ts';
import { AVAILABILITY } from './config.ts';

const { notice, buffer } = AVAILABILITY;

/** `Intl.DateTimeFormat` is the only IANA validator in the runtime (Q12). */
export const isValidTimeZone = (timeZone: string): boolean => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
};

export interface MentorSettingsInput {
  readonly timeZone: string;
  readonly minNoticeMinutes: number;
  readonly bufferMinutes: number;
}

/**
 * M3 settings: notice 2–48 h (Q9), buffer 0–30 min every 5 min (M3), an IANA time zone (Q12).
 * `minNoticeMinutes` may not be a value the grid does not produce; the UI offers 1 h steps for
 * notice and 5 min steps for the buffer.
 */
export const validateMentorSettings = (
  input: MentorSettingsInput,
): Result<void, InvalidAvailability> => {
  const issues: AvailabilityIssue[] = [];
  if (!isValidTimeZone(input.timeZone)) {
    issues.push({ field: 'timeZone', problem: 'invalid' });
  }
  if (input.minNoticeMinutes < notice.minMinutes || input.minNoticeMinutes > notice.maxMinutes) {
    issues.push({ field: 'minNoticeMinutes', problem: 'out_of_range' });
  } else if (input.minNoticeMinutes % notice.stepMinutes !== 0) {
    issues.push({ field: 'minNoticeMinutes', problem: 'invalid' });
  }
  if (input.bufferMinutes < buffer.minMinutes || input.bufferMinutes > buffer.maxMinutes) {
    issues.push({ field: 'bufferMinutes', problem: 'out_of_range' });
  } else if (input.bufferMinutes % buffer.stepMinutes !== 0) {
    issues.push({ field: 'bufferMinutes', problem: 'invalid' });
  }
  return issues.length === 0
    ? ok(undefined)
    : err({ code: 'scheduling.invalid_availability', issues });
};
