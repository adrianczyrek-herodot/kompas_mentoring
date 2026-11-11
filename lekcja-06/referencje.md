# Referencje: Kompas

- **Data:** 2026-11-11
- **Kto wybierał:** Adrian Czyrek (karty R01, R02 i A01 przejęte z ćwiczenia DevMentora, uzasadnienia napisane pod Kompas)
- **Źródła wiedzy o produkcie:** `.ai/specs/product-brief.md`, `kompas-mentoring/KONCEPCJA.md`. Wywiadów z użytkownikami brak.
- **Słowa charakteru (potwierdzone):** czytelny, gęsty, ciepły, uporządkowany, rzeczowy
- **Antycharakter (potwierdzony):** generyczny, efekciarski, hałaśliwy, bezbarwny, natarczywy

> Do żadnej karty nie ma zrzutu ani linku. Każda obserwacja to parafraza słownego opisu. To, czego bez zrzutu nie wiadomo, jest zaznaczone w obserwacji.

## Referencje

| # | Referencja | Źródło | Kto wybrał | Obserwacja | Bierzemy | Nie bierzemy | Robimy zamiast tego | Dlaczego pasuje do produktu | Rodzina | Waga | Status (propozycja / przyjęte) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| R01.1 | GitHub: lista pull requestów, strona repozytorium | opis słowny, bez zrzutu | Adrian Czyrek | Pozycje ułożone w wierszach jedna pod drugą. W każdym wierszu tytuł i metadane w jednej linii. Na jednym ekranie mieści się wiele wierszy, a tekst się czyta. Bez zrzutu nie wiadomo, ile linii ma wiersz ani jakie są odstępy. | Dużo informacji w jednym widoku przy zachowanej czytelności | Gęstości w rezerwacji i w pokoju sesji (zob. K1) | Gęsto w listach i tabelach, przestronnie w rezerwacji i pokoju (K1) | Gość porównuje mentorów (cel C1), mentor chce mieć mało administracji (C4). Dotyczy listy mentorów, Moich sesji, panelu mentora M2 i zarobków M5. | kompozycja i gęstość | musi być | przyjęte |
| R01.2 | GitHub | opis słowny, bez zrzutu | Adrian Czyrek | Kod i nazwy plików są innym krojem niż reszta tekstu. Że to krój o stałej szerokości, to założenie, bo zrzutu brak. | Osobny krój o stałej szerokości dla kodu | Kroju o stałej szerokości dla nazw plików i jako ogólnego stylu (propozycja P4) | Krój o stałej szerokości tylko dla kodu w czacie (S1, U6) i w notatkach po sesji (M4, U9) | Mentorzy IT pokazują kod na sesji i w notatkach. Kariera, biznes i design kodu nie mają, więc krój nie wychodzi poza kod. | typografia | musi być | przyjęte (P4) |
| R01.3 | GitHub (wyprowadzone) | wyprowadzone z R01.2 | Adrian Czyrek | Wyprowadzone przeze mnie, nie z opisu karty. | Cyfry o stałej szerokości dla godzin i kwot | — | — | W siatce slotów U1 i w zarobkach M5 porównuje się godziny i kwoty w kolumnach. | typografia | musi być | przyjęte (P5) |
| R01.4 | GitHub | opis słowny, bez zrzutu | Adrian Czyrek | Wiersze listy dzielą cienkie poziome linie. Bez zrzutu nie wiadomo, czy linia biegnie przez całą szerokość i czy wiersze mają naprzemienne tło. | Cienkie linie jako podział wierszy zamiast kart z cieniem | — | — | Linie oddzielają pozycje bez dodatkowego miejsca, więc wspierają gęstość z R01.1. | komponenty | musi być | przyjęte |
| R01.5 | GitHub | opis słowny, bez zrzutu | Adrian Czyrek | Interfejs w samych szarościach, bez ciepłego koloru („wszystko szare, mało ciepła”). | — | Palety bez akcentu, czyli samych szarości (P3) | Ciepłe szarości (neutralne z domieszką żółci lub brązu) zamiast chłodnych, niebieskawych (P1) | Mentoring 1:1 to relacja z człowiekiem, a uczeń boi się braku „chemii”. Uzasadnienie jest słabe: ciepło wynika z Twojego gustu, nie z badań. | kolor | musi być | przyjęte (P1, P3) |
| R01.6 | GitHub | opis słowny, bez zrzutu | Adrian Czyrek | Wszystkie wiersze i elementy mają podobną wagę („trudno się zorientować, co jest najważniejsze”). | — | Równej wagi wszystkich elementów (P3) | Jedna wyróżniona akcja główna na ekranie, reszta drugorzędna (P2), np. „Zarezerwuj sesję próbną — X zł” na profilu P2, „Dołącz” w panelu M2 | Celem C2 jest zamiana sesji próbnej w plan. Każdy ekran ma jeden następny krok. | kompozycja i gęstość | musi być | przyjęte (P2) |
| R02.1 | Slack: widok kanału z wątkiem | opis słowny, bez zrzutu | Adrian Czyrek | Lista wiadomości zajmuje główną, największą część ekranu, a obok jest wątek. Bez zrzutu nie wiadomo, jak są podzielone kolumny ani czy pole pisania jest przypięte na dole. | Rozmowa jako główna treść ekranu | Rozmowy w centrum całego produktu (P9) | Rozmowa w centrum tylko w S1 Wiadomości i w czacie pokoju U6 (P9) | Rdzeń Kompasu to wyszukiwanie, rezerwacja i sesja wideo. Rozmowa obsługuje pytania przed rezerwacją (UC5) i czat podczas sesji. | kompozycja i gęstość | warto | przyjęte (P9) |
| R02.2 | Slack | opis słowny, bez zrzutu | Adrian Czyrek | „Szybko się pisze i odpisuje”. Bez zrzutu nie wiadomo, czy pole pisania jest zawsze widoczne i czy Enter wysyła wiadomość. | Szybkie pisanie i odpowiadanie bez przechodzenia między ekranami | — | — | KONCEPCJA S1 ma stan „nie wysłano → Ponów”, więc wiadomość pokazuje się od razu i może się nie powieść. | ruch i reakcja | warto | przyjęte |
| R02.3 | Slack | opis słowny, bez zrzutu | Adrian Czyrek | Przy każdej wiadomości widać autora i czas napisania. Bez zrzutu nie wiadomo, czy jest awatar i jaki jest format godziny. | Autor i godzina przy każdej wiadomości | — | — | Godzina wyświetlana w strefie użytkownika (reguła 10 briefu, Z9). Uczeń i mentor mogą być w różnych strefach. | komponenty | warto | przyjęte |
| R02.4 | Slack | opis słowny, bez zrzutu | Adrian Czyrek | Dużo powiadomień i oznaczeń nieprzeczytanych („za dużo powiadomień”). | — | Liczników i powiadomień o wszystkim | Powiadamiamy tylko o tym, co wymaga działania albo zmienia termin. Bez liczników przy każdym elemencie (P6). | Mentor chce mieć mało administracji. S3 ma już preferencje powiadomień dla każdego typu. | ruch i reakcja | warto | przyjęte (P6) |
| R02.5 | Slack | opis słowny, bez zrzutu | Adrian Czyrek | Emoji w wiadomościach, w reakcjach i w interfejsie („emoji wszędzie”). | — | Reakcji emoji i emoji w interfejsie | Ikony tylko funkcyjne (P7) | Płatna relacja z ekspertem, a uczeń boi się straty pieniędzy, więc ton jest rzeczowy. Częściowo to gust. | ton wypowiedzi | warto | przyjęte (P7) |
| R02.6 | Slack | opis słowny, bez zrzutu | Adrian Czyrek | Boczny pasek z wieloma listami („bałagan w bocznym pasku”). | — | Bocznego paska z listami kanałów | Stała, krótka nawigacja z 5 pozycji, jak w KONCEPCJI §3, np. dla ucznia: Szukaj · Sesje · Wiadomości · Postępy · Konto (P8) | Produkt jest mobile-first (Z9), a dolna nawigacja z 5 pozycji jest już w mapie ekranów. | kompozycja i gęstość | warto | przyjęte (P8) |

