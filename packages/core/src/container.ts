import { type AwilixContainer, asValue, createContainer, InjectionMode } from 'awilix';
import { registerSchedulingModule } from './modules/scheduling/di.ts';
import type { SchedulingCradle } from './modules/scheduling/index.ts';
import type { Clock } from './shared/domain/index.ts';
import type { Env } from './shared/infrastructure/env.ts';
import type { Logger } from './shared/infrastructure/logger.ts';
import { SystemClock } from './shared/infrastructure/system-clock.ts';

export interface AppCradle extends SchedulingCradle {
  env: Env;
  logger: Logger;
  clock: Clock;
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
  container.register({
    env: asValue(deps.env),
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
