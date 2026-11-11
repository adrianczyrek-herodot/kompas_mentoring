/**
 * Documentation blocks for the Foundations pages (Storybook only, not exported from the package).
 * Every value shown is read from the live CSS variables in src/styles/tokens.css — nothing is copied.
 */
import { CircleAlertIcon, ClockIcon, SearchIcon, TriangleAlertIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Cell, DocTable, readVar, themeLabel, themes, useProbes } from './doc-kit';
import { spaceRelations, typeRoles } from './token-data';

/* ---------- typography ---------- */

export function TypeRoles() {
  return (
    <DocTable head={['Rola', 'Próbka', 'Klasy', 'Token', 'Źródło', 'Kiedy']}>
      {typeRoles.map((role) => (
        <tr key={role.role}>
          <Cell>{role.role}</Cell>
          <Cell>
            <span className={`block max-w-measure ${role.className}`}>{role.sample}</span>
          </Cell>
          <Cell mono>{role.className}</Cell>
          <Cell>{role.token}</Cell>
          <Cell>{role.source}</Cell>
          <Cell>{role.use}</Cell>
        </tr>
      ))}
    </DocTable>
  );
}

export function MeasureSample() {
  return (
    <div className="flex flex-col gap-group">
      <p className="max-w-measure text-body">
        Tekst ciągły ma najwyżej około 65 znaków w linii (token <code>measure-text</code>, klasa{' '}
        <code>max-w-measure</code>). Dłuższa linia męczy oko i utrudnia powrót do początku kolejnego
        wiersza, szczególnie w opisie mentora, notatce po sesji i zasadach przełożenia.
      </p>
      <p className="text-meta text-text-muted">Szerokość akapitu powyżej: max-w-measure (65ch).</p>
    </div>
  );
}

/* ---------- spacing and layout ---------- */

export function SpaceRelations() {
  const [probes, values] = useProbes((p) =>
    Object.fromEntries(spaceRelations.map((rel) => [rel.token, readVar(p.light, rel.token)])),
  );
  return (
    <>
      {probes}
      <DocTable head={['Relacja', 'Token', 'Klasa', 'Wartość', 'Podgląd', 'Przykład w produkcie']}>
        {spaceRelations.map((rel) => (
          <tr key={rel.token}>
            <Cell>{rel.relation}</Cell>
            <Cell mono>{rel.token}</Cell>
            <Cell mono>{rel.className}</Cell>
            <Cell>
              {rel.value}
              <span className="block text-meta text-text-muted">
                teraz: {values?.[rel.token] ?? '…'}
              </span>
            </Cell>
            <Cell>
              <span className="flex items-center">
                <span
                  className="block h-icon-sm rounded-tag bg-action-primary"
                  style={{ width: `var(--${rel.token})` }}
                />
              </span>
            </Cell>
            <Cell>{rel.example}</Cell>
          </tr>
        ))}
      </DocTable>
    </>
  );
}

