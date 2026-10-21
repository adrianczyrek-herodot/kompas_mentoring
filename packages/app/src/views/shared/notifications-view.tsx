"use client";

import { buttonVariants } from "@devmentor/ui/frontend/button";
import { Icon } from "@devmentor/ui/frontend/icon";
import { listClass, listItemClass } from "@devmentor/ui/frontend/list";
import { Skeleton } from "@devmentor/ui/frontend/skeleton";
import { EmptyState, ErrorState } from "@devmentor/ui/frontend/state";
import { h1Class, smallMuted } from "@devmentor/ui/frontend/typography";
import { fmtDate, fmtTime } from "@devmentor/ui/lib/format";
import { cn } from "@devmentor/ui/lib/utils";
import Link from "next/link";
import { markAllNotificationsRead } from "@/demo/actions";
import { toUrl } from "@/demo/navigation";
import { useDemoStore } from "@/demo/use-demo-store";
import { useSetViewState, useViewState } from "@/demo/use-view-state";

/** S2 — powiadomienia. */
export function NotificationsView() {
  const store = useDemoStore();
  const state = useViewState();
  const setState = useSetViewState();
  const list = state === "empty" ? [] : store.notifications;
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className={cn(h1Class, "m-0")}>Powiadomienia</h1>
        {list.some((n) => n.unread) && <button type="button" data-read className={buttonVariants({ variant: "ghost", size: "s" })} onClick={markAllNotificationsRead}>Oznacz wszystkie jako przeczytane</button>}
      </div>
      {state === "loading" && <Skeleton rows={4} kind="line" />}
      {state === "error" && <ErrorState onRetry={() => setState("success")} />}
      {state === "empty" && <EmptyState title="Wszystko przeczytane" text="Tutaj pojawią się przypomnienia o sesjach, wiadomości i zmiany w planie." />}
      {state === "success" && (
        <div className={listClass}>
          {list.map((n) => (
            <Link key={n.text} href={toUrl(n.link)} className={cn(listItemClass, "hover:bg-[#fbfaf6]", n.unread && "bg-[#fffaf3] font-semibold")}>
              <Icon name="bell" className="text-brand-2" />
              <div className="flex-1">{n.text}<br /><span className={smallMuted}>{fmtDate(n.at)}, {fmtTime(n.at)}</span></div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
