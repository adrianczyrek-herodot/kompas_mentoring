# Audyt kontekstu agenta — Kompas Mentoring

**Data:** 2026-11-22 · **Gałąź:** `cez/3e0900c2` · **Agent:** Claude Code (Opus 5.5, okno 1M) uruchomiony przez cezar
**Narzędzia:** transkrypt bieżącej sesji (`~/.claude/projects/…3e0900c2…/bd533bc6-….jsonl`, pola `usage`), indeks Context Scope (`~/.contextscope/index/v1`), skille `eliminate-no-op` i `task-router` z `github.com/pat-lewczuk/skills` (sklonowane do katalogu tymczasowego, poza repo).

## TL;DR

### Przed / po (metryki z kroku 1)

| Metryka | Przed | Po | Δ |
|---|---|---|---|
| Kontekst przed pierwszym promptem | ~41 000 tok (4,1% okna 1M / 20,5% okna 200k) | **~38 000 tok** (3,8% / 19,0%) — szac.: baseline minus zmierzony spadek instrukcji; pełny pomiar wymaga nowej sesji | **~−3 000 (−7%)** |
| `AGENTS.md` | 227 linii · 12 682 zn. · ~6 490 tok | **86 linii · 8 034 zn. · ~4 260 tok** (zmierzone) | **−141 linii, −2 230 tok (−34%)** |
| `CLAUDE.md` (ładowany razem z `AGENTS.md`) | 29 linii · ~925 tok | 7 linii · ~150 tok | −775 tok |
| Opisy skilli | ~6 960 tok (36 skilli) | ~6 960 tok | 0 — skille są ustawieniem konta, nie repo (znalezisko 5.1) |
| Włączone serwery MCP | 33 (4 połączone + 29 bez autoryzacji) | 33 | 0 — niczego nie wyłączano (zgodnie z poleceniem) |
| Tokeny MCP na serwer (definicje narzędzi) | 0 (`mcp__*` zabronione) | 0 | 0 |
| MCP łącznie | ~2 650 tok | ~2 650 tok | 0 (znalezisko 5.2) |

### Najważniejsze zmiany

1. `AGENTS.md` odchudzony skillem `eliminate-no-op` + przeglądem linijka po linijce: szablony spec/run/lekcji przeniesione do `.ai/templates/`, usunięta lista kontrolna (duplikat zasad), drzewo katalogu i meta-tekst, naprawiona martwa ścieżka `packages/core/src/shared/domain`.
2. `CLAUDE.md` skrócony do `@AGENTS.md` + jednej reguły — wcześniej powtarzał `AGENTS.md`, który i tak importuje.
3. Router zadań (`task-router`): tabela 14 tras w roocie, reguły `packages/core` → `packages/core/AGENTS.md`, słownik → `docs/domain-glossary.md`, mockupy → `kompas-mentoring/mockupy/AGENTS.md`, sprawdzanie `pnpm agents:check-router`. Zysk tokenowy ~0 — decyzja zostawić/wycofać należy do użytkownika (4.5).
4. Naprawiona luka: `AGENTS.md` modułów `identity` i `scheduling` nie były ładowane przez Claude Code — dodane `CLAUDE.md` z `@AGENTS.md`.
5. Metoda pomiaru: tokeny mierzone z `usage` API; „znaki/4” zaniża ~2× dla polskiego tekstu.

### Do wdrożenia w przyszłym tygodniu

- [ ] Wyłączyć na koncie claude.ai skille nieużywane w projekcie (docx, pptx, xlsx, pdf, google-workspace, docs, morning, hr-bot, computer-use, built-in-browser, chrome-browser, import-memory, cowork-*) — ~3 700 tok/sesję, nakład S (5.1).
- [ ] Odłączyć konektory MCP claude.ai nieużywane w pracy z kodem (Meetings, Claude Docs, Claude Data, Atlassian Rovo v1, 29 nieautoryzowanych) albo uruchamiać sesje projektu bez nich — ~2 650 tok/sesję, nakład S (5.2).
- [x] Podzielić `.ai/lessons.md` na część „Proces” (zawsze) i pliki obszarowe podpięte w routerze — ~4 000–5 000 tok/zadanie, nakład S–M (5.3). **Wdrożone 2026-11-22:** `.ai/lessons/areas/{ui,e2e,backend,prototypes}.md`; `lessons.md` 16 937 → 8 253 zn. (~8 700 → ~4 230 tok).
- [x] Dodać do `AGENTS.md` regułę czytania dużych specyfikacji fragmentami (`Grep` po nagłówku → `Read` z `offset/limit`) i spis treści na górze spec > 500 linii — 20 000–60 000 tok w sesjach na specyfikacjach, nakład S (5.4). **Wdrożone 2026-11-22** (reguła w „Sposób pracy” pkt 5; spis treści w spec — nie wdrożony).

## 1. Baseline

### Metoda liczenia tokenów

Licznik tokenów (API `count_tokens`) nie jest dostępny w tej sesji, a heurystyka „znaki / 4” okazała się **błędna dla tego modelu** — dlatego liczby są mierzone **empirycznie z pól `usage` w transkrypcie API**: tekst wypisywałem w osobnym wywołaniu narzędzia i odczytywałem przyrost kontekstu między kolejnymi żądaniami (`Δ(input+cache_creation+cache_read) − output_tokens poprzedniej tury`). Dokładność ok. ±50–150 tokenów na pomiar (narzut bloku `tool_result`).

| Próbka | Znaki | Tokeny (zmierzone) | Znaków / token |
|---|---:|---:|---:|
| `AGENTS.md` (polski + markdown) | 12 682 | ~6 490 | **1,95** |
| Lista skilli (angielski) | 19 928 | ~6 960 | **2,86** |
| Instrukcje serwerów MCP (angielski) | 5 596 | ~2 150 | **2,6** |
| `om-ux-shape/SKILL.md` (angielski) | 8 346 | ~2 870 (pomiar z małym dodatkiem) | ~2,9 |

