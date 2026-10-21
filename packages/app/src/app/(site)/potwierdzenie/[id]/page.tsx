import { Skeleton } from "@devmentor/ui/frontend/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ConfirmationView } from "@/views/student/confirmation-view";

export const metadata: Metadata = { title: "Potwierdzenie rezerwacji" };

export default async function PotwierdzenieIdPage({ params }: PageProps<"/potwierdzenie/[id]">) {
  const { id } = await params;
  return (
    <Suspense fallback={<Skeleton rows={3} />}>
      <ConfirmationView id={id} />
    </Suspense>
  );
}
