import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const chipBase = cva(
  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-[13px] py-1.5 text-[0.88rem] no-underline",
  {
    variants: {
      on: {
        false: "border-line bg-surface text-ink hover:border-brand-2",
        true: "border-brand bg-brand text-white",
      },
    },
    defaultVariants: { on: false },
  },
);

/** Klasy „chipa” — filtr, kategoria lub aktywny filtr do usunięcia (`on`). */
export const chipVariants = (props?: VariantProps<typeof chipBase>): string => cn(chipBase(props));
