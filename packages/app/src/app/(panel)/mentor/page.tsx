import { Skeleton } from "@devmentor/ui/backend/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardView } from "@/views/mentor/dashboard-view";

export const metadata: Metadata = { title: "Panel mentora" };

export default function MentorPage() {
  return (
    <Suspense fallback={<div aria-busy="true"><Skeleton className="h-40" /></div>}>
      <DashboardView />
    </Suspense>
  );
}
