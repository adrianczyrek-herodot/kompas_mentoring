import { createServer, type Server } from 'node:http';

export interface WorkerHealth {
  isReady(): boolean;
}

/** `/health` for Cloud Run: 200 while the worker processes jobs, 503 while starting or draining. */
export const createHealthServer = (health: WorkerHealth): Server =>
  createServer((request, response) => {
    if (request.method === 'GET' && request.url === '/health') {
      const ready = health.isReady();
      response.writeHead(ready ? 200 : 503, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ status: ready ? 'ok' : 'unavailable' }));
      return;
    }
    response.writeHead(404).end();
  });
