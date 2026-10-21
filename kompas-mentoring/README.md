# Kompas — koncepcja portalu mentoringowego

Wstępna koncepcja i klikalne mockupy portalu mentoringu 1:1, wzorowanego funkcjonalnie na Preply (wyszukiwarka, profil z wideo, sesja próbna, plan sesji tygodniowo, saldo, przekładanie, oceny). Identyfikacja wizualna, treści i kod są własne.

## Zawartość

| Ścieżka | Co to jest |
|---|---|
| `KONCEPCJA.md` | Użytkownicy i potrzeby, use case'y, przepływy z błędami, mapa ekranów, specyfikacja 22 ekranów (cel, funkcje, komponenty, stany, walidacje, API), model danych, ryzyka |

Klikalne mockupy zostały przeniesione do monorepo DevMentor (zob. [`README.md`](../README.md) w korzeniu):

| Ścieżka | Co to jest |
|---|---|
| `packages/app/src/views/` | Ekrany przepisane na React + Tailwind: `public/` (P1–P4), `student/` (U1–U9), `shared/` (S1–S3, mapa ekranów) |
| `packages/app/src/legacy/` | Ekrany mentora i admina (M1–M5, A1–A2) i ich router — widoki jako HTML, do przepisania w fazie 4 |
| `packages/app/src/demo/` | Stan demo w pamięci i akcje, role i nawigacja, pasek mockupu |
| `packages/core/src/domain/` | Typy domenowe i reguły jako czyste funkcje (dawniej `domain.ts`) |
| `packages/db/src/fixtures/` | Dane demo (dawniej `mocks.ts`) |
| `packages/ui/src/styles/`, `packages/ui/src/lib/`, `packages/ui/src/frontend/` | Style (Tailwind z tokenami Kompasu, `kompas.css`), formatowanie, ikony, komponenty React |

## Jak uruchomić

Z korzenia repozytorium:

```bash
npm install
npm run dev         # http://localhost:3000 — mapa ekranów: /mapa; ekrany mentora i admina pod /app#/…, panel pod /admin
npm run typecheck
npm run build
```

## Jak przeglądać

Ciemny pasek **MOCKUP** na górze każdego ekranu:

- **Rola** — Gość / Uczeń / Mentor / Admin (Uczeń ładuje personę demo z historią sesji, planem i saldem).
- **Stan** — domyślny / loading / empty / error dla bieżącego ekranu. Działa też przez adres: `#/mentorzy?state=empty`.
- **Mapa ekranów** — lista wszystkich ekranów i ścieżek F1–F6 do przeklikania.

„Teraz” w mockupie jest stałe: **wtorek 20.10.2026, 14:00** — sesja o 14:05 pozwala dołączyć do pokoju.

### Podpowiedzi do symulacji

- Kod rabatowy `KOMPAS10` działa, inne kody zwracają błąd.
- Checkout: zaznacz „symuluj odrzuconą płatność” albo „symuluj wygaśnięcie blokady”.
- Wybór terminu: „symuluj zajęcie terminu (409)”.
- Logowanie/rejestracja: e-mail `zajety@kompas.pl` daje błąd.
- Wiadomości: numer telefonu lub e-mail w treści pokazuje ostrzeżenie o płatnościach poza platformą; słowo „błąd” symuluje nieudane wysłanie.
- Kalendarz mentora: kliknij lub przeciągnij po siatce dostępności.

## Sprawdzone

Ścieżki F1–F6 przeklikane automatycznie w przeglądarce przy 360 px i 1280 px: bez błędów JS i bez poziomego przewijania.
