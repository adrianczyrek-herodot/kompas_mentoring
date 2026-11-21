'use client';

import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import { cn } from '../lib/utils';

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn('flex flex-col gap-inline', className)}
      {...props}
    />
  );
}

// 20 px circle (rounded-round, P-T5), 44 px tap area (K1); checked = selection accent ring and dot
// (R04.2, K4); error = danger border (D5); disabled without opacity (D2); focus = global outline.
function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        'peer relative flex size-checkbox shrink-0 items-center justify-center rounded-round border border-border-control bg-surface-panel transition-colors duration-fast after:absolute after:top-1/2 after:left-1/2 after:size-target after:-translate-1/2 not-data-checked:not-data-disabled:hover:bg-surface-hover aria-invalid:border-border-invalid data-checked:border-track-on data-disabled:cursor-not-allowed data-disabled:border-border-disabled data-disabled:bg-surface-disabled',
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="size-inline rounded-round bg-track-on data-disabled:bg-text-disabled"
      />
    </RadioPrimitive.Root>
  );
}

export { RadioGroup, RadioGroupItem };
