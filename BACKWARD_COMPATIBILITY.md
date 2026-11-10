# BACKWARD_COMPATIBILITY.md — zasady kompatybilności wstecznej

Powierzchnie kontraktowe Kompasu i reguły ich zmiany. Źródło: §4.7, §5, §11 spec stacku (`.ai/specs/2026-10-21-tech-stack-i-standardy-inzynieryjne.md`). Przegląd wg [CODE_REVIEW.md](CODE_REVIEW.md); proces: [SDLC.md](SDLC.md). Zmiana łamiąca kontrakt = wpis w „Decyzje i zmiany” specyfikacji (i ADR przy decyzji trudnej do odwrócenia).

## 1. API `/api/v1`

- Wersja w URL. W obrębie `v1` **tylko zmiany addytywne**: nowe endpointy, nowe opcjonalne pola żądania, nowe pola odpowiedzi, nowe wartości filtrów opcjonalnych.
- **Zabronione w `v1`:** usunięcie lub zmiana nazwy/typu/znaczenia pola, zaostrzenie walidacji, nowe wymagane pole żądania, zmiana kodu błędu (`code`, `type` w RFC 9457) lub statusu HTTP, zmiana formatu kwot (`{ amount, currency }`, grosze) i dat (ISO 8601 UTC), zmiana semantyki paginacji kursorowej.
- Klienci muszą ignorować nieznane pola; nowe wartości enumów w odpowiedziach traktujemy jako zmianę potencjalnie łamiącą — dodawaj je świadomie i opisuj w OpenAPI.
- **Wycofanie:** nagłówki `Deprecation` i `Sunset` (data), wpis w OpenAPI (`deprecated: true`) i changelogu; element działa przez cały okres wygaszania (minimum 6 miesięcy dla klientów zewnętrznych/mobilnych — do potwierdzenia przy pierwszym klientze zewnętrznym). Zmiana łamiąca = nowa wersja `/api/v2`, `v1` żyje równolegle do `Sunset`.
- OpenAPI (`/api/v1/openapi.json`) generowane z kontraktów oRPC jest źródłem prawdy; PR zmieniający kontrakt pokazuje diff OpenAPI.
- Edycja agregatów przez `ETag`/`If-Match`; nagłówek `Idempotency-Key` zachowuje semantykę (zob. spec §4.6).

## 2. Zdarzenia domenowe

- Nazwa w czasie przeszłym **z wersją**: `booking.confirmed.v1`. Ładunek: identyfikatory + minimum danych; schemat zod w `packages/contracts/events`.
- W obrębie wersji tylko zmiany addytywne (nowe opcjonalne pola). Zmiana niekompatybilna (usunięcie/zmiana pola, zmiana znaczenia) = **nowa wersja** (`booking.confirmed.v2`).
- Przy wprowadzeniu `v2`: producent publikuje `v1` i `v2` równolegle do czasu migracji wszystkich konsumentów; `v1` usuwamy dopiero po opróżnieniu kolejki zadań i wdrożeniu konsumentów (zadania pg-boss w kolejce mogą nieść starą wersję).
- Konsumenci są idempotentni i tolerują nieznane pola.

## 3. Baza danych (expand → migrate → contract)

- Każda migracja zgodna wstecz z poprzednią wersją aplikacji; rollback aplikacji bez cofania migracji.
- Rozbijaj zmiany łamiące na trzy kroki w osobnych wydaniach: **expand** (dodaj opcjonalne), **migrate** (backfill, kod czyta nowe), **contract** (usuń stare po weryfikacji). Zob. [SDLC.md](SDLC.md) §6.
- Zabronione w jednym wydaniu: `DROP`/`RENAME` kolumny lub tabeli używanej przez poprzednią wersję, dodanie `NOT NULL` bez wartości domyślnej, zmiana typu kolumny z przepisaniem tabeli pod ruchem.
- Istniejących migracji nie edytujemy po scaleniu do `main`. Wymagany przegląd człowieka.
- Pieniądze zawsze `bigint` w groszach + `currency char(3)`; wpisów ledgera nie modyfikujemy (korekta = przelew odwracający).

## 4. Kontrakty zod w `packages/contracts`

- Schematy zod są źródłem walidacji, typów klienta i OpenAPI — zasady z §1 i §2 stosuje się do nich wprost.
- Dodawaj pola jako `.optional()` / z `.default()`; nie zawężaj typów, nie usuwaj pól, nie zmieniaj `.brand()` ID.
- Zmiana schematu wejściowego formularza (react-hook-form) nie może łamać zapisanych szkiców (np. szkice M1) — dodaj migrację danych lub tolerancję starego kształtu.
- Typy zdarzeń wersjonowane w nazwie (§2); kontrakty wspólne dla `apps/web`, `apps/worker` i klientów nie importują niczego spoza `packages/contracts`.

## 5. Inne powierzchnie

- Konfiguracja środowiskowa (zmienne env walidowane zod przy starcie): nowa zmienna wymagana tylko z wartością domyślną lub po wdrożeniu sekretu; usunięcie dopiero po wycofaniu użycia.
- Webhooki przychodzące `/api/v1/webhooks/{provider}`: ścieżki i weryfikacja podpisu bez zmian w obrębie `v1`.
- Teksty UI (`messages/pl.json`): klucze nie są kontraktem zewnętrznym, ale usunięcie klucza wymaga sprawdzenia użyć (lint/test).

## Checklist zmiany kontraktu

- [ ] Zmiana addytywna? Jeśli nie — nowa wersja i okres wygaszania (`Deprecation`/`Sunset`).
- [ ] Diff OpenAPI / schematów zdarzeń w PR.
- [ ] Migracja zgodna wstecz; krok contract w osobnym PR.
- [ ] Specyfikacja zaktualizowana („Decyzje i zmiany”).