Wniosek metodyczny: dla polskiego tekstu „znaki / 4” zaniża wynik **~2×**, dla angielskiego ~1,4×. Wartości, których nie dało się zmierzyć wprost, przeliczam współczynnikiem z tabeli (PL 1,95, EN 2,9) i oznaczam „szac.”.

### Tabela metryk

| Metryka | Wartość | Metoda pomiaru |
|---|---|---|
| Zajętość okna kontekstu przed pierwszym promptem (tokeny i % okna) | **~41 000 tok** = 4,1% okna 1M (20,5% okna 200k). Po dołączeniu bloku MCP w 2. żądaniu: **~43 200 tok** (4,3% / 21,6%) | Pierwsze żądanie API tej sesji: `usage` = 43 646 tok (cache_creation 43 644 + input 2), minus prompt użytkownika (5 130 zn. PL ÷ 1,95 ≈ 2 630 tok). Uwaga: zawiera dopisek systemowy cezar — w gołym Claude Code baseline będzie niższy. |
| Rozmiar `AGENTS.md` (linie, znaki, tokeny) | **227 linii, 12 682 znaki (13 234 B), ~6 490 tok** (+ `CLAUDE.md`: 29 linii, 1 804 zn., ~925 tok szac.) | `wc -l`, `wc -m`, `wc -c`; tokeny — pomiar przyrostu `usage` (wyżej). `CLAUDE.md` importuje `@AGENTS.md`, więc oba lądują w kontekście (blok `instructions` = 15 105 zn.). |
| Łączny rozmiar opisów (description) wszystkich skilli (tokeny) | **~6 960 tok** (36 skilli, 19 928 zn.) | Załącznik `skill_listing` z transkryptu wypisany w osobnym wywołaniu, przyrost `usage`. Context Scope (estymator `chars-v2`) szacuje ten blok na 10 017–10 185 tok w poprzednich sesjach. |
| Liczba włączonych serwerów MCP | **33 serwery claude.ai** (4 połączone: Atlassian Rovo, Claude Data, Claude Docs, Meetings; 29 wymaga autoryzacji). Projektowy `.mcp.json`: brak. Serwery lokalne/użytkownika: **BRAK DANYCH – `~/.claude.json` jest zablokowany do odczytu (sandbox + `permissions.deny`)** | Załączniki `mcp_instructions_delta` i `deferred_tools_delta` (`needsAuthMcpServers`) w transkrypcie. |
| Tokeny konsumowane przez każdy serwer MCP (definicje narzędzi) | **Definicje narzędzi: 0 tok dla każdego serwera** — `.claude/settings.json` ma `permissions.deny: ["mcp__*"]`, więc żadne narzędzie `mcp__*` nie trafia do kontekstu (lista narzędzi odroczonych zawiera tylko `ListMcpResourcesTool`, `ReadMcpResourceDirTool`, `ReadMcpResourceTool`). **Instrukcje serwerów** (ładowane mimo blokady): Atlassian Rovo ~230, Claude Data ~405, Claude Docs ~730, Meetings ~790 tok; 29 serwerów „wymaga autoryzacji”: nazwy + akapit ostrzeżenia ~500 tok szac. (~17 tok/serwer) | Instrukcje: pomiar przyrostu `usage` dla całego bloku (~2 150 tok), rozdzielony proporcjonalnie do znaków (596 / 1 053 / 1 893 / 2 054). Lista „needs auth”: ~1 450 zn. ÷ 2,9. |
| Łącznie MCP (tokeny) | **~2 650 tok** (0 definicji narzędzi + ~2 150 instrukcji + ~500 listy serwerów do autoryzacji) | Suma powyższych. |

### Skład kontekstu startowego (~41 000 tok)

| Blok | Tokeny | Źródło |
|---|---:|---|
| Prompt systemowy Claude Code + schematy narzędzi + dopisek cezar | ~22 700 | reszta z 41 000 (nie da się rozbić — BRAK DANYCH o podziale, prompt systemowy nie jest zapisywany w transkrypcie) |
| `CLAUDE.md` + `AGENTS.md` | ~7 450 | zmierzone (`AGENTS.md`) + szac. (`CLAUDE.md`) |
| Lista skilli (36) | ~6 960 | zmierzone |
| Instrukcje sandboxa | ~2 600 | szac. (7 608 zn. ÷ 2,9) |
| Lista agentów, środowisko, data, kontekst sesji | ~1 300 | szac. |
| *(od 2. żądania)* MCP | ~2 650 | zmierzone + szac. |

### Skille widoczne w sesji (36)

Tokeny opisu = długość wpisu w `skill_listing` ÷ 2,86 (zmierzony współczynnik bloku). Tokeny treści = `SKILL.md` ÷ 2,9 (szac.; treść ładuje się dopiero po wywołaniu skilla). Treść skilli wbudowanych i pluginu: **BRAK DANYCH – są w binarce Claude Code / w `~/.claude/plugins` (zablokowany odczyt)**.

