"use client";

import { useEffect, useRef } from "react";

/** Montuje aplikację z `src/legacy` (router na hashu, widoki jako HTML) w przeglądarce. */
export function KompasApp() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let stop: (() => void) | undefined;
    let cancelled = false;
    void import("./main").then(({ startKompasApp }) => {
      if (!cancelled && root.current) stop = startKompasApp(root.current);
    });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);

  return (
    <div id="app" ref={root}>
      <p style={{ padding: 24 }}>Wczytywanie…</p>
    </div>
  );
}
