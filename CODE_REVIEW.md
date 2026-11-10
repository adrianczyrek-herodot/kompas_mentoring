# CODE_REVIEW.md — lista kontrolna przeglądu

Obowiązuje ludzi i agentów (`om-code-review` czyta ten plik automatycznie). Źródło: §10.4 spec stacku (`.ai/specs/2026-10-21-tech-stack-i-standardy-inzynieryjne.md`). Każdy punkt ma być sprawdzalny: wskaż plik/linię albo test, który go potwierdza. Rozbieżność = uwaga do poprawy przed merge.

## 0. Bramka wstępna

- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build` zielone (CI), brak nowych ostrzeżeń Knip i dependency-cruiser.
- [ ] PR ≤ ~400 zmienionych linii (bez migracji i snapshotów); większy — poproś o podział.
- [ ] Commity w Conventional Commits z zakresem = moduł (`feat(booking): …`); PR odwołuje się do specyfikacji z `.ai/specs/`.
- [ ] Zmiana dotyczy jednej fazy specyfikacji; odejście od spec lub stacku ma wpis w „Decyzje i zmiany” (i ADR, jeśli decyzja trudna do odwrócenia).

## 1. Wymagany przegląd człowieka (§10.2)

Niezależnie od wyniku agentów zatwierdza człowiek, gdy PR dotyka:

- `packages/core/src/modules/{billing,ledger,payouts,identity}/**`,
- `**/migrations/**` (nowe migracje: tylko expand → migrate → contract, zob. `SDLC.md`; istniejących migracji się nie edytuje),
- kontraktów publicznych (`packages/contracts`, `/api/v1`) — dodatkowo `BACKWARD_COMPATIBILITY.md`.

## 2. Granice modułów (§2.4)

- [ ] `domain/` importuje tylko własne `domain/` i `packages/core/shared/domain` (Money, Clock, Result, typy ID); zero I/O.
- [ ] `application/` importuje `domain/` i porty, nigdy adaptery ani `infrastructure/`.
- [ ] Inny moduł importowany wyłącznie przez `modules/<x>/index.ts`.
- [ ] `apps/web` i `apps/worker` importują tylko `index.ts` modułów i `contracts`; brak dostępu do encji i EntityManagera.
- [ ] Brak cykli między modułami; reakcja innego modułu = zdarzenie domenowe, nie wywołanie wstecz.
- [ ] Brak wspólnych tabel między modułami; odwołanie do obiektu innego modułu to markowane ID (wyjątek: FK do `identity.user`).
- [ ] Typy dostawców (Stripe, LiveKit…) nie wychodzą poza `infrastructure/`; dostawca dostępny wyłącznie przez port z fake'iem i testem kontraktowym.
- [ ] Nie wyłączono reguł `eslint-plugin-boundaries` / dependency-cruiser komentarzem ani wyjątkiem w konfiguracji.

## 3. Autoryzacja i własność zasobu (§8)

- [ ] Każda komenda i zapytanie aplikacyjne sprawdza uprawnienie (np. `booking.cancel.own`) **i** własność zasobu; autoryzacja nie jest tylko w `proxy.ts` ani w UI.
- [ ] Test „cudzy zasób → 404/403” dla nowego endpointu/komendy.
- [ ] Akcje admina: wymagane 2FA, wpis w `trust.audit_entry`; ręczne korekty salda tylko przez `trust` z audytem; impersonacja tylko do odczytu.
- [ ] Wejście z zewnątrz walidowane schematem zod na krawędzi; ID parsowane do typów markowanych.
- [ ] Webhooki: weryfikacja podpisu, okno czasowe, deduplikacja.
- [ ] Brak sekretów w kodzie, logach, kliencie i `.ai/`; zmienne środowiskowe walidowane przy starcie.

## 4. Idempotencja i współbieżność (§4.4, §4.6)

- [ ] `POST /checkout`, `/bookings/holds`, `/bookings/:id/cancel`, `/balances/transfer`, `/mentor/payouts` wymagają `Idempotency-Key` (równoległe → 409, ten sam klucz z innym ciałem żądania → 422); klucz przekazany do Stripe.
- [ ] Handler zadania/webhooka jest idempotentny (inbox z unikalnym `event_id`); test: duplikat nie daje drugiego efektu.
- [ ] Zdarzenie domenowe wysłane jako zadanie pg-boss w tej samej transakcji co zmiana stanu.
- [ ] Agregaty edytowane przez wiele stron mają `version`; konflikt → 409 (`ETag`/`If-Match` w API).
- [ ] Rezerwacje chronione ograniczeniem wykluczającym; błąd `23P01` mapowany na `SlotTaken`; brak „sprawdź, potem wstaw” bez blokady/ograniczenia.

## 5. Pieniądze (§3, §6.3)

- [ ] Kwoty jako `Money` (`bigint`, grosze, waluta) w domenie; w bazie `bigint` + `currency char(3)`; w API liczba całkowita groszy.
- [ ] Brak `number`/`float`/`numeric` z ułamkami w polach `*amount*`/`*price*`; podział prowizji przez `allocate`.
- [ ] Zmiany salda i kredytów wyłącznie przez ledger (przelew między kontami, w jednej transakcji); wpisów nie edytujemy — korekta = przelew odwracający.
- [ ] Nowe zdarzenie płatnicze ma wiersz w tabeli księgowań i testy: suma sald = 0, saldo kredytu ≥ 0.
- [ ] Kwoty liczone wyłącznie na serwerze.

## 6. Czas (§4.1, §4.10)

- [ ] Brak `Date.now()`, `new Date()`, `Math.random()` w `domain/**`; czas wstrzyknięty (`Clock` / `now: Temporal.Instant`).
- [ ] Domena na `Temporal.Instant` / `ZonedDateTime`; w bazie `timestamptz`; reguły dostępności w czasie lokalnym + `time_zone` (IANA).
- [ ] Testy używają `FakeClock`, nie prawdziwego czasu; przypadki DST (ostatnia niedziela marca i października) dla slotów.
- [ ] Strefa czasowa widoczna przy każdym terminie w UI.
- [ ] Stałe biznesowe w `policies/config.ts` z odnośnikiem do decyzji (Z2–Z5), nie rozsiane po kodzie.

## 7. Obsługa błędów (§4.9)

- [ ] Oczekiwane porażki jako `Result.err` z unią `{ code: '…' }`; wyjątki tylko dla błędów programisty.
- [ ] Błędy domenowe mapowane jednym mapperem na RFC 9457 (`problem+json`, `title` z i18n).
- [ ] Brak pustych `catch` i połykania błędów; brak `console.*` (używamy loggera).
- [ ] Switch po stanach/zdarzeniach jest wyczerpujący; przejścia stanów w tabeli przejść.

## 8. Frontend: stany L/E/Er/S, i18n, dostępność (§7)

- [ ] Każdy nowy ekran ma stany: loading (L), empty z akcją (E), error z „Ponów” (Er), success (S) — wzorzec tekstów z mockupów.
- [ ] Wszystkie teksty UI w `messages/pl.json` (next-intl, ICU: odmiana one/few/many, waluty, daty w strefie użytkownika); brak tekstów na sztywno w komponentach.
- [ ] WCAG 2.2 AA: semantyczny HTML, widoczny focus, cele dotyku ≥ 24 px, kontrast, etykiety pól, błędy powiązane przez `aria-describedby`, obsługa klawiatury, `prefers-reduced-motion`.
- [ ] E2E w 360 i 1280 px; `@axe-core/playwright` bez naruszeń serious/critical.
- [ ] RSC domyślnie; `"use client"` tylko na liściach z interakcją; zero logiki biznesowej w Server Actions i route handlerach (wołają serwis aplikacyjny).
- [ ] Formularze: ten sam schemat zod co serwer, blokada podwójnego wysłania, zachowanie danych przy błędzie.
- [ ] Budżety: JS strony publicznej ≤ 170 kB gzip; obrazy przez `next/image`.

## 9. Testy (§9)

- [ ] Test napisany w tym samym PR co kod; nie zależy od kolejności ani prawdziwego czasu.
- [ ] Każda nowa komenda: ścieżka szczęśliwa **i każdy kod błędu** (test integracyjny z Testcontainers).
- [ ] Zmiany w `domain/`: pokrycie gałęzi ≥ 90%; `scheduling` i `ledger`: testy właściwości (fast-check).
- [ ] Nowy port/webhook: adapter vs fake (test kontraktowy), odtworzenie podpisanego webhooka z fixture'a.
- [ ] Brak testów flaky, `skip`/`only` i wyłączonych asercji.

## 10. Prywatność i logi (§6.5, §8)

- [ ] Logi zawierają identyfikatory, nie PII: brak e-maila, telefonu, imienia i nazwiska, treści wiadomości, notatek, celu sesji, tokenów, `authorization`, cookie; nowe pola wrażliwe dodane do `redact`.
- [ ] Treść wiadomości i notatek nie trafia do logów ani do Sentry.
- [ ] Nowe dane osobowe: uwzględnione w eksporcie i anonimizacji RODO; dostawca w rejestrze podprocesorów.

## 11. Baza i migracje (§3, §11)

- [ ] Nazwy `snake_case`, tabele w liczbie pojedynczej, `_at`, `is_`; klucze UUID v7; schemat per moduł.
- [ ] Migracja zgodna wstecz z poprzednią wersją aplikacji (expand → migrate → contract); destrukcyjny krok w osobnym PR po wdrożeniu.
- [ ] Brak soft delete w domenie (stany końcowe w maszynie stanów).

## 12. Zależności i łańcuch dostaw (§8)

- [ ] Wersje przypięte dokładnie (bez `^`/`~`); nowa zależność uzasadniona; skrypty instalacyjne nie rozszerzone bez powodu.
- [ ] Akcje GitHub przypięte po SHA; workflow z `permissions: {}` domyślnie.

## Zalecana ważność uwag

- **Blocker:** naruszenie granic modułów, brak autoryzacji/własności, pieniądze poza `Money`/ledgerem, brak idempotencji, `Date.now()` w domenie, PII w logach, migracja niezgodna wstecz.
- **Major:** brak testu błędu, brak stanów L/E/Er/S, teksty poza i18n, naruszenie WCAG.
- **Minor:** nazewnictwo, rozmiar plików/funkcji (ostrzeżenie lint), styl.
