/**
 * App frame for full-screen stories: AppHeader with the role's navigation, one <main> with the
 * content width (`content-max`, 1160 px) and room for the mobile bottom bar (P-T17). Storybook only.
 */
import type { ReactNode } from 'react';
import {
  AppHeader,
  Avatar,
  AvatarFallback,
  Button,
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  type NavRole,
} from '../../src/index';

function AccountMenu({ initials }: { initials: string }) {
  return (
    <Menu>
      <MenuTrigger render={<Button variant="ghost" size="icon" />}>
        <Avatar size="sm" aria-hidden="true">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="sr-only">Menu konta</span>
      </MenuTrigger>
      <MenuContent align="end">
        <MenuItem>Konto i ustawienia</MenuItem>
        <MenuSeparator />
        <MenuItem>Wyloguj</MenuItem>
      </MenuContent>
    </Menu>
  );
}

export function ScreenShell({
  navRole,
  current,
  children,
}: {
  navRole: NavRole;
  current: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-surface-page text-text-default">
      <AppHeader
        role={navRole}
        current={current}
        actions={<AccountMenu initials={navRole === 'mentor' ? 'KN' : 'AC'} />}
      />
      <main className="mx-auto flex max-w-content flex-col gap-section px-panel pt-section pb-bottom-nav md:pb-section">
        {children}
      </main>
    </div>
  );
}

export const fullscreen = { layout: 'fullscreen' as const };
