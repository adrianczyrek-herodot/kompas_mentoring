import { Skeleton } from "@devmentor/ui/backend/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { StudentsView } from "@/views/mentor/students-view";

export const metadata: Metadata = { title: "Uczniowie" };

export default function MentorUczniowiePage() {
  return (
    <Suspense fallback={<div aria-busy="true"><Skeleton className="h-40" /></div>}>
      <StudentsView />
    </Suspense>
  );
}
