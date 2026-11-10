import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthView } from "@/views/public/auth-view";

export const metadata: Metadata = { title: "Logowanie" };

export default function LogowaniePage() {
  return (
    <Suspense>
      <AuthView mode="login" />
    </Suspense>
  );
}
