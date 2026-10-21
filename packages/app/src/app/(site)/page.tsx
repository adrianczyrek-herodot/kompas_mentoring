import { Suspense } from "react";
import { HomeView } from "@/views/public/home-view";

export default function HomePage() {
  return (
    <Suspense>
      <HomeView />
    </Suspense>
  );
}
