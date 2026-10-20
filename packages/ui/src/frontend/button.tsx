import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

const buttonBase = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-transparent font-semibold leading-tight whitespace-nowrap no-underline transition-colors disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        primary: "bg-brand text-white hover:bg-brand-2",
        ghost: "border-line bg-surface text-ink hover:border-ink-3",
        light: "bg-white text-brand",
        social: "w-full border-line bg-surface text-ink",
        danger: "bg-err text-white",
      },
      size: {
        md: "min-h-[42px] px-[18px] py-2.5",
        s: "min-h-[34px] px-[13px] py-1.5 text-[0.87rem]",
      },
      block: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonVariants = VariantProps<typeof buttonBase>;

/**
 * Klasy przycisku — także dla linków (`<Link className={buttonVariants({ variant: "ghost" })}>`).
 * Przez `cn()`, żeby kolor ramki wariantu wygrywał z bazowym `border-transparent`.
 */
export const buttonVariants = (props?: ButtonVariants): string => cn(buttonBase(props));

export function Button({ className, variant, size, block, type = "button", ...props }: ComponentProps<"button"> & ButtonVariants) {
  return <button type={type} className={cn(buttonVariants({ variant, size, block }), className)} {...props} />;
}
