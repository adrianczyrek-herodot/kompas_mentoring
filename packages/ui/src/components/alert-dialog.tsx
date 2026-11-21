'use client';

import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';
import type * as React from 'react';
import {
  backdropClasses,
  modalDescriptionClasses,
  modalPanelClasses,
  modalTitleClasses,
} from '../lib/overlay';
import { cn } from '../lib/utils';

// Confirmation of an irreversible or costly action (U5 cancel < 12 h, S3 delete account). No close
// on backdrop click and no X: the user answers with one of the two buttons (WAI-ARIA APG Alert Dialog).
const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

function AlertDialogContent({ className, children, ...props }: AlertDialogPrimitive.Popup.Props) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Backdrop className={backdropClasses} />
      <AlertDialogPrimitive.Viewport className="fixed inset-0 z-(--layer-overlay) flex items-center justify-center p-group">
        <AlertDialogPrimitive.Popup
          data-slot="alert-dialog-content"
          className={cn(
            modalPanelClasses,
            'max-h-full w-full max-w-dialog overflow-y-auto rounded-panel p-panel',
            className,
          )}
          {...props}
        >
          {children}
        </AlertDialogPrimitive.Popup>
      </AlertDialogPrimitive.Viewport>
    </AlertDialogPrimitive.Portal>
  );
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn('flex flex-col gap-tight', className)}
      {...props}
    />
  );
}

/** Cancel first in the DOM (gets focus), the verb action last (right on wide screens). */
function AlertDialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        'flex flex-col gap-inline pt-inline *:w-full md:flex-row md:justify-end md:*:w-auto',
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({ className, ...props }: AlertDialogPrimitive.Title.Props) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(modalTitleClasses, className)}
      {...props}
    />
  );
}

function AlertDialogDescription({ className, ...props }: AlertDialogPrimitive.Description.Props) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(modalDescriptionClasses, className)}
      {...props}
    />
  );
}

/** Closes the dialog; render it as a Button: `render={<Button variant="outline" />}`. */
const AlertDialogClose = AlertDialogPrimitive.Close;

export {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
};
