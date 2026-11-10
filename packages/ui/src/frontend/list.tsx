/** Lista w ramce karty (wątki, sesje, powiadomienia). */
export const listClass = "flex flex-col overflow-hidden rounded-card border border-line bg-surface";

/** Wiersz listy; `is-active`/`is-unread` przez dodatkowe klasy w miejscu użycia. */
export const listItemClass = "flex items-center gap-3 border-b border-line-2 px-3.5 py-3 no-underline last:border-b-0";

/** Tabela danych w karcie. */
export const tableClass =
  "w-full border-collapse text-[0.9rem] [&_th]:border-b [&_th]:border-line [&_th]:px-1.5 [&_th]:py-2 [&_th]:text-left [&_th]:text-[0.76rem] [&_th]:font-semibold [&_th]:text-ink-3 [&_th]:uppercase [&_td]:border-b [&_td]:border-line-2 [&_td]:px-1.5 [&_td]:py-2.5";
