"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/** Montuje aplikację z `src/legacy` (router na hashu, widoki jako HTML) w przeglądarce. */
export function KompasApp() {
  const root = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    let stop: (() => void) | undefined;
    let cancelled = false;
    void import("./main").then(({ startKompasApp }) => {
      // `replace`: link `#/mentorzy` już dodał wpis w historii — zastępujemy go adresem strony React.
      if (!cancelled && root.current) stop = startKompasApp(root.current, { navigate: (url) => router.replace(url) });
    });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [router]);

  return (
    <div id="app" ref={root}>
      <p style={{ padding: 24 }}>Wczytywanie…</p>
    </div>
  );
}