export function SpacingExample() {
  return (
    <div className="flex flex-col gap-section rounded-panel bg-surface-page p-panel">
      <section className="flex flex-col gap-group">
        <h3 className="text-section-title font-semibold">Nadchodzące</h3>
        <div className="flex flex-col rounded-panel border border-border-divider bg-surface-panel">
          {[
            ['wt., 18 lis.', '18:00–18:30', 'Anna Kowalska', 'Sesja próbna'],
            ['czw., 20 lis.', '19:00–20:00', 'Marek Nowak', 'Plan: 1 × tydzień'],
          ].map(([day, time, mentor, kind]) => (
            <div
              key={time}
              className="flex flex-wrap items-baseline gap-inline border-b border-border-divider px-panel py-row-y text-body-dense last:border-b-0"
            >
              <span className="tabular-nums font-medium">{day}</span>
              <span className="tabular-nums">{time}</span>
              <span>{mentor}</span>
              <span className="text-text-muted">{kind}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-group">
        <h3 className="text-section-title font-semibold">Minione</h3>
        <p className="text-body-dense text-text-muted">
          Tu pojawią się sesje, które już się odbyły.
        </p>
      </section>
    </div>
  );
}

export function LayoutWidths() {
  const rows = [
    {
      width: '320 px',
      layout:
        'jedna kolumna, dolny pasek nawigacji z 5 pozycji, odstępy panelu i sekcji 16 / 32 px',
      source: 'KONCEPCJA Z9, §3.2, R02.6',
    },
    {
      width: '768 px',
      layout:
        'nawigacja w nagłówku, odstępy panelu i sekcji 24 / 48 px, listy w dwóch kolumnach tylko tam, gdzie pomagają porównać',
      source: 'KONCEPCJA §3.2',
    },
    {
      width: '1440 px',
      layout:
        'treść wyśrodkowana do content-max (1160 px), formularze do form-max (640 px), tekst do measure-text (65 znaków)',
      source: 'mockup (.main, .narrow), R05.1',
    },
  ];
  return (
    <DocTable head={['Szerokość', 'Układ', 'Źródło']}>
      {rows.map((row) => (
        <tr key={row.width}>
          <Cell>{row.width}</Cell>
          <Cell>{row.layout}</Cell>
          <Cell>{row.source}</Cell>
        </tr>
      ))}
    </DocTable>
  );
}

/* ---------- shape and depth ---------- */

export function ShapeSamples() {
  const shapes = [
    { token: 'shape-tag', className: 'rounded-tag', use: 'znacznik statusu, checkbox' },
    { token: 'shape-control', className: 'rounded-control', use: 'przycisk, pole, select' },
    { token: 'shape-panel', className: 'rounded-panel', use: 'panel, dialog, arkusz, menu' },
    { token: 'shape-round', className: 'rounded-round', use: 'awatar, radio' },
  ];
  const [probes, values] = useProbes((p) =>
    Object.fromEntries(shapes.map((s) => [s.token, readVar(p.light, s.token)])),
  );
  return (
    <>
      {probes}
      <DocTable head={['Token', 'Klasa', 'Wartość', 'Podgląd', 'Gdzie']}>
        {shapes.map((shape) => (
          <tr key={shape.token}>
            <Cell mono>{shape.token}</Cell>
            <Cell mono>{shape.className}</Cell>
            <Cell>{values?.[shape.token] ?? '…'}</Cell>
            <Cell>
              <span
                className={`block size-control border border-border-control bg-surface-panel ${shape.className}`}
              />
            </Cell>
            <Cell>{shape.use}</Cell>
          </tr>
        ))}
      </DocTable>
    </>
  );
}

export function DepthSamples() {
  return (
    <div className="grid gap-group sm:grid-cols-2">
      <div className="flex flex-col gap-inline">
        <div className="rounded-panel border border-border-divider bg-surface-panel p-panel text-body-dense">
          Panel: obramowanie <code>border-divider</code>, bez cienia.
        </div>
        <p className="text-meta text-text-muted">
          Panele i karty oddziela linia, nie cień (R01.4).
        </p>
      </div>
      <div className="flex flex-col gap-inline">
        <div className="rounded-panel border border-border-divider bg-surface-panel p-panel text-body-dense shadow-overlay">
          Nakładka: <code>shadow-overlay</code> (menu, popover, dialog, toast).
        </div>
        <p className="text-meta text-text-muted">
          Cień tylko dla warstw nad treścią (propozycja P-T4).
        </p>
      </div>
    </div>
  );
}

/* ---------- motion ---------- */

export function MotionTokens() {
  const motion = [
    { token: 'duration-fast', use: 'najechanie, zmiana koloru' },
    { token: 'duration-base', use: 'zmiana stanu (zaznaczenie, rozwinięcie)' },
    { token: 'duration-overlay', use: 'pojawienie się menu, popovera, dialogu, toastu' },
    { token: 'easing-standard', use: 'wszystkie przejścia' },
  ];
  const [probes, values] = useProbes((p) =>
    Object.fromEntries(motion.map((m) => [m.token, readVar(p.light, m.token)])),
  );
  return (
    <>
      {probes}
      <DocTable head={['Token', 'Wartość teraz', 'Gdzie']}>
        {motion.map((m) => (
          <tr key={m.token}>
            <Cell mono>{m.token}</Cell>
            <Cell mono>{values?.[m.token] ?? '…'}</Cell>
            <Cell>{m.use}</Cell>
          </tr>
        ))}
      </DocTable>
    </>
  );
}

/* ---------- icons ---------- */

export function IconSizes() {
  const sizes = [
    {
      token: 'icon-sm',
      className: 'size-icon-sm',
      use: 'w tekście gęstym, w przyciskach, w znacznikach',
    },
    {
      token: 'icon-md',
      className: 'size-icon-md',
      use: 'w polach, w nagłówkach sekcji, w alertach',
    },
    { token: 'icon-lg', className: 'size-icon-lg', use: 'w pustych stanach i stanach błędu' },
  ];
  return (
    <DocTable head={['Token', 'Klasa', 'Podgląd', 'Gdzie']}>
      {sizes.map((size) => (
        <tr key={size.token}>
          <Cell mono>{size.token}</Cell>
          <Cell mono>{size.className}</Cell>
          <Cell>
            <span className="inline-flex items-center gap-inline">
              <SearchIcon className={size.className} aria-hidden />
              <ClockIcon className={size.className} aria-hidden />
              <TriangleAlertIcon className={size.className} aria-hidden />
              <CircleAlertIcon className={size.className} aria-hidden />
            </span>
          </Cell>
          <Cell>{size.use}</Cell>
        </tr>
      ))}
    </DocTable>
  );
}

/* ---------- themes ---------- */

/** Renders children once per theme, side by side, on the page surface of that theme. */
export function ThemeSideBySide({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-group md:grid-cols-2">
      {themes.map((theme) => (
        <div
          key={theme}
          className={`${theme} flex flex-col gap-group rounded-panel border border-border-divider bg-surface-page p-panel text-text-default`}
        >
          <p className="text-label font-medium">{themeLabel[theme]}</p>
          {children}
        </div>
      ))}
    </div>
  );
}
