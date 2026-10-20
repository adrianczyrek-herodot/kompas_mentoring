# AGENTS.md — instrukcje dla agentów AI

Ten plik obowiązuje **każdego** agenta AI pracującego w tym repozytorium (Claude Code, Codex, Cursor, Copilot, OpenCode i inne). Zasady oznaczone jako **MUSISZ** są obowiązkowe — nie pomijaj ich, nawet przy drobnych zadaniach, chyba że użytkownik wprost zwolni Cię z nich w bieżącym zadaniu.

## Projekt

**DevMentor** — aplikacja portalu mentoringu 1:1, monorepo w `packages/`. Opis architektury: `README.md`.

- Koncepcja produktu i klikalne mockupy (punkt odniesienia dla ekranów i reguł domenowych): `kompas-mentoring/README.md`, `kompas-mentoring/KONCEPCJA.md`, `kompas-mentoring/mockupy/` (osobny projekt, nie należy do workspace'ów).
- Sprawdzenie zmian w aplikacji (z korzenia repo): `npm run typecheck && npm run build`.
- Sprawdzenie zmian w mockupach: `cd kompas-mentoring/mockupy && npm run typecheck && npm run build`.

## Stos technologiczny i architektura DevMentor

Założenia są wiążące. Odejście od nich (nowa biblioteka zastępująca element stosu, nowy pakiet, zmiana kierunku zależności) wymaga decyzji użytkownika i specyfikacji w `.ai/specs/`.

### Stos

| Obszar | Technologia | Uwagi |
|---|---|---|
| Framework | **Next.js** (najnowsza stabilna, App Router, Turbopack) | Bez Pages Routera. Server Components domyślnie, `"use client"` tylko tam, gdzie potrzebna interakcja. |
| Język | **TypeScript** (najnowsza stabilna), tryb `strict` | Bez `any` i `@ts-ignore` bez uzasadnienia w komentarzu. Wspólne ustawienia w `tsconfig.base.json`. |
| UI | **React** (najnowsza stabilna) | Komponenty funkcyjne. |
| Baza danych | **PostgreSQL** | Lokalnie: `docker compose up -d` (`compose.yaml`). |
| ORM | **MikroORM** (`@mikro-orm/postgresql`) | Migracje, pula połączeń, Unit of Work. Encje przez `defineEntity` + `setClass` — **bez dekoratorów** i `reflect-metadata`. |
| DI | **Awilix** | Tryb `PROXY` + `strict` (`createContainer()` z `@devmentor/core`). |
| Style — strony frontendowe | **Tailwind CSS** (v4) | Strony publiczne: czysty Tailwind + `@devmentor/ui/frontend`. |
| Style — strony backendowe | **shadcn/ui** (na Tailwindzie) | Panel `/admin`: komponenty z `@devmentor/ui/backend`. |
| Monorepo | **npm workspaces** | Jeden `package-lock.json` w korzeniu. Instalacja: `npm i <pakiet> -w @devmentor/<nazwa>`. |

### Pakiety (`packages/`)

| Pakiet | Nazwa | Odpowiedzialność | Może zależeć od |
|---|---|---|---|
| `packages/app` | `@devmentor/app` | Aplikacja Next.js: trasy, strony, route handlery, server actions; **jedyny composition root** kontenera DI (`src/server/container.ts`). | `core`, `db`, `ui` |
| `packages/core` | `@devmentor/core` | Części wielokrotnego użytku niezależne od frameworka: kontener DI i typ `Cradle`, błędy domenowe, abstrakcje (np. `Clock`), reguły domenowe jako czyste funkcje/serwisy. | tylko biblioteki zewnętrzne bez React/Next/MikroORM |
| `packages/db` | `@devmentor/db` | Dane: konfiguracja MikroORM, encje, migracje, repozytoria, `registerDb()`. | `core` |
| `packages/ui` | `@devmentor/ui` | Komponenty UI wielokrotnego użytku bez logiki biznesowej i dostępu do danych: `frontend/` (Tailwind), `backend/` (shadcn/ui), `lib/utils.ts` (`cn`), `styles/globals.css`. | biblioteki UI (React jako peer) |

Zasady:

1. **Kierunek zależności:** `core` ← `db` ← `app`, `ui` ← `app`. Zakazane są importy w przeciwną stronę i cykle (`core` nie importuje `db`/`ui`, `ui` nie importuje `db`, `db` nie importuje React/Next).
2. **Importy między pakietami tylko przez nazwę pakietu** i jego `exports` (`@devmentor/db`, `@devmentor/ui/backend/button`) — nigdy ścieżką względną do innego pakietu ani do jego `src/`.
3. **Pakiety wewnętrzne to źródła TS** bez kroku budowania (`exports` wskazuje na `src/`); nowy pakiet dopisz do `transpilePackages` w `packages/app/next.config.ts`.
4. Nowy pakiet w `packages/` dodawaj tylko po decyzji użytkownika; nazwa `@devmentor/<nazwa>`, `tsconfig.json` rozszerzający `../../tsconfig.base.json`, skrypt `typecheck`.
5. Przed pisaniem kodu Next.js sprawdź API w dokumentacji zainstalowanej wersji (`node_modules/next/dist/docs/`) — wersja może być nowsza niż Twoja wiedza. `packages/app/AGENTS.md` generuje `next dev`; nie usuwaj go i nie edytuj ręcznie.

### Dependency Injection (Awilix)

1. Kontener składa **wyłącznie** `packages/app/src/server/container.ts` (`import "server-only"`). Pakiety eksportują klasy, fabryki i funkcje `registerX(container)`; nie tworzą własnych kontenerów ani singletonów modułowych z zależnościami.
2. Zależności wstrzykiwane przez konstruktor jako jeden obiekt: `constructor({ em, clock }: { em: EntityManager; clock: Clock })`. Bez `container.resolve()` wewnątrz serwisów (service locator).
3. Każdą rejestrację typuj, rozszerzając `Cradle`: `declare module "@devmentor/core" { interface Cradle { mentorService: MentorService } }`.
4. Czas życia: serwisy bezstanowe i `orm` — `singleton`; `em` i wszystko, co od niego zależy — `scoped`. W route handlerach, server actions i Server Components używaj `getRequestScope()` (scope per żądanie). Tryb `strict` zgłosi singleton zależny od zależności scoped — nie wyłączaj go.
5. Czas bieżący bierz z wstrzykiwanego `clock`, nie z `new Date()` w logice domenowej.

### Dane (MikroORM + PostgreSQL)

1. Encja = plik `packages/db/src/entities/<nazwa>.entity.ts` (`defineEntity` + `setClass`) dopisany do tablicy `entities` w `entities/index.ts` — bez skanowania folderów (nie działa po zbundlowaniu).
2. Każda zmiana schematu = migracja: `npm run db:migration:create`, przejrzyj wygenerowany SQL, `npm run db:migration:up`. Commituj migrację razem z `.snapshot-*.json`. Nie edytuj zastosowanych migracji i nie używaj `schema:update` poza eksperymentami lokalnymi.
3. Jedna instancja ORM i pula połączeń na proces (`getOrm()`); nie wywołuj `MikroORM.init` gdzie indziej. Do zapytań w żądaniu używaj `em` ze scope'u (fork z własną mapą tożsamości), nie globalnego `orm.em`.
4. Kod z `@devmentor/db` uruchamiaj tylko po stronie serwera — nigdy w komponentach `"use client"`.
5. Konfiguracja przez zmienne środowiskowe w jednym pliku `.env` w korzeniu (wzór: `.env.example`). Sekretów nie commituj.

### UI: Tailwind (frontend) i shadcn/ui (backend)

1. **Strony frontendowe** (publiczne, grupa tras `src/app/(frontend)/`): Tailwind + komponenty z `@devmentor/ui/frontend`. Nie importuj tu `@devmentor/ui/backend`.
2. **Strony backendowe** (panel, `src/app/(backend)/admin/`): komponenty shadcn/ui z `@devmentor/ui/backend`, kolory przez tokeny motywu (`bg-card`, `text-muted-foreground`), nie surowe palety.
3. Nowy komponent shadcn dodawaj CLI z katalogu pakietu UI: `cd packages/ui && npx shadcn@latest add <komponent>` (konfiguracja w `packages/ui/components.json`); wygenerowany kod wolno dostosować.
4. Komponent używany w więcej niż jednym miejscu przenieś do `@devmentor/ui`; komponenty jednorazowe zostają w `packages/app`. Klasy łącz przez `cn()`.

## Katalog `.ai/` — pamięć i proces pracy agentów

```
.ai/
├── specs/                  # specyfikacje SDD (Spec-Driven Development) — aktywne
│   ├── YYYY-MM-DD-slug.md
│   ├── implemented/        # specyfikacje w pełni wdrożone
│   └── archive/            # specyfikacje porzucone, zastąpione lub nieaktualne
├── runs/                   # logi autonomicznych przebiegów AI
│   └── YYYY-MM-DD-slug.md
├── lessons.md              # indeks i krótkie wnioski — pamięć długoterminowa
└── lessons/                # dłuższe, szczegółowe wnioski
    └── YYYY-MM-DD-slug.md
```

`.ai/cezar/` to katalog roboczy narzędzia cezar (worktree, załączniki) — nie jest częścią tej struktury, nie zapisuj tam niczego i nie commituj go.

### Konwencja nazw plików

Wszystkie pliki w `specs/`, `runs/` i `lessons/` **MUSZĄ** mieć nazwę `YYYY-MM-DD-slug.md`:

- `YYYY-MM-DD` — data utworzenia pliku (bieżąca data, nie data z treści zadania).
- `slug` — krótki opis w kebab-case: małe litery ASCII, cyfry i myślniki, bez polskich znaków i spacji, maks. ~6 słów. Przykład: `2026-10-20-przekladanie-sesji.md`.
- Jeśli plik o takiej nazwie już istnieje, dodaj sufiks: `2026-10-20-przekladanie-sesji-2.md`.
- Przy przenoszeniu (np. do `implemented/`) nazwa pliku się **nie zmienia** — używaj `git mv`.

## Zasady obowiązkowe

1. **Na początku każdego zadania MUSISZ przeczytać `.ai/lessons.md`** i otworzyć pliki z `.ai/lessons/`, które dotyczą Twojego zadania. Stosuj zapisane tam wnioski.
2. **Przed implementacją nietrywialnej zmiany MUSISZ mieć specyfikację w `.ai/specs/`.** Sprawdź, czy pasująca specyfikacja już istnieje; jeśli nie — utwórz ją (szablon niżej) i dopiero potem pisz kod. Nietrywialna zmiana to nowa funkcja, nowy ekran, zmiana reguł domenowych, modelu danych lub przepływu, refaktor obejmujący kilka plików. Literówki, drobne poprawki stylów i jednolinijkowe fixy specyfikacji nie wymagają.
3. **Implementuj zgodnie ze specyfikacją.** Jeśli w trakcie pracy okaże się, że trzeba od niej odejść, najpierw zaktualizuj specyfikację (sekcja „Decyzje i zmiany”), potem kod.
4. **Po pełnym wdrożeniu specyfikacji MUSISZ** ustawić `status: implemented`, uzupełnić `implemented:` (data) i przenieść plik przez `git mv` do `.ai/specs/implemented/`. Specyfikację porzuconą lub zastąpioną ustaw na `status: archived` (podaj powód / następcę) i przenieś do `.ai/specs/archive/`.
5. **Każdy autonomiczny przebieg MUSI mieć log w `.ai/runs/`.** Przebieg autonomiczny to praca bez bieżącego nadzoru człowieka: zadanie zlecone w tle, przez orkiestrator (np. cezar), automatyzację, CI, sub-agenta lub pętlę. Utwórz log **na początku** przebiegu, uzupełniaj go na bieżąco i zamknij podsumowaniem przed zakończeniem — także gdy przebieg się nie powiódł.
6. **Po naprawieniu błędu MUSISZ zapisać wniosek** w `.ai/lessons.md` (i ewentualnie w `.ai/lessons/`), jeśli przyczyna nie była oczywista, mogłaby się powtórzyć albo kosztowała dużo czasu. To samo dotyczy każdego ustalenia, które warto pamiętać długoterminowo: decyzji użytkownika, pułapek narzędzi, konwencji, które nie wynikają z kodu.
7. **Nie zapisuj sekretów** (tokenów, haseł, danych osobowych) w żadnym pliku w `.ai/`.
8. Pliki w `.ai/` commituj razem ze zmianą, której dotyczą.

## Sposób pracy

Praktyki uzupełniające zasady obowiązkowe (na podstawie wskazówek zespołu Claude Code — Boris Cherny).

1. **Najpierw plan, potem kod.** Złożone zadanie zaczynaj od planu (w Claude Code — tryb planowania) i zapisz go w specyfikacji („Projekt rozwiązania”, „Plan wdrożenia”) tak dokładnie, żeby implementacja przeszła za jednym podejściem. Gdy coś idzie nie tak, zatrzymaj się i przeplanuj (zasada 3), zamiast brnąć dalej. Przy dużej zmianie poproś sub-agenta o krytyczny przegląd planu.
2. **Weryfikuj, zanim ogłosisz koniec.** Po zmianie w kodzie uruchom sprawdzenie z sekcji „Projekt” i przejdź zmieniony przepływ w przeglądarce (`npm run dev`); odhacz kryteria akceptacji specyfikacji. Nie raportuj sukcesu bez wyniku komend — jeśli czegoś nie dało się sprawdzić, napisz to wprost.
3. **Korekta = reguła.** Gdy użytkownik poprawia Twój wynik lub sposób pracy, zapisz regułę zapobiegającą powtórce w `.ai/lessons.md` (zasada 6); jeśli dotyczy procesu wszystkich agentów, zaproponuj zmianę w `AGENTS.md`.
4. **Błędy naprawiaj samodzielnie, od przyczyny.** Zgłoszony błąd albo czerwony typecheck/build to wystarczające polecenie: odtwórz, znajdź przyczynę, napraw, zweryfikuj — nie dopytuj o to, co da się ustalić z kodu.
5. **Po doraźnej poprawce — zrób to porządnie.** Jeśli fix wyszedł obejściem lub przypadkiem specjalnym, odrzuć go i wdróż eleganckie rozwiązanie z wiedzą, którą już masz.
6. **Sub-agenci i praca równoległa.** Szerokie przeszukiwanie, research i przeglądy zlecaj sub-agentom, żeby nie zaśmiecać głównego kontekstu. Na równoległe sesje (osobne worktree, np. cezar) dziel tylko zadania niezależne, o rozłącznym zakresie plików.
7. **Powtarzalne czynności → skill.** To, co robisz regularnie, zaproponuj jako skill lub komendę commitowaną do repozytorium.

## `.ai/specs/` — specyfikacje SDD

Specyfikacja opisuje **co** i **dlaczego** przed **jak**. Jest źródłem prawdy dla implementacji i przeglądu.

Cykl życia: `draft` → `approved` → `in-progress` → `implemented` (przeniesienie do `implemented/`) albo `archived` (przeniesienie do `archive/`). Specyfikację tworzoną przez agenta zostaw jako `draft` i poproś użytkownika o akceptację, chyba że zadanie wprost pozwala działać bez niej.

Szablon:

```markdown
---
title: <tytuł>
status: draft            # draft | approved | in-progress | implemented | archived
created: YYYY-MM-DD
implemented:             # YYYY-MM-DD po wdrożeniu
related: []              # inne specyfikacje, runy, lekcje, PR-y
---

# <tytuł>

## Kontekst i cel
Jaki problem rozwiązujemy i dla kogo.

## Zakres
- W zakresie: …
- Poza zakresem: …

## Wymagania
1. …

## Kryteria akceptacji
- [ ] …

## Projekt rozwiązania
Pliki, moduły, model danych, przepływy, stany błędów.

## Plan wdrożenia
1. …

## Decyzje i zmiany
- YYYY-MM-DD — decyzja / odejście od pierwotnego planu i powód.
```

## `.ai/runs/` — logi autonomicznych przebiegów

Jeden plik na przebieg. Log ma pozwolić człowiekowi lub kolejnemu agentowi zrozumieć, co się stało, bez czytania transkryptu.

Szablon:

```markdown
---
title: <krótki opis zadania>
date: YYYY-MM-DD
agent: <narzędzie / model>
status: in-progress      # in-progress | done | partial | failed | blocked
spec: .ai/specs/...      # jeśli dotyczy
branch: <gałąź>
---

# <tytuł>

## Zadanie
Polecenie w 1–3 zdaniach.

## Przebieg
- HH:MM — krok, decyzja, wynik.

## Wynik
Co zostało zrobione, zmienione pliki, commity.

## Weryfikacja
Uruchomione komendy i ich wynik (testy, typecheck, build).

## Problemy i otwarte kwestie
Co nie wyszło, co zostało do zrobienia, pytania do człowieka.

## Wnioski
Wpisy dodane do `.ai/lessons.md` / `.ai/lessons/` (albo „brak”).
```

## `.ai/lessons.md` i `.ai/lessons/` — pamięć długoterminowa

- **`.ai/lessons.md`** — jedyne miejsce, które czyta każdy agent na starcie. Trzymaj je krótkie: jedna lekcja = jeden punkt (1–3 zdania), pogrupowane tematycznie, z datą. Jeśli lekcja wymaga dłuższego opisu, zapisz go w `.ai/lessons/YYYY-MM-DD-slug.md` i dodaj w `lessons.md` punkt z linkiem.
- **`.ai/lessons/`** — szczegółowe opisy: objawy, przyczyna, rozwiązanie, jak zapobiec, odnośniki do commitów / runów.
- Przed dopisaniem sprawdź, czy podobna lekcja już istnieje — aktualizuj ją zamiast dublować. Lekcje, które okazały się błędne lub nieaktualne, usuń albo popraw.
- Zapisuj to, czego **nie da się** łatwo odczytać z kodu ani historii gita. Nie zapisuj streszczeń wykonanej pracy — od tego są runy.

Format punktu w `lessons.md`:

```markdown
- **YYYY-MM-DD** — <wniosek: co robić / czego unikać i dlaczego>. Szczegóły: [lessons/YYYY-MM-DD-slug.md](lessons/YYYY-MM-DD-slug.md)
```

Szablon pliku w `.ai/lessons/`:

```markdown
---
title: <tytuł>
date: YYYY-MM-DD
tags: []
---

# <tytuł>

## Kontekst / objawy
## Przyczyna
## Rozwiązanie
## Jak zapobiegać w przyszłości
## Odnośniki
```

## Lista kontrolna przed zakończeniem zadania

- [ ] Przeczytałem `.ai/lessons.md` na początku pracy.
- [ ] Nietrywialna zmiana ma specyfikację w `.ai/specs/`, a kod jest z nią zgodny.
- [ ] Zmiana w kodzie jest zweryfikowana (typecheck, build, przepływ w przeglądarce), a wynik podałem w raporcie.
- [ ] Wdrożona specyfikacja ma `status: implemented` i leży w `.ai/specs/implemented/`.
- [ ] Przebieg autonomiczny ma zamknięty log w `.ai/runs/`.
- [ ] Nowe ustalenia i wnioski z naprawionych błędów są w `.ai/lessons.md` / `.ai/lessons/`.
- [ ] Wszystkie nowe pliki w `.ai/` mają nazwę `YYYY-MM-DD-slug.md`.