| Skill | Źródło | Opis (zn.) | Opis (tok) | Treść `SKILL.md` (zn.) | Treść (tok, szac.) |
|---|---|---:|---:|---:|---:|
| om-create-skill | `open-mercato/skills` (kurs) | 390 | 136 | 8 353 | 2 880 |
| om-setup-agent-pipeline | `open-mercato/skills` (kurs) | 487 | 170 | 20 396 | 7 033 |
| om-synthetic-users | `open-mercato/skills` (kurs) | 478 | 167 | 18 061 | 6 228 |
| om-ux-review-pr | `open-mercato/skills` (kurs) | 355 | 124 | 9 560 | 3 297 |
| om-ux-setup | `open-mercato/skills` (kurs) | 356 | 124 | 7 089 | 2 444 |
| om-ux-shape | `open-mercato/skills` (kurs) | 281 | 98 | 8 346 | 2 878 |
| cowork-plugin-management:cowork-plugin-customizer | plugin Anthropic | 330 | 115 | BRAK DANYCH | — |
| cowork-plugin-management:create-cowork-plugin | plugin Anthropic | 393 | 137 | BRAK DANYCH | — |
| dataviz | wbudowany | 1 447 | 506 | BRAK DANYCH | — |
| update-config | wbudowany | 707 | 247 | BRAK DANYCH | — |
| keybindings-help | wbudowany | 248 | 87 | BRAK DANYCH | — |
| code-review | wbudowany | 642 | 224 | BRAK DANYCH | — |
| simplify | wbudowany | 188 | 66 | BRAK DANYCH | — |
| fewer-permission-prompts | wbudowany | 191 | 67 | BRAK DANYCH | — |
| loop | wbudowany | 344 | 120 | BRAK DANYCH | — |
| schedule | wbudowany | 381 | 133 | BRAK DANYCH | — |
| claude-api | wbudowany | 1 082 | 378 | BRAK DANYCH | — |
| workflow-authoring | wbudowany | 252 | 88 | BRAK DANYCH | — |
| run | wbudowany | 368 | 129 | BRAK DANYCH | — |
| plugin-authoring | wbudowany | 268 | 94 | BRAK DANYCH | — |
| init | wbudowany | 67 | 23 | BRAK DANYCH | — |
| security-review | wbudowany | 90 | 31 | BRAK DANYCH | — |
| anthropic-skills:built-in-browser | synced (Anthropic) | 854 | 299 | 7 061 | 2 435 |
| anthropic-skills:chrome-browser | synced (Anthropic) | 786 | 275 | 5 881 | 2 028 |
| anthropic-skills:computer-use | synced (Anthropic) | 967 | 338 | 12 941 | 4 462 |
| anthropic-skills:deep-research | synced (Anthropic) | 604 | 211 | 13 101 | 4 518 |
| anthropic-skills:docs | synced (Anthropic) | 1 029 | 360 | 1 243 | 429 |
| anthropic-skills:docx | synced (Anthropic) | 959 | 335 | 9 296 | 3 206 |
| anthropic-skills:google-workspace | synced (Anthropic) | 991 | 347 | 16 009 | 5 520 |
| anthropic-skills:hr-bot | synced (plugin organizacji HeroDot) | 1 046 | 366 | 12 644 | 4 360 |
| anthropic-skills:import-memory | synced (Anthropic) | 173 | 60 | 10 615 | 3 660 |
| anthropic-skills:morning | synced (Anthropic) | 367 | 128 | 17 948 | 6 189 |
| anthropic-skills:pdf | synced (Anthropic) | 461 | 161 | 8 021 | 2 766 |
| anthropic-skills:pptx | synced (Anthropic) | 985 | 344 | 29 010 | 10 003 |
| anthropic-skills:skill-creator | synced (Anthropic) | 353 | 123 | 36 138 | 12 461 |
| anthropic-skills:xlsx | synced (Anthropic) | 973 | 340 | 9 718 | 3 351 |
| **Razem** | | **19 893** | **~6 960** | | |

Uwagi:
- Repozytorium **nie ma własnych skilli** (`.claude/skills/` nie istnieje, `git ls-files | grep skill` → tylko notatki bezpieczeństwa).
- `~/.agents/skills/` zawiera 43 skille (`open-mercato/skills` ×42, `vercel-labs/skills` ×1 — wg `~/.agents/.skill-lock.json`); Claude Code widzi z nich tylko 6, podlinkowane do `~/.claude/skills/`. Pozostałe 37 czytają inne agenty (Codex, Cursor) — poza zakresem tego pomiaru.
- Skille o charakterze „biurowym” (`docx`, `pptx`, `xlsx`, `pdf`, `google-workspace`, `docs`, `morning`, `hr-bot`, `computer-use`, `built-in-browser`, `chrome-browser`, `import-memory`) zajmują ~3 400 tok opisu, a w historii tego repo nie widać zadań, które by ich wymagały (zweryfikuję w kroku 5).

### Serwery MCP — kandydaci do wyłączenia (niczego nie wyłączono)

W tym projekcie **żaden serwer MCP nie może być użyty**: `permissions.deny: ["mcp__*"]` w `.claude/settings.json` blokuje wszystkie narzędzia MCP. Mimo to instrukcje serwerów i lista serwerów do autoryzacji kosztują ~2 650 tok w każdej sesji. Kandydaci:

| Serwer | Koszt w kontekście | Dlaczego kandydat |
|---|---:|---|
| claude.ai Meetings | ~790 | brak związku z kodem; narzędzia zablokowane |
| claude.ai Claude Docs | ~730 | dokumenty projektu żyją w repo (`.ai/`, `docs/`) |
| claude.ai Claude Data | ~405 | brak zapytań/artefaktów danych w projekcie |
| claude.ai Atlassian Rovo | ~230 | tracker projektu to GitHub (`agentic.config.json`: `"tracker": "github"`); endpoint v1 jest przestarzały |
| 29 serwerów „wymaga autoryzacji” (AWS ×2, Akiflow, Asana, Atlassian MCP, Attio, Box, Brevo, Canva, Context7, Figma, Fireflies, Google Calendar/Docs/Sheets/Slides, HubSpot, Intercom, Latenode, Linear, Miro, Netlify, Notion, Pocket, Sentry, Stripe, Vercel, Wicket Platform PoC, monday.com) | ~500 łącznie | nieautoryzowane i zablokowane; potencjalnie przydatne w przyszłości tylko Context7 (dokumentacja bibliotek), Figma (design) i Stripe (płatności) — ale dziś i tak zablokowane przez `mcp__*` |

