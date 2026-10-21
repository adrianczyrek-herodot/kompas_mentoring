import type { ReactNode } from "react";
import { DemoChrome } from "@/demo/demo-chrome";

/** Strony przepisane na React (P1–P4) — z nagłówkiem i paskiem mockupu w React. */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return <DemoChrome>{children}</DemoChrome>;
}
