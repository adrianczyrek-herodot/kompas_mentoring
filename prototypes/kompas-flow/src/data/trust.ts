/**
 * Trust team (A1, A2): mentor applications and disputes from the grey mockups (`APPLICATIONS`,
 * `DISPUTES`, `screens/admin.ts` checklist and field list). Amounts in grosze (`bigint`).
 */
import type { AccountId } from './accounts';

const zl = (value: number) => BigInt(value) * 100n;

export type ApplicationStatus = 'submitted' | 'changes_requested' | 'approved' | 'rejected';
export type Kyc = 'verified' | 'pending' | 'mismatch';

export type Application = {
  id: string;
  name: string;
  headline: string;
  /** Calendar date `YYYY-MM-DD`. */
  submitted: string;
  kyc: Kyc;
  linkedin: boolean;
  categories: string[];
  status: ApplicationStatus;
  /** The demo account that owns the application (Adam Górski). */
  accountId?: AccountId;
  /** Last decision of the trust team, shown to the candidate in M1. */
  decision?: { fields: string[]; comment: string };
};

export const INITIAL_APPLICATIONS: Application[] = [
  { id: 'a1', name: 'Adam Górski', headline: 'Product Manager · discovery, metryki', submitted: '2026-10-17', kyc: 'verified', linkedin: true, categories: ['Product Management'], status: 'submitted', accountId: 'adam' },
  { id: 'a2', name: 'Robert Zając', headline: 'iOS Developer · Swift, SwiftUI', submitted: '2026-10-18', kyc: 'pending', linkedin: true, categories: ['Frontend'], status: 'submitted' },
  { id: 'a3', name: 'Laura Bielecka', headline: 'Cloud Architect · Azure, Terraform', submitted: '2026-10-19', kyc: 'mismatch', linkedin: false, categories: ['DevOps & Cloud'], status: 'submitted' },
];

export const VERIFICATION_CHECKLIST = [
  'Zdjęcie przedstawia twarz, bez logo i tekstu',
  'Opis bez danych kontaktowych i linków do płatności',
  'Doświadczenie zgodne z LinkedIn',
  'Wideo: dobra jakość dźwięku, ten sam człowiek co na zdjęciu',
  'Stawka w widełkach kategorii',
];

export const FIELDS_TO_FIX = ['Zdjęcie', 'Nagłówek', 'Opis', 'Wideo', 'Stawka', 'Dokument'];

export type DisputeOutcome = 'balance' | 'card' | 'partial' | 'none';

export type Dispute = {
  id: string;
  /** Booking in the demo state; seeded disputes refer to sessions outside the demo accounts. */
  bookingId?: string;
  sessionLabel: string;
  studentName: string;
  mentorName: string;
  reason: string;
  /** ISO instant. */
  opened: string;
  /** Value of the session: the refund cannot exceed it (KONCEPCJA §A2). */
  amount: bigint;
  /** Room events („kto i kiedy dołączył”), oldest first. */
  events: string[];
  studentSays: string;
  /** Undefined while the other side has its 48 h to answer. */
  mentorSays?: string;
  status: 'open' | 'resolved';
  resolution?: { outcome: DisputeOutcome; refund: bigint; message: string };
};

export const INITIAL_DISPUTES: Dispute[] = [
  {
    id: 'd1',
    sessionLabel: 's-901',
    studentName: 'Filip W.',
    mentorName: 'Marek Lis',
    reason: 'Mentor się nie pojawił',
    opened: '2026-10-18T18:15:30+02:00',
    amount: zl(260),
    events: ['18:00:12 — uczeń dołączył do pokoju', '18:10:40 — uczeń kliknął „Mentor się nie pojawił”', '18:14:02 — mentor dołączył do pokoju', '18:15:30 — uczeń opuścił pokój'],
    studentSays: 'Czekałem 10 minut, potem zgłosiłem problem i wyszedłem.',
    mentorSays: 'Miałem awarię internetu, dołączyłem z 14-minutowym opóźnieniem.',
    status: 'open',
  },
  {
    id: 'd2',
    sessionLabel: 's-877',
    studentName: 'Hanna P.',
    mentorName: 'Natalia Kurek',
    reason: 'Sesja niezgodna z opisem',
    opened: '2026-10-19T18:10:00+02:00',
    amount: zl(150),
    events: ['17:00:01 — obie strony w pokoju', '17:58:44 — koniec sesji'],
    studentSays: 'Chciałam omówić research, a rozmawiałyśmy tylko o Figmie.',
    mentorSays: 'Cel sesji w rezerwacji dotyczył Figmy.',
    status: 'open',
  },
];

export type AuditEntry = { at: string; actor: string; action: string; subject: string };
