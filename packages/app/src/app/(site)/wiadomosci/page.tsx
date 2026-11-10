import { Skeleton } from "@devmentor/ui/frontend/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { MessagesView } from "@/views/shared/messages-view";

export const metadata: Metadata = { title: "Wiadomości" };

export default function WiadomosciPage() {
  return (
    <Suspense fallback={<Skeleton rows={3} />}>
      <MessagesView />
    </Suspense>
  );
}
