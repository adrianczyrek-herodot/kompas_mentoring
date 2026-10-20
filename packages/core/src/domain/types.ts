// Typy domenowe portalu mentoringu. Kwoty w złotych (w API: grosze), daty jako ISO 8601.

export type Role = 'guest' | 'student' | 'mentor' | 'admin';

export interface Review {
  author: string;
  rating: number;
  date: string;
  text: string;
  tags: string[];
}

export interface Mentor {
  id: string;
  name: string;
  headline: string;
  bio: string;
  country: string;
  languages: string[];
  categories: string[];
  tags: string[];
  yearsExp: number;
  companies: string[];
  rate60: number;
  trialPrice: number;
  rating: number;
  reviewsCount: number;
  sessions: number;
  returningPct: number;
  responseHours: number;
  verified: boolean;
  acceptingNew: boolean;
  hue: number;
  reviews: Review[];
  // dostępność: dzień tygodnia (0 = pon) → godziny startu slotów
  availability: Record<number, number[]>;
}

export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'disputed' | 'requested';

export interface Session {
  id: string;
  mentorId: string;
  student: string;
  startsAt: string;
  durationMin: number;
  type: 'trial' | 'plan';
  status: SessionStatus;
  goal: string;
  note?: string;
  actionItems?: { text: string; done: boolean }[];
  reviewed?: boolean;
}

/** Uczeń z perspektywy mentora. */
export interface Student {
  id: string; name: string; status: 'aktywny' | 'próbny' | 'nieaktywny'; goal: string; sessions: number;
  balance: number; plan: string; nextSession?: string; hue: number;
}

export interface TrialRequest { id: string; student: string; startsAt: string; goal: string; hue: number; }

export interface Earning { date: string; student: string; type: string; gross: number; fee: number; status: 'dostępne' | 'oczekujące' | 'wypłacone'; }

export interface Thread { id: string; withName: string; hue: number; unread: number; messages: { me: boolean; text: string; at: string }[]; }

export interface Application { id: string; name: string; headline: string; submitted: string; kyc: 'zweryfikowano' | 'oczekuje' | 'niezgodność'; linkedin: boolean; hue: number; categories: string[]; }

export interface Dispute { id: string; sessionId: string; student: string; mentor: string; reason: string; opened: string; amount: number; events: string[]; studentSays: string; mentorSays: string; }

export interface Notification { text: string; at: string; link: string; unread: boolean; }