Uwaga: konektory claude.ai są konfigurowane na koncie (claude.ai → Settings → Connectors), nie w repo — wyłączenie działa dla wszystkich projektów użytkownika.

## 2. AGENTS.md

**Status: zaakceptowane przez użytkownika (2026-11-22, „Akceptuję całość”) i zastosowane.** Zmienione: `AGENTS.md`, `CLAUDE.md`, `SDLC.md:9` (wskaźnik szablonu), `.ai/lessons.md:3` (nazwa sekcji). Nowe: `.ai/templates/{spec,run,lesson}.md` (treść 1:1 z usuniętych bloków). Oryginały: `docs/context-audit/backup/{AGENTS,CLAUDE,SDLC}.md.bak` oraz `HEAD` sprzed audytu (`bc64b44`). Propozycja w wersji pokazanej do akceptacji: `docs/context-audit/proposed/`.

### 2.1 Co zaproponował skill `eliminate-no-op`

Przebieg mechaniczny: `python3 scripts/analyze.py AGENTS.md --repo . --also CLAUDE.md --also .ai/lessons.md`.

| Wynik skryptu | Wartość | Komentarz |
|---|---|---|
| Linie / dyrektywy (actionable) | 227 / 103 (92) | |
| Est. tokens (skrypt) | 3 084 | estymator skryptu zaniża ~2× dla polskiego — pomiar z `usage`: ~6 490 |
| Project-noun ratio | 0,72 (66/92) | plik gęsty, w większości konkretny |
| Vague-without-project-noun | 0 | brak „pustych” ogólników |
| Najcięższe sekcje | Standardy inżynieryjne 527, Zasady obowiązkowe 476, Sposób pracy 441, Projekt 316, Lekcje 275, Specyfikacje 255 | |
| Duplikaty | 1 możliwy: `AGENTS.md:74` ↔ `.ai/lessons.md:9` (`.ai/cezar/`) | plus duplikacja całego „Skrótu” w `CLAUDE.md` (skrypt jej nie wykrył — inny język zdań) |
| „Nieistniejące” odwołania | 70 | **69 fałszywych alarmów** (parser ucina ścieżki na myślniku: `kompas-mentoring/…` → `mentoring/…`; względne `domain/`, `index.ts`). Ręcznie potwierdzony 1 martwy: `packages/core/shared/domain` → istnieje `packages/core/src/shared/domain` |

Klasyfikacja dyrektyw według testów skilla (Inversion / Ablation / Specificity / Counter-default / Recovery) — proponowane do usunięcia:

| Linie | Werdykt | Kod | Dyrektywa |
|---|---|---|---|
| 61–72 | TRIM | N12 | drzewo katalogu `.ai/` (12 linii) — te same katalogi nazywają reguły 1–6 |
| 99 | CUT | N10 | „na podstawie wskazówek zespołu Claude Code — Boris Cherny” (meta) |
| 105 | MERGE | N2/N4 | „zrób to porządnie… eleganckie rozwiązanie” — scalone z pkt 4 („od przyczyny”) |
| 107 | CUT | N7 | „Powtarzalne czynności → skill” — brak wyzwalacza i artefaktu |
| 111 | CUT | N8/N4 | „Specyfikacja opisuje co i dlaczego… źródło prawdy” — pokrywa zasada 3 |
| 115–149, 155–186, 201–217 | MOVE | — | 3 szablony (spec, run, lesson; 72 linie) → `.ai/templates/`; potrzebne tylko przy tworzeniu pliku danego typu |
| 219–227 | CUT | N4 | „Lista kontrolna” — każdy punkt powtarza zasadę 1, 2, 4, 5, 6, sposób pracy 2 lub konwencję nazw |
| `CLAUDE.md` 7–29 | MERGE | N4 | „Skrót dla Claude Code” powtarza `AGENTS.md`, który `CLAUDE.md` i tak importuje (`@AGENTS.md`) — oba ładują się w każdej sesji |

### 2.2 Przegląd linijka po linijce — „Czy bez tej linijki agent zrobiłby coś inaczej?”

