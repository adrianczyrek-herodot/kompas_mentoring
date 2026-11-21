/**
 * The review engine's screen anatomy: `section.screen#<ID>` with a meta line (hidden in
 * presentation mode), the product inside `.frame` (comments anchor there) and screen notes.
 */
import { Badge } from '@kompas/ui';
import { type ReactNode, useEffect } from 'react';
import { refreshEngine } from '../review/engine-adapter';
import type { ScreenDef } from '../screens/registry';

export function ScreenFrame({
  screen,
  notes,
  children,
}: {
  screen: ScreenDef | undefined;
  notes?: ReactNode;
  children: ReactNode;
}) {
  const id = screen?.id ?? 'nieznany-adres';
  useEffect(() => {
    refreshEngine();
  });
  return (
    <section id={id} className="screen is-current">
      <div className="screen-meta flex flex-wrap items-center gap-x-group gap-y-tight border-b border-border-divider bg-surface-sunken px-panel py-tight text-meta text-text-muted">
        <h2 className="text-label font-semibold text-text-default">
          {screen ? `${screen.id} · ${screen.name}` : 'Adres spoza mapy ekranów'}
        </h2>
        {screen ? <p>{screen.purpose}</p> : null}
        {screen ? (
          <ul aria-label="Historie i sekcje specyfikacji" className="screen-refs flex gap-tight">
            {screen.refs.map((ref) => (
              <li key={ref}>
                <Badge variant="neutral">{ref}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="frame">{children}</div>
      {notes ? (
        <aside
          aria-label="Notatka do ekranu"
          className="notes border-t border-border-divider bg-surface-sunken px-panel py-group text-body-dense"
        >
          {notes}
        </aside>
      ) : null}
    </section>
  );
}
