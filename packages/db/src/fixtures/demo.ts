// Dane demo (persona ucznia, mentorka Kasia Nowicka, panel admina). Kwoty w złotych (w API: grosze), daty jako ISO.
// Czyste dane bez zależności od MikroORM — bezpieczne w przeglądarce; w fazie 5 posłużą jako seed bazy.
import type {
  Application, Dispute, Earning, Mentor, Notification, Session, Student, Thread, TrialRequest,
} from '@devmentor/core/domain';

/** Stałe „teraz” danych demo, żeby aplikacja wyglądała tak samo przy każdym uruchomieniu. */
export const DEMO_NOW = new Date('2026-10-20T14:00:00+02:00');

const std = { 0: [9, 10, 17, 18], 1: [17, 18, 19], 2: [9, 10, 11], 3: [18, 19], 4: [8, 9, 16], 5: [10, 11], 6: [] };

export const MENTORS: Mentor[] = [
  {
    id: 'm1', name: 'Kasia Nowicka', headline: 'Senior Frontend Engineer · React, TypeScript, architektura UI',
    bio: 'Od 9 lat buduję aplikacje webowe — od startupów po produkty z milionami użytkowników. Pomagam juniorom przejść z „działa” do „jest utrzymywalne”: code review, architektura komponentów, przygotowanie do rozmów technicznych. Na pierwszej sesji ustalamy cel i plan na 8 tygodni.',
    country: 'Polska', languages: ['polski', 'angielski'], categories: ['Frontend', 'Kariera w IT'],
    tags: ['React', 'TypeScript', 'Next.js', 'Code review', 'Rozmowy techniczne'], yearsExp: 9,
    companies: ['Allegro', 'Brainly'], rate60: 180, trialPrice: 49, rating: 4.9, reviewsCount: 87, sessions: 642,
    returningPct: 82, responseHours: 2, verified: true, acceptingNew: true, hue: 168,
    reviews: [
      { author: 'Michał', rating: 5, date: '2026-10-02', text: 'Po trzech sesjach przepisałem swój projekt portfolio i dostałem pierwszą ofertę. Konkretne uwagi, zero lania wody.', tags: ['konkretna', 'dobrze przygotowana'] },
      { author: 'Ola', rating: 5, date: '2026-09-18', text: 'Świetnie tłumaczy, dlaczego coś jest problemem, zamiast dawać gotowe rozwiązanie.', tags: ['cierpliwa'] },
      { author: 'Piotr', rating: 4, date: '2026-09-01', text: 'Bardzo dobra sesja próbna, chciałbym więcej wolnych terminów wieczorem.', tags: ['konkretna'] },
    ],
    availability: std,
  },
  {
    id: 'm2', name: 'Tomasz Wierzbicki', headline: 'Engineering Manager · od developera do lidera zespołu',
    bio: 'Prowadzę zespoły od 6 lat. Pracuję z osobami, które dostały pierwszy awans na lidera albo chcą go dostać: rozmowy 1:1, feedback, delegowanie, rozmowy o podwyżce.',
    country: 'Polska', languages: ['polski'], categories: ['Przywództwo', 'Kariera w IT'],
    tags: ['Leadership', '1:1', 'Feedback', 'Awans'], yearsExp: 14, companies: ['Netguru', 'DocPlanner'],
    rate60: 240, trialPrice: 59, rating: 4.8, reviewsCount: 41, sessions: 310, returningPct: 76, responseHours: 5,
    verified: true, acceptingNew: true, hue: 28,
    reviews: [{ author: 'Agnieszka', rating: 5, date: '2026-10-10', text: 'Pierwszy raz ktoś rozłożył mi delegowanie na konkretne kroki.', tags: ['praktyczny'] }],
    availability: { 0: [19, 20], 1: [], 2: [19, 20], 3: [7, 8], 4: [], 5: [9, 10, 11], 6: [] },
  },
  {
    id: 'm3', name: 'Ewa Sadowska', headline: 'Data Scientist · ML w produkcji, Python, przebranżowienie',
    bio: 'Przeszłam z finansów do data science i wiem, jak wygląda ta droga. Pomagam zbudować portfolio projektów ML, które rekruterzy faktycznie czytają.',
    country: 'Polska', languages: ['polski', 'angielski'], categories: ['Data & AI', 'Kariera w IT'],
    tags: ['Python', 'Machine Learning', 'SQL', 'Portfolio', 'LLM'], yearsExp: 7, companies: ['ING Tech', 'Revolut'],
    rate60: 200, trialPrice: 49, rating: 5.0, reviewsCount: 23, sessions: 128, returningPct: 88, responseHours: 3,
    verified: true, acceptingNew: true, hue: 262,
    reviews: [{ author: 'Kuba', rating: 5, date: '2026-10-12', text: 'Plan nauki dopasowany do mojego czasu, a nie z YouTube.', tags: ['konkretna'] }],
    availability: { 0: [12, 13], 1: [12, 13], 2: [], 3: [12, 13, 18], 4: [12], 5: [], 6: [10] },
  },
  {
    id: 'm4', name: 'Marek Lis', headline: 'Staff Backend Engineer · Java, Kotlin, systemy rozproszone',
    bio: 'Projektuję systemy, które obsługują duży ruch. Uczę myślenia o skalowalności, testowaniu i projektowaniu API.',
    country: 'Polska', languages: ['polski', 'angielski'], categories: ['Backend', 'DevOps & Cloud'],
    tags: ['Java', 'Kotlin', 'Kafka', 'System design', 'AWS'], yearsExp: 12, companies: ['OLX', 'Zalando'],
    rate60: 260, trialPrice: 59, rating: 4.7, reviewsCount: 56, sessions: 401, returningPct: 70, responseHours: 12,
    verified: true, acceptingNew: false, hue: 210,
    reviews: [{ author: 'Bartek', rating: 5, date: '2026-09-22', text: 'System design przerobiony na prawdziwych przykładach.', tags: ['ekspert'] }],
    availability: { 0: [], 1: [20], 2: [], 3: [20], 4: [], 5: [], 6: [] },
  },
  {
    id: 'm5', name: 'Natalia Kurek', headline: 'Product Designer · UX research, portfolio, Figma',
    bio: 'Pomagam projektantkom i projektantom zbudować portfolio, które pokazuje proces, a nie tylko ładne ekrany.',
    country: 'Polska', languages: ['polski'], categories: ['UX/UI Design'],
    tags: ['Figma', 'UX research', 'Portfolio', 'Design systems'], yearsExp: 6, companies: ['Booksy'],
    rate60: 150, trialPrice: 39, rating: 4.9, reviewsCount: 34, sessions: 215, returningPct: 79, responseHours: 4,
    verified: true, acceptingNew: true, hue: 330,
    reviews: [{ author: 'Zuza', rating: 5, date: '2026-10-05', text: 'Case study z portfolio wreszcie ma sens.', tags: ['konkretna'] }],
    availability: std,
  },
  {
    id: 'm6', name: 'Adam Górski', headline: 'Product Manager · discovery, metryki, rozmowy rekrutacyjne PM',
    bio: 'Byłem developerem, teraz jestem PM-em. Pomagam w przejściu do produktu i w przygotowaniu do rozmów.',
    country: 'Polska', languages: ['polski', 'angielski'], categories: ['Product Management', 'Kariera w IT'],
    tags: ['Discovery', 'OKR', 'Metryki', 'Rozmowy PM'], yearsExp: 8, companies: ['Pracuj.pl'],
    rate60: 170, trialPrice: 0, rating: 0, reviewsCount: 0, sessions: 0, returningPct: 0, responseHours: 1,
    verified: false, acceptingNew: true, hue: 90,
    reviews: [],
    availability: { 0: [18], 1: [18], 2: [18], 3: [18], 4: [], 5: [], 6: [] },
  },
];

