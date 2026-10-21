import { FakeClock } from '@kompas/testing';
import { describe, expect, it } from 'vitest';
import { createAppContainer, createRequestScope } from './container.ts';
import { parseEnv } from './shared/infrastructure/env.ts';
import { createLogger } from './shared/infrastructure/logger.ts';

const makeContainer = () =>
  createAppContainer({
    env: parseEnv({ DATABASE_URL: 'postgres://kompas:kompas@localhost:5432/kompas' }),
    logger: createLogger({ level: 'silent' }),
    clock: new FakeClock(),
  });

describe('container', () => {
  it('creates scoped services once per request scope', () => {
    const container = makeContainer();
    const first = createRequestScope(container, { requestId: 'r-1' });
    const second = createRequestScope(container, { requestId: 'r-2' });

    expect(first.cradle.getCancellationTerms).toBe(first.cradle.getCancellationTerms);
    expect(first.cradle.getCancellationTerms).not.toBe(second.cradle.getCancellationTerms);
    expect(first.cradle.requestId).toBe('r-1');
  });

  it('injects the clock into module services', () => {
    const scope = createRequestScope(makeContainer(), { requestId: 'r-1' });
    const startsAt = scope.cradle.clock.now().add({ hours: 24 });
    expect(scope.cradle.getCancellationTerms({ startsAt }).isFree).toBe(true);
  });
});
