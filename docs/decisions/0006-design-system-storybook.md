---
status: accepted
date: 2026-11-11
decision-makers: [właściciel produktu]
---

# Design system w `packages/ui` z dokumentacją w Storybooku

## Context and Problem Statement

Spec stacku (tabela narzędzi) odłożyła Storybook („nie w MVP — koszt utrzymania > zysk przy małym zespole; stany komponentów pokazujemy w Playwright + mockupach”). Ekrany budują jednak w dużej części agenci AI, a każdy z nich zgaduje komponenty, tokeny i stany, jeśli nie ma jednej instrukcji obsługi. Mockupy w `kompas-mentoring/mockupy/` nie używają komponentów z `@kompas/ui`, więc nie dokumentują systemu, którego używa aplikacja.

## Decision Drivers

* Agent lub developer buduje nowy ekran bez zgadywania (komponent, tokeny, stany, czego unikać).
* Styl wynika z decyzji w `lekcja-06/referencje.md`, a nie z wyglądu shadcn.
* WCAG 2.2 AA od pierwszego dnia (brief C6) — sprawdzane automatycznie na każdym stanie komponentu, w obu motywach.
* Mały zespół: utrzymanie musi być tanie, bez osobnej usługi i publikacji.

## Considered Options

* Storybook 10 w `packages/ui` (react-vite, addon-docs, addon-a11y, addon-vitest), stories jako testy w Vitest.
* Bez Storybooka: dokumentacja w Markdown + zrzuty Playwright (dotychczasowa decyzja).
* Ladle / Histoire (lżejsze, bez integracji a11y i testów interakcji na tym samym poziomie).

## Decision Outcome

Wybrana opcja: „Storybook 10 w `packages/ui`”, ponieważ jedna instancja daje dokumentację (MDX), żywe przykłady na prawdziwych komponentach, testy dostępności (`a11y: { test: 'error' }`) i interakcji uruchamiane w Vitest, bez osobnej infrastruktury. Storybook nie jest publikowany; działa lokalnie i w CI.

### Consequences

* Good, because każdy stan komponentu ma story, test dostępności i interakcji; agent czyta jedną dokumentację (`docs/design-system.md` + Storybook).
* Good, because tokeny w trzech warstwach i skrypt `check:tokens` pilnują, żeby komponenty nie miały wartości spoza tokenów.
* Bad, because dochodzi kilkanaście zależności deweloperskich i czas testów w CI (przeglądarka Playwright).
* Bad, because dokumentacja wymaga utrzymania przy każdej zmianie komponentu (reguły w „Jak zmieniać system”).

## More Information

Specyfikacja: `.ai/specs/2026-11-11-design-system-storybook.md`. Postęp: `packages/ui/POSTEP.md`. Ponowna ocena, jeśli utrzymanie Storybooka zacznie blokować dostarczanie faz F2–F3.