| Linijka / blok | Decyzja | Uzasadnienie |
|---|---|---|
| 1 nagłówek | zostaw | tytuł |
| 3 „Ten plik obowiązuje każdego agenta… chyba że użytkownik zwolni” | skróć | lista narzędzi (Claude Code, Codex…) nic nie zmienia; reguła pierwszeństwa „użytkownik może zwolnić” zostaje (L3) |
| 7 „Kompas — koncepcja i klikalne mockupy portalu” | skróć | opis nieaktualny (projekt jest już aplikacją) — zostają wskaźniki do koncepcji |
| 9–10 mockupy + komenda | skróć (kandydat: przenieś) | mockupy nie zmieniane od 2026-11-10; potrzebne tylko przy zadaniu na mockupach → routing (krok 4) |
| 11–18 struktura monorepo (blok kodu) | skróć | ta sama informacja w jednym punkcie; poprawiona ścieżka `src/shared/domain` |
| 20 weryfikacja aplikacji | zostaw | dokładne komendy (L2), potrzebne przy każdej zmianie kodu |
| 21 komendy design systemu | przenieś | tylko przy zadaniach UI; wszystkie są już w `docs/design-system.md` (l. 125–154) |
| 22 „agent budujący ekran czyta `docs/design-system.md`” | zostaw | trasa do kontekstu UI (wchłania l. 21) |
| 26 standardy, ADR, SDLC, CODE_REVIEW, BC | zostaw | wskaźniki + reguła „odejście wymaga wpisu” (L3) |
| 28–34 reguły modułów | zostaw (kandydat: przenieś) | wymuszane lintem (N6), ale znajomość z góry zapobiega złemu projektowi; potrzebne tylko przy pracy w `packages/core` / `apps` → routing |
| 30 `packages/core/shared/domain` | skróć/popraw | martwa ścieżka (N5) → `packages/core/src/shared/domain` |
| 36 pieniądze i czas | zostaw | L1/L4 (bigint zamiast number, zakaz `Date.now` w domenie) — model domyślnie robi odwrotnie |
| 38 język i commity | zostaw | L1: kod po angielsku, UI po polsku; zakres commita = moduł (commitlint nie wymusza zakresu) |
| 40–57 słownik domeny | zostaw (kandydat: przenieś) | nazwy, których model nie zgadnie (L2); niepotrzebne przy zadaniach DS / docs / proces → routing |
| 59–72 drzewo `.ai/` | skróć | do jednej linii (N12) |
| 74 `.ai/cezar/` | zostaw | L6 (granica zakresu); duplikat w `lessons.md:9` do usunięcia po stronie lekcji (poza zakresem tej zmiany) |
| 76–84 konwencja nazw | skróć | reguły zostają (bieżąca data — L1, sufiks, `git mv`, wyjątki), wylatują przykłady |
| 88 zasada 1 (lessons na start) | zostaw | proces projektu |
| 89 zasada 2 (spec przed kodem + definicja „nietrywialnej”) | zostaw | próg z definicją — wysoka wartość |
| 90–91 zasady 3–4 | zostaw | cykl życia spec |
| 92 zasada 5 (log runu) | zostaw | definicja „autonomiczny” jest potrzebna |
| 93 zasada 6 (lekcje) | zostaw + scal | wchłania „Korekta = reguła” (l. 103) |
| 94 zasada 7 (sekrety) | zostaw | L4 |
| 95 zasada 8 | zostaw | krótka, konkretna |
| 99 „Boris Cherny” | usuń | N10 |
| 101 plan | skróć | „(zasada 3)” zbędne; reszta zostaje |
| 102 weryfikacja | skróć | odniesienie do mockupów usunięte; „nie raportuj sukcesu bez wyniku komend” zostaje (L1, lekcja 2026-11-21) |
| 103 korekta = reguła | scal | z zasadą 6 |
| 104 błędy od przyczyny | zostaw | L1 (agenci dopytują zamiast naprawiać) |
| 105 „zrób porządnie” | scal | z pkt 104 |
| 106 sub-agenci | skróć | druga część (rozłączny zakres) to L6 |
| 107 „→ skill” | usuń | N7 |
| 111 „co i dlaczego” | usuń | N8, pokrywa zasada 3 |
| 113 cykl życia spec + „zostaw draft i poproś o akceptację” | zostaw | L6 (punkt zatrzymania) |
| 115–149 szablon specyfikacji | przenieś | → `.ai/templates/spec.md`; ładowany tylko przy tworzeniu spec |
| 153 cel logu | zostaw | 1 zdanie |
| 155–186 szablon runu | przenieś | → `.ai/templates/run.md` |
| 190–195 zasady lekcji | skróć | treść zostaje, 4 punkty → 3 |
| 197–199 format punktu | zostaw | wzorzec linii (1 linia) |
| 201–217 szablon lekcji | przenieś | → `.ai/templates/lesson.md` |
| 219–227 lista kontrolna | usuń | N4 — w całości duplikat zasad |

Konsekwencja poza `AGENTS.md`: `SDLC.md:9` mówi „szablon w `AGENTS.md`” — przy akceptacji zmienić na „szablon w `.ai/templates/spec.md`” (1 linia).

### 2.3 Rozmiar

| | Przed | Po | Δ |
|---|---:|---:|---:|
| `AGENTS.md` linie | 227 | 96 | −131 (−58%) |
| `AGENTS.md` znaki | 12 682 | 8 347 | −4 335 (−34%) |
| `AGENTS.md` tokeny | ~6 490 (zmierzone) | **~4 310 (zmierzone, przyrost `usage`)** | **~−2 180 (−34%)** |
| `CLAUDE.md` tokeny | ~925 (szac.) | ~150 (szac.) | ~−775 |
| Razem instrukcje w każdej sesji | ~7 450 | ~4 460 | **~−3 000 (−40%)** |
| Szablony (ładowane na żądanie) | — | 1 358 zn. (~700 tok) | poza kontekstem startowym |

Linie spadają mocniej niż znaki (−58% vs −34%), bo usuwane są głównie bloki szablonów i drzewo katalogów. Wynik powyżej progu 40% z instrukcji skilla — to nie jest agresywne cięcie, tylko przeniesienie szablonów i duplikatów.

## 3. Skille

**Własnych skilli: brak** (potwierdzone przez użytkownika 2026-11-22). Repozytorium nie ma `.claude/skills/` ani innych plików `SKILL.md`. Dlatego **żadnych zmian w skillach nie proponuję ani nie wprowadzam**.

| skill | tokeny opisu | tokeny treści | opis mówi „kiedy”? (T/N) | rekomendacja |
|---|---:|---:|:-:|---|
| — (brak własnych skilli) | — | — | — | — |

### Pominięte (nie są własne)

