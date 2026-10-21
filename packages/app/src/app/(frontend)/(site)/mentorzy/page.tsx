import { Skeleton } from "@devmentor/ui/frontend/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "@/views/public/search-view";

export const metadata: Metadata = { title: "Mentorzy" };

export default function MentorsPage() {
  return (
    <Suspense fallback={<Skeleton rows={4} />}>
      <SearchView />
    </Suspense>
  );
}
