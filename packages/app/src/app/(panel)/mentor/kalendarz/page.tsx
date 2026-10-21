import { Skeleton } from "@devmentor/ui/backend/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CalendarView } from "@/views/mentor/calendar-view";

export const metadata: Metadata = { title: "Kalendarz i dostępność" };

export default function MentorKalendarzPage() {
  return (
    <Suspense fallback={<div aria-busy="true"><Skeleton className="h-40" /></div>}>
      <CalendarView />
    </Suspense>
  );
}
