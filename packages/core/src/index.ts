export * from "./di";
export * from "./clock";
export * from "./errors";

import type { Clock } from "./clock";

declare module "./di" {
  interface Cradle {
    clock: Clock;
  }
}
