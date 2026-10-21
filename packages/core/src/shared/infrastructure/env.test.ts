import { describe, expect, it } from 'vitest';
import { directDatabaseUrl, parseEnv } from './env.ts';

describe('parseEnv', () => {
  it('applies defaults and falls back to the pooled URL for direct connections', () => {
    const env = parseEnv({ DATABASE_URL: 'postgres://kompas:kompas@localhost:5432/kompas' });
    expect(env.NODE_ENV).toBe('development');
    expect(env.WORKER_PORT).toBe(8081);
    expect(directDatabaseUrl(env)).toBe('postgres://kompas:kompas@localhost:5432/kompas');
  });

  it('fails fast with a readable message', () => {
    expect(() => parseEnv({ DATABASE_URL: 'mysql://nope' })).toThrow(/DATABASE_URL/);
  });
});
