import {
  CalendarDays,
  ChartLine,
  LayoutDashboard,
  MessageSquare,
  Search,
  User,
  Users,
  Wallet,
} from 'lucide-react';
import type * as React from 'react';
import { cn } from '../lib/utils';

type NavRole = 'student' | 'mentor';

type NavItem = { id: string; label: string; href: string; Icon: typeof Search };

// Five items per role (KONCEPCJA §3, R02.6). No counters next to items (R02.4).
const navItems: Record<NavRole, NavItem[]> = {
  student: [
    { id: 'search', label: 'Szukaj', href: '/mentorzy', Icon: Search },
    { id: 'sessions', label: 'Sesje', href: '/sesje', Icon: CalendarDays },
    { id: 'messages', label: 'Wiadomości', href: '/wiadomosci', Icon: MessageSquare },
    { id: 'progress', label: 'Postępy', href: '/postepy', Icon: ChartLine },
    { id: 'account', label: 'Konto', href: '/konto', Icon: User },
  ],
  mentor: [
    { id: 'dashboard', label: 'Panel', href: '/mentor', Icon: LayoutDashboard },
    { id: 'calendar', label: 'Kalendarz', href: '/mentor/kalendarz', Icon: CalendarDays },
    { id: 'students', label: 'Uczniowie', href: '/mentor/uczniowie', Icon: Users },
    { id: 'messages', label: 'Wiadomości', href: '/wiadomosci', Icon: MessageSquare },
    { id: 'earnings', label: 'Zarobki', href: '/mentor/zarobki', Icon: Wallet },
  ],
};

type AppHeaderProps = Omit<React.ComponentProps<'header'>, 'children'> & {
  role: NavRole;
  /** Id of the current item (`aria-current="page"`). */
  current?: string;
  /** Right side: notifications, avatar menu (KONCEPCJA §3.2). Pages add `pb-bottom-nav md:pb-0`. */
  actions?: React.ReactNode;
};

function NavLinks({
  role,
  current,
  compact,
}: {
  role: NavRole;
  current?: string | undefined;
  compact: boolean;
}) {
  return (
    <ul className={cn('flex', compact ? 'w-full justify-around' : 'gap-tight')}>
      {navItems[role].map(({ id, label, href, Icon }) => (
        <li key={id}>
          <a
            href={href}
            aria-current={id === current ? 'page' : undefined}
            data-current={id === current || undefined}
            className={cn(
              'flex items-center rounded-control text-label text-text-muted transition-colors duration-fast hover:bg-surface-hover hover:text-text-default data-current:text-text-default',
              compact
                ? 'min-h-target min-w-target flex-col justify-center gap-tight px-tight text-meta data-current:font-semibold'
                : 'min-h-control gap-inline px-field-x data-current:bg-selected-bg data-current:text-text-link',
            )}
          >
            <Icon aria-hidden="true" className="size-icon-md" />
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}

// App frame: logo and the role's five sections. Desktop: in the header; < 768 px: bottom bar
// (KONCEPCJA §3.2). The current section is marked by aria-current and weight/background, not
// colour alone (WCAG 1.4.1).
function AppHeader({ role, current, actions, className, ...props }: AppHeaderProps) {
  return (
    <>
      <header
        data-slot="app-header"
        className={cn(
          'flex min-h-control-lg items-center justify-between gap-group border-b border-border-divider bg-surface-panel px-panel',
          className,
        )}
        {...props}
      >
        <a href="/" className="rounded-control text-section-title font-semibold text-text-default">
          Kompas
        </a>
        <nav aria-label="Główna" className="hidden md:block">
          <NavLinks role={role} current={current} compact={false} />
        </nav>
        <div className="flex items-center gap-inline">{actions}</div>
      </header>
      <nav
        aria-label="Główna (dolny pasek)"
        className="fixed inset-x-0 bottom-0 flex h-bottom-nav items-center border-t border-border-divider bg-surface-panel md:hidden"
      >
        <NavLinks role={role} current={current} compact />
      </nav>
    </>
  );
}

export { AppHeader, type AppHeaderProps, type NavRole };
