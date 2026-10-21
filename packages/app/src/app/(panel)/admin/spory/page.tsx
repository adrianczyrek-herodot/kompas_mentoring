import { Skeleton } from "@devmentor/ui/backend/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { DisputesView } from "@/views/admin/disputes-view";

export const metadata: Metadata = { title: "Spory i zwroty" };

export default function AdminSporyPage() {
  return (
    <Suspense fallback={<div aria-busy="true"><Skeleton className="h-40" /></div>}>
      <DisputesView />
    </Suspense>
  );
}
