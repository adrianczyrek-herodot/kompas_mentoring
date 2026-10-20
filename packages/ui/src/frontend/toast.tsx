"use client";

import { useEffect, useState } from "react";
import { cn } from "../lib/utils";

type ToastItem = { id: number; text: string; kind: "ok" | "err"; out: boolean };
type Listener = (item: ToastItem) => void;

const listeners = new Set<Listener>();
let seq = 0;

/** Krótki komunikat na dole ekranu (znika po 3 s). Wymaga `<Toaster />` w layoucie. */
export function toast(text: string, kind: "ok" | "err" = "ok"): void {
  const item = { id: ++seq, text, kind, out: false };
  listeners.forEach((l) => l(item));
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const onToast: Listener = (item) => {
      setItems((list) => [...list, item]);
      timers.push(
        setTimeout(() => setItems((list) => list.map((x) => (x.id === item.id ? { ...x, out: true } : x))), 2600),
        setTimeout(() => setItems((list) => list.filter((x) => x.id !== item.id)), 3000),
      );
    };
    listeners.add(onToast);
    return () => {
      listeners.delete(onToast);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <>
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            "fixed bottom-24 left-1/2 z-[100] max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-full px-[18px] py-2.5 text-center text-[0.9rem] text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all duration-300 md:bottom-7",
            t.kind === "err" ? "bg-err" : "bg-ink",
            t.out && "translate-y-2 opacity-0",
          )}
        >
          {t.text}
        </div>
      ))}
    </>
  );
}
