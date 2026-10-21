import { Skeleton } from "@devmentor/ui/frontend/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ReviewView } from "@/views/student/review-view";

export const metadata: Metadata = { title: "Ocena sesji" };

export default async function SesjeIdOcenaPage({ params }: PageProps<"/sesje/[id]/ocena">) {
  const { id } = await params;
  return (
    <Suspense fallback={<Skeleton rows={3} />}>
      <ReviewView id={id} />
    </Suspense>
  );
}
