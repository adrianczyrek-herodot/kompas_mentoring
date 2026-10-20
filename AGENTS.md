# AGENTS.md — instrukcje dla agentów AI

Ten plik obowiązuje **każdego** agenta AI pracującego w tym repozytorium (Claude Code, Codex, Cursor, Copilot, OpenCode i inne). Zasady oznaczone jako **MUSISZ** są obowiązkowe — nie pomijaj ich, nawet przy drobnych zadaniach, chyba że użytkownik wprost zwolni Cię z nich w bieżącym zadaniu.

## Projekt

Kompas — koncepcja i klikalne mockupy portalu mentoringu 1:1. Szczegóły w `kompas-mentoring/README.md` i `kompas-mentoring/KONCEPCJA.md`.

- Mockupy: `kompas-mentoring/mockupy/` (TypeScript, bundle w `dist/app.js`).
- Sprawdzenie zmian w kodzie: `cd kompas-mentoring/mockupy && npm run typecheck && npm run build`.

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
- [ ] Wdrożona specyfikacja ma `status: implemented` i leży w `.ai/specs/implemented/`.
- [ ] Przebieg autonomiczny ma zamknięty log w `.ai/runs/`.
- [ ] Nowe ustalenia i wnioski z naprawionych błędów są w `.ai/lessons.md` / `.ai/lessons/`.
- [ ] Wszystkie nowe pliki w `.ai/` mają nazwę `YYYY-MM-DD-slug.md`.
