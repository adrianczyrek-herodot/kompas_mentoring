import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

// Branded IDs (spec §6.3): created only by parsing at the system edge, so MentorId ≠ StudentId.
export const UserId = z.uuid().brand<'UserId'>();
export type UserId = z.infer<typeof UserId>;

export const MentorId = z.uuid().brand<'MentorId'>();
export type MentorId = z.infer<typeof MentorId>;

export const StudentId = z.uuid().brand<'StudentId'>();
export type StudentId = z.infer<typeof StudentId>;

export const BookingId = z.uuid().brand<'BookingId'>();
export type BookingId = z.infer<typeof BookingId>;

/** New time-ordered identifier (UUID v7, spec §3), branded by the given schema. */
export const newId = <Schema extends z.ZodType<unknown, string>>(
  schema: Schema,
): z.output<Schema> => schema.parse(uuidv7());
