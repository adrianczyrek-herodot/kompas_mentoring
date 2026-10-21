import { Skeleton } from "@devmentor/ui/frontend/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PlansView } from "@/views/student/plans-view";

export const metadata: Metadata = { title: "Plany i saldo" };

export default function PlanyPage() {
  return (
    <Suspense fallback={<Skeleton rows={3} />}>
      <PlansView />
    </Suspense>
  );
}
