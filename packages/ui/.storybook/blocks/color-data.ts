/**
 * Documentation metadata for the colour tokens (Storybook only).
 * Values are NOT stored here: blocks read them from the live CSS variables (src/styles/tokens.css),
 * so the docs always show what the product renders. Sources: lekcja-06/tokeny.md.
 */

export type ColorToken = {
  name: string;
  group: 'Powierzchnie' | 'Tekst' | 'Akcje' | 'Zaznaczenie i fokus' | 'Linie' | 'Statusy';
  source: string;
  use: string;
  avoid: string;
};

export const colorTokens: ColorToken[] = [
  {
    name: 'surface-page',
    group: 'Powierzchnie',
    source: 'R03.1',
    use: 'tło strony',
    avoid: 'panele',
  },
  {
    name: 'surface-panel',
    group: 'Powierzchnie',
    source: 'R03.1, R04.1',
    use: 'panele, nakładki, pola formularza',
    avoid: 'tło strony',
  },
  {
    name: 'surface-sunken',
    group: 'Powierzchnie',
    source: 'R04.1',
    use: 'nagłówek tabeli, kod, szkielet ładowania',
    avoid: 'akcja główna',
  },
  { name: 'text-default', group: 'Tekst', source: 'R03.1', use: 'cały tekst główny', avoid: '—' },
  {
    name: 'text-muted',
    group: 'Tekst',
    source: 'R04.1',
    use: 'metadane, opisy',
    avoid: 'zasada 12 h, ceny (A04)',
  },
  {
    name: 'text-subtle',
    group: 'Tekst',
    source: 'propozycja P-T1',
    use: 'placeholder, znaczniki czasu',
    avoid: 'informacje potrzebne do działania',
  },
  {
    name: 'text-link',
    group: 'Tekst',
    source: 'R04.2',
    use: 'linki, akcje tekstowe',
    avoid: 'wypełnienia przycisków',
  },
  {
    name: 'text-on-action',
    group: 'Tekst',
    source: 'K4, WCAG 1.4.3',
    use: 'tekst na action-primary',
    avoid: '—',
  },
  {
    name: 'text-on-danger',
    group: 'Tekst',
    source: 'WCAG 1.4.3',
    use: 'tekst na action-danger',
    avoid: '—',
  },
  {
    name: 'action-primary',
    group: 'Akcje',
    source: 'K4, R06.2, R01.6',
    use: 'jedna akcja główna na ekranie',
    avoid: 'akcje drugorzędne, dekoracja, tła',
  },
  {
    name: 'action-primary-hover',
    group: 'Akcje',
    source: 'K4',
    use: 'najechanie na akcję główną',
    avoid: '—',
  },
  {
    name: 'action-primary-pressed',
    group: 'Akcje',
    source: 'K4',
    use: 'wciśnięcie akcji głównej',
    avoid: '—',
  },
  {
    name: 'action-danger',
    group: 'Akcje',
    source: 'WCAG, A02',
    use: 'akcje nieodwracalne',
    avoid: 'ostrzeżenia',
  },
  {
    name: 'selected-bg',
    group: 'Zaznaczenie i fokus',
    source: 'R04.2, K4',
    use: 'zaznaczony slot, zakładka, opcja',
    avoid: 'najechanie',
  },
  {
    name: 'selected-border',
    group: 'Zaznaczenie i fokus',
    source: 'R04.2, K4',
    use: 'obramowanie zaznaczenia',
    avoid: '—',
  },
  {
    name: 'focus-ring',
    group: 'Zaznaczenie i fokus',
    source: 'WCAG 2.4.7, 2.4.11',
    use: 'każdy element z fokusem',
    avoid: '—',
  },
  {
    name: 'border-divider',
    group: 'Linie',
    source: 'R01.4',
    use: 'linie między wierszami, separatory',
    avoid: 'granice pól',
  },
  {
    name: 'border-control',
    group: 'Linie',
    source: 'WCAG 1.4.11',
    use: 'ramka pól, checkboxa, radia, przycisku drugorzędnego',
    avoid: 'linie wierszy',
  },
  {
    name: 'status-success-fg',
    group: 'Statusy',
    source: 'brief (statusy U4/U5), Q2',
    use: 'sukces — zawsze z ikoną lub tekstem',
    avoid: 'jedyny nośnik znaczenia',
  },
  {
    name: 'status-success-bg',
    group: 'Statusy',
    source: 'brief',
    use: 'tło znacznika i komunikatu sukcesu',
    avoid: '—',
  },
  {
    name: 'status-warning-fg',
    group: 'Statusy',
    source: 'brief, Z5',
    use: 'ostrzeżenie (np. mniej niż 12 h)',
    avoid: '—',
  },
  {
    name: 'status-warning-bg',
    group: 'Statusy',
    source: 'brief',
    use: 'tło ostrzeżenia',
    avoid: '—',
  },
  { name: 'status-danger-fg', group: 'Statusy', source: 'brief', use: 'błąd', avoid: '—' },
  { name: 'status-danger-bg', group: 'Statusy', source: 'brief', use: 'tło błędu', avoid: '—' },
  {
    name: 'status-neutral-fg',
    group: 'Statusy',
    source: 'propozycja P-T3, K4',
    use: 'status informacyjny',
    avoid: 'niebieskie „info”',
  },
  {
    name: 'status-neutral-bg',
    group: 'Statusy',
    source: 'propozycja P-T3',
    use: 'tło statusu informacyjnego',
    avoid: '—',
  },
];

