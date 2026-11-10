import { Writable } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { createLogger } from './logger.ts';

const capture = () => {
  const lines: string[] = [];
  const stream = new Writable({
    write(chunk: Buffer, _encoding, callback) {
      lines.push(chunk.toString());
      callback();
    },
  });
  const logger = createLogger({ level: 'info', module: 'test' }, stream);
  return { logger, lines };
};

describe('logger redaction', () => {
  it('redacts personal data and secrets but keeps identifiers', () => {
    const { logger, lines } = capture();
    logger.info(
      {
        userId: 'u-1',
        email: 'jan@example.com',
        user: { name: 'Jan Kowalski', phone: '+48 600 000 000' },
        req: { headers: { authorization: 'Bearer secret', cookie: 'sid=1' } },
      },
      'signed in',
    );
    const entry = JSON.parse(lines[0] ?? '{}') as Record<string, unknown>;
    expect(entry).toMatchObject({
      module: 'test',
      userId: 'u-1',
      email: '[redacted]',
      user: { name: '[redacted]', phone: '[redacted]' },
      req: { headers: { authorization: '[redacted]', cookie: '[redacted]' } },
    });
  });

  it('keeps error messages readable', () => {
    const { logger, lines } = capture();
    logger.error({ err: new Error('connect ECONNREFUSED') }, 'failed');
    const entry = JSON.parse(lines[0] ?? '{}') as { err?: { message?: string } };
    expect(entry.err?.message).toBe('connect ECONNREFUSED');
  });
});
