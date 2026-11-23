// Roles and permissions (spec §8). Permissions grow with later phases; roles stay a closed union.

export const ROLES = ['student', 'mentor', 'admin_trust', 'admin_finance'] as const;
export type Role = (typeof ROLES)[number];

const ADMIN_ROLES = ['admin_trust', 'admin_finance'] as const satisfies readonly Role[];

export type Permission =
  | 'account.manage.own' // S3: own profile, password, consents, sessions
  | 'mentor.access' // mentor home (F2 fills it in)
  | 'admin.access' // any /admin route (2FA enforced separately)
  | 'catalog.mentor_profile.edit.own' // F2 M1: own mentor profile (someone else's → 404)
  | 'catalog.favorite.manage.own' // F2: own favourite mentors
  | 'scheduling.availability.manage.own' // F3 M3: own weekly template, exceptions and settings
  | 'trust.mentor_application.decide' // F2 A1: mentor verification queue and decisions
  | 'payouts.payout_profile.edit.own' // F2 M1 step 6: own DAC7 and payout data
  | 'payouts.payout_profile.read_sensitive'; // F2 (Q5): full DAC7 values, audited reads

const PERMISSIONS: Record<Role, readonly Permission[]> = {
  student: ['account.manage.own', 'catalog.favorite.manage.own'],
  mentor: [
    'account.manage.own',
    'mentor.access',
    'catalog.mentor_profile.edit.own',
    'scheduling.availability.manage.own',
    'payouts.payout_profile.edit.own',
  ],
  admin_trust: ['account.manage.own', 'admin.access', 'trust.mentor_application.decide'],
  admin_finance: ['account.manage.own', 'admin.access', 'payouts.payout_profile.read_sensitive'],
};

export const isAdmin = (roles: readonly Role[]): boolean =>
  roles.some((role) => (ADMIN_ROLES as readonly Role[]).includes(role));

export const hasPermission = (roles: readonly Role[], permission: Permission): boolean =>
  roles.some((role) => PERMISSIONS[role].includes(permission));
