'use client';

import { Toast as ToastPrimitive } from '@base-ui/react/toast';
import { CircleCheck, XIcon } from 'lucide-react';
import type * as React from 'react';
import { cn } from '../lib/utils';

// Short confirmation that needs no action (M3 "Zapisano", U5 after an action) or a transient
// conflict the UI already resolved (U1 409 "Ten termin został właśnie zajęty"). An error that needs
// action is never a toast — use FieldError or Alert (prompt, R02.4).
const useToast = ToastPrimitive.useToastManager;

function ToastList({ closeLabel }: { closeLabel: string }) {
  const { toasts } = ToastPrimitive.useToastManager();
  return toasts.map((toast) => (
    <ToastPrimitive.Root
      key={toast.id}
      toast={toast}
      data-slot="toast"
      className="flex w-full items-start gap-inline rounded-panel border border-border-divider bg-surface-panel p-group text-text-default shadow-overlay transition-opacity duration-(--duration-overlay) data-ending-style:opacity-0 data-starting-style:opacity-0"
    >
      {toast.type === 'success' ? (
        <CircleCheck aria-hidden="true" className="size-icon-md shrink-0 text-status-success-fg" />
      ) : null}
      <ToastPrimitive.Content className="flex min-w-0 flex-1 flex-col gap-tight">
        <ToastPrimitive.Title className="text-label font-semibold" />
        <ToastPrimitive.Description className="text-body-dense text-text-muted" />
        {toast.actionProps ? (
          <ToastPrimitive.Action className="w-fit text-label font-medium text-text-link underline underline-offset-4" />
        ) : null}
      </ToastPrimitive.Content>
      <ToastPrimitive.Close
        aria-label={closeLabel}
        className="relative flex size-icon-lg shrink-0 items-center justify-center rounded-tag text-text-muted after:absolute after:top-1/2 after:left-1/2 after:size-target after:-translate-1/2 hover:text-text-default [&>svg]:size-icon-sm"
      >
        <XIcon aria-hidden="true" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  ));
}

type ToastProviderProps = {
  children: React.ReactNode;
  /** Accessible name of each toast's close button, e.g. "Zamknij powiadomienie". */
  closeLabel: string;
  /** Name of the toast landmark region (F6 jumps to it), e.g. "Powiadomienia". Base UI default is English. */
  regionLabel: string;
  /** ms before a toast closes by itself; long enough to read (WCAG 2.2.1). */
  timeout?: number;
  className?: string;
};

/** Wrap the app once; call `useToast().add({ title, description, type: 'success' })` anywhere. */
function ToastProvider({
  children,
  closeLabel,
  regionLabel,
  timeout = 6000,
  className,
}: ToastProviderProps) {
  return (
    <ToastPrimitive.Provider timeout={timeout}>
      {children}
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport
          data-slot="toast-viewport"
          aria-label={regionLabel}
          className={cn(
            'fixed right-group bottom-group left-group z-(--layer-overlay) flex flex-col gap-inline md:left-auto md:w-toast',
            className,
          )}
        >
          <ToastList closeLabel={closeLabel} />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}

export { ToastProvider, type ToastProviderProps, useToast };
