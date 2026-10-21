import { Skeleton } from "@devmentor/ui/frontend/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountView } from "@/views/shared/account-view";

export const metadata: Metadata = { title: "Konto i ustawienia" };

export default function KontoPage() {
  return (
    <Suspense fallback={<Skeleton rows={3} />}>
      <AccountView />
    </Suspense>
  );
}
