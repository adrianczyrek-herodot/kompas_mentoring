import { Skeleton } from "@devmentor/ui/frontend/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { SessionsView } from "@/views/student/sessions-view";

export const metadata: Metadata = { title: "Moje sesje" };

export default function SesjePage() {
  return (
    <Suspense fallback={<Skeleton rows={3} />}>
      <SessionsView />
    </Suspense>
  );
}
