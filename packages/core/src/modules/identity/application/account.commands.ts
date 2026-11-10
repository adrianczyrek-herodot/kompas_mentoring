import { v7 as uuidv7 } from 'uuid';
import type { Clock, UserId } from '../../../shared/domain/index.ts';
import { err, ok, type Result } from '../../../shared/domain/index.ts';
import type { Consent } from '../domain/consent.entity.ts';
import type { DataRequest, DataRequestKind } from '../domain/data-request.entity.ts';
import type { Forbidden } from '../domain/identity.errors.ts';
import { CONSENT_DOCUMENT_VERSIONS } from '../domain/policies/config.ts';
import type { CurrentUser } from './get-current-user.query.ts';
import type { ConsentRepository } from './record-registration-consents.command.ts';
import { requirePermission } from './require-permission.ts';

/** Port: export and deletion requests (carried out by the worker in F8). */
export interface DataRequestRepository {
  findPending(userId: UserId, kind: DataRequestKind): Promise<DataRequest | null>;
  listPending(userId: UserId): Promise<readonly DataRequest[]>;
  save(request: DataRequest): Promise<void>;
}

/** S3: give or withdraw the marketing consent; each change is a new versioned decision. */
export const makeSetMarketingConsent =
  ({ clock, consentRepository }: { clock: Clock; consentRepository: ConsentRepository }) =>
  async (actor: CurrentUser, granted: boolean): Promise<Result<Consent, Forbidden>> => {
    const allowed = requirePermission(actor, 'account.manage.own');
    if (allowed.isErr()) return err(allowed.error);
    const decision: Consent = {
      userId: actor.id,
      document: 'marketing',
      version: CONSENT_DOCUMENT_VERSIONS.marketing,
      granted,
      decidedAt: clock.now(),
    };
    await consentRepository.saveAll([decision]);
    return ok(decision);
  };

/** S3 (Q7): records an export or deletion request; asking again returns the pending one. */
export const makeRequestPersonalData =
  ({
    clock,
    dataRequestRepository,
  }: {
    clock: Clock;
    dataRequestRepository: DataRequestRepository;
  }) =>
  async (actor: CurrentUser, kind: DataRequestKind): Promise<Result<DataRequest, Forbidden>> => {
    const allowed = requirePermission(actor, 'account.manage.own');
    if (allowed.isErr()) return err(allowed.error);
    const pending = await dataRequestRepository.findPending(actor.id, kind);
    if (pending !== null) return ok(pending);
    const request: DataRequest = { id: uuidv7(), userId: actor.id, kind, requestedAt: clock.now() };
    await dataRequestRepository.save(request);
    return ok(request);
  };

export type SetMarketingConsent = ReturnType<typeof makeSetMarketingConsent>;
export type RequestPersonalData = ReturnType<typeof makeRequestPersonalData>;
