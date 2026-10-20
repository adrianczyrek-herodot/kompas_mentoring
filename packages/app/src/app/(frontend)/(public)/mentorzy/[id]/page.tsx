import { MENTORS } from "@devmentor/db/fixtures";
import { Skeleton } from "@devmentor/ui/frontend/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileView } from "@/views/public/profile-view";

export async function generateMetadata({ params }: PageProps<"/mentorzy/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: MENTORS.find((m) => m.id === id)?.name ?? "Profil mentora" };
}

export default async function MentorProfilePage({ params }: PageProps<"/mentorzy/[id]">) {
  const { id } = await params;
  return (
    <Suspense fallback={<Skeleton rows={2} />}>
      <ProfileView id={id} />
    </Suspense>
  );
}
