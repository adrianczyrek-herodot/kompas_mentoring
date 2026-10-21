import { Skeleton } from "@devmentor/ui/frontend/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { SessionDetailView } from "@/views/student/session-detail-view";

export const metadata: Metadata = { title: "Szczegóły sesji" };

export default async function SesjeIdPage({ params }: PageProps<"/sesje/[id]">) {
  const { id } = await params;
  return (
    <Suspense fallback={<Skeleton rows={3} />}>
      <SessionDetailView id={id} />
    </Suspense>
  );
}
