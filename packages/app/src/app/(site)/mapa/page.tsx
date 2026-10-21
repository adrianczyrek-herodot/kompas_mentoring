import { Skeleton } from "@devmentor/ui/frontend/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ScreenMapView } from "@/views/shared/screen-map-view";

export const metadata: Metadata = { title: "Mapa ekranów" };

export default function MapaPage() {
  return (
    <Suspense fallback={<Skeleton rows={3} />}>
      <ScreenMapView />
    </Suspense>
  );
}
