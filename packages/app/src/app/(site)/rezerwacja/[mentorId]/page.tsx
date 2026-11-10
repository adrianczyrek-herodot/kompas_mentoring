import { Skeleton } from "@devmentor/ui/frontend/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PickSlotView } from "@/views/student/pick-slot-view";

export const metadata: Metadata = { title: "Wybór terminu" };

export default async function RezerwacjaMentoridPage({ params }: PageProps<"/rezerwacja/[mentorId]">) {
  const { mentorId } = await params;
  return (
    <Suspense fallback={<Skeleton rows={3} />}>
      <PickSlotView mentorId={mentorId} />
    </Suspense>
  );
}
