import { hashPassword } from 'better-auth/crypto';
import { checkPasswordLength } from '../../domain/policies/password.policy.ts';
import type { AdminRole } from '../../domain/role.ts';
import type { Auth } from './create-auth.ts';

export interface AdminAccountInput {
  email: string;
  name: string;
  password: string;
  role: AdminRole;
}

/**
 * Q4: admin accounts come only from the CLI / seed, never from sign-up. Creates the account
 * (e-mail treated as verified) or gives an existing user the admin role and the new password.
 * 2FA is set up by the admin on first sign-in (`/admin/2fa`).
 */
export const makeCreateAdminAccount =
  ({ auth }: { auth: Auth }) =>
  async (input: AdminAccountInput): Promise<'created' | 'promoted'> => {
    const length = checkPasswordLength(input.password);
    if (length.isErr()) throw new Error(`Invalid admin password: ${length.error.code}`);
    const ctx = await auth.$context;
    // Better Auth's own hasher: `ctx.password.hash` is wrapped by the HIBP plugin, which needs
    // an HTTP request context that a CLI does not have. Admins choose long generated passwords.
    const hash = await hashPassword(input.password);
    const existing = await ctx.internalAdapter.findUserByEmail(input.email, {
      includeAccounts: true,
    });
    if (existing !== null) {
      await ctx.internalAdapter.updateUser(existing.user.id, { roles: [input.role] });
      const credential = existing.accounts.find((account) => account.providerId === 'credential');
      if (credential === undefined) {
        await ctx.internalAdapter.linkAccount({
          userId: existing.user.id,
          providerId: 'credential',
          accountId: existing.user.id,
          password: hash,
        });
      } else {
        await ctx.internalAdapter.updatePassword(existing.user.id, hash);
      }
      return 'promoted';
    }
    // No endpoint context: the sign-up hooks (consents, role choice) do not run for admins.
    const user = await ctx.internalAdapter.createUser(
      { email: input.email, name: input.name, emailVerified: true, roles: [input.role] },
      { method: 'admin' },
    );
    await ctx.internalAdapter.linkAccount({
      userId: user.id,
      providerId: 'credential',
      accountId: user.id,
      password: hash,
    });
    return 'created';
  };

export type CreateAdminAccount = ReturnType<typeof makeCreateAdminAccount>;
