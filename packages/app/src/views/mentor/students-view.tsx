"use client";

import { STUDENTS } from "@devmentor/db/fixtures";
import { Badge } from "@devmentor/ui/backend/badge";
import { buttonVariants } from "@devmentor/ui/backend/button";
import { Card } from "@devmentor/ui/backend/card";
import { Skeleton } from "@devmentor/ui/backend/skeleton";
import { EmptyState, ErrorState, PageHeader } from "@devmentor/ui/backend/state";
import { fmtDate } from "@devmentor/ui/lib/format";
import { cn } from "@devmentor/ui/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSetViewState, useViewState } from "@/demo/use-view-state";
import { PersonAvatar } from "@/panel/person-avatar";

const FILTERS = ["wszyscy", "aktywny", "próbny", "nieaktywny"] as const;
export const STUDENT_STATUS_VARIANT = { aktywny: "default", próbny: "secondary", nieaktywny: "outline" } as const;

/** M4 — lista uczniów mentora (`?f=` status). */
export function StudentsView() {
  const state = useViewState();
  const setState = useSetViewState();
  const filter = useSearchParams().get("f") ?? "wszyscy";
  const list = state === "empty" ? [] : STUDENTS.filter((s) => filter === "wszyscy" || s.status === filter);
  return (
    <>
      <PageHeader title="Uczniowie" />
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link key={f} href={`/mentor/uczniowie?f=${encodeURIComponent(f)}`} aria-current={f === filter ? "page" : undefined}
            className={cn(buttonVariants({ variant: f === filter ? "default" : "outline", size: "sm" }), "rounded-full")}>
            {f === "wszyscy" ? "Wszyscy" : f[0]!.toUpperCase() + f.slice(1)}
          </Link>
        ))}
      </div>
      {state === "loading" && <div aria-busy="true" className="grid gap-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>}
      {state === "error" && <ErrorState onRetry={() => setState("success")} />}
      {state === "empty" && <EmptyState title="Nie masz jeszcze uczniów" text="Pierwsi uczniowie pojawią się po zaakceptowaniu sesji próbnej." />}
      {state === "success" && (
        <Card className="gap-0 py-0">
          <ul className="divide-y">
            {list.map((s) => (
              <li key={s.id}>
                <Link href={`/mentor/uczniowie/${s.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50">
                  <PersonAvatar name={s.name} hue={s.hue} />
                  <div className="min-w-0 flex-1">
                    <strong>{s.name}</strong> <Badge variant={STUDENT_STATUS_VARIANT[s.status]}>{s.status}</Badge>
                    <p className="truncate text-sm text-muted-foreground">{s.goal}</p>
                  </div>
                  <div className="hidden text-right text-sm text-muted-foreground sm:block">
                    {s.sessions} sesji<br />{s.nextSession ? `Następna: ${fmtDate(s.nextSession)}` : "—"}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
