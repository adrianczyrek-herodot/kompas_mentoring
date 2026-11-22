# SDLC.md — cykl pracy

Proces dla ludzi i agentów AI (cezar + skille `open-mercato/skills`). Źródło: §10–§11 spec stacku (`.ai/specs/2026-10-21-tech-stack-i-standardy-inzynieryjne.md`). Zasady pamięci i logów agentów: `AGENTS.md`. Dodatkowo: [CODE_REVIEW.md](CODE_REVIEW.md), [BACKWARD_COMPATIBILITY.md](BACKWARD_COMPATIBILITY.md), konfiguracja pipeline'u: `.ai/agentic.config.json`.

## 1. Cykl: spec → backlog → implementacja → review → QA → merge

| Etap | Co się dzieje | Narzędzie / właściciel | Wyjście |
|---|---|---|---|
| Specyfikacja | Jedna specyfikacja na fazę w `.ai/specs/` (szablon w `AGENTS.md`) z sekcją Open Questions. Implementacja startuje dopiero po odpowiedziach (bramka). Poprawka błędu nie wymaga specyfikacji. Decyzje trudne do odwrócenia → ADR w `docs/decisions/`. | `om-spec-writing`; człowiek akceptuje (`status: approved`) | Zaakceptowana spec |
| Backlog | Spec dzielona na zadania o rozłącznym zakresie modułów; pozycje w `.ai/specs/backlog.md` (§2a). | `om-backlog` | Zadania/issues |
| Implementacja | Fazami, w osobnym worktree z własną gałęzią Neon; test w tym samym PR co kod; walidacja lokalna. Autonomiczny przebieg ma log w `.ai/runs/`. | `om-auto-implement-spec`, cezar; człowiek | PR (≤ ~400 linii) |
| Review | Przegląd wg [CODE_REVIEW.md](CODE_REVIEW.md). Dla `billing`, `ledger`, `payouts`, `identity` i migracji — obowiązkowo człowiek, niezależnie od agentów. | `om-code-review`; człowiek | Zatwierdzenie |
| QA | PR z etykietą `needs-qa` czeka na QA w przeglądarce na preview (360 i 1280 px). | `om-auto-qa-pr`; człowiek ustawia `qa-approved` | `qa-approved` |
| Merge | `qa-approved` + zielone CI + spełniona definicja ukończenia. Merge robi człowiek; wdrożenie produkcji — ręczne zatwierdzenie w MVP. | człowiek | Zmiana na `main` |

Po wdrożeniu spec: `status: implemented`, `git mv` do `.ai/specs/implemented/` (zob. `AGENTS.md`). Równoległe zadania tylko o rozłącznym zakresie plików/modułów.

## 2. Git

- **Trunk-based:** gałęzie krótkie (≤ 2 dni), `main` zawsze wdrażalny, niedokończone funkcje za flagą (PostHog).
- **Conventional Commits** z zakresem = moduł: `feat(booking): …`, `fix(ledger): …`, `docs(adr): …`, `chore(deps): …`. Typy: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `perf`. Kod, commity i nazwy plików po angielsku. Egzekwuje commitlint (lefthook).
- **PR ≤ ~400 zmienionych linii** (bez migracji i snapshotów); jedna faza spec = jeden lub kilka PR.
- Nigdy bezpośrednio na `main`; zmiany przez PR. Plików w `.ai/` commitujemy razem ze zmianą, której dotyczą.

## 2a. Backlog, zgłoszenia i priorytety

- **Źródła prawdy:** `.ai/specs/product-brief.md` (co i dlaczego, zakres Now/Later) → `.ai/specs/backlog.md` (epiki `E<n>`, historie `E<n>-S<m>`, zadania `E<n>-S<m>-T<k>`, pozycje Later `L<n>`) → GitHub Issues. Zmiana zakresu idzie w tej kolejności.
- **Zgłoszenia** mają epiki i historie z zakresu Now; tytuł zaczyna się od identyfikatora z backlogu (`[E2-S3] …`, epik: `[E2] Epik: …`), a backlog linkuje numer zgłoszenia. Zadania to lista kontrolna w zgłoszeniu historii. Pozycje Later nie mają zgłoszeń, dopóki nie trafią do Now.
- **Historia** opisuje: epik, oczekiwany rezultat, kryteria akceptacji, zależności (identyfikatory i numery zgłoszeń), zadania, źródła. **Epik** zawiera cel, listę kontrolną swoich historii z linkami i specyfikację fazy.
- **Etykiety:** każde zgłoszenie ma dokładnie jedną etykietę `priority-*` i jedną kategorię (`feature`, `bug`, `documentation`, `refactor`, `security`, `dependencies`); etykiety `risk-*` i etapów pipeline'u dotyczą PR-ów.

