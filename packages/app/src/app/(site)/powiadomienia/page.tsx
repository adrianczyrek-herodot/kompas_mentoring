import { Skeleton } from "@devmentor/ui/frontend/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { NotificationsView } from "@/views/shared/notifications-view";

export const metadata: Metadata = { title: "Powiadomienia" };

export default function PowiadomieniaPage() {
  return (
    <Suspense fallback={<Skeleton rows={3} />}>
      <NotificationsView />
    </Suspense>
  );
}
