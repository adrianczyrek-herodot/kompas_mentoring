import { err, ok, type Result } from '../../../shared/domain/index.ts';
import type { Forbidden } from '../domain/identity.errors.ts';
import { hasPermission, type Permission } from '../domain/role.ts';
import type { CurrentUser } from './get-current-user.query.ts';

/** Every command and query of the module starts here (spec §8: checked server-side, not in UI). */
export const requirePermission = (
  actor: CurrentUser,
  permission: Permission,
): Result<void, Forbidden> =>
  hasPermission(actor.roles, permission) ? ok(undefined) : err({ code: 'identity.forbidden' });
