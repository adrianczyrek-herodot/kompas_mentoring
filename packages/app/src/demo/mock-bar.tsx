"use client";

import type { Role } from "@devmentor/core/domain";
import { Icon } from "@devmentor/ui/frontend/icon";
import { cn } from "@devmentor/ui/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { switchRole } from "./actions";
import { DEFAULT_ROUTE, ROLE_LABEL, screenInfo, toUrl } from "./navigation";
import { useDemoStore } from "./use-demo-store";
import { VIEW_STATES, useForcedState, useSetViewState } from "./use-view-state";

// Pasek mockupu (wspólny dla stron i panelu). Używa kolorów Kompasu — w panelu stoi poza `.backend`.
const STATE_LABEL = { success: "domyślny", loading: "loading", empty: "empty", error: "error" };
/** Przełączniki stanu ekranu (czytają `?state=`, więc w osobnej granicy Suspense). */
function StateSwitch() {
  const forced = useForcedState() ?? "success";
  const setState = useSetViewState();
  return (
    <span className="inline-flex overflow-hidden rounded-md border border-[#34413e]" role="group" aria-label="Stan ekranu">
      {VIEW_STATES.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => setState(s)}
          className={cn("cursor-pointer border-0 bg-transparent px-[9px] py-[3px] [&+&]:border-l [&+&]:border-[#34413e]", forced === s ? "bg-[#2c3a37] text-white" : "text-[#b9c4c1]")}
        >
          {STATE_LABEL[s]}
        </button>
      ))}
    </span>
  );
}

/** Pasek MOCKUP: ekran, rola, stan, mapa ekranów. */
export function MockBar({ pathname }: { pathname: string }) {
  const { role } = useDemoStore();
  const router = useRouter();
  const screen = screenInfo(pathname);
  const changeRole = (r: Role) => {
    switchRole(r);
    router.push(toUrl(DEFAULT_ROUTE[r]));
  };
  return (
    <div className="flex items-center gap-3 overflow-x-auto bg-mock px-4 py-1.5 text-[0.78rem] whitespace-nowrap text-[#d9e2df]" role="region" aria-label="Pasek mockupu">
      <span className="rounded bg-accent px-[7px] py-px font-bold tracking-[0.05em] text-[#1a0f05]">MOCKUP</span>
      {screen && <span><b className="text-white">{screen.id}</b> {screen.title}</span>}
      <label>
        Rola{" "}
        <select
          data-role
          value={role}
          onChange={(e) => changeRole(e.target.value as Role)}
          className="ml-1 rounded-md border border-[#34413e] bg-[#1f2a28] px-1.5 py-0.5 text-white"
        >
          {(Object.keys(ROLE_LABEL) as Role[]).map((k) => <option key={k} value={k}>{ROLE_LABEL[k]}</option>)}
        </select>
      </label>
      <Suspense fallback={null}><StateSwitch /></Suspense>
      <Link href={toUrl("#/mapa")} className="inline-flex items-center gap-1 text-[#d9e2df] no-underline">
        <Icon name="map" className="size-3.5" /> Mapa ekranów
      </Link>
    </div>
  );
}