| Grupa | Skille | Opis (tok) | Powód pominięcia |
|---|---|---:|---|
| Kurs (`open-mercato/skills`, wg `~/.agents/.skill-lock.json`) | om-create-skill, om-setup-agent-pipeline, om-synthetic-users, om-ux-review-pr, om-ux-setup, om-ux-shape | ~820 | skille z kursu |
| Synchronizowane z claude.ai (Anthropic) | built-in-browser, chrome-browser, computer-use, deep-research, docs, docx, google-workspace, import-memory, morning, pdf, pptx, skill-creator, xlsx | ~3 180 | autor: Anthropic; lokalna edycja zostałaby nadpisana przy synchronizacji |
| Plugin organizacji | hr-bot | ~366 | skill firmy HeroDot, nie projektu |
| Plugin Anthropic | cowork-plugin-customizer, create-cowork-plugin | ~250 | autor: Anthropic |
| Wbudowane Claude Code | dataviz, update-config, keybindings-help, code-review, simplify, fewer-permission-prompts, loop, schedule, claude-api, workflow-authoring, run, plugin-authoring, init, security-review | ~2 170 | część binarki, nie do edycji |

### Obserwacje (informacyjnie, bez zmian)

- **Kontekst, nie treść, jest problemem.** Opisy 36 skilli kosztują ~6 960 tok w każdej sesji, a żaden z nich nie jest specyficzny dla Kompasu. Skille „biurowe” i desktopowe (`docx`, `pptx`, `xlsx`, `pdf`, `google-workspace`, `docs`, `morning`, `hr-bot`, `computer-use`, `built-in-browser`, `chrome-browser`, `import-memory`, `cowork-*`, ~3 700 tok) można wyłączyć na koncie claude.ai (Settings → Capabilities/Skills). Działa to dla wszystkich projektów, więc decyzja należy do użytkownika — ujęte w kroku 5.
- Opisy bez wyraźnego „kiedy”: `init`, `security-review`, `import-memory`, `om-ux-review-pr`, `om-ux-setup` — nie do poprawienia lokalnie (nie są własne).
- Treść > ~5 000 tok: `skill-creator` (~12 460), `pptx` (~10 000), `om-setup-agent-pipeline` (~7 030), `om-synthetic-users` (~6 230), `morning` (~6 190), `google-workspace` (~5 520). Ładują się tylko po wywołaniu, więc nie wpływają na kontekst startowy.
- Duplikaty z `AGENTS.md`: nie znaleziono — skille kursu odwołują się do `.ai/agentic.config.json` i `SDLC.md`, a nie powtarzają reguł projektu.
- Możliwy kierunek na przyszłość (zasada „Powtarzalne czynności → skill” została usunięta z `AGENTS.md` w kroku 2): pierwszy własny skill mógłby powstać z treści wyniesionych w kroku 4 (np. „praca w module domenowym”), jeśli routing się nie sprawdzi.

## 4. Routing

### 4.1 Ocena przed uruchomieniem skilla: **niepotrzebny** (jako optymalizacja kontekstu)

- Po kroku 2 root `AGENTS.md` ma 96 linii i ~4 310 tok — mieści się w budżecie skilla (≤ 150 linii). Treść zależna od typu zadania to niewiele: reguły modułów + pieniądze/czas (~550 tok), słownik domeny (~430 tok), dwie linijki o design systemie i mockupach.
- Największe koszty kontekstu startowego leżą poza repo: prompt systemowy i narzędzia (~22 700), lista skilli (~6 960), MCP (~2 650). Routing ich nie dotyka.
- Projekt ma realne obszary (domena w `packages/core` z modułami `identity`/`scheduling`, UI w `packages/ui`, prototypy, e2e), więc routing ma sens **organizacyjny** — mówi agentowi, gdzie szukać. Zysk tokenowy przewidywałem jednak bliski zera.

### 4.2 Jak skill `task-router` rozmapował projekt

Discover → Split → Route → Check, zgodnie ze skillem:

| Obszar / zadanie | Trasa (plik) |
|---|---|
| Naprawa błędu | `.ai/lessons.md` („Błędy i ich przyczyny”), `SDLC.md` |
| Nowa funkcja / ekran | `.ai/specs/product-brief.md`, `.ai/specs/backlog.md`, `.ai/templates/spec.md`, spec stacku |
| Refaktor | `packages/core/AGENTS.md`, `BACKWARD_COMPATIBILITY.md` |
| Przegląd kodu / PR | `CODE_REVIEW.md`, `.ai/agentic.config.json` |
| `packages/core` + importy z `apps/*` | `packages/core/AGENTS.md` |
| Moduły `identity`, `scheduling` | istniejące `packages/core/src/modules/{identity,scheduling}/AGENTS.md` |
| Nazwy domenowe, teksty UI, specyfikacje | `docs/domain-glossary.md`, `apps/web/messages/pl.json` |
| UI / design system | `docs/design-system.md` |
| ADR | `docs/decisions/README.md` |
| E2E | `apps/web/e2e/support.ts`, `.ai/lessons.md` („Kod i mockupy”) |
| Prototypy | `prototypes/kompas-flow/README.md` |
| Stare mockupy | `kompas-mentoring/mockupy/AGENTS.md` |
| Sekrety, uprawnienia agenta | `security-notes.md` |

Przeniesione z roota (przeniesione, nie skopiowane): reguły modułów i „Pieniądze i czas” → `packages/core/AGENTS.md`; słownik domeny → `docs/domain-glossary.md`; mockupy (komenda + `npm run dev`) → `kompas-mentoring/mockupy/AGENTS.md`; punkt o design systemie → wiersz routera. W roocie zostały reguły ogólne: projekt, komendy weryfikacji, standardy, język, `.ai/`, zasady obowiązkowe, sposób pracy. Nowa reguła dodana przez router: „`AGENTS.md` w katalogu, w którym pracujesz, ma pierwszeństwo w swoim zakresie”.

Luki (brak dokumentu → brak wiersza): `apps/worker` (brak opisu kolejek pg-boss / outbox poza ADR 0002), `packages/contracts` (zdarzenia, oRPC), migracje bazy (wskazówki rozproszone po lekcjach), CI (`.github/workflows/ci.yml` bez opisu dla agentów).

