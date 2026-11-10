import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // The container image (spec §1.4) builds with NEXT_OUTPUT=standalone; `next start` needs the default.
  ...(process.env['NEXT_OUTPUT'] === 'standalone' ? { output: 'standalone' as const } : {}),
  // Workspace packages ship TypeScript sources.
  transpilePackages: ['@kompas/contracts', '@kompas/core', '@kompas/ui'],
  // Server-only libraries with dynamic requires / native drivers stay outside the bundle.
  serverExternalPackages: [
    '@mikro-orm/core',
    '@mikro-orm/postgresql',
    '@mikro-orm/migrations',
    'pg-boss',
    'pino',
  ],
  poweredByHeader: false,
  // `forbidden()` renders app/forbidden.tsx with HTTP 403 for signed-in users without the role.
  experimental: { authInterrupts: true },
};

export default withNextIntl(nextConfig);
