import { Skeleton } from "@devmentor/ui/backend/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { VerificationView } from "@/views/admin/verification-view";

export const metadata: Metadata = { title: "Weryfikacja mentorów" };

export default function AdminWeryfikacjaPage() {
  return (
    <Suspense fallback={<div aria-busy="true"><Skeleton className="h-40" /></div>}>
      <VerificationView />
    </Suspense>
  );
}