**Znalezisko uboczne (ważne):** istniejące `packages/core/src/modules/identity/AGENTS.md` i `…/scheduling/AGENTS.md` **nie były nigdy ładowane przez Claude Code** — Claude Code wczytuje w podkatalogach tylko `CLAUDE.md`, a obok tych plików go nie było. Skill dodaje `CLAUDE.md` z `@AGENTS.md` obok każdego `AGENTS.md`; skrypt sprawdzający to wymusza.

### 4.3 Utworzone i zmienione pliki

| Ścieżka | Opis |
|---|---|
| `AGENTS.md` | zmieniony: sekcja „Router zadań” (14 tras); usunięte bloki przeniesione niżej |
| `packages/core/AGENTS.md` | nowy: reguły modułów, pieniądze i czas (13 linii) |
| `packages/core/CLAUDE.md` | nowy: `@AGENTS.md` |
| `packages/core/src/modules/identity/CLAUDE.md` | nowy: `@AGENTS.md` (luka opisana wyżej) |
| `packages/core/src/modules/scheduling/CLAUDE.md` | nowy: `@AGENTS.md` (j.w.) |
| `docs/domain-glossary.md` | nowy: słownik PL ↔ EN (20 linii) |
| `kompas-mentoring/mockupy/AGENTS.md` | nowy: komendy mockupów (5 linii) |
| `kompas-mentoring/mockupy/CLAUDE.md` | nowy: `@AGENTS.md` |
| `scripts/check-task-router.mjs` | nowy: sprawdza, że każda trasa istnieje, budżety (root ≤ 150, jednostka ≤ 120 linii) i `CLAUDE.md` obok każdego `AGENTS.md`; bez zależności |
| `package.json` | dodany skrypt `agents:check-router` |

Weryfikacja: `node scripts/check-task-router.mjs` → `✓ task router: 22 routed paths exist, instruction files within budget` (kod 0); test negatywny (trasa `docs/nope.md`) → kod 1 z komunikatem. `biome check scripts/check-task-router.mjs package.json` → 0 błędów (po `--write`, sam format). `pnpm lint` w całości: **BRAK DANYCH** — `pnpm install` w sandboxie przerwał się na `EPERM` (zapis plików `.vscode/` zależności), więc ESLint/knip nie zostały uruchomione.

### 4.4 Wpływ na kontekst startowy

| | Po kroku 2 | Po routingu | Δ |
|---|---:|---:|---:|
| Root `AGENTS.md` | 96 linii / ~4 310 tok | 86 linii / **~4 260 tok** (zmierzone) | **~−50 tok (~−1%)** |
| Ładowane na żądanie | — | `packages/core/AGENTS.md` ~550, `docs/domain-glossary.md` ~430, mockupy ~160 | tylko przy pracy w danym obszarze |
| Moduły `identity`/`scheduling` | 0 (nieładowane — luka) | ~1 100 / ~780 tok przy pracy w module | **wzrost** w tych zadaniach, ale to treść, która miała się ładować od początku |

Pomiar potwierdził ocenę z 4.1: tabela routingu (~1 000 znaków ścieżek) zajęła prawie tyle samo, ile zwolniło przeniesienie treści.

### 4.5 Decyzja do podjęcia przez użytkownika

Ponieważ moja ocena to „niepotrzebny”, zmiany są przygotowane jako **dwa osobne commity**:

1. `fix(context): load module AGENTS.md in Claude Code` — tylko `packages/core/src/modules/{identity,scheduling}/CLAUDE.md`. **Rekomenduję zostawić niezależnie od decyzji o routingu.**
2. `refactor(context): split AGENTS.md into a task router` — reszta tabeli 4.3. Wycofanie: `git revert <sha>`.

Rekomendacja: router zostawić, jeśli liczysz na wartość organizacyjną (agent szybciej trafia do `docs/design-system.md`, `CODE_REVIEW.md`, modułów); wycofać, jeśli celem był wyłącznie mniejszy kontekst — tu zysku nie ma.

## 5. Context Scope

**Źródło:** indeks Context Scope `~/.contextscope/index/v1` (estymator `chars-v2`, kalibracja `cal-2026-10-07a`, ostatni przebieg 2026-11-22 15:58) — 80 sesji z katalogów `kompas_mentoring` (2026-10-20 → 2026-11-22), z czego **17 to prawdziwe sesje robocze**, a 60 to jednorazowe wywołania pomocnicze (Haiku, 1–2 żądania, ~23 tys. tok każde; 3 puste). Uzupełniająco: 82 transkrypty `~/.claude/projects/-Users-adrianczyrek-cezar-projects-kompas-mentoring*/*.jsonl` (liczenie wywołań narzędzi). Tokeny Context Scope są szacunkami estymatora; wartości „zmierzone” pochodzą z kroku 1.

### Liczby zbiorcze

| Metryka | Wartość |
|---|---|
| Kontekst startowy (1. żądanie, 17 sesji roboczych) | mediana **39 538 tok** (min 33 442, max 65 707); z tego prompt systemowy ~17 300, lista skilli ~10 000, instrukcje ~7 300, lista agentów ~1 500 |
| Kompakcje | **1** (sesja `d24e11ee`, 2026-10-20) |
| Wywołania narzędzi (82 transkrypty) | Bash 1 481 (19 sesji), Write 207, Read 160, Edit 68, Grep 11, Agent 8, ToolSearch 1 |
| Wywołania skilli (`Skill`) | **0** |
| Wywołania narzędzi MCP | **0** |
| Bash użyty do zapisu plików (heredoc, `sed -i`, zapis z Pythona) | 605 z 1 481 (41%) |
| Najwięcej okna (suma bloków) | załączniki 1,82 mln · argumenty narzędzi 1,60 mln · wyniki Bash 1,49 mln · odczyty plików 0,63 mln |

