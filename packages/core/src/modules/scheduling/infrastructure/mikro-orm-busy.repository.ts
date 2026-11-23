import type { BusyRepository } from '../application/ports.ts';
import type { Interval } from '../domain/policies/slots-for.policy.ts';

/**
 * Adapter: time that blocks booking although the template is open.
 *
 * E3-S3 (step 8) ships the port, the query and the API without a source: `scheduling.booking`
 * arrives in step 10 (E3-S4) and `scheduling.external_busy` in E3-S10, and both plug in here. Until
 * then the answer is honestly empty — no invented busy time — and the slot engine already filters
 * whatever this returns.
 */
export class MikroOrmBusyRepository implements BusyRepository {
  listBusy(): Promise<Interval[]> {
    return Promise.resolve([]);
  }
}
