import { Skeleton } from "@devmentor/ui/frontend/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { RoomView } from "@/views/student/room-view";

export const metadata: Metadata = { title: "Pokój sesji" };

export default async function SesjeIdPokojPage({ params }: PageProps<"/sesje/[id]/pokoj">) {
  const { id } = await params;
  return (
    <Suspense fallback={<Skeleton rows={3} />}>
      <RoomView id={id} />
    </Suspense>
  );
}