export const SESSIONS: Session[] = [
  { id: 's1', mentorId: 'm1', student: 'Ty', startsAt: '2026-10-20T14:05:00+02:00', durationMin: 60, type: 'plan', status: 'scheduled', goal: 'Review architektury komponentów w projekcie portfolio' },
  { id: 's2', mentorId: 'm1', student: 'Ty', startsAt: '2026-10-23T18:00:00+02:00', durationMin: 60, type: 'plan', status: 'scheduled', goal: 'Testy jednostkowe hooków' },
  { id: 's3', mentorId: 'm3', student: 'Ty', startsAt: '2026-10-21T08:00:00+02:00', durationMin: 30, type: 'trial', status: 'scheduled', goal: 'Czy da się przejść z frontendu do ML w rok?' },
  { id: 's4', mentorId: 'm1', student: 'Ty', startsAt: '2026-10-18T18:00:00+02:00', durationMin: 60, type: 'plan', status: 'completed', goal: 'Zarządzanie stanem w React', reviewed: true,
    note: 'Omówiliśmy, kiedy stan lokalny wystarcza, a kiedy potrzebny jest store. Twoje komponenty formularza robią za dużo — rozdziel walidację od prezentacji.',
    actionItems: [{ text: 'Wydziel hook useCheckoutForm', done: true }, { text: 'Przeczytaj dokumentację React o „lifting state up”', done: true }, { text: 'Dodaj testy do walidacji formularza', done: false }] },
  { id: 's5', mentorId: 'm1', student: 'Ty', startsAt: '2026-10-09T18:00:00+02:00', durationMin: 30, type: 'trial', status: 'completed', goal: 'Sesja próbna — ustalenie celu', reviewed: false,
    note: 'Cel: pierwsza praca jako frontend developer do marca 2027. Plan: portfolio (3 projekty), code review co tydzień, 2 próbne rozmowy techniczne.',
    actionItems: [{ text: 'Spisz listę 10 firm, do których chcesz aplikować', done: true }] },
  { id: 's6', mentorId: 'm5', student: 'Ty', startsAt: '2026-10-02T17:00:00+02:00', durationMin: 30, type: 'trial', status: 'cancelled', goal: 'Konsultacja portfolio' },
];

