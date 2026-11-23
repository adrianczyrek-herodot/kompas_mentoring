import { type AwilixContainer, asClass, asFunction } from 'awilix';
import type { Clock } from '../../shared/domain/index.ts';
import type { DatabaseCradle } from '../../shared/infrastructure/db/database-cradle.ts';
import type { Orm } from '../../shared/infrastructure/db/orm.ts';
import {
  type AddAvailabilityException,
  type DeleteAvailabilityException,
  makeAddAvailabilityException,
  makeDeleteAvailabilityException,
} from './application/availability-exceptions.commands.ts';
import {
  type GetCancellationTerms,
  makeGetCancellationTerms,
} from './application/get-cancellation-terms.query.ts';
import {
  type GetMentorAvailability,
  makeGetMentorAvailability,
} from './application/get-mentor-availability.query.ts';
import {
  type GetMentorCalendar,
  makeGetMentorCalendar,
} from './application/get-mentor-calendar.query.ts';
import {
  type GetWeeklyAvailabilityMinutes,
  makeGetWeeklyAvailabilityMinutes,
} from './application/get-weekly-availability-minutes.query.ts';
import type {
  AvailabilityRepository,
  BusyRepository,
  MentorBookabilityRepository,
} from './application/ports.ts';
import {
  makeSaveAvailabilityTemplate,
  type SaveAvailabilityTemplate,
} from './application/save-availability-template.command.ts';
import {
  makeUpdateMentorSettings,
  type UpdateMentorSettings,
} from './application/update-mentor-settings.command.ts';
import { MentorBookabilityRecord } from './infrastructure/mentor-bookability.records.ts';
import { makeMentorBookabilitySubscription } from './infrastructure/mentor-bookability.subscription.ts';
import { MikroOrmAvailabilityRepository } from './infrastructure/mikro-orm-availability.repository.ts';
import { MikroOrmBusyRepository } from './infrastructure/mikro-orm-busy.repository.ts';
import { MikroOrmMentorBookabilityRepository } from './infrastructure/mikro-orm-mentor-bookability.repository.ts';
import { schedulingRecords } from './infrastructure/scheduling.records.ts';
import { Migration20261123000000SchedulingAvailability } from './migrations/Migration20261123000000SchedulingAvailability.ts';
import { Migration20261124000000SchedulingBookability } from './migrations/Migration20261124000000SchedulingBookability.ts';

/** Picked up by the ORM configuration (explicit lists, no globbing). */
export const schedulingEntities = [...schedulingRecords, MentorBookabilityRecord];
export const schedulingMigrations = [
  {
    name: 'Migration20261123000000SchedulingAvailability',
    class: Migration20261123000000SchedulingAvailability,
  },
  {
    name: 'Migration20261124000000SchedulingBookability',
    class: Migration20261124000000SchedulingBookability,
  },
];

export interface SchedulingCradle {
  availabilityRepository: AvailabilityRepository;
  /** Q13: the mirrored `catalog` mentor, read by the availability query and (step 10) the hold. */
  mentorBookabilityRepository: MentorBookabilityRepository;
  /** Time that blocks booking although the template is open (bookings in step 10, Google in E3-S10). */
  busyRepository: BusyRepository;
  getCancellationTerms: GetCancellationTerms;
  getMentorCalendar: GetMentorCalendar;
  /** Public: U1 slots and „następny wolny termin" for one mentor profile. */
  getMentorAvailability: GetMentorAvailability;
  /** Public query for `catalog` (F2 step 5): the weekly template in minutes. */
  getWeeklyAvailabilityMinutes: GetWeeklyAvailabilityMinutes;
  saveAvailabilityTemplate: SaveAvailabilityTemplate;
  addAvailabilityException: AddAvailabilityException;
  deleteAvailabilityException: DeleteAvailabilityException;
  updateMentorSettings: UpdateMentorSettings;
}

export type SchedulingDeps = SchedulingCradle & DatabaseCradle & { clock: Clock };

/** Registers the scheduling module; application services are scoped per request / per job. */
export const registerSchedulingModule = (container: AwilixContainer<SchedulingDeps>): void => {
  container.register({
    availabilityRepository: asClass(MikroOrmAvailabilityRepository).scoped(),
    mentorBookabilityRepository: asClass(MikroOrmMentorBookabilityRepository).scoped(),
    busyRepository: asClass(MikroOrmBusyRepository).scoped(),
    getCancellationTerms: asFunction(makeGetCancellationTerms).scoped(),
    getMentorCalendar: asFunction(makeGetMentorCalendar).scoped(),
    getMentorAvailability: asFunction(makeGetMentorAvailability).scoped(),
    getWeeklyAvailabilityMinutes: asFunction(makeGetWeeklyAvailabilityMinutes).scoped(),
    saveAvailabilityTemplate: asFunction(makeSaveAvailabilityTemplate).scoped(),
    addAvailabilityException: asFunction(makeAddAvailabilityException).scoped(),
    deleteAvailabilityException: asFunction(makeDeleteAvailabilityException).scoped(),
    updateMentorSettings: asFunction(makeUpdateMentorSettings).scoped(),
  });
};

/** Reactions of `scheduling` to other modules' events, started by the worker (spec §4.6). */
export const schedulingEventSubscriptions = ({ orm }: { orm: Orm }) => [
  makeMentorBookabilitySubscription({ orm }),
];