## Antyreferencje

| # | Wygląd | Dlaczego nie | Podpis do uniknięcia | Źródło (gust / badania / propozycja) |
|---|---|---|---|---|
| A01 | Generyczny wygląd AI, połączony z „typową stroną startupu AI” | Wygląda jak wszystko inne. Gość pyta „czy to prawdziwy ekspert?”, a generyczny wygląd nie odróżnia Kompasu od innych serwisów. | **Na ekranie:** fioletowy gradient w tle lub na przyciskach, gradient na tekście nagłówka, półprzezroczyste („szklane”) karty z rozmytym tłem, ikony iskierek, wyśrodkowany hero z trzema kartami funkcji pod spodem, duże zaokrąglenia i cienie na każdym elemencie, zmyślone loga firm i opinie. **W kodzie:** `linear-gradient(` z odcieniami fioletu, `background-clip: text`, `backdrop-filter: blur(`, półprzezroczyste białe tło kart, ikona `Sparkles` lub ✨. Przykład: `lekcja-06/02-rekrutacja.html` (są tam `linear-gradient`, `background-clip: text`, `backdrop-filter: blur(12px)`). | gust (karta A01) i propozycja P10, przyjęte |
| A02 | Sztuczna presja sprzedażowa | Gość boi się straty pieniędzy (brief §2). Kompas chce zaufania, nie pośpiechu. | „Zostały 2 miejsca”, „X osób ogląda ten profil”, przekreślona cena bez podstawy, promocyjne liczniki czasu, wyskakujące okna z rabatem przy wejściu lub wyjściu. **Wyjątek:** odliczanie blokady terminu (HoldCountdown, reguła 5 briefu) zostaje, bo to informacja o rzeczywistej blokadzie. | propozycja P11 (z briefu, nie z wywiadów), przyjęte |
| A03 | Gamifikacja | Wyróżnik Kompasu: postęp mierzy się celem, a nie liczbą lekcji. | Punkty, serie dni, odznaki, rankingi uczniów, konfetti, certyfikaty ukończenia. **W kodzie:** biblioteki konfetti, pola `streak`, `badge`, `xp`. Postęp pokazujemy jako cel i kamienie milowe (GoalCard, MilestoneList w U9). | propozycja P12 (z briefu, nie z wywiadów), przyjęte |
| A04 | Drobny druk | Uczeń boi się zawiłych rozliczeń i utraty pieniędzy przy anulowaniu (brief §2). | Zasady przełożenia i anulowania (reguła 12 h) oraz składniki ceny podane mniejszym i jaśniejszym tekstem niż tekst główny, w przypisach z gwiazdką albo ukryte w zwiniętym „Regulaminie”. Robimy zamiast tego: pełny tekst przy akcji (PolicyNotice w U5, PriceBreakdown). | propozycja P13 (z briefu, nie z wywiadów), przyjęte |

