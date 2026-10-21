import type { ReactNode } from "react";
import { DemoChrome } from "@/demo/demo-chrome";

/** Strony frontendowe (Tailwind, tokeny Kompasu) — z nagłówkiem, paskiem mockupu i strażnikiem dostępu. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="kompas min-h-screen">
      <DemoChrome>{children}</DemoChrome>
    </div>
  );
}
