'use client';

import { Switch as SwitchPrimitive } from '@base-ui/react/switch';
import { cn } from '../lib/utils';

// 44 × 24 px track, 20 px thumb, 44 px tap area (K1, P-T14). Off = track-off (3.65 : 1, WCAG 1.4.11),
// on = selection accent (R04.2, K4); the thumb position, not colour alone, shows the state (WCAG 1.4.1).
function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer relative inline-flex h-switch-h w-switch-w shrink-0 items-center rounded-round bg-track-off p-switch-inset transition-colors duration-fast after:absolute after:top-1/2 after:left-1/2 after:size-target after:-translate-1/2 aria-invalid:outline-solid aria-invalid:outline-(length:--focus-ring-width) aria-invalid:outline-border-invalid data-checked:bg-track-on data-disabled:cursor-not-allowed data-disabled:bg-border-disabled',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="size-switch-thumb rounded-round bg-surface-panel transition-transform duration-fast data-checked:translate-x-switch-thumb data-disabled:bg-surface-disabled"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
