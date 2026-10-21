// Moderacja (A1–A2) i prośby o sesję próbną (M2): warunki decyzji jako czyste funkcje.
import { firstError, length, required } from '../validation';

export const VERIFICATION_CHECKLIST = [
  'Zdjęcie przedstawia twarz, bez logo i tekstu',
  'Opis bez danych kontaktowych i linków do płatności',
  'Doświadczenie zgodne z LinkedIn',
  'Wideo: dobra jakość dźwięku, ten sam człowiek co na zdjęciu',
  'Stawka w widełkach kategorii',
] as const;
export const FIELDS_TO_FIX = ['Zdjęcie', 'Nagłówek', 'Opis', 'Wideo', 'Stawka', 'Dokument'] as const;

export type VerificationDecision = 'approve' | 'changes' | 'reject';

/** Błędy decyzji o zgłoszeniu mentora. Zatwierdzenie wymaga pozytywnego KYC i pełnej checklisty. */
export function verificationErrors(d: { decision: string; kycVerified: boolean; checklistDone: boolean; fieldsToFix: number; comment: string }): Record<string, string> {
  const e: Record<string, string | null> = {
    decision: !d.decision ? 'Wybierz decyzję.'
      : d.decision === 'approve' && !d.kycVerified ? 'Nie można zatwierdzić bez pozytywnej weryfikacji KYC.'
        : d.decision === 'approve' && !d.checklistDone ? 'Odhacz całą checklistę przed zatwierdzeniem.' : null,
    fieldsToFix: d.decision === 'changes' && d.fieldsToFix === 0 ? 'Wskaż co najmniej jedno pole.' : null,
    comment: d.decision !== 'approve' ? firstError(d.comment, [required('Komentarz jest wymagany.'), length(10, 1000)]) : null,
  };
  return Object.fromEntries(Object.entries(e).filter((x): x is [string, string] => Boolean(x[1])));
}

export const DISPUTE_RESOLUTIONS = [['balance', 'Zwrot do salda ucznia'], ['card', 'Zwrot na kartę'], ['partial', 'Zwrot częściowy'], ['none', 'Bez zwrotu']] as const;

/** Błędy rozstrzygnięcia sporu; zwrot częściowy od 1 zł do wartości sesji. */
export function resolutionErrors(r: { resolution: string; amount: string; max: number; why: string }): Record<string, string> {
  const n = Number(r.amount);
  const e: Record<string, string | null> = {
    res: r.resolution ? null : 'Wybierz rozstrzygnięcie.',
    amount: r.resolution === 'partial' && !(n > 0 && n <= r.max) ? `Kwota od 1 do ${r.max} zł.` : null,
    why: firstError(r.why, [required(), length(20, 1000)]),
  };
  return Object.fromEntries(Object.entries(e).filter((x): x is [string, string] => Boolean(x[1])));
}

export const DECLINE_REASONS = ['Termin mi nie pasuje', 'Temat poza moimi kompetencjami', 'Nie przyjmuję nowych uczniów', 'Inny'] as const;

/** Błędy odrzucenia prośby o sesję próbną; przy „Inny” wymagane wyjaśnienie 10–300 znaków. */
export function declineErrors(why: string, other: string): Record<string, string> {
  const e: Record<string, string | null> = {
    why: why ? null : 'Wybierz powód.',
    other: why === 'Inny' ? length(10, 300)(other) : null,
  };
  return Object.fromEntries(Object.entries(e).filter((x): x is [string, string] => Boolean(x[1])));
}
