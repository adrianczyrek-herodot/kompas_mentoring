// Onboarding mentora (M1): kroki i walidacja danych kroku — czyste funkcje bez stanu UI.
import { length, range, required } from '../validation';

export const ONBOARDING_STEPS = ['O mnie', 'Kompetencje', 'Opis i wideo', 'Stawka', 'Dostępność', 'Weryfikacja'] as const;
export const SESSION_LANGUAGES = ['polski', 'angielski', 'niemiecki', 'ukraiński'] as const;
export const MIN_AVAILABILITY_HOURS = 3;

/** Dane formularza kroku (wartości pól; listy wielokrotnego wyboru oddzielone przecinkami). */
export type OnboardingValues = Record<string, string>;

/** Stan poza polami formularza, od którego zależy walidacja. */
export interface OnboardingContext { hasPhoto: boolean; hasVideo: boolean; kycDone: boolean; availabilityHours: number; }

const list = (v: string | undefined): string[] => (v ?? '').split(',').map((x) => x.trim()).filter(Boolean);
const first = (...errs: (string | null)[]): string | null => errs.find(Boolean) ?? null;

/** Błędy kroku `step` (1–6) — klucz: nazwa pola. */
export function onboardingErrors(step: number, v: OnboardingValues, ctx: OnboardingContext): Record<string, string> {
  const e: Record<string, string | null> = {};
  const val = (k: string) => v[k] ?? '';
  switch (step) {
    case 1:
      e.photo = ctx.hasPhoto ? null : 'Dodaj zdjęcie.';
      e.name = first(required()(val('name')), length(2, 60)(val('name')));
      e.country = required()(val('country'));
      e.lang = list(v.lang).length ? null : 'Wybierz co najmniej jeden język.';
      break;
    case 2: {
      const cats = list(v.cat).length;
      const tags = list(v.tags).length;
      e.cat = cats >= 1 && cats <= 5 ? null : 'Wybierz od 1 do 5 kategorii.';
      e.tags = tags >= 3 && tags <= 15 ? null : `Podaj 3–15 umiejętności (teraz: ${tags}).`;
      e.years = range(1, 50, ' lat')(val('years'));
      break;
    }
    case 3: {
      const url = val('videoUrl').trim();
      e.headline = first(required()(val('headline')), length(20, 80)(val('headline')));
      e.bio = first(required()(val('bio')), length(300, 2000)(val('bio')));
      e.videoUrl = url && !/^https:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//.test(url) ? 'Link musi prowadzić do YouTube lub Vimeo.'
        : !url && !ctx.hasVideo ? 'Dodaj wideo albo link — profile z wideo mają wyraźnie więcej rezerwacji.' : null;
      break;
    }
    case 4:
      e.rate = first(required()(val('rate')), range(40, 1000, ' zł')(val('rate')));
      break;
    case 5:
      e.avail = ctx.availabilityHours >= MIN_AVAILABILITY_HOURS ? null : `Zaznacz co najmniej ${MIN_AVAILABILITY_HOURS} godziny (teraz: ${ctx.availabilityHours}).`;
      break;
    case 6:
      e.linkedin = first(required()(val('linkedin')), /linkedin\.com\/in\//.test(val('linkedin')) ? null : 'Podaj link w formacie linkedin.com/in/…');
      e.kyc = ctx.kycDone ? null : 'Zweryfikuj tożsamość, zanim wyślesz profil.';
      e.iban = first(required()(val('iban')), /^PL\d{26}$/.test(val('iban').replace(/\s/g, '').toUpperCase()) ? null : 'Polski IBAN: PL + 26 cyfr.');
      e.terms = val('terms') ? null : 'Akceptacja regulaminu jest wymagana.';
      break;
  }
  return Object.fromEntries(Object.entries(e).filter((x): x is [string, string] => Boolean(x[1])));
}
