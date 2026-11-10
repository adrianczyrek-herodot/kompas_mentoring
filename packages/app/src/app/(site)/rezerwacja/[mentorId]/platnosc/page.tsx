import { Skeleton } from "@devmentor/ui/frontend/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutView } from "@/views/student/checkout-view";

export const metadata: Metadata = { title: "Płatność" };

export default async function RezerwacjaMentoridPlatnoscPage({ params }: PageProps<"/rezerwacja/[mentorId]/platnosc">) {
  const { mentorId } = await params;
  return (
    <Suspense fallback={<Skeleton rows={3} />}>
      <CheckoutView mentorId={mentorId} />
    </Suspense>
  );
}
