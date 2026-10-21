"use client";

import type { Role } from "@devmentor/core/domain";
import { buttonVariants } from "@devmentor/ui/frontend/button";
import { Icon } from "@devmentor/ui/frontend/icon";
import { cn } from "@devmentor/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AVATAR, useAccess } from "./access";
import { assumeRole } from "./actions";
import { MockBar } from "./mock-bar";
import { DEFAULT_ROUTE, NAV, ROLE_LABEL, screenInfo, toUrl, type Access } from "./navigation";
import { useDemoStore } from "./use-demo-store";

function NavLinks({ role, pathname, mobile = false }: { role: Role; pathname: string; mobile?: boolean }) {
  const cur = `#${pathname}`;
  return NAV[role].map(([route, label, icon]) => {
    const active = cur === route || (route !== "#/mentor" && cur.startsWith(route));
    return (
      <Link
        key={route}
        href={toUrl(route)}
        className={cn(
          "flex items-center font-medium text-ink-2 no-underline",
          mobile ? "flex-col gap-0.5 rounded-[10px] px-1.5 py-1 text-[0.7rem]" : "gap-1.5 rounded-full px-[11px] py-[7px] text-[0.92rem] hover:bg-line-2",
          active && (mobile ? "text-brand" : "bg-brand-soft text-brand"),
        )}
      >
        <Icon name={icon} />
        <span>{label}</span>
      </Link>
    );
  });
}

const guardCard = "mx-auto flex max-w-[640px] flex-col items-center gap-3 rounded-card border border-line bg-surface p-[18px] text-center shadow-card";

/** Strażnik dostępu (wygląd stron frontendowych): gość → zaloguj się, zła rola → przełącz. */
function AccessGuard({ access, role, children }: { access: Access; role: Role; children: ReactNode }) {
  const check = useAccess(access, role);
  if (check.kind === "ok") return children;
  if (check.kind === "guest") {
    return (
      <div className={guardCard}>
        <Icon name="user" />
        <h1 className="mb-0 font-serif text-[1.4rem] font-semibold">Zaloguj się, żeby kontynuować</h1>
        <p className="text-ink-2">Ten ekran wymaga konta.</p>
        <div className="flex justify-center gap-2">
          <Link className={buttonVariants()} href="/logowanie">Zaloguj</Link>
          <Link className={buttonVariants({ variant: "ghost" })} href="/rejestracja">Załóż konto</Link>
        </div>
      </div>
    );
  }
  return (
    <div className={guardCard}>
      <Icon name="alert" />
      <h1 className="mb-0 font-serif text-[1.4rem] font-semibold">Ten ekran jest dla roli: {ROLE_LABEL[check.needed]}</h1>
      <p className="text-ink-2">W mockupie możesz przełączyć rolę.</p>
      <button type="button" data-switch={check.needed} className={buttonVariants()} onClick={() => assumeRole(check.needed)}>Przełącz na: {ROLE_LABEL[check.needed]}</button>
    </div>
  );
}

/** Nagłówek, nawigacja i stopka stron frontendowych. */
export function DemoChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { role, notifications } = useDemoStore();
  const unread = notifications.filter((n) => n.unread).length;
  const avatar = AVATAR[role];
  const screen = screenInfo(pathname);
  const access = screen?.access ?? "public";
  const bare = screen?.bare ?? false;
  return (
    <>
      <MockBar pathname={pathname} />
      <header className="sticky top-0 z-20 flex items-center gap-5 border-b border-line bg-paper/92 px-4 py-2.5 backdrop-blur-md">
        <Link href={toUrl(DEFAULT_ROUTE[role])} className="flex items-center gap-1.5 font-serif text-[1.3rem] font-bold tracking-[-0.02em] text-brand no-underline" aria-label="Kompas — strona główna">
          <span className="text-[1.05rem] text-accent">✦</span>kompas
        </Link>
        <nav className="hidden gap-1 md:flex" aria-label="Główna"><NavLinks role={role} pathname={pathname} /></nav>
        <div className="ml-auto flex items-center gap-2">
          {role === "guest" ? (
            <>
              <Link className={buttonVariants({ variant: "ghost", size: "s" })} href="/logowanie">Zaloguj</Link>
              <Link className={cn(buttonVariants({ size: "s" }), "max-[480px]:hidden")} href="/rejestracja">Załóż konto</Link>
            </>
          ) : (
            <>
              <Link href={toUrl("#/powiadomienia")} className="relative grid size-[38px] place-items-center rounded-full text-ink-2 hover:bg-line-2" aria-label="Powiadomienia">
                <Icon name="bell" />
                {unread > 0 && <span className="absolute top-[3px] right-[3px] grid h-4 min-w-4 place-items-center rounded-lg bg-accent text-[0.65rem] font-bold text-white">{unread}</span>}
              </Link>
              <Link
                href={toUrl("#/konto")}
                className="grid size-[34px] place-items-center rounded-full text-[12px] font-bold no-underline"
                style={{ color: `hsl(${avatar.hue} 45% 22%)`, background: `hsl(${avatar.hue} 45% 86%)` }}
                aria-label="Konto"
              >
                {avatar.initials}
              </Link>
            </>
          )}
        </div>
      </header>
      {role !== "guest" && (
        <nav className="fixed inset-x-0 bottom-0 z-25 flex justify-around border-t border-line bg-surface px-1 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom))] md:hidden" aria-label="Główna (mobile)">
          <NavLinks role={role} pathname={pathname} mobile />
        </nav>
      )}
      <main id="main" data-path={pathname} className={cn(bare ? "" : "mx-auto min-h-[70vh] max-w-[1160px] px-4 pt-5 pb-12", role !== "guest" && "pb-24 md:pb-12")}>
        <AccessGuard access={access} role={role}>{children}</AccessGuard>
      </main>
      {!bare && <footer className="mx-auto flex max-w-[1160px] justify-between border-t border-line px-4 pt-5 pb-[110px] text-[0.8rem] text-ink-3 md:pb-7">
        <span>Kompas · mockup koncepcji · dane fikcyjne</span>
        <Link href={toUrl("#/mapa")}>Mapa ekranów</Link>
      </footer>}
    </>
  );
}

