// Walidatory wartości pól — czyste funkcje zwracające komunikat błędu albo `null`.
// Wspólne dla formularzy w przeglądarce i (docelowo) walidacji po stronie serwera.

export type Validator = (value: string) => string | null;

export const required = (msg = 'To pole jest wymagane.'): Validator => (v) => (v.trim() ? null : msg);

export const length = (min: number, max: number): Validator => (v) => {
  const n = v.trim().length;
  if (n < min) return `Wpisz co najmniej ${min} znaków (teraz: ${n}).`;
  if (n > max) return `Maksymalnie ${max} znaków (teraz: ${n}).`;
  return null;
};

export const email: Validator = (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : 'Podaj poprawny adres e-mail.');

export const range = (min: number, max: number, unit = ''): Validator => (v) => {
  const n = Number(v);
  return Number.isFinite(n) && v !== '' && n >= min && n <= max ? null : `Podaj wartość od ${min} do ${max}${unit}.`;
};

/** Pierwszy błąd z listy walidatorów albo `null`. */
export const firstError = (value: string, validators: Validator[]): string | null =>
  validators.map((check) => check(value)).find(Boolean) ?? null;
