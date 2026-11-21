'use client';

import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group';
import { cn } from '../lib/utils';

// Segmented control: one border-control frame (WCAG 1.4.11), 44 px items (K1), pressed = selection
// background + accent text + semibold (R04.2, K4; weight is the non-colour cue, WCAG 1.4.1).
// Labels wrap instead of overflowing: three options must fit at 320 px.
function ToggleGroup({ className, ...props }: ToggleGroupPrimitive.Props) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      className={cn(
        'inline-flex w-fit divide-x divide-border-control rounded-control border border-border-control bg-surface-panel',
        className,
      )}
      {...props}
    />
  );
}

function ToggleGroupItem({ className, ...props }: TogglePrimitive.Props) {
  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      className={cn(
        'relative inline-flex min-h-control min-w-0 flex-1 items-center justify-center gap-inline px-field-x text-center text-label font-medium text-text-default transition-colors duration-fast select-none first:rounded-l-control last:rounded-r-control focus-visible:z-(--layer-overlay) not-data-pressed:hover:bg-surface-hover data-disabled:cursor-not-allowed data-disabled:bg-surface-disabled data-disabled:text-text-disabled data-pressed:bg-selected-bg data-pressed:font-semibold data-pressed:text-text-link [&_svg]:size-icon-sm',
        className,
      )}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
