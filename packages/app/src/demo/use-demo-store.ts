"use client";

import { useSyncExternalStore } from "react";
import { getVersion, store, subscribe } from "./store";

/** Stan demo w komponencie React; komponent przerysuje się po `notify()`. */
export function useDemoStore(): typeof store {
  useSyncExternalStore(subscribe, getVersion, getVersion);
  return store;
}
