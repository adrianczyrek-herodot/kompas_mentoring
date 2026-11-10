import { Skeleton } from "@devmentor/ui/backend/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { StudentView } from "@/views/mentor/student-view";

export const metadata: Metadata = { title: "Uczeń" };

export default async function MentorUczniowieIdPage({ params }: PageProps<"/mentor/uczniowie/[id]">) {
  const { id } = await params;
  return (
    <Suspense fallback={<div aria-busy="true"><Skeleton className="h-40" /></div>}>
      <StudentView id={id} />
    </Suspense>
  );
}
