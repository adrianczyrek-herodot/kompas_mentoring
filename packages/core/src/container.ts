import {
  type AwilixContainer,
  asClass,
  asFunction,
  asValue,
  createContainer,
  InjectionMode,
} from 'awilix';
import type { BetterAuthPlugin } from 'better-auth';
import { type CatalogCradle, registerCatalogModule } from './modules/catalog/di.ts';
import { type IdentityCradle, registerIdentityModule } from './modules/identity/di.ts';
import { registerSchedulingModule, schedulingEventSubscriptions } from './modules/scheduling/di.ts';
import type { SchedulingCradle } from './modules/scheduling/index.ts';
import type { Clock } from './shared/domain/index.ts';
import type { DatabaseCradle } from './shared/infrastructure/db/database-cradle.ts';
import { checkDatabase, createOrm, type DatabaseStatus } from './shared/infrastructure/db/orm.ts';
import type { Env } from './shared/infrastructure/env.ts';
import {
  type EventPublisher,
  PgBossEventPublisher,
} from './shared/infrastructure/events/outbox.ts';
import type { EventSubscription } from './shared/infrastructure/events/subscriptions.ts';
import { createBoss, type PgBoss } from './shared/infrastructure/jobs/boss.ts';
import type { Logger } from './shared/infrastructure/logger.ts';
import { SystemClock } from './shared/infrastructure/system-clock.ts';

export interface AppCradle extends SchedulingCradle, IdentityCradle, CatalogCradle, DatabaseCradle {
  env: Env;
  logger: Logger;
  clock: Clock;
  /** Pings the database; the ORM itself stays inside core (spec §2.4 rule 4). */
  databaseHealth: () => Promise<DatabaseStatus>;
  /** pg-boss of this process: web only sends jobs, the worker also fetches them (spec §1.4). */
  boss: PgBoss;
  /** Outbox: events go out as jobs on the transaction of the change (spec §4.6). */
  eventPublisher: EventPublisher;
  /** Module reactions to other modules' events, started by the worker. */
  eventSubscriptions: readonly EventSubscription[];
}

export interface RequestCradle extends AppCradle {
  requestId: string;
  /** Logger bound to the request (`requestId` in every line, spec §6.5). */
  log: Logger;
}

export type AppContainer = AwilixContainer<AppCradle>;
export type RequestScope = AwilixContainer<RequestCradle>;

/** One container per process (web or worker): same domain wiring in both (spec §1.4). */
export const createAppContainer = (deps: {
  env: Env;
  logger: Logger;
  clock?: Clock;
  /** Better Auth plugins of the hosting framework (web: `nextCookies()`); the worker has none. */
  authPlugins?: readonly BetterAuthPlugin[];
  /** The worker passes its own boss; web gets a send-only one, started on the first publish. */
  boss?: PgBoss;
}): AppContainer => {
  // strict: scoped services cannot be resolved from the root, which forces a request/job scope.
  const container = createContainer<AppCradle>({
    injectionMode: InjectionMode.PROXY,
    strict: true,
  });
  // Created without connecting; web reaches Postgres through the pooler URL (spec §1.4).
  const orm = createOrm(deps.env.DATABASE_URL);
  container.register({
    env: asValue(deps.env),
    orm: asValue(orm),
    em: asFunction(() => orm.em.fork()).scoped(),
    databaseHealth: asValue(() => checkDatabase(orm)),
    logger: asValue(deps.logger),
    clock: asValue(deps.clock ?? new SystemClock()),
    authPlugins: asValue(deps.authPlugins ?? []),
    boss: deps.boss
      ? asValue(deps.boss)
      : asFunction(() => createBoss('web', deps.env.DATABASE_URL)).singleton(),
    eventPublisher: asClass(PgBossEventPublisher).singleton(),
  });
  registerSchedulingModule(container);
  registerIdentityModule(container);
  registerCatalogModule(container);
  // Reactions of the modules to each other's events (spec §4.6); the worker starts the queues.
  container.register({
    eventSubscriptions: asFunction((deps: AppCradle) =>
      schedulingEventSubscriptions({ orm: deps.orm }),
    ).singleton(),
  });
  return container;
};

/** Child scope per HTTP request or job: scoped services are created once per scope. */
export const createRequestScope = (
  container: AppContainer,
  context: { requestId: string },
): RequestScope => {
  const scope = container.createScope<RequestCradle>();
  scope.register({
    requestId: asValue(context.requestId),
    log: asValue(container.cradle.logger.child({ requestId: context.requestId })),
  });
  return scope;
};
