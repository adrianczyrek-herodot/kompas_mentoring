import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { LoaderCircle } from 'lucide-react';
import { cn } from '../lib/utils';

// Kompas decisions (packages/ui/POSTEP.md, stage 2): 44 px controls (K1), rounded-control (A01),
// focus = global 2 px outline (P-T2), pressed = colour only (D3), disabled without opacity (D2).
const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center gap-inline rounded-control border border-transparent text-label font-medium whitespace-nowrap transition-colors duration-fast select-none aria-busy:cursor-progress data-disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-icon-sm",
  {
    variants: {
      variant: {
        // The one primary action per screen (R01.6, K4).
        default:
          'bg-action-primary text-text-on-action hover:bg-action-primary-hover active:bg-action-primary-pressed data-disabled:not-aria-busy:border-border-disabled data-disabled:not-aria-busy:bg-surface-disabled data-disabled:not-aria-busy:text-text-disabled',
        // Secondary action: visible boundary (WCAG 1.4.11), hover D4.
        outline:
          'border-border-control bg-surface-panel text-text-default hover:bg-surface-hover active:bg-surface-hover aria-expanded:bg-surface-hover data-disabled:not-aria-busy:border-border-disabled data-disabled:not-aria-busy:bg-surface-disabled data-disabled:not-aria-busy:text-text-disabled',
        // Quiet action: toolbars, "Anuluj" next to a primary action (R05.3).
        ghost:
          'text-text-default hover:bg-surface-hover active:bg-surface-hover aria-expanded:bg-surface-hover data-disabled:not-aria-busy:bg-transparent data-disabled:not-aria-busy:text-text-disabled',
        // Irreversible actions only (A02, R9).
        destructive:
          'bg-action-danger text-text-on-danger hover:bg-action-danger-hover active:bg-action-danger-hover data-disabled:not-aria-busy:border-border-disabled data-disabled:not-aria-busy:bg-surface-disabled data-disabled:not-aria-busy:text-text-disabled',
        // Text action: a button that looks like a link (does something, does not navigate).
        link: 'text-text-link underline underline-offset-4 hover:decoration-2 data-disabled:not-aria-busy:text-text-disabled data-disabled:not-aria-busy:no-underline',
      },
      size: {
        default: 'min-h-control px-button-x',
        // Roomy booking screens (P3, U1; R01.1).
        lg: 'min-h-control-lg px-button-x text-body',
        // Dense rows only (Z6): 32 px visual, 44 px tap area.
        sm: 'min-h-control-sm px-field-x after:absolute after:inset-x-0 after:top-1/2 after:h-target after:-translate-y-1/2',
        icon: 'size-control',
        'icon-sm':
          'size-control-sm after:absolute after:top-1/2 after:left-1/2 after:size-target after:-translate-1/2',
      },
    },
    compoundVariants: [{ variant: 'link', className: 'px-0' }],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    /** Shows a spinner, sets `aria-busy` and blocks clicks while keeping focus on the button. */
    loading?: boolean;
  };

function Button({
  className,
  variant = 'default',
  size = 'default',
  loading = false,
  disabled,
  focusableWhenDisabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled === true || loading}
      focusableWhenDisabled={loading ? true : focusableWhenDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : null}
      {children}
    </ButtonPrimitive>
  );
}

export { Button, type ButtonProps, buttonVariants };
