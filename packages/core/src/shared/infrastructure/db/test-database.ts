import { getContainerRuntimeClient } from 'testcontainers';

/** Whether Testcontainers can start PostgreSQL here; CI must never silently skip (spec §7). */
export const dockerAvailable = await getContainerRuntimeClient().then(
  () => true,
  () => false,
);

const SKIP_NOTE =
  'SKIPPED: Docker is not available — start Docker (or set DOCKER_HOST) to run Testcontainers integration tests; CI always runs them.';

if (!dockerAvailable) {
  if (process.env['CI'] === 'true') {
    throw new Error('Docker is required for integration tests in CI.');
  }
  process.stderr.write(`\n[integration] ${SKIP_NOTE}\n\n`);
}

/** Suite title that carries the skip reason when Docker is missing. */
export const integrationSuite = (title: string): string =>
  dockerAvailable ? title : `${title} (${SKIP_NOTE})`;

export const POSTGRES_IMAGE = 'postgres:17-alpine';