// Perspektywa mentora (Kasia Nowicka, m1)
export const STUDENTS: Student[] = [
  { id: 'st1', name: 'Adrian C.', status: 'aktywny', goal: 'Pierwsza praca jako frontend dev do marca 2027', sessions: 6, balance: 3, plan: '1×60 min / tydz.', nextSession: '2026-10-20T14:05:00+02:00', hue: 12 },
  { id: 'st2', name: 'Julia M.', status: 'aktywny', goal: 'Awans na mid w obecnej firmie', sessions: 14, balance: 5, plan: '2×60 min / tydz.', nextSession: '2026-10-20T17:00:00+02:00', hue: 300 },
  { id: 'st3', name: 'Paweł R.', status: 'próbny', goal: 'Przygotowanie do rozmowy w scale-upie', sessions: 0, balance: 0, plan: '—', nextSession: '2026-10-22T09:00:00+02:00', hue: 190 },
  { id: 'st4', name: 'Monika K.', status: 'nieaktywny', goal: 'Nauka TypeScript', sessions: 4, balance: 0, plan: 'anulowany', hue: 50 },
];

export const REQUESTS: TrialRequest[] = [
  { id: 'r1', student: 'Paweł R.', startsAt: '2026-10-22T09:00:00+02:00', goal: 'Mam rozmowę techniczną za 2 tygodnie w scale-upie, chcę przećwiczyć zadanie live coding w React.', hue: 190 },
  { id: 'r2', student: 'Iga T.', startsAt: '2026-10-24T10:00:00+02:00', goal: 'Uczę się sama od pół roku, nie wiem, czy mój kod jest „produkcyjny”.', hue: 140 },
];

export const EARNINGS: Earning[] = [
  { date: '2026-10-19', student: 'Julia M.', type: 'Plan 60 min', gross: 180, fee: 36, status: 'oczekujące' },
  { date: '2026-10-17', student: 'Julia M.', type: 'Plan 60 min', gross: 180, fee: 36, status: 'dostępne' },
  { date: '2026-10-18', student: 'Adrian C.', type: 'Plan 60 min', gross: 180, fee: 36, status: 'dostępne' },
  { date: '2026-10-14', student: 'Monika K.', type: 'Plan 60 min', gross: 180, fee: 36, status: 'dostępne' },
  { date: '2026-10-09', student: 'Adrian C.', type: 'Sesja próbna', gross: 49, fee: 49, status: 'wypłacone' },
  { date: '2026-10-08', student: 'Julia M.', type: 'Plan 60 min', gross: 180, fee: 36, status: 'wypłacone' },
];