export type ContrastPair = {
  label: string;
  fg: string;
  bg: string;
  /** 4.5 for text (WCAG 1.4.3), 3 for interface elements (WCAG 1.4.11), 0 for decorative lines. */
  min: 4.5 | 3 | 0;
};

export const contrastPairs: ContrastPair[] = [
  { label: 'Tekst na tle strony', fg: 'text-default', bg: 'surface-page', min: 4.5 },
  { label: 'Tekst na panelu', fg: 'text-default', bg: 'surface-panel', min: 4.5 },
  { label: 'Tekst na tle zagłębionym', fg: 'text-default', bg: 'surface-sunken', min: 4.5 },
  { label: 'Tekst drugorzędny na tle strony', fg: 'text-muted', bg: 'surface-page', min: 4.5 },
  { label: 'Tekst drugorzędny na panelu', fg: 'text-muted', bg: 'surface-panel', min: 4.5 },
  {
    label: 'Tekst drugorzędny na tle zagłębionym',
    fg: 'text-muted',
    bg: 'surface-sunken',
    min: 4.5,
  },
  { label: 'Tekst pomocniczy na tle strony', fg: 'text-subtle', bg: 'surface-page', min: 4.5 },
  { label: 'Tekst pomocniczy na panelu', fg: 'text-subtle', bg: 'surface-panel', min: 4.5 },
  { label: 'Link na tle strony', fg: 'text-link', bg: 'surface-page', min: 4.5 },
  { label: 'Link na panelu', fg: 'text-link', bg: 'surface-panel', min: 4.5 },
  { label: 'Link na zaznaczeniu', fg: 'text-link', bg: 'selected-bg', min: 4.5 },
  { label: 'Tekst na zaznaczeniu', fg: 'text-default', bg: 'selected-bg', min: 4.5 },
  { label: 'Tekst akcji głównej', fg: 'text-on-action', bg: 'action-primary', min: 4.5 },
  {
    label: 'Tekst akcji głównej — najechanie',
    fg: 'text-on-action',
    bg: 'action-primary-hover',
    min: 4.5,
  },
  {
    label: 'Tekst akcji głównej — wciśnięcie',
    fg: 'text-on-action',
    bg: 'action-primary-pressed',
    min: 4.5,
  },
  { label: 'Tekst akcji usuwania', fg: 'text-on-danger', bg: 'action-danger', min: 4.5 },
  { label: 'Błąd na panelu', fg: 'status-danger-fg', bg: 'surface-panel', min: 4.5 },
  { label: 'Błąd na własnym tle', fg: 'status-danger-fg', bg: 'status-danger-bg', min: 4.5 },
  { label: 'Sukces na panelu', fg: 'status-success-fg', bg: 'surface-panel', min: 4.5 },
  { label: 'Sukces na własnym tle', fg: 'status-success-fg', bg: 'status-success-bg', min: 4.5 },
  { label: 'Ostrzeżenie na panelu', fg: 'status-warning-fg', bg: 'surface-panel', min: 4.5 },
  {
    label: 'Ostrzeżenie na własnym tle',
    fg: 'status-warning-fg',
    bg: 'status-warning-bg',
    min: 4.5,
  },
  { label: 'Status neutralny', fg: 'status-neutral-fg', bg: 'status-neutral-bg', min: 4.5 },
  { label: 'Ramka pola na panelu', fg: 'border-control', bg: 'surface-panel', min: 3 },
  { label: 'Ramka pola na tle strony', fg: 'border-control', bg: 'surface-page', min: 3 },
  { label: 'Fokus na tle strony', fg: 'focus-ring', bg: 'surface-page', min: 3 },
  { label: 'Fokus na panelu', fg: 'focus-ring', bg: 'surface-panel', min: 3 },
  { label: 'Akcja główna względem tła strony', fg: 'action-primary', bg: 'surface-page', min: 3 },
  { label: 'Akcja główna względem panelu', fg: 'action-primary', bg: 'surface-panel', min: 3 },
  { label: 'Obramowanie zaznaczenia', fg: 'selected-border', bg: 'selected-bg', min: 3 },
  {
    label: 'Linia między wierszami (dekoracyjna)',
    fg: 'border-divider',
    bg: 'surface-page',
    min: 0,
  },
];
