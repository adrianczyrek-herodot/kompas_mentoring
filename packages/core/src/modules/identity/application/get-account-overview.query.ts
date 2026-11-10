import type { UserId } from '../../../shared/domain/index.ts';
import { err, ok, type Result } from '../../../shared/domain/index.ts';
import type { DataRequestKind } from '../domain/data-request.entity.ts';
import type { Forbidden, NotFound } from '../domain/identity.errors.ts';
import type { DataRequestRepository } from './account.commands.ts';
import type { CurrentUser } from './get-current-user.query.ts';
import type { ConsentRepository } from './record-registration-consents.command.ts';
import { requirePermission } from './require-permission.ts';

export interface AccountOverview {
  readonly marketingConsent: boolean;
  readonly pendingRequests: readonly DataRequestKind[];
}

/** S3 data beyond the session user: current marketing decision and pending data requests. */
export const makeGetAccountOverview =
  ({
    consentRepository,
    dataRequestRepository,
  }: {
    consentRepository: ConsentRepository;
    dataRequestRepository: DataRequestRepository;
  }) =>
  async (
    actor: CurrentUser,
    userId: UserId,
  ): Promise<Result<AccountOverview, Forbidden | NotFound>> => {
    const allowed = requirePermission(actor, 'account.manage.own');
    if (allowed.isErr()) return err(allowed.error);
    // Another user's account looks exactly like a missing one (spec §8).
    if (userId !== actor.id) return err({ code: 'identity.not_found' });
    const [marketing, pending] = await Promise.all([
      consentRepository.latest(userId, 'marketing'),
      dataRequestRepository.listPending(userId),
    ]);
    return ok({
      marketingConsent: marketing?.granted ?? false,
      pendingRequests: pending.map((request) => request.kind),
    });
  };

export type GetAccountOverview = ReturnType<typeof makeGetAccountOverview>;
