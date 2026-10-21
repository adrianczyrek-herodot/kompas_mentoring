import { Skeleton } from "@devmentor/ui/backend/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { EarningsView } from "@/views/mentor/earnings-view";

export const metadata: Metadata = { title: "Zarobki i wypłaty" };

export default function MentorZarobkiPage() {
  return (
    <Suspense fallback={<div aria-busy="true"><Skeleton className="h-40" /></div>}>
      <EarningsView />
    </Suspense>
  );
}
