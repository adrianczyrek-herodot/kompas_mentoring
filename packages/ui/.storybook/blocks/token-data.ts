/**
 * Documentation metadata for typography and spacing tokens (Storybook only).
 * Values are read from the live CSS variables (src/styles/tokens.css). Sources: lekcja-06/tokeny.md.
 */

export type TypeRole = {
  role: string;
  className: string;
  token: string;
  source: string;
  use: string;
  sample: string;
};

export const typeRoles: TypeRole[] = [
  {
    role: 'Nagłówek strony P1 / P3',
    className: 'font-serif text-display font-semibold',
    token: 'type-display (28 → 36 px)',
    source: 'K6, P-T6',
    use: 'tylko duży nagłówek strony głównej i profilu mentora',
    sample: 'Znajdź mentora, który przeprowadzi cię przez zmianę',
  },
  {
    role: 'Nagłówek strony',
    className: 'text-page-title font-semibold',
    token: 'type-page-title (22 → 24 px)',
    source: 'R05.1, P-T6',
    use: 'jeden na ekran: „Moje sesje”, „Kalendarz i dostępność”',
    sample: 'Moje sesje',
  },
  {
    role: 'Nagłówek sekcji',
    className: 'text-section-title font-semibold',
    token: 'type-section-title (18 px)',
    source: 'R05.1, P-T6',
    use: 'sekcje i panele: „Nadchodzące”, „Prośby o sesję próbną”',
    sample: 'Prośby o sesję próbną',
  },
  {
    role: 'Tekst',
    className: 'text-body',
    token: 'type-body (16 px)',
    source: 'R05.1',
    use: 'tekst ciągły, formularze, rezerwacja',
    sample: 'Sesję możesz przełożyć albo anulować bez kosztów do 12 godzin przed jej rozpoczęciem.',
  },
  {
    role: 'Tekst gęsty',
    className: 'text-body-dense',
    token: 'type-body-dense (14 px)',
    source: 'K1, R01.1',
    use: 'wiersze list i tabel',
    sample: 'Anna Kowalska · Frontend, React · 12 lat doświadczenia',
  },
  {
    role: 'Etykieta',
    className: 'text-label font-medium',
    token: 'type-label (14 px, 500)',
    source: 'R05.1, P-T6',
    use: 'etykiety pól, przyciski gęste, nagłówki kolumn',
    sample: 'Strefa czasowa',
  },
  {
    role: 'Metadane',
    className: 'text-meta text-text-muted',
    token: 'type-meta (13 px)',
    source: 'P-T6, A04',
    use: 'czas wysłania, liczba wyników — nigdy zasada 12 h ani cena',
    sample: 'Wysłano 14:32 · czas Europa/Warszawa',
  },
  {
    role: 'Liczby',
    className: 'text-body tabular-nums',
    token: 'numeric (tabular-nums)',
    source: 'R01.3, R03.3',
    use: 'godziny slotów, kwoty, kolumny tabel',
    sample: '09:00  09:30  10:00  ·  120,00 zł  ·  1 080,00 zł',
  },
  {
    role: 'Kod',
    className: 'font-mono text-code',
    token: 'type-code (14 px, Plex Mono)',
    source: 'R01.2, P4',
    use: 'tylko kod w czacie i notatkach po sesji',
    sample: 'const slot = slotsFor(rules, exceptions, bookings, tz, range);',
  },
];

export type SpaceRelation = {
  relation: string;
  token: string;
  className: string;
  value: string;
  example: string;
};

export const spaceRelations: SpaceRelation[] = [
  {
    relation: 'W grupie',
    token: 'space-inline',
    className: 'gap-inline',
    value: '8 px',
    example: 'ikona i tekst w przycisku, przyciski jednej grupy, znaczniki obok siebie',
  },
  {
    relation: 'Między grupami',
    token: 'space-group',
    className: 'gap-group',
    value: '16 px',
    example: 'kolejne pola formularza, bloki w panelu',
  },
  {
    relation: 'Wewnątrz panelu',
    token: 'space-panel',
    className: 'p-panel',
    value: '16 px, od 768 px 24 px',
    example: 'margines wewnętrzny panelu, dialogu, arkusza',
  },
  {
    relation: 'Między sekcjami',
    token: 'space-section',
    className: 'gap-section',
    value: '32 px, od 768 px 48 px',
    example: 'sekcje strony: „Nadchodzące” i „Minione”',
  },
  {
    relation: 'Wiersz listy (gęsto)',
    token: 'space-row-y',
    className: 'py-row-y',
    value: '12 px',
    example: 'wiersz listy mentorów, sesji, kolejki weryfikacji (K1)',
  },
];
