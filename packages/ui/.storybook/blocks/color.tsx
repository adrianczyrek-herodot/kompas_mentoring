/**
 * Colour blocks for Podstawy/Kolor (Storybook only): roles and measured contrast in both themes.
 */
import { CheckIcon, XIcon } from 'lucide-react';
import { type ColorToken, colorTokens, contrastPairs } from './color-data';
import {
  Cell,
  contrastRatio,
  DocTable,
  readColor,
  Swatch,
  type Theme,
  themes,
  toHex,
  useProbes,
} from './doc-kit';

/* ---------- colour ---------- */

export function ColorRoles({ group }: { group?: ColorToken['group'] }) {
  const tokens = group ? colorTokens.filter((token) => token.group === group) : colorTokens;
  const [probes, values] = useProbes((p) =>
    Object.fromEntries(
      tokens.map((token) => {
        const light = readColor(p.light, token.name);
        const dark = readColor(p.dark, token.name);
        return [token.name, { light: light ? toHex(light) : '—', dark: dark ? toHex(dark) : '—' }];
      }),
    ),
  );
  return (
    <>
      {probes}
      <DocTable head={['Token', 'Jasny', 'Ciemny', 'Źródło', 'Gdzie używać', 'Gdzie nie używać']}>
        {tokens.map((token) => (
          <tr key={token.name}>
            <Cell mono>{token.name}</Cell>
            {themes.map((theme) => (
              <Cell key={theme}>
                <span className="inline-flex items-center gap-inline">
                  <Swatch token={token.name} theme={theme} />
                  <span className="font-mono text-code whitespace-nowrap">
                    {values?.[token.name]?.[theme] ?? '…'}
                  </span>
                </span>
              </Cell>
            ))}
            <Cell>{token.source}</Cell>
            <Cell>{token.use}</Cell>
            <Cell>{token.avoid}</Cell>
          </tr>
        ))}
      </DocTable>
    </>
  );
}

export function ContrastTable() {
  const [probes, results] = useProbes((p) =>
    contrastPairs.map((pair) => {
      const ratios = Object.fromEntries(
        themes.map((theme) => {
          const fg = readColor(p[theme], pair.fg);
          const bg = readColor(p[theme], pair.bg);
          return [theme, fg && bg ? contrastRatio(fg, bg) : Number.NaN];
        }),
      ) as Record<Theme, number>;
      return { pair, ratios };
    }),
  );
  return (
    <>
      {probes}
      <DocTable
        caption="Zmierzone w przeglądarce dla wartości z tokens.css. Próg: 4,5 : 1 dla tekstu (WCAG 1.4.3), 3 : 1 dla elementów interfejsu (WCAG 1.4.11)."
        head={['Para', 'Tekst / element', 'Tło', 'Próg', 'Jasny', 'Ciemny']}
      >
        {(results ?? []).map(({ pair, ratios }) => (
          <tr key={pair.label}>
            <Cell>{pair.label}</Cell>
            <Cell mono>{pair.fg}</Cell>
            <Cell mono>{pair.bg}</Cell>
            <Cell>
              {pair.min === 0 ? 'dekoracja' : `${String(pair.min).replace('.', ',')} : 1`}
            </Cell>
            {themes.map((theme) => (
              <Cell key={theme}>
                <Verdict ratio={ratios[theme]} min={pair.min} />
              </Cell>
            ))}
          </tr>
        ))}
      </DocTable>
    </>
  );
}

function Verdict({ ratio, min }: { ratio: number; min: number }) {
  const value = Number.isNaN(ratio) ? '—' : `${ratio.toFixed(2).replace('.', ',')} : 1`;
  if (min === 0) {
    return <span className="tabular-nums">{value}</span>;
  }
  const ok = ratio >= min;
  return (
    <span
      className={`inline-flex items-center gap-inline tabular-nums ${ok ? 'text-status-success-fg' : 'font-semibold text-status-danger-fg'}`}
    >
      {ok ? (
        <CheckIcon className="size-icon-sm" aria-hidden />
      ) : (
        <XIcon className="size-icon-sm" aria-hidden />
      )}
      {value} {ok ? 'spełnia' : 'poniżej progu'}
    </span>
  );
}
