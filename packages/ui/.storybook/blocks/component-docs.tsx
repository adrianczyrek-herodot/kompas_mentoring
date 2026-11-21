/**
 * Documentation helpers for component pages and stories (Storybook only, not exported from the
 * package): the state matrix, do / don't pairs and a fixed-width viewport frame.
 */
import type { ReactNode } from 'react';

/** Values for `data-preview-state` (frozen :hover / :focus-visible / :active, see storybook.css). */
export type PreviewState = 'hover' | 'focus' | 'pressed';

function MatrixHead({ columns }: { columns: string[] }) {
  return (
    <thead>
      <tr className="border-b border-border-control">
        {['Wariant', ...columns].map((column) => (
          <th key={column} scope="col" className="px-inline py-row-y text-label font-medium">
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function StateMatrix({
  columns,
  rows,
  caption,
}: {
  columns: string[];
  rows: { label: string; cells: ReactNode[] }[];
  caption?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="border-collapse text-left text-body-dense">
        {caption ? (
          <caption className="pb-inline text-left text-meta text-text-muted">{caption}</caption>
        ) : null}
        <MatrixHead columns={columns} />
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-border-divider">
              <th scope="row" className="px-inline py-row-y align-middle text-label font-medium">
                {row.label}
              </th>
              {row.cells.map((cell, index) => (
                <td key={columns[index]} className="px-inline py-row-y align-middle">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Verdict({
  kind,
  children,
  note,
}: {
  kind: 'do' | 'dont';
  children: ReactNode;
  note: string;
}) {
  const good = kind === 'do';
  return (
    <figure className="flex min-w-0 flex-1 flex-col gap-inline">
      <div
        className={`flex flex-1 flex-wrap items-center gap-inline rounded-panel border bg-surface-panel p-panel ${good ? 'border-status-success-fg' : 'border-status-danger-fg'}`}
      >
        {children}
      </div>
      <figcaption className="text-body-dense text-text-default">
        <strong className={good ? 'text-status-success-fg' : 'text-status-danger-fg'}>
          {good ? 'Dobrze: ' : 'Źle: '}
        </strong>
        {note}
      </figcaption>
    </figure>
  );
}

/** One do / don't pair, side by side (stacked below 768 px), each with one sentence. */
export function DoDont({
  good,
  goodNote,
  bad,
  badNote,
}: {
  good: ReactNode;
  goodNote: string;
  bad: ReactNode;
  badNote: string;
}) {
  return (
    <div className="flex flex-col gap-group md:flex-row">
      <Verdict kind="do" note={goodNote}>
        {good}
      </Verdict>
      <Verdict kind="dont" note={badNote}>
        {bad}
      </Verdict>
    </div>
  );
}

/** Fixed-width frame that stands in for a device width (320 / 768 / 1440 px) on docs pages. */
export function ViewportFrame({
  width,
  children,
}: {
  width: 320 | 768 | 1440;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-inline">
      <p className="text-meta text-text-muted">{width} px</p>
      <div
        className="overflow-hidden rounded-panel border border-border-divider bg-surface-page p-group"
        style={{ width, maxWidth: '100%' }}
      >
        {children}
      </div>
    </div>
  );
}

export interface ComponentIndexItem {
  name: string;
  import: string;
  group: string;
  when: string;
  whenNot: string;
}

/** Table used on "Zacznij tutaj" and "Komponenty" pages. */
export function ComponentTable({
  components,
}: {
  components: readonly ComponentIndexItem[];
}) {
  const groups = [...new Set(components.map((c) => c.group))];
  return (
    <div className="space-section">
      {groups.map((group) => (
        <section key={group} className="space-panel">
          <h3 className="text-section-title text-text-default">{group}</h3>
          <div className="overflow-x-auto">
            <table className="border-collapse text-left text-body-dense w-full">
              <thead>
                <tr className="border-b border-border-control">
                  <th scope="col" className="px-inline py-row-y text-label font-medium">Komponent</th>
                  <th scope="col" className="px-inline py-row-y text-label font-medium">Import</th>
                  <th scope="col" className="px-inline py-row-y text-label font-medium">Kiedy używać</th>
                  <th scope="col" className="px-inline py-row-y text-label font-medium">Kiedy nie</th>
                </tr>
              </thead>
              <tbody>
                {components
                  .filter((c) => c.group === group)
                  .map((c) => (
                    <tr key={c.name} className="border-b border-border-divider">
                      <td className="px-inline py-row-y font-mono text-code">{c.name}</td>
                      <td className="px-inline py-row-y font-mono text-code">{c.import}</td>
                      <td className="px-inline py-row-y">{c.when}</td>
                      <td className="px-inline py-row-y">{c.whenNot}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
