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

// ---- Dane karty (pola osadzane przez operatora płatności; w mockupie walidowane lokalnie) ----

export const cardNumber: Validator = (v) => (/^\d{16}$/.test(v.replace(/\s/g, '')) ? null : 'Podaj 16 cyfr numeru karty.');
export const cardExpiry: Validator = (v) => (/^(0[1-9]|1[0-2])\/\d{2}$/.test(v.trim()) ? null : 'Format MM/RR.');
export const cardCvc: Validator = (v) => (/^\d{3,4}$/.test(v.trim()) ? null : '3 lub 4 cyfry.');
