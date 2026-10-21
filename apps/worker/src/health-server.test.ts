import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';
import { createHealthServer } from './health-server.ts';

describe('worker /health', () => {
  let close: (() => void) | undefined;
  afterEach(() => close?.());

  const start = async (ready: boolean): Promise<string> => {
    const server = createHealthServer({ isReady: () => ready });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    close = () => server.close();
    return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  };

  it('reports ok while ready', async () => {
    const response = await fetch(`${await start(true)}/health`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
  });

  it('reports 503 while starting or draining', async () => {
    const response = await fetch(`${await start(false)}/health`);
    expect(response.status).toBe(503);
  });
});
