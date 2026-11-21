'use client';

import { Separator as SeparatorPrimitive } from '@base-ui/react/separator';
import { cn } from '../lib/utils';

// Thin line between rows and groups instead of cards with shadows (R01.4). Decorative contrast
// (border-divider) — never the only boundary of a control (WCAG 1.4.11: use border-control).
function Separator({ className, orientation = 'horizontal', ...props }: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border-divider data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch',
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
