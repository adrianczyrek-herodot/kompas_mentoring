import type { Metadata } from "next";
import { KompasApp } from "@/legacy/kompas-app";

export const metadata: Metadata = { title: "Kompas · mockup" };

/** Ekrany jeszcze nieprzepisane na React (router na hashu, np. `/app#/sesje`). */
export default function LegacyAppPage() {
  return <KompasApp />;
}
