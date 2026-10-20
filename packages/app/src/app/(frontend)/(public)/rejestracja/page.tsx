import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthView } from "@/views/public/auth-view";

export const metadata: Metadata = { title: "Rejestracja" };

export default function RejestracjaPage() {
  return (
    <Suspense>
      <AuthView mode="register" />
    </Suspense>
  );
}