## Konflikty i rozstrzygnięcia

| Konflikt | Referencje | Rozstrzygnięcie | Kto zdecydował |
|---|---|---|---|
| K1. R01 chce gęstości, a produkt jest mobile-first i ma spełniać WCAG 2.2 AA (cele dotyku) | R01.1, KONCEPCJA Z9, brief C6 | Gęsto w listach i tabelach (lista mentorów, Moje sesje, panel M2, zarobki M5), przestronnie w rezerwacji i w pokoju sesji. Cele dotyku nie mniejsze niż 44 px; tę wartość zaproponował agent. | Adrian Czyrek, 2026-11-11 |
| K2. R02 stawia rozmowę w centrum, a rdzeń Kompasu to rezerwacja i sesja wideo | R02.1 | Rozmowa w centrum tylko w S1 i w czacie U6 (P9) | Adrian Czyrek, 2026-11-11 |
| K3. Odrzucenie gamifikacji kontra cel C5 „widać postęp ucznia” | A03, brief C5 | Postęp jako cel, kamienie milowe, notatki i zadania, bez punktów i odznak (P12) | Adrian Czyrek, 2026-11-11 |

## Luki

- **Kolor, kierunek pozytywny:** karty mówią tylko, czego nie robić (same szarości, fioletowy gradient), i dają kierunek „ciepłe szarości”. Brakuje koloru akcentu i palety. **Czeka na karty R03 i kolejne** (decyzja: „Dodam referencje”).
- **Typografia, krój główny:** jest tylko krój o stałej szerokości dla kodu i cyfr. Nie ma kroju tekstu ani nagłówków ani skali. **Czeka na karty R03 i kolejne.**
- **Ton wypowiedzi:** jest tylko negatyw (bez emoji, R02.5). Brakuje referencji dla tonu tekstów: komunikatów błędów, pustych stanów, e-maili.
- **Ruch i reakcja:** jest tylko R02.2 i R02.4. Brakuje referencji dla animacji, przejść i potwierdzeń (np. „Ten termin został właśnie zajęty”).
- **Pokój sesji U6 (wideo):** kluczowy ekran bez żadnej referencji.
- **Zrzuty:** brak. Obserwacje to parafrazy (decyzja: zostawiamy). Otwarte: ile linii ma wiersz w R01, czy wiersze mają naprzemienne tło, jak są podzielone kolumny w R02.
- **Badania:** brak wywiadów. A02–A04 wynikają z briefu i KONCEPCJI, nie z rozmów z użytkownikami. Warto je potwierdzić w badaniach.

## Obrazy

Brak plików. Po dodaniu zrzutów nazwy powinny wyglądać tak:

- `R01-github-lista-pr.png`
- `R02-slack-watek.png`
- `A01-startup-ai.png`

---

Nic w tym pliku nie jest jeszcze regułą. Zasady i tokeny powstają w następnym kroku, z tego pliku, i każdą z nich zatwierdzam osobno.
