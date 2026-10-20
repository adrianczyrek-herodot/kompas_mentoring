"use client";

import {
  CATEGORIES, PRICE_MAX, SORT_OPTIONS, TIME_OPTIONS, activeMentorFilters, filterMentors, mentorFiltersToQuery, readMentorFilters,
  type MentorFilters,
} from "@devmentor/core/domain";
import { MENTORS } from "@devmentor/db/fixtures";
import { buttonVariants } from "@devmentor/ui/frontend/button";
import { chipVariants } from "@devmentor/ui/frontend/chip";
import { inputClass } from "@devmentor/ui/frontend/field";
import { Icon } from "@devmentor/ui/frontend/icon";
import { Skeleton } from "@devmentor/ui/frontend/skeleton";
import { EmptyState, ErrorState } from "@devmentor/ui/frontend/state";
import { cn } from "@devmentor/ui/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSetViewState, useViewState } from "@/demo/use-view-state";
import { MentorCard } from "./mentor-cards";

const labelClass = "text-[0.88rem] font-semibold";

/** Formularz filtrów — niekontrolowany; zmiana (select, checkbox, suwak, Enter/wyjście z pola tematu) aktualizuje adres. */
function FiltersForm({ filters, onChange }: { filters: MentorFilters; onChange: (f: MentorFilters) => void }) {
  const [price, setPrice] = useState(filters.priceMax);
  const read = (form: HTMLFormElement): MentorFilters => {
    const fd = new FormData(form);
    return {
      topic: String(fd.get("topic") ?? ""),
      priceMax: Number(fd.get("priceMax")),
      verified: Boolean(fd.get("verified")),
      time: String(fd.get("time") ?? ""),
      sort: String(fd.get("sort") ?? "trafnosc"),
    };
  };
  const commit = (e: { currentTarget: HTMLElement }) => {
    const form = e.currentTarget.closest("form");
    if (form) onChange(read(form));
  };
  return (
    <form
      className="grid gap-3.5 rounded-card border border-line bg-surface p-4"
      onSubmit={(e) => { e.preventDefault(); onChange(read(e.currentTarget)); }}
    >
      <div className="flex flex-col gap-[5px]">
        <label htmlFor="f-topic" className={labelClass}>Temat</label>
        <input id="f-topic" name="topic" defaultValue={filters.topic} list="topics2" placeholder="np. React" className={inputClass} onBlur={commit} />
        <datalist id="topics2">{CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
      </div>
      <div className="flex flex-col gap-[5px]">
        <label htmlFor="f-price" className={labelClass}>Cena za 60 min: do <output>{price}</output> zł</label>
        <input id="f-price" type="range" name="priceMax" min={50} max={PRICE_MAX} step={10} defaultValue={filters.priceMax}
          className="accent-brand" onChange={(e) => setPrice(Number(e.target.value))} onPointerUp={commit} onKeyUp={commit} />
      </div>
      <div className="flex flex-col gap-[5px]">
        <label htmlFor="f-time" className={labelClass}>Dostępność</label>
        <select id="f-time" name="time" defaultValue={filters.time} className={inputClass} onChange={commit}>
          {TIME_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <label className="flex cursor-pointer items-start gap-2">
        <input type="checkbox" name="verified" defaultChecked={filters.verified} className="mt-1 size-4 flex-none accent-brand" onChange={commit} /> Tylko zweryfikowani
      </label>
      <div className="flex flex-col gap-[5px]">
        <label htmlFor="f-sort" className={labelClass}>Sortuj</label>
        <select id="f-sort" name="sort" defaultValue={filters.sort} className={inputClass} onChange={commit}>
          {SORT_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
    </form>
  );
}

/** P2 — wyszukiwarka mentorów. Filtry żyją w adresie (`/mentorzy?topic=React&sort=ocena`). */
export function SearchView() {
  const params = useSearchParams();
  const router = useRouter();
  const state = useViewState();
  const setState = useSetViewState();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters = readMentorFilters(params);
  const list = state === "empty" ? [] : filterMentors(MENTORS, filters);
  const active = activeMentorFilters(filters);
  const narrowest = active[0];

  const go = (q: URLSearchParams) => {
    const qs = q.toString();
    router.replace(`/mentorzy${qs ? `?${qs}` : ""}`, { scroll: false });
  };
  const clear = (key: string) => {
    const q = new URLSearchParams(params);
    q.delete(key);
    q.delete("state");
    go(q);
  };
  const clearButton = narrowest && (
    <button type="button" className={buttonVariants()} onClick={() => clear(narrowest[0])}>Wyczyść: {narrowest[1]}</button>
  );

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="m-0 font-serif text-[1.85rem] font-semibold">Mentorzy</h1>
        <button type="button" className={cn(buttonVariants({ variant: "ghost" }), "md:hidden")} onClick={() => setFiltersOpen((o) => !o)}>
          Filtry{active.length ? ` (${active.length})` : ""}
        </button>
      </div>
      <div className="grid gap-5 min-[900px]:grid-cols-[280px_1fr] min-[900px]:items-start">
        <aside className={cn("min-[900px]:sticky min-[900px]:top-[76px] min-[900px]:block", filtersOpen ? "block" : "hidden")}>
          <FiltersForm key={params.toString()} filters={filters} onChange={(f) => go(mentorFiltersToQuery(f))} />
        </aside>
        <div>
          {active.length > 0 && (
            <div className="my-3 flex flex-wrap gap-2">
              {active.map(([k, l]) => (
                <button key={k} type="button" className={chipVariants({ on: true })} onClick={() => clear(k)}>
                  {l} <Icon name="x" className="size-3.5" />
                </button>
              ))}
            </div>
          )}
          {state === "loading" && <Skeleton rows={4} />}
          {state === "error" && <ErrorState text="Nie udało się wczytać listy mentorów." onRetry={() => setState("success")} />}
          {state === "empty" && (
            <EmptyState title="Brak mentorów dla tych filtrów" text="Spróbuj poluzować filtry — najbardziej zawęża wynik filtr poniżej."
              action={clearButton || <Link className={buttonVariants()} href="/mentorzy">Pokaż wszystkich</Link>} />
          )}
          {state === "success" && (list.length === 0
            ? <EmptyState title="Brak mentorów dla tych filtrów" text="Spróbuj poluzować filtry." action={clearButton || undefined} />
            : (
              <>
                <p className="text-[0.85rem] text-ink-2" data-count>{list.length} {list.length === 1 ? "mentor" : "mentorów"}</p>
                <div className="space-y-3">{list.map((m) => <MentorCard key={m.id} mentor={m} />)}</div>
              </>
            ))}
        </div>
      </div>
    </>
  );
}
