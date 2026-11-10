import { Skeleton } from "@devmentor/ui/frontend/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ProgressView } from "@/views/student/progress-view";

export const metadata: Metadata = { title: "Postępy" };

export default function PostepyPage() {
  return (
    <Suspense fallback={<Skeleton rows={3} />}>
      <ProgressView />
    </Suspense>
  );
}
