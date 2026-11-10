import { FakeClock } from '@kompas/testing';
import { describe, expect, it } from 'vitest';
import { newId, type UserId, UserId as UserIdSchema } from '../../../shared/domain/index.ts';
import type { Consent, ConsentDocument } from '../domain/consent.entity.ts';
import type { DataRequest, DataRequestKind } from '../domain/data-request.entity.ts';
import type { Role } from '../domain/role.ts';
import {
  type DataRequestRepository,
  makeRequestPersonalData,
  makeSetMarketingConsent,
} from './account.commands.ts';
import { makeGetAccountOverview } from './get-account-overview.query.ts';
import type { CurrentUser } from './get-current-user.query.ts';
import type { ConsentRepository } from './record-registration-consents.command.ts';

const actorWith = (roles: Role[]): CurrentUser => ({
  id: newId(UserIdSchema),
  name: 'Ola',
  email: 'ola@example.com',
  emailVerified: true,
  twoFactorEnabled: false,
  roles,
});

const inMemory = () => {
  const consents: Consent[] = [];
  const requests: DataRequest[] = [];
  const consentRepository: ConsentRepository = {
    saveAll: (saved) => {
      consents.push(...saved);
      return Promise.resolve();
    },
    latest: (userId: UserId, document: ConsentDocument) =>
      Promise.resolve(
        consents.findLast((c) => c.userId === userId && c.document === document) ?? null,
      ),
  };
  const dataRequestRepository: DataRequestRepository = {
    findPending: (userId: UserId, kind: DataRequestKind) =>
      Promise.resolve(requests.find((r) => r.userId === userId && r.kind === kind) ?? null),
    listPending: (userId: UserId) => Promise.resolve(requests.filter((r) => r.userId === userId)),
    save: (request) => {
      requests.push(request);
      return Promise.resolve();
    },
  };
  const deps = { clock: new FakeClock(), consentRepository, dataRequestRepository };
  return {
    setMarketingConsent: makeSetMarketingConsent(deps),
    requestPersonalData: makeRequestPersonalData(deps),
    getAccountOverview: makeGetAccountOverview(deps),
  };
};

describe('S3 account commands and query (spec §8, Q7)', () => {
  it('withdraws the marketing consent as a new decision', async () => {
    const account = inMemory();
    const actor = actorWith(['student']);
    await account.setMarketingConsent(actor, true);
    await account.setMarketingConsent(actor, false);
    const overview = await account.getAccountOverview(actor, actor.id);
    expect(overview._unsafeUnwrap().marketingConsent).toBe(false);
  });

  it('records each kind of data request once while it is pending', async () => {
    const account = inMemory();
    const actor = actorWith(['mentor']);
    const first = await account.requestPersonalData(actor, 'export');
    const again = await account.requestPersonalData(actor, 'export');
    await account.requestPersonalData(actor, 'deletion');
    expect(again._unsafeUnwrap().id).toBe(first._unsafeUnwrap().id);
    const overview = await account.getAccountOverview(actor, actor.id);
    expect(overview._unsafeUnwrap().pendingRequests).toEqual(['export', 'deletion']);
  });

  it('answers 403 to an actor without the permission', async () => {
    const account = inMemory();
    const actor = actorWith([]);
    expect((await account.setMarketingConsent(actor, true))._unsafeUnwrapErr().code).toBe(
      'identity.forbidden',
    );
    expect((await account.requestPersonalData(actor, 'export'))._unsafeUnwrapErr().code).toBe(
      'identity.forbidden',
    );
    expect((await account.getAccountOverview(actor, actor.id))._unsafeUnwrapErr().code).toBe(
      'identity.forbidden',
    );
  });

  it("answers 404 for someone else's account", async () => {
    const account = inMemory();
    const result = await account.getAccountOverview(actorWith(['student']), newId(UserIdSchema));
    expect(result._unsafeUnwrapErr().code).toBe('identity.not_found');
  });
});
