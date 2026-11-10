import type { ReactNode } from "react";
import { PanelChrome } from "@/panel/panel-chrome";

/** Panel mentora i admina — komponenty shadcn/ui z `@devmentor/ui/backend` (motyw w zakresie `.backend`). */
export default function PanelLayout({ children }: { children: ReactNode }) {
  return <PanelChrome>{children}</PanelChrome>;
}
