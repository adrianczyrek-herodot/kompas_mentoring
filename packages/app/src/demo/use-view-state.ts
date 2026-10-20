"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export type ViewState = "success" | "loading" | "empty" | "error";
export const VIEW_STATES: ViewState[] = ["success", "loading", "empty", "error"];

/** Odczyt `?state=` (wymuszony stan ekranu) bez ustawiania go. */
export function useForcedState(): ViewState | null {
  const forced = useSearchParams().get("state");
  return VIEW_STATES.includes(forced as ViewState) ? (forced as ViewState) : null;
}

/** Zmienia `?state=` w bieżącym adresie (`success` usuwa parametr). */
export function useSetViewState(): (state: ViewState) => void {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (state) => {
    const q = new URLSearchParams(params);
    if (state === "success") q.delete("state");
    else q.set("state", state);
    const qs = q.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };
}

/**
 * Stan ekranu jak w mockupie: `?state=` wymusza stan; bez niego po wejściu na stronę
 * przez 280 ms trwa „loading”, potem „success”.
 */
export function useViewState(): ViewState {
  const forced = useForcedState();
  const [booting, setBooting] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 280);
    return () => clearTimeout(t);
  }, []);
  return forced ?? (booting ? "loading" : "success");
}
