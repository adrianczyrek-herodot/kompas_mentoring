# Kompas — koncepcja portalu mentoringowego

Wstępna koncepcja i klikalne mockupy portalu mentoringu 1:1, wzorowanego funkcjonalnie na Preply (wyszukiwarka, profil z wideo, sesja próbna, plan sesji tygodniowo, saldo, przekładanie, oceny). Identyfikacja wizualna, treści i kod są własne.

## Zawartość

| Ścieżka | Co to jest |
|---|---|
| `KONCEPCJA.md` | Użytkownicy i potrzeby, use case'y, przepływy z błędami, mapa ekranów, specyfikacja 22 ekranów (cel, funkcje, komponenty, stany, walidacje, API), model danych, ryzyka |
| `mockupy/index.html` | Klikalne mockupy — otwórz w przeglądarce |
| `mockupy/src/` | Kod TypeScript: `main.ts` (router, pasek mockupu), `mocks.ts` (dane), `domain.ts` (reguły jako czyste funkcje), `screens/*` |
| `mockupy/dist/app.js` | Gotowy zbudowany bundle — nic nie trzeba instalować |

## Jak uruchomić

**Bez instalacji:** otwórz `mockupy/index.html` dwuklikiem. Działa offline.

**Z przebudową po zmianach w kodzie:**

```bash
cd mockupy
npm install
npm run build       # przebudowuje dist/app.js
npm run dev         # serwer z auto-przebudową: http://localhost:8000
npm run typecheck
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
