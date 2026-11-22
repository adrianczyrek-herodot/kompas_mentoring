# AGENTS.md — instrukcje dla agentów AI

Obowiązuje każdego agenta AI w tym repozytorium. Zasady **MUSISZ** są obowiązkowe także przy drobnych zadaniach, chyba że użytkownik wprost zwolni Cię z nich w bieżącym zadaniu.

## Projekt

Kompas — portal mentoringu 1:1. Koncepcja: `kompas-mentoring/README.md`, `kompas-mentoring/KONCEPCJA.md`.

- Monorepo pnpm + Turborepo (struktura wg §2.2 spec stacku): `apps/web` (Next.js 16), `apps/worker` (pg-boss); `packages/core` (moduły domenowe w `src/modules/*`, DI, `src/shared/domain`), `contracts` (zod, oRPC, zdarzenia), `ui`, `testing` (FakeClock, fake'i portów), `config`; `docs/decisions` (ADR).
- Weryfikacja aplikacji: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`. Lokalnie: `docker compose up -d`, `pnpm db:migrate`, `pnpm db:seed`.

## Standardy inżynieryjne

Wiążące dla każdej specyfikacji funkcjonalnej: `.ai/specs/2026-10-21-tech-stack-i-standardy-inzynieryjne.md` i ADR w [`docs/decisions/`](docs/decisions/README.md). Proces: [`SDLC.md`](SDLC.md), przegląd: [`CODE_REVIEW.md`](CODE_REVIEW.md), kontrakty: [`BACKWARD_COMPATIBILITY.md`](BACKWARD_COMPATIBILITY.md). Odejście od stacku lub wzorców wymaga wpisu w „Decyzje i zmiany” specyfikacji (i ADR).

**Język:** kod, identyfikatory, komentarze, commity i nazwy plików po angielsku; UI, specyfikacje, ADR i `AGENTS.md` po polsku; teksty UI tylko w `messages/pl.json`. Commity: Conventional Commits z zakresem = moduł (`feat(booking): …`).

## Router zadań — co przeczytać przed pracą

Wczytuj tylko wiersze pasujące do zadania. Plik `AGENTS.md` w katalogu, w którym pracujesz, ma pierwszeństwo w swoim zakresie.

| Zadanie | Przeczytaj |
|---|---|
| Naprawa błędu | `.ai/lessons.md` (sekcja „Błędy i ich przyczyny”), `SDLC.md` |
| Nowa funkcja / ekran | `.ai/specs/product-brief.md`, `.ai/specs/backlog.md`, `.ai/templates/spec.md`, `.ai/specs/2026-10-21-tech-stack-i-standardy-inzynieryjne.md` |
| Refaktor | `packages/core/AGENTS.md`, `BACKWARD_COMPATIBILITY.md` |
| Przegląd kodu / PR | `CODE_REVIEW.md`, `.ai/agentic.config.json` (ścieżki wymagające przeglądu człowieka) |
| Kod w `packages/core` lub importy z `apps/web`, `apps/worker` | `packages/core/AGENTS.md` |
| Moduł `identity` | `packages/core/src/modules/identity/AGENTS.md` |
| Moduł `scheduling` (i wzorzec nowego modułu) | `packages/core/src/modules/scheduling/AGENTS.md` |
| Nazwy domenowe, teksty UI, specyfikacja | `docs/domain-glossary.md`, `apps/web/messages/pl.json` |
| UI, nowy ekran, design system (`packages/ui`) | `docs/design-system.md` |
| Decyzja architektoniczna / odejście od stacku | `docs/decisions/README.md` |
| Testy e2e (`apps/web/e2e`) | `apps/web/e2e/support.ts`, `.ai/lessons.md` (sekcja „Kod i mockupy”) |
| Prototyp (`prototypes/`) | `prototypes/kompas-flow/README.md` |
| Stare mockupy | `kompas-mentoring/mockupy/AGENTS.md` |
| Sekrety, uprawnienia agenta | `security-notes.md` |

## Katalog `.ai/`

`specs/` (aktywne; `implemented/`, `archive/`), `runs/` (logi przebiegów), `lessons.md` (indeks wniosków), `lessons/` (szczegóły), `templates/` (szablony plików). `.ai/cezar/` to katalog roboczy narzędzia cezar — nie należy do tej struktury, nie zapisuj tam niczego i nie commituj go.

**Nazwy plików** w `specs/`, `runs/`, `lessons/` **MUSZĄ** mieć postać `YYYY-MM-DD-slug.md`:

- `YYYY-MM-DD` — data utworzenia pliku (bieżąca, nie z treści zadania).
- `slug` — kebab-case: małe litery ASCII, cyfry i myślniki, bez polskich znaków, maks. ~6 słów.
- Nazwa zajęta → sufiks `-2`. Przy przenoszeniu (np. do `implemented/`) nazwa się nie zmienia — `git mv`.
- Wyjątek: dokumenty żyjące `.ai/specs/product-brief.md` i `.ai/specs/backlog.md` mają stałe nazwy i nie są przenoszone (zasady backlogu: `SDLC.md` §2a).

## Zasady obowiązkowe

1. **Na początku każdego zadania MUSISZ przeczytać `.ai/lessons.md`** i otworzyć pliki z `.ai/lessons/`, które dotyczą Twojego zadania. Stosuj zapisane tam wnioski.
2. **Przed implementacją nietrywialnej zmiany MUSISZ mieć specyfikację w `.ai/specs/`.** Sprawdź, czy pasująca już istnieje; jeśli nie — utwórz ją (szablon `.ai/templates/spec.md`) i dopiero potem pisz kod. Nietrywialna zmiana to nowa funkcja, nowy ekran, zmiana reguł domenowych, modelu danych lub przepływu, refaktor obejmujący kilka plików. Literówki, drobne poprawki stylów i jednolinijkowe fixy specyfikacji nie wymagają.
3. **Implementuj zgodnie ze specyfikacją.** Jeśli trzeba od niej odejść, najpierw zaktualizuj specyfikację („Decyzje i zmiany”), potem kod.
4. **Po pełnym wdrożeniu specyfikacji MUSISZ** ustawić `status: implemented`, uzupełnić `implemented:` (data) i przenieść plik przez `git mv` do `.ai/specs/implemented/`. Specyfikację porzuconą lub zastąpioną ustaw na `status: archived` (podaj powód / następcę) i przenieś do `.ai/specs/archive/`.
5. **Każdy autonomiczny przebieg MUSI mieć log w `.ai/runs/`** (szablon `.ai/templates/run.md`). Przebieg autonomiczny to praca bez bieżącego nadzoru człowieka: zadanie w tle, przez orkiestrator (np. cezar), automatyzację, CI, sub-agenta lub pętlę. Utwórz log **na początku**, uzupełniaj na bieżąco i zamknij podsumowaniem — także gdy przebieg się nie powiódł.
6. **Po naprawieniu błędu MUSISZ zapisać wniosek** w `.ai/lessons.md` (i ewentualnie w `.ai/lessons/`), jeśli przyczyna nie była oczywista, mogłaby się powtórzyć albo kosztowała dużo czasu. To samo dotyczy ustaleń wartych pamięci: decyzji i korekt użytkownika, pułapek narzędzi, konwencji niewynikających z kodu. Korekta dotycząca procesu wszystkich agentów → zaproponuj zmianę w `AGENTS.md`.
7. **Nie zapisuj sekretów** (tokenów, haseł, danych osobowych) w żadnym pliku w `.ai/`.
8. Pliki w `.ai/` commituj razem ze zmianą, której dotyczą.

## Sposób pracy

1. **Najpierw plan, potem kod.** Złożone zadanie zaczynaj od planu (w Claude Code — tryb planowania) i zapisz go w specyfikacji („Projekt rozwiązania”, „Plan wdrożenia”) tak dokładnie, żeby implementacja przeszła za jednym podejściem. Gdy coś idzie nie tak, zatrzymaj się i przeplanuj. Przy dużej zmianie poproś sub-agenta o krytyczny przegląd planu.
2. **Weryfikuj, zanim ogłosisz koniec.** Uruchom sprawdzenie z sekcji „Projekt”, przejdź zmieniony przepływ w przeglądarce i odhacz kryteria akceptacji specyfikacji. Nie raportuj sukcesu bez wyniku komend — jeśli czegoś nie dało się sprawdzić, napisz to wprost.
3. **Błędy naprawiaj samodzielnie, od przyczyny.** Zgłoszony błąd albo czerwony typecheck/build to wystarczające polecenie: odtwórz, znajdź przyczynę, napraw, zweryfikuj — nie dopytuj o to, co da się ustalić z kodu. Fix, który wyszedł obejściem lub przypadkiem specjalnym, zastąp rozwiązaniem u źródła.
4. **Praca równoległa.** Szerokie przeszukiwanie i przeglądy zlecaj sub-agentom. Równoległe sesje (osobne worktree, np. cezar) tylko dla zadań niezależnych, o rozłącznym zakresie plików.

## Specyfikacje

Cykl życia: `draft` → `approved` → `in-progress` → `implemented` (przeniesienie do `implemented/`) albo `archived` (przeniesienie do `archive/`). Specyfikację tworzoną przez agenta zostaw jako `draft` i poproś użytkownika o akceptację, chyba że zadanie wprost pozwala działać bez niej. Szablon: `.ai/templates/spec.md`.

## Runy

Jeden plik na przebieg; log ma pozwolić człowiekowi lub kolejnemu agentowi zrozumieć, co się stało, bez czytania transkryptu. Szablon: `.ai/templates/run.md`.

## Lekcje

- `.ai/lessons.md` — jedyne miejsce czytane przez każdego agenta na starcie. Jedna lekcja = jeden punkt (1–3 zdania), pogrupowane tematycznie, z datą. Dłuższy opis → `.ai/lessons/YYYY-MM-DD-slug.md` (szablon `.ai/templates/lesson.md`) i punkt z linkiem.
- Przed dopisaniem sprawdź, czy podobna lekcja istnieje — aktualizuj zamiast dublować; błędne lub nieaktualne usuń albo popraw.
- Zapisuj to, czego **nie da się** łatwo odczytać z kodu ani historii gita. Nie zapisuj streszczeń wykonanej pracy — od tego są runy.

Format punktu:

```markdown
- **YYYY-MM-DD** — <wniosek: co robić / czego unikać i dlaczego>. Szczegóły: [lessons/YYYY-MM-DD-slug.md](lessons/YYYY-MM-DD-slug.md)
```
