"use client";

import type { Role } from "@devmentor/core/domain";
import { Button, buttonVariants } from "@devmentor/ui/backend/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@devmentor/ui/backend/card";
import { Toaster } from "@devmentor/ui/backend/sonner";
import { cn } from "@devmentor/ui/lib/utils";
import {
  CalendarIcon, FlagIcon, LayoutDashboardIcon, LockIcon, MessageSquareIcon, SearchIcon, ShieldCheckIcon, TargetIcon,
  UserPlusIcon, UsersIcon, WalletIcon, type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AVATAR, useAccess } from "@/demo/access";
import { assumeRole } from "@/demo/actions";
import { MockBar } from "@/demo/mock-bar";
import { NAV, ROLE_LABEL, screenInfo, toUrl, type Access } from "@/demo/navigation";
import { useDemoStore } from "@/demo/use-demo-store";
import { PersonAvatar } from "./person-avatar";

const ICONS: Record<string, LucideIcon> = {
  home: LayoutDashboardIcon, cal: CalendarIcon, users: UsersIcon, chat: MessageSquareIcon, wallet: WalletIcon,
  shield: ShieldCheckIcon, flag: FlagIcon, search: SearchIcon, user: UserPlusIcon, target: TargetIcon,
};

function NavItems({ role, pathname, compact = false }: { role: Role; pathname: string; compact?: boolean }) {
  const cur = `#${pathname}`;
  return NAV[role].map(([route, label, icon]) => {
    const active = cur === route || (route !== "#/mentor" && route !== "#/admin" && cur.startsWith(route));
    const Icon = ICONS[icon] ?? LayoutDashboardIcon;
    return (
      <Link key={route} href={toUrl(route)} aria-current={active ? "page" : undefined}
        className={cn(buttonVariants({ variant: active ? "secondary" : "ghost", size: compact ? "sm" : "default" }), !compact && "w-full justify-start")}>
        <Icon /> {label}
      </Link>
    );
  });
}

/** Strażnik dostępu panelu: gość → zaloguj się, zła rola → przełącz. */
function PanelGuard({ access, role, children }: { access: Access; role: Role; children: ReactNode }) {
  const check = useAccess(access, role);
  if (check.kind === "ok") return children;
  return (
    <Card className="mx-auto max-w-md text-center">
      <CardHeader>
        <LockIcon className="mx-auto size-6 text-muted-foreground" />
        <CardTitle>{check.kind === "guest" ? "Zaloguj się, żeby kontynuować" : `Ten ekran jest dla roli: ${ROLE_LABEL[check.needed]}`}</CardTitle>
        <CardDescription>{check.kind === "guest" ? "Ten ekran wymaga konta." : "W mockupie możesz przełączyć rolę."}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center gap-2">
        {check.kind === "guest" ? (
          <>
            <Button asChild><Link href="/logowanie">Zaloguj</Link></Button>
            <Button asChild variant="outline"><Link href="/rejestracja">Załóż konto</Link></Button>
          </>
        ) : (
          <Button data-switch={check.needed} onClick={() => assumeRole(check.needed)}>Przełącz na: {ROLE_LABEL[check.needed]}</Button>
        )}
      </CardContent>
    </Card>
  );
}

/** Panel mentora i admina (shadcn/ui): pasek mockupu, menu boczne z nawigacją roli, strażnik dostępu. */
export function PanelChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { role } = useDemoStore();
  const screen = screenInfo(pathname);
  const persona = AVATAR[role];
  return (
    <>
      {/* Pasek mockupu używa kolorów Kompasu — poza zakresem motywu panelu. */}
      <MockBar pathname={pathname} />
      <div className="backend flex min-h-[calc(100vh-34px)] bg-muted/40 text-foreground">
        <aside className="hidden w-60 shrink-0 flex-col gap-1 border-r bg-background p-3 md:flex">
          <Link href={role === "admin" ? "/admin" : role === "mentor" ? "/mentor" : "/"} className="mb-3 px-3 py-2 font-semibold no-underline">
            Kompas · Panel
          </Link>
          <nav className="grid gap-1" aria-label="Panel"><NavItems role={role} pathname={pathname} /></nav>
          {role !== "guest" && (
            <div className="mt-auto flex items-center gap-2 border-t px-2 pt-3 text-sm">
              <PersonAvatar name={persona.name} hue={persona.hue} className="size-8" />
              <span>{persona.name} · {ROLE_LABEL[role]}</span>
            </div>
          )}
        </aside>
        <div className="min-w-0 flex-1">
          <nav className="flex gap-1 overflow-x-auto border-b bg-background px-2 py-2 md:hidden" aria-label="Panel (mobile)">
            <NavItems role={role} pathname={pathname} compact />
          </nav>
          <main id="main" data-path={pathname} className="mx-auto max-w-6xl p-4 md:p-8">
            <PanelGuard access={screen?.access ?? "public"} role={role}>{children}</PanelGuard>
          </main>
        </div>
      </div>
      <Toaster position="bottom-center" />
    </>
  );
}
