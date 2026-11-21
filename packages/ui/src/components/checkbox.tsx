'use client';

import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { CheckIcon, MinusIcon } from 'lucide-react';
import { cn } from '../lib/utils';

// 20 px box, 44 px tap area (K1) through the ::after layer; checked = selection accent (R04.2, K4);
// error = danger border (D5); disabled without opacity (D2); focus = global outline (P-T2).
function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer relative flex size-checkbox shrink-0 items-center justify-center rounded-tag border border-border-control bg-surface-panel text-checkbox-check transition-colors duration-fast after:absolute after:top-1/2 after:left-1/2 after:size-target after:-translate-1/2 not-data-checked:not-data-indeterminate:not-data-disabled:hover:bg-surface-hoveraria-invalid:border-border-invalid data-checked:border-checkbox-checked data-checked:bg-checkbox-checked data-indeterminate:border-checkbox-checked data-indeterminate:bg-checkbox-checked data-disabled:cursor-not-allowed data-disabled:border-border-disabled data-disabled:bg-surface-disabled data-disabled:text-text-disabled',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="group/indicator grid place-content-center text-current transition-none [&>svg]:size-icon-sm"
      >
        {props.indeterminate ? <MinusIcon aria-hidden="true" /> : <CheckIcon aria-hidden="true" />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
