import { Skeleton } from "@devmentor/ui/backend/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { OnboardingView } from "@/views/mentor/onboarding-view";

export const metadata: Metadata = { title: "Zostań mentorem" };

export default async function MentorOnboardingStepPage({ params }: PageProps<"/mentor/onboarding/[step]">) {
  const { step } = await params;
  return (
    <Suspense fallback={<div aria-busy="true"><Skeleton className="h-40" /></div>}>
      <OnboardingView step={step} />
    </Suspense>
  );
}
