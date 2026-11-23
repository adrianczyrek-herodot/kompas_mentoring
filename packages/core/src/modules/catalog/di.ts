import { type AwilixContainer, asClass, asFunction } from 'awilix';
import type { Clock } from '../../shared/domain/index.ts';
import type { DatabaseCradle } from '../../shared/infrastructure/db/database-cradle.ts';
import type { Env } from '../../shared/infrastructure/env.ts';
import type { EventPublisher } from '../../shared/infrastructure/events/outbox.ts';
import {
  type GetMentorAccess,
  makeGetMentorAccess,
  makeOpenMyMentorProfile,
  type OpenMyMentorProfile,
} from './application/open-my-mentor-profile.query.ts';
import type { MentorProfileRepository } from './application/ports.ts';
import {
  makeSaveProfileStep,
  type SaveProfileStep,
} from './application/save-profile-step.command.ts';
import { catalogRecords } from './infrastructure/catalog.records.ts';
import { MikroOrmMentorProfileRepository } from './infrastructure/mikro-orm-mentor-profile.repository.ts';
import { Migration20261122000000CatalogProfile } from './migrations/Migration20261122000000CatalogProfile.ts';

/** Picked up by the ORM configuration (explicit lists, no globbing). */
export const catalogEntities = catalogRecords;
export const catalogMigrations = [
  {
    name: 'Migration20261122000000CatalogProfile',
    class: Migration20261122000000CatalogProfile,
  },
];

export interface CatalogCradle {
  mentorProfileRepository: MentorProfileRepository;
  openMyMentorProfile: OpenMyMentorProfile;
  getMentorAccess: GetMentorAccess;
  saveProfileStep: SaveProfileStep;
}

type Deps = CatalogCradle &
  DatabaseCradle & { clock: Clock; eventPublisher: EventPublisher; env: Env };

/** Registers the catalog module; application services are scoped per request / per job. */
export const registerCatalogModule = (container: AwilixContainer<Deps>): void => {
  container.register({
    mentorProfileRepository: asClass(MikroOrmMentorProfileRepository).scoped(),
    openMyMentorProfile: asFunction(makeOpenMyMentorProfile).scoped(),
    getMentorAccess: asFunction(makeGetMentorAccess).scoped(),
    saveProfileStep: asFunction(makeSaveProfileStep).scoped(),
  });
};
