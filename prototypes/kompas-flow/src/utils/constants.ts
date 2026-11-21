export const PROTO_BAR_HEIGHT = 48;
export const REVIEW_BAR_HEIGHT = 56;
export const SIDEBAR_WIDTH = 360;

export const DEMO_NOW_ISO = '2026-10-20T14:00:00+02:00';

export const PROMO_CODES: Record<string, { discount: number; description: string }> = {
  'KOMPAS10': { discount: 10, description: '10% zniżki na pierwszą sesję' },
};

export const PAYMENT_METHODS = [
  { id: 'card', label: 'Karta płatnicza', icon: '💳', description: 'Visa, Mastercard' },
  { id: 'blik', label: 'BLIK', icon: '📱', description: 'Szybka płatność mobilna' },
  { id: 'p24', label: 'Przelewy24', icon: '🏦', description: 'Przelew bankowy' },
];

export const TIMEZONES = [
  'Europe/Warsaw', 'Europe/Berlin', 'Europe/London', 'Europe/Paris',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'UTC',
];

export const REVIEW_TAGS = [
  'konkretny', 'dobrze przygotowany', 'cierpliwy', 'praktyczny', 'ekspert',
  'inspirujący', 'jasny', 'wspierający', 'profesjonalny', 'empathy',
];

export const REVIEW_PRIVATE_TAGS = [
  'potrzebuje więcej struktury', 'trudności z komunikacją', 'nieprzygotowany',
  'zmienia tematy', 'niskie zaangażowanie',
];

export const DISPUTE_REASONS = [
  'Mentor się nie pojawił',
  'Sesja niezgodna z opisem',
  'Problemy techniczne',
  'Nieodpowiednie zachowanie',
  'Inne',
];

export const CANCEL_REASONS = [
  'Zmiana planów',
  'Choroba',
  'Problem techniczny',
  'Znaleziono innego mentora',
  'Inne',
];

export const DECLINE_REASONS = [
  'Brak dostępności w terminie',
  'Niepasujący profil ucznia',
  'Przeciążenie',
  'Inne',
];