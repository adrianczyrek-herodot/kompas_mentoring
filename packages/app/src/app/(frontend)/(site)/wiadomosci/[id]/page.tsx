import { Skeleton } from "@devmentor/ui/frontend/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { MessagesView } from "@/views/shared/messages-view";

export const metadata: Metadata = { title: "Wiadomości" };

export default async function WiadomosciIdPage({ params }: PageProps<"/wiadomosci/[id]">) {
  const { id } = await params;
  return (
    <Suspense fallback={<Skeleton rows={3} />}>
      <MessagesView id={id} />
    </Suspense>
  );
}
