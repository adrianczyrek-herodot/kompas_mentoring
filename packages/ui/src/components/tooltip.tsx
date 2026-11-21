'use client';

import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { positionerClasses } from '../lib/overlay';
import { cn } from '../lib/utils';

// Short label for an icon-only control (M3, U1 week navigation). Never information needed to act —
// it is invisible on touch and to many screen-reader users (prompt, "What to avoid").
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

function TooltipContent({
  className,
  sideOffset = 6,
  side = 'top',
  ...props
}: TooltipPrimitive.Popup.Props & {
  sideOffset?: number;
  side?: 'top' | 'bottom' | 'left' | 'right';
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        className={positionerClasses}
        sideOffset={sideOffset}
        side={side}
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            'max-w-tooltip rounded-tag bg-surface-inverse px-inline py-tight text-meta text-text-inverse transition-opacity duration-fast data-ending-style:opacity-0 data-starting-style:opacity-0',
            className,
          )}
          {...props}
        />
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
