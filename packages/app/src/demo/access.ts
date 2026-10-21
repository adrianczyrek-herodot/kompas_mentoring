"use client";

import type { Role } from "@devmentor/core/domain";
import { useEffect } from "react";
import { rememberReturnTo } from "./actions";
import type { Access } from "./navigation";

/** Inicjały i odcień awatara zalogowanej persony demo. */
export const AVATAR: Record<Role, { name: string; initials: string; hue: number }> = {
  guest: { name: "", initials: "", hue: 0 },
  student: { name: "Adrian C.", initials: "AC", hue: 12 },
  mentor: { name: "Kasia Nowicka", initials: "KN", hue: 168 },
  admin: { name: "Admin Demo", initials: "AD", hue: 0 },
};

/** Czy rola ma dostęp do ekranu. */
export const allowed = (access: Access, role: Role): boolean =>
  access === "public" || (role !== "guest" && (access === "auth" || access === role));

export type AccessCheck = { kind: "ok" } | { kind: "guest" } | { kind: "role"; needed: Role };

/** Wynik strażnika dostępu; gość zablokowany na ekranie wymagającym konta — zapamiętujemy trasę powrotu. */
export function useAccess(access: Access, role: Role): AccessCheck {
  const blockedGuest = access !== "public" && role === "guest";
  useEffect(() => {
    if (blockedGuest) rememberReturnTo(`#${location.pathname}${location.search}`);
  }, [blockedGuest]);
  if (allowed(access, role)) return { kind: "ok" };
  return blockedGuest ? { kind: "guest" } : { kind: "role", needed: access as Role };
}
