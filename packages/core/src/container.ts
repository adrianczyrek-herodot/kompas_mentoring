import { type AwilixContainer, asValue, createContainer, InjectionMode } from 'awilix';
import { registerSchedulingModule } from './modules/scheduling/di.ts';
import type { SchedulingCradle } from './modules/scheduling/index.ts';
import type { Clock } from './shared/domain/index.ts';
import { checkDatabase, createOrm, type DatabaseStatus } from './shared/infrastructure/db/orm.ts';
import type { Env } from './shared/infrastructure/env.ts';
import type { Logger } from './shared/infrastructure/logger.ts';
import { SystemClock } from './shared/infrastructure/system-clock.ts';

export interface AppCradle extends SchedulingCradle {
  env: Env;
  logger: Logger;
  clock: Clock;
  /** Pings the database; the ORM itself stays inside core (spec §2.4 rule 4). */
  databaseHealth: () => Promise<DatabaseStatus>;
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
    databaseHealth: asValue(() => checkDatabase(orm)),
    logger: asValue(deps.logger),
    clock: asValue(deps.clock ?? new SystemClock()),
  });
  registerSchedulingModule(container);
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
