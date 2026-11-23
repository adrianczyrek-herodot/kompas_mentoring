import { type AwilixContainer, asClass, asFunction } from 'awilix';
import type { Clock } from '../../shared/domain/index.ts';
import type { DatabaseCradle } from '../../shared/infrastructure/db/database-cradle.ts';
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
  type GetMentorCalendar,
  makeGetMentorCalendar,
} from './application/get-mentor-calendar.query.ts';
import {
  type GetWeeklyAvailabilityMinutes,
  makeGetWeeklyAvailabilityMinutes,
} from './application/get-weekly-availability-minutes.query.ts';
import type { AvailabilityRepository } from './application/ports.ts';
import {
  makeSaveAvailabilityTemplate,
  type SaveAvailabilityTemplate,
} from './application/save-availability-template.command.ts';
import {
  makeUpdateMentorSettings,
  type UpdateMentorSettings,
} from './application/update-mentor-settings.command.ts';
import { MikroOrmAvailabilityRepository } from './infrastructure/mikro-orm-availability.repository.ts';
import { schedulingRecords } from './infrastructure/scheduling.records.ts';
import { Migration20261123000000SchedulingAvailability } from './migrations/Migration20261123000000SchedulingAvailability.ts';

/** Picked up by the ORM configuration (explicit lists, no globbing). */
export const schedulingEntities = schedulingRecords;
export const schedulingMigrations = [
  {
    name: 'Migration20261123000000SchedulingAvailability',
    class: Migration20261123000000SchedulingAvailability,
  },
];

export interface SchedulingCradle {
  availabilityRepository: AvailabilityRepository;
  getCancellationTerms: GetCancellationTerms;
  getMentorCalendar: GetMentorCalendar;
  /** Public query for `catalog` (F2 step 5): the weekly template in minutes. */
  getWeeklyAvailabilityMinutes: GetWeeklyAvailabilityMinutes;
  saveAvailabilityTemplate: SaveAvailabilityTemplate;
  addAvailabilityException: AddAvailabilityException;
  deleteAvailabilityException: DeleteAvailabilityException;
  updateMentorSettings: UpdateMentorSettings;
}

type Deps = SchedulingCradle & DatabaseCradle & { clock: Clock };

/** Registers the scheduling module; application services are scoped per request / per job. */
export const registerSchedulingModule = (container: AwilixContainer<Deps>): void => {
  container.register({
    availabilityRepository: asClass(MikroOrmAvailabilityRepository).scoped(),
    getCancellationTerms: asFunction(makeGetCancellationTerms).scoped(),
    getMentorCalendar: asFunction(makeGetMentorCalendar).scoped(),
    getWeeklyAvailabilityMinutes: asFunction(makeGetWeeklyAvailabilityMinutes).scoped(),
    saveAvailabilityTemplate: asFunction(makeSaveAvailabilityTemplate).scoped(),
    addAvailabilityException: asFunction(makeAddAvailabilityException).scoped(),
    deleteAvailabilityException: asFunction(makeDeleteAvailabilityException).scoped(),
    updateMentorSettings: asFunction(makeUpdateMentorSettings).scoped(),
  });
};
