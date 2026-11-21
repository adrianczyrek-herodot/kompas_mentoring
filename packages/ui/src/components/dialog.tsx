'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { XIcon } from 'lucide-react';
import type * as React from 'react';
import {
  backdropClasses,
  modalDescriptionClasses,
  modalPanelClasses,
  modalTitleClasses,
} from '../lib/overlay';
import { cn } from '../lib/utils';
import { Button } from './button';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

type DialogContentProps = DialogPrimitive.Popup.Props & {
  /** Accessible name of the corner close button, e.g. "Zamknij". Without it there is no X button. */
  closeLabel?: string;
};

// Centered panel, 480 px max (P-T10), rounded-panel, the only shadow is shadow-overlay (R01.4).
function DialogContent({ className, children, closeLabel, ...props }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop className={backdropClasses} />
      <DialogPrimitive.Viewport className="fixed inset-0 z-(--layer-overlay) flex items-center justify-center p-group">
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          className={cn(
            modalPanelClasses,
            'relative max-h-full w-full max-w-dialog overflow-y-auto rounded-panel p-panel',
            className,
          )}
          {...props}
        >
          {children}
          {closeLabel ? (
            <DialogPrimitive.Close
              render={<Button variant="ghost" size="icon" aria-label={closeLabel} />}
              className="absolute top-inline right-inline"
            >
              <XIcon aria-hidden="true" />
            </DialogPrimitive.Close>
          ) : null}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Viewport>
    </DialogPrimitive.Portal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-tight pr-control', className)}
      {...props}
    />
  );
}

/** Actions: primary last (right on wide screens), stacked full width below 768 px. */
function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'flex flex-col-reverse gap-inline pt-inline *:w-full md:flex-row md:justify-end md:*:w-auto',
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(modalTitleClasses, className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(modalDescriptionClasses, className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  type DialogContentProps,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
};
