# Moduł `catalog` — profile mentorów, taksonomia, wyszukiwarka

Odpowiada za: profil mentora (`MentorProfile`) i onboarding M1, kategorie i tagi, zdjęcie profilowe (port `FileStorage`), później read model wyszukiwarki P2, profil publiczny P3 i ulubionych (spec F2 — `.ai/specs/2026-11-22-f2-katalog-onboarding.md`).

## Język domeny
- `mentor profile` — profil mentora; `step` — krok M1 (`about`, `skills`, `bio`, `rate`, `availability`, `verification`; segmenty URL po polsku mapuje `apps/web`).
- `category` — zamknięta lista (Q3, zmiana tylko migracją); `tag` — wolny tekst z normalizacją (`tagKey`).
- `rate60` — stawka za 60 min jako `Money`; 30 min = `halfHourRate` (połowa, w dół do grosza).

## Niezmienniki
- Cykl życia tylko przez tabelę przejść `domain/mentor-profile.state.ts`; nowy stan = nowy wiersz + test. Publiczny jest wyłącznie `approved` (`isPublic`).
- Edycja tylko w `draft`, `changes_requested`, `approved` (`isEditable`); w `submitted` → `catalog.profile_locked` (Q6).
- Reguły pól w `domain/policies/` ze stałymi w `config.ts`. Zapis kroku przyjmuje puste pola, nigdy niepoprawne (`mode: 'draft'`); krok jest ukończony, gdy przechodzi `mode: 'complete'`. Limity w `packages/contracts/catalog` muszą być zgodne z `config.ts` (pilnuje `contracts-parity.test.ts`).
- Kroki 1–4 w `completedSteps` wylicza `saveStep`/`attachPhoto` z danych; kroki 5–6 zapisują ich własne komendy (E2-S3).
- Właściciel z sesji (`actor.id`), nigdy z ciała żądania; cudzy/nieistniejący profil → `catalog.not_found` (404). Konflikt `version` → `catalog.version_conflict` (409).
- Wideo zapisujemy jako `{ provider, videoId }`, nie URL (A05); slug `<imie>-<6 znaków>` stały po publikacji (Q14).
- Zdjęcie: klucz generuje serwer, wymiary sprawdza serwer po uploadzie; nieprzypięte pliki > 24 h usuwa cron.
- Port `FileStorage` (domena) ma trzy adaptery: R2 (produkcja), lokalny (dev/e2e, katalog na dysku + trasa `/pliki/*` w `apps/web`) i fake (testy). Podpis lokalnego uploadu to HMAC z klucza, typu, rozmiaru i wygaśnięcia — przeglądarka nie może wgrać niczego innego.
- Zapis szkicu kroku i potwierdzenie zdjęcia to osobne komendy: potwierdzenie zdjęcia podnosi `version` profilu, więc formularz musi trzymać aktualną wersję (409 = konflikt z inną kartą).
- `catalog` ↔ `trust` tylko zdarzeniami (`packages/contracts/events`); publikacja w transakcji zmiany (`shared/infrastructure/events`).

## Struktura (spec §2.4, wzór: `scheduling/AGENTS.md`)
- `domain/` czysty TS (encja, maszyna stanów, polityki, port `FileStorage`) · `application/` komendy i zapytania · `infrastructure/` MikroORM, adaptery R2/lokalny · `api/` router oRPC · `jobs/` cron · `migrations/` schemat `catalog`.
