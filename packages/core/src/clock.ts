/** Źródło bieżącego czasu — wstrzykiwane, żeby reguły zależne od czasu dało się testować. */
export interface Clock {
  now(): Date;
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
