import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

/** Wyśrodkowany kontener treści stron publicznych. */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1160px] px-4", className)} {...props} />;
}