### Kluczowe znaleziska

| # | Znalezisko | Dowód | Szacowany zysk | Nakład | Tag |
|---|---|---|---|---|---|
| 1 | **Skille ładowane, a nieużywane.** Lista 36 skilli jest w każdej sesji, a w 82 transkryptach nie ma ani jednego wywołania `Skill`. | `skill_listing` mediana 10 011 tok (Context Scope) / ~6 960 tok (zmierzone, krok 1); 0 wywołań | **~3 700 tok/sesję** (~9% startu) po wyłączeniu skilli „biurowych” i desktopowych na koncie claude.ai; więcej, jeśli wyłączyć też om-* w `~/.claude/skills` | S | `[WDROŻYĆ W PRZYSZŁYM TYGODNIU]` |
| 2 | **MCP ładowane, a niemożliwe do użycia.** `mcp__*` jest zabronione w `.claude/settings.json`, 0 wywołań, a instrukcje 4 konektorów i lista 29 nieautoryzowanych serwerów trafiają do kontekstu. | `mcp_instructions_delta` 1,57 mln tok-żądań łącznie; krok 1: ~2 650 tok/sesję | **~2 650 tok/sesję** (~6%) | S | `[WDROŻYĆ W PRZYSZŁYM TYGODNIU]` |
| 3 | **`.ai/lessons.md` czytany w całości na starcie każdego zadania** (zasada 1), a rośnie (70 linii, 15 821 znaków; 23 zmiany w listopadzie). Większość lekcji dotyczy jednego obszaru (Storybook, Better Auth, e2e, prototypy). | odczytany w 6 sesjach; ~8 100 tok przy zmierzonym współczynniku 1,95 zn./tok (Context Scope: ~3 900) | **~4 000–5 000 tok/zadanie** po podziale na „Proces” (zawsze) + pliki obszarowe podpinane w routerze z kroku 4 | S–M | `[WDROŻYĆ W PRZYSZŁYM TYGODNIU]` |
| 4 | **Duże specyfikacje czytane w całości, wielokrotnie.** `.ai/specs/…auth-uprawnienia…` czytana 4× w jednej sesji (69 041 tok), spec stacku 2× (30 003 tok), `KONCEPCJA.md` 3× (25 635 tok). Najczęstsze reguły Context Scope: B-01 „Fat tool result” (18× w 13 sesjach), B-02 „Repeated fat results” (11× w 8 sesjach), B-03 „Huge file read” (5 sesji). | findings B-01/B-02/B-03 | **20 000–60 000 tok** w sesji pracującej na specyfikacji | S (reguła: najpierw `Grep` po nagłówku, potem `Read` z `offset/limit`; spis treści na górze dużych spec) | `[WDROŻYĆ W PRZYSZŁYM TYGODNIU]` |
| 5 | **Argumenty narzędzi dominują okno.** W 3 długich sesjach argumenty Write/Bash to 36–47% kontekstu w szczycie (np. `Bash card.mdx` 14 589 tok, `Write POSTEP.md` 4 958 tok). 41% wywołań Bash zapisuje pliki (heredoc / `sed -i`) zamiast `Edit`. | B-17 (3 sesje) | do **30–40% szczytu** w długich sesjach | S (reguła), ale wymaga sprawdzenia, czy zmienia zachowanie | `[PÓŹNIEJ]` |
| 6 | **Za długie sesje i jedyna kompakcja.** Sesja `d24e11ee` (2026-10-20): 639 żądań, 250,7 mln tok przetworzonych, szczyt 966 846 tok (97% okna 1M), 84 żądania powyżej 80% okna, 1 kompakcja. Jeszcze 3 sesje oznaczone „Session too long” (60–176 żądań). Przyczyna: jedno zadanie obejmowało całą migrację (szkielet monorepo + przeniesienie ekranów). | B-08, B-13 | ~50% przetworzonych tokenów w takich zadaniach | M (jedno zadanie = jedna sesja, handoff cezar) | `[PÓŹNIEJ]` |
| 7 | **Grube raporty sub-agentów i podwójne odczyty.** Raporty Explore/general-purpose 5 594–8 870 tok; sub-agenci ponownie czytają `.ai/lessons.md`, `KONCEPCJA.md` przeczytane już przez rodzica (20 773 tok zduplikowane). | B-05 (3×), B-06, B-15 | ~5 000–8 000 tok na delegację | S (w prompcie: „zwróć tylko wnioski, ≤ 1 000 tok”) | `[PÓŹNIEJ]` |
| 8 | **Odczyty plików generowanych / legacy.** Typy z `node_modules/.pnpm/@better-auth…/init-options.d.mts` (28 582 tok), `packages/app/src/legacy/screens/*.ts` (25 882 tok, 3×). | top odczytów | 10 000–30 000 tok w sesji | S (najpierw `Grep`) | `[PÓŹNIEJ]` |
| 9 | **Wywołania pomocnicze cezar niosą pełny kontekst projektu.** 60 jednorazowych wywołań Haiku po ~23 400 tok (głównie prompt systemowy + lista skilli + instrukcje). | 60 sesji, łącznie ~1,4 mln tok | znika razem z pkt 1–2 (lista skilli i MCP) | L (konfiguracja cezar, poza repo) | `[PÓŹNIEJ]` |
| 10 | **Zagnieżdżone `AGENTS.md` modułów nigdy nie były ładowane** przez Claude Code (brak `CLAUDE.md` obok). Naprawione w kroku 4. | krok 4.2 | jakość, nie tokeny (+~1 000 tok przy pracy w module) | S | wdrożone |
