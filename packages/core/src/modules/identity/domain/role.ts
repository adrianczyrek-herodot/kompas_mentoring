// Roles and permissions (spec §8). Permissions grow with later phases; roles stay a closed union.

export const ROLES = ['student', 'mentor', 'admin_trust', 'admin_finance'] as const;
export type Role = (typeof ROLES)[number];

const ADMIN_ROLES = ['admin_trust', 'admin_finance'] as const satisfies readonly Role[];
export type AdminRole = (typeof ADMIN_ROLES)[number];

export type Permission =
  | 'account.manage.own' // S3: own profile, password, consents, sessions
  | 'admin.access'; // any /admin route (2FA enforced separately)

const PERMISSIONS: Record<Role, readonly Permission[]> = {
  student: ['account.manage.own'],
  mentor: ['account.manage.own'],
  admin_trust: ['account.manage.own', 'admin.access'],
  admin_finance: ['account.manage.own', 'admin.access'],
};

export const isAdmin = (roles: readonly Role[]): boolean =>
  roles.some((role) => (ADMIN_ROLES as readonly Role[]).includes(role));

export const hasPermission = (roles: readonly Role[], permission: Permission): boolean =>
  roles.some((role) => PERMISSIONS[role].includes(permission));