| Priorytet | Kiedy | Reakcja |
|---|---|---|
| `priority-extreme` | Awaria lub regresja na `main`/produkcji, luka bezpieczeństwa, ryzyko utraty pieniędzy lub danych | Natychmiast, przerywa bieżącą pracę |
| `priority-high` | Ścieżka krytyczna zakresu Now — blokuje inne historie Now albo cel bieżącej fazy | Następna do podjęcia, przed `medium` |
| `priority-medium` | Zakres Now poza ścieżką krytyczną | W kolejności zależności |
| `priority-low` | Zakres Now „miło mieć”; pozycja Later, jeśli wyjątkowo ma zgłoszenie | Gdy brak pracy o wyższym priorytecie |

Epik dostaje najwyższy priorytet spośród swoich historii. Błąd zgłoszony spoza backlogu: priorytet wg tabeli + pozycja w backlogu w ramach epiku, którego dotyczy.

## 3. Definicja ukończenia (każdy PR / faza)

- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build` zielone.
- [ ] `docker compose up -d && pnpm db:migrate && pnpm db:seed` działa na czystym repo.
- [ ] E2E dla zmienionych ekranów w 360 i 1280 px, 0 naruszeń axe serious/critical.
- [ ] Specyfikacja zaktualizowana („Decyzje i zmiany”), lekcje dopisane, run zamknięty (jeśli autonomiczny).
- [ ] Brak nowych ostrzeżeń Knip i dependency-cruiser.

## 4. Środowiska

| Środowisko | Gdzie | Dane |
|---|---|---|
| Lokalne | docker compose | seed z mockupów |
| Preview (per PR) | Cloud Run tagged revision + gałąź Neon | seed; Stripe test mode, LiveKit dev |
| Staging | Cloud Run (osobny projekt GCP) | seed + dane syntetyczne; integracje w trybie testowym |
| Produkcja | Cloud Run europe-west3 + Neon Frankfurt (PITR) | prawdziwe |

## 5. Pipeline CI/CD (GitHub Actions)

Akcje przypięte po SHA, `permissions: {}` domyślnie, OIDC do GCP (bez długoterminowych kluczy), `pnpm install --frozen-lockfile`.

1. `install` (frozen lockfile, cache Turborepo)
2. `lint` + `typecheck` + `test:unit` (równolegle)
3. `test:integration` (Testcontainers)
4. `build` obrazu
5. preview deploy + migracje na gałęzi Neon
6. `test:e2e` (Playwright, sharding) na preview
7. po merge: staging → smoke → produkcja (ręczne zatwierdzenie w MVP)

Bramka walidacji (`validation.commands`; niezerowy kod zatrzymuje pipeline): `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`. W F0 wdrożenie na Cloud Run/Neon jest tylko szkicem (wyłączony krok CI).

## 6. Migracje: expand → migrate → contract

Każda migracja musi być zgodna wstecz z poprzednią wersją aplikacji (rollback = poprzednia rewizja Cloud Run, **bez cofania migracji**).

1. **Expand** — dodaj nowe kolumny/tabele/indeksy jako opcjonalne (bez usuwania i zmiany znaczenia starych); wdrożenie kodu piszącego do obu.
2. **Migrate** — przenieś dane (backfill zadaniem w tle, partiami); kod czyta nowe, wciąż toleruje stare.
3. **Contract** — po wdrożeniu i weryfikacji usuń stare elementy, w osobnym PR/wydaniu.

Migracje uruchamiane jako osobny krok przed przełączeniem ruchu. Istniejących migracji nie edytujemy. Wymagają przeglądu człowieka. Szczegóły kompatybilności: [BACKWARD_COMPATIBILITY.md](BACKWARD_COMPATIBILITY.md).

## 7. Harness dla agentów

Krótki `AGENTS.md` + `AGENTS.md` per moduł; „czujniki”: typy, lint z komunikatami naprawy, testy architektury, szybkie testy domeny. Powtarzający się błąd agenta → nowa reguła lint / test / wpis w `.ai/lessons.md`.
