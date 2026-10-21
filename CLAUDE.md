# CLAUDE.md

Pełne, wiążące instrukcje dla agentów są w `AGENTS.md` — importowane poniżej. W razie rozbieżności rozstrzyga `AGENTS.md`.

@AGENTS.md

## Skrót dla Claude Code

Struktura `.ai/` (szczegóły i szablony w `AGENTS.md`):

| Ścieżka | Przeznaczenie |
|---|---|
| `.ai/specs/YYYY-MM-DD-slug.md` | Aktywne specyfikacje SDD |
| `.ai/specs/implemented/` | Specyfikacje wdrożone (przenoszone przez `git mv`) |
| `.ai/specs/archive/` | Specyfikacje porzucone lub zastąpione |
| `.ai/runs/YYYY-MM-DD-slug.md` | Logi autonomicznych przebiegów AI |
| `.ai/lessons.md` | Indeks krótkich wniosków — czytany na starcie każdego zadania |
| `.ai/lessons/YYYY-MM-DD-slug.md` | Szczegółowe wnioski |

Obowiązkowo:

1. Zacznij każde zadanie od przeczytania `.ai/lessons.md`.
2. Nietrywialna zmiana → najpierw specyfikacja w `.ai/specs/`, potem kod. Po wdrożeniu: `status: implemented` i `git mv` do `.ai/specs/implemented/`.
3. Praca autonomiczna (cezar, sub-agent, tło, automatyzacja, `/loop`) → log w `.ai/runs/` założony na starcie i zamknięty podsumowaniem na końcu.
4. Po naprawieniu nieoczywistego błędu lub przy ustaleniu wartym zapamiętania → wpis w `.ai/lessons.md` (szczegóły w `.ai/lessons/`).
5. Wnioski dotyczące **projektu** zapisuj w `.ai/lessons.md`, a nie (tylko) w prywatnej pamięci Claude Code — `.ai/` jest współdzielone z innymi agentami i ludźmi.
6. Nazwy plików: `YYYY-MM-DD-slug.md`, slug w kebab-case bez polskich znaków.
7. Złożone zadanie → tryb planowania i plan w specyfikacji; przed raportem weryfikacja zmian; korekta od użytkownika → reguła w `.ai/lessons.md`. Szczegóły: `AGENTS.md` → „Sposób pracy”.
8. Standardy i proces: `docs/decisions/` (ADR), `SDLC.md`, `CODE_REVIEW.md`, `BACKWARD_COMPATIBILITY.md`, `.ai/agentic.config.json` — zob. `AGENTS.md` → „Standardy inżynieryjne”.
