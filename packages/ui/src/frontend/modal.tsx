"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./icon";

/**
 * Okno modalne (od dołu na telefonie, wyśrodkowane od 640 px). Zamyka je tło, przycisk ✕ i Escape;
 * po otwarciu fokus trafia na pierwsze pole albo przycisk.
 */
export function Modal({ onClose, children, label }: { onClose: () => void; children: ReactNode; label?: string }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    box.current?.querySelector<HTMLElement>("input,select,textarea,button:not([data-close])")?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-90 flex items-end justify-center bg-[rgba(14,22,21,0.45)] sm:items-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="relative max-h-[90vh] w-full max-w-[520px] animate-[modal-up_.2s_ease-out] space-y-3 overflow-auto rounded-t-[18px] bg-surface px-[18px] py-[22px] sm:rounded-[18px]"
      >
        <button type="button" data-close aria-label="Zamknij" onClick={onClose}
          className="absolute top-3 right-3 m-0! cursor-pointer border-0 bg-transparent p-1.5 text-ink-2">
          <Icon name="x" />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
