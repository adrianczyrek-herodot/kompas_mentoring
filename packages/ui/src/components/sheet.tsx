'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { XIcon } from 'lucide-react';
import type * as React from 'react';
import { backdropClasses, modalPanelClasses } from '../lib/overlay';
import { cn } from '../lib/utils';
import { Button } from './button';

// Side or bottom panel (a modal dialog): P2 filters (bottom on phones, KONCEPCJA §P2), U5 reschedule.
const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

const sheetVariants = cva('fixed z-(--layer-overlay) overflow-y-auto p-panel', {
  variants: {
    side: {
      right: 'inset-y-0 right-0 w-full max-w-sheet border-l border-border-divider',
      bottom: 'inset-x-0 bottom-0 max-h-full rounded-t-panel border-t border-border-divider',
    },
  },
  defaultVariants: { side: 'right' },
});

type SheetContentProps = DialogPrimitive.Popup.Props &
  VariantProps<typeof sheetVariants> & {
    /** Accessible name of the close button, e.g. "Zamknij filtry". */
    closeLabel: string;
  };

function SheetContent({ className, children, side, closeLabel, ...props }: SheetContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop className={backdropClasses} />
      <DialogPrimitive.Popup
        data-slot="sheet-content"
        data-side={side ?? 'right'}
        className={cn(modalPanelClasses, sheetVariants({ side }), className)}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          render={<Button variant="ghost" size="icon" aria-label={closeLabel} />}
          className="absolute top-inline right-inline"
        >
          <XIcon aria-hidden="true" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn('flex flex-col gap-tight pr-control', className)}
      {...props}
    />
  );
}

/** Sticky actions at the bottom of the panel ("Pokaż wyniki", "Wyczyść filtry"). */
function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        'sticky bottom-0 mt-auto flex flex-col-reverse gap-inline border-t border-border-divider bg-surface-panel pt-group *:w-full md:flex-row md:justify-end md:*:w-auto',
        className,
      )}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn('text-section-title font-semibold', className)}
      {...props}
    />
  );
}

function SheetDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-body-dense text-text-muted', className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  type SheetContentProps,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
};