export const THREADS: Thread[] = [
  { id: 't1', withName: 'Kasia Nowicka', hue: 168, unread: 1, messages: [
    { me: false, text: 'Cześć! Przed czwartkiem wrzuć proszę link do repo z formularzem, przejrzę go wcześniej.', at: '2026-10-19T19:12:00+02:00' },
    { me: true, text: 'Jasne, wrzucę jutro rano.', at: '2026-10-19T19:30:00+02:00' },
    { me: false, text: 'Super, dzięki. Dziś o 14:05 widzimy się w pokoju sesji.', at: '2026-10-20T09:02:00+02:00' },
  ] },
  { id: 't2', withName: 'Ewa Sadowska', hue: 262, unread: 0, messages: [
    { me: true, text: 'Dzień dobry, czy na sesji próbnej możemy omówić plan przejścia do ML?', at: '2026-10-18T10:00:00+02:00' },
    { me: false, text: 'Oczywiście. Przygotuj krótko, co już umiesz z Pythona i matematyki.', at: '2026-10-18T13:40:00+02:00' },
  ] },
];

export const APPLICATIONS: Application[] = [
  { id: 'a1', name: 'Adam Górski', headline: 'Product Manager · discovery, metryki', submitted: '2026-10-17', kyc: 'zweryfikowano', linkedin: true, hue: 90, categories: ['Product Management'] },
  { id: 'a2', name: 'Robert Zając', headline: 'iOS Developer · Swift, SwiftUI', submitted: '2026-10-18', kyc: 'oczekuje', linkedin: true, hue: 20, categories: ['Frontend'] },
  { id: 'a3', name: 'Laura Bielecka', headline: 'Cloud Architect · Azure, Terraform', submitted: '2026-10-19', kyc: 'niezgodność', linkedin: false, hue: 230, categories: ['DevOps & Cloud'] },
];

export const DISPUTES: Dispute[] = [
  { id: 'd1', sessionId: 's-901', student: 'Filip W.', mentor: 'Marek Lis', reason: 'Mentor się nie pojawił', opened: '2026-10-18', amount: 260,
    events: ['18:00:12 — uczeń dołączył do pokoju', '18:10:40 — uczeń kliknął „Mentor się nie pojawił”', '18:14:02 — mentor dołączył do pokoju', '18:15:30 — uczeń opuścił pokój'],
    studentSays: 'Czekałem 10 minut, potem zgłosiłem problem i wyszedłem.', mentorSays: 'Miałem awarię internetu, dołączyłem z 14-minutowym opóźnieniem.' },
  { id: 'd2', sessionId: 's-877', student: 'Hanna P.', mentor: 'Natalia Kurek', reason: 'Sesja niezgodna z opisem', opened: '2026-10-19', amount: 150,
    events: ['17:00:01 — obie strony w pokoju', '17:58:44 — koniec sesji'],
    studentSays: 'Chciałam omówić research, a rozmawiałyśmy tylko o Figmie.', mentorSays: 'Cel sesji w rezerwacji dotyczył Figmy.' },
];

export const NOTIFICATIONS: Notification[] = [
  { text: 'Sesja z Kasią Nowicką zaczyna się za 5 minut', at: '2026-10-20T14:00:00+02:00', link: '#/sesje/s1', unread: true },
  { text: 'Nowa wiadomość od Kasi Nowickiej', at: '2026-10-20T09:02:00+02:00', link: '#/wiadomosci/t1', unread: true },
  { text: 'Oceń sesję próbną z 9 października', at: '2026-10-10T09:00:00+02:00', link: '#/sesje/s5/ocena', unread: false },
  { text: 'Plan odnowiony: 4 sesje dodane do salda', at: '2026-10-06T08:00:00+02:00', link: '#/plany', unread: false },
];
