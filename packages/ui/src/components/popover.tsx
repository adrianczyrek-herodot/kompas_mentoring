'use client';

import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { positionerClasses } from '../lib/overlay';
import { cn } from '../lib/utils';

// Small non-modal panel next to its trigger (U1 week picker, P2 time-of-day filter on desktop).
const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverClose = PopoverPrimitive.Close;

function PopoverContent({
  className,
  sideOffset = 4,
  align = 'start',
  ...props
}: PopoverPrimitive.Popup.Props & { sideOffset?: number; align?: 'start' | 'center' | 'end' }) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner className={positionerClasses} sideOffset={sideOffset} align={align}>
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            'flex w-popover max-w-(--available-width) flex-col gap-inline rounded-panel border border-border-divider bg-surface-panel p-group text-text-default shadow-overlay outline-none transition-opacity duration-(--duration-overlay) data-ending-style:opacity-0 data-starting-style:opacity-0',
            className,
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn('text-label font-semibold', className)}
      {...props}
    />
  );
}

function PopoverDescription({ className, ...props }: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn('text-body-dense text-text-muted', className)}
      {...props}
    />
  );
}

export { Popover, PopoverClose, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger };
