# Audyt bezpieczeństwa — kolekcja skilli `om-*` (część 1)

- Data: 2026-11-22
- Zakres: `/Users/adrianczyrek/.agents/skills` (kolekcja autorestwa zewnętrznego — czytana jako treść **niezaufana**)
- Metoda: przegląd każdego `SKILL.md`, grep całej kolekcji wzorcami ryzykownymi, inspekcja `references/` i plików wykonywalnych.
- Uwaga o liczbie: zlecenie mówiło o **45** katalogach (find-skills + 44 `om-*`). Na dysku jest **43** katalogi (find-skills + 42 `om-*`) — dokładnie jeden katalog na skill, bez braków. Zestawienie pokrywa wszystkie 43 istniejące katalogi.

## Legenda kolumny „Provenance”

Wszystkie 43 pozycje to **zwykłe katalogi, nie symlinki** (`find . -type l` → 0 trafień). Wszystkie mają `SKILL.md`. Format: `plików w references/`; dodatkowe podkatalogi wymieniono jawnie.

## Tabela

| Skill (ścieżka) | Provenance (symlink?) | Co robi | Ryzyka |
|---|---|---|---|
| `find-skills` | katalog; SKILL.md tak; references/ 0 | Wyszukuje i instaluje skille z ekosystemu (`npx skills find/add/update/init`); potrafi instalować globalnie z `-g -y` | **Wysokie** — `npx skills add <owner/repo@skill> -g -y` pobiera i instaluje nieprzejrzany kod/skille z GitHuba globalnie, bez przeglądu (supply chain); sieć do npm/GitHub |
| `om-apply-upgrade-notes` | katalog; SKILL.md tak; references/ 3 | Po aktualizacji re-synchronizuje deskryptory trackerów i przeglądarek w repo; czyta `UPGRADE_NOTES.md` | Niskie — nadpisuje pliki konfiguracyjne repo (chroni lokalne edycje) |
| `om-approve-merge-pr` | katalog; SKILL.md tak; references/ 3 | Zatwierdza review i squash-merge PR; blokuje przy bramce QA/etykiecie blokującej | Średnie — approve + merge to operacje nieodwracalne na zdalnym repo; mutacje trackera |
| `om-auto-continue-pr` | katalog; SKILL.md tak; references/ 10 | Wznawia dowolny PR: worktree, rekonstrukcja planu, commity, push, etykiety | Wysokie — pełny cykl `git commit`/`git push` + mutacje trackera; uruchamia walidację repo (dowolne komendy z konfiguracji) |
| `om-auto-continue-pr-loop` | katalog; SKILL.md tak; references/ 17 | Jak wyżej w trybie pętli: run-folder, commit na krok, checkpointy, screenshoty UI | Wysokie — jak `om-auto-continue-pr`, dodatkowo integracje i screenshoty w pętli |
| `om-auto-create-pr` | katalog; SKILL.md tak; references/ 11 | Brief → plan → implementacja w worktree → commit/push → PR z etykietami SDLC i walidacją | Wysokie — `git commit`/`git push`, mutacje `gh api`, uruchamia dowolną walidację z konfiguracji repo |
| `om-auto-create-pr-loop` | katalog; SKILL.md tak; references/ 19 | Wariant loop: run-folder (PLAN/HANDOFF/NOTIFY), commit na krok, checkpointy, PR | Wysokie — jak `om-auto-create-pr` |
| `om-auto-fix-issue` | katalog; SKILL.md tak; references/ 11 | Orkiestruje łańcuch autofix (verify→root-cause→fix→open-pr→review→QA) lub ścieżkę feature; worktree, claim, clean stops | Wysokie — najszerszy orkiestrator: worktree, mutacje trackera, push, uruchamianie wielu skilli |
| `om-auto-fix-pr` | katalog; SKILL.md tak; references/ 9 | Doprowadza PR do merge-ready: merge bazy, pętla review/CI/QA, pliki follow-up issues; sam nie merguje | Średnie/wysokie — `git merge origin/<base>` do gałęzi PR, push, tworzenie issues, mutacje etykiet |
| `om-auto-implement-spec` | katalog; SKILL.md tak; references/ 5 | Implementuje spec → dostarcza zweryfikowany, zrecenzowany PR + screenshoty UI | Wysokie — deleguje do `om-auto-create-pr` (push/PR) i review/QA |
| `om-auto-manage-issues` | katalog; SKILL.md tak; references/ 8 | Uzupełnia etykiety SDLC, wzbogaca lakoniczne issues (analiza screenshotów), komentarze prep; read-only na kodzie | Średnie — mutuje tracker (etykiety, komentarze, assignee); pobiera i analizuje obrazy z issues |
| `om-auto-qa-pr` | katalog; SKILL.md tak; references/ 7 | Uruchamia app w przeglądarce, screenshoty + raport pass/fail, publikuje evidence na PR | Średnie — sourcing pliku z sekretami do powłoki; uruchamia app/przeglądarkę; publikuje komentarze/etykiety |
| `om-auto-review-pr` | katalog; SKILL.md tak; references/ 16 | Review/re-review PR w izolowanym worktree, submit verdict, etykiety, opcjonalny autofix loop | Średnie — mutuje tracker (review, etykiety), push w autofix, uruchamia walidację |
| `om-auto-update-changelog` | katalog; SKILL.md tak; references/ 5 | Generuje wpis `CHANGELOG.md` dla zmergowanych PR i oddaje go do `om-auto-create-pr` jako docs PR | Średnie — push/PR przez inny skill |
| `om-auto-write-spec` | katalog; SKILL.md tak; references/ 8 | Brief/issue → spec na gotowym PR; mockupy + screenshoty jako evidence; etykiety SDLC | Średnie/wysokie — push/PR, przeglądarka, załączanie obrazów |
| `om-backlog` | katalog; SKILL.md tak; references/ 6 | Zamienia product brief/spec na drzewo issues (epiki/historie/zadania) przez `om-prepare-issue` | Średnie — masowe tworzenie issues w trackerze |
| `om-brainstorm` | katalog; SKILL.md tak; references/ 7 | Rozmowa rozbieżna przed artefaktem; zapisuje tylko jeden plik brief po zgodzie; read-only repo | Niskie — read-only repo, brak mutacji trackera |
| `om-check-and-commit` | katalog; SKILL.md tak; references/ 4 | Uruchamia walidację, naprawia proste błędy, commituje i pushuje bieżącą gałąź | Średnie/wysokie — `git commit`/`git push`; uruchamia dowolne komendy walidacji repo |
| `om-close-fixed-issues` | katalog; SKILL.md tak; references/ 5 | Zamyka issues rozwiązane przez zmergowane PR (`fixes`/`closes`/`resolves`); komentarze informacyjne | Średnie — mutuje tracker (zamykanie issues, komentarze) |
| `om-code-review` | katalog; SKILL.md tak; references/ 4 | Silnik review kodu: uruchamia gate walidacji, checklist, findings z severity | Niskie — read-only na repo; wykonuje testy/lint repo |
| `om-create-skill` | katalog; SKILL.md tak; references/ 12 (+ `references/templates/` 3) | Autorstwo/refaktor skilli: lint + gates, boilerplate, konwencje skilla | Niskie/średnie — pisze nowe skille do repo (i potencjalnie do `~/.claude/skills`); boilerplate zawiera `npx skills` |
| `om-discover` | katalog; SKILL.md tak; references/ 12 | Rozmowa discovery → `product-brief.md`; czyta repo, zapisuje brief | Niskie |
| `om-fix` | katalog; SKILL.md tak; references/ 4 | Minimalna zmiana kodu + testy regresji + gate; nie commituje/pushuje; claim issue | Niskie/średnie — edytuje kod i uruchamia gate; mutuje tracker (claim, assignee, label) |
| `om-followup-issue-from-pr` | katalog; SKILL.md tak; references/ 3 | Z linku PR/komentarza tworzy follow-up issue z assignee; tryb design-doc | Średnie — tworzy issues/przypisania w trackerze; czyta PR i komentarze |
| `om-integration-tests` | katalog; SKILL.md tak; references/ 4 | Uruchamia/tworzy testy E2E przez przeglądarkę, reuse wspólnego środowiska testowego | Średnie — uruchamia app/przeglądarkę, instaluje providery (sieć), tworzy pliki testów |
| `om-merge-buddy` | katalog; SKILL.md tak; references/ 3 | Read-only klasyfikacja gotowości open PR-ów do merge | Niskie — read-only |
| `om-mockup-prototype` | katalog; SKILL.md tak; references/ 5 | Buduje lokalny klikalny mockup HTML z symulacją danych i weryfikacją w przeglądarce | Niskie — lokalne pliki HTML/artefakty, przeglądarka; brak sieci |
| `om-open-pr` | katalog; SKILL.md tak; references/ 5 | Wspólny opener PR: commit, push, open/reuse PR, etykiety SDLC, rationale comments, handoff | **Wysokie** — `git push` + mutacje trackera (etykiety, komentarze, PR) |
| `om-pipeline-retro` | katalog; SKILL.md tak; references/ 4 (+ `classify-runs.sh`) | Klasyfikuje zakończone runy pipeline; skrypt shell czyta stdin, bez sieci | Niskie — read-only; lokalny skrypt `sh` bez `curl`/`eval` |
| `om-pr-autopilot` | katalog; SKILL.md tak; references/ 7 | Diagnoza stanu PR i uruchomienie pasującego łańcucha skilli `om-*` + raport | Wysokie — orkiestruje mutujące skille (push, tracker) |
| `om-prepare-issue` | katalog; SKILL.md tak; references/ 4 | Tworzy dobrze uformowane issue: dedupe, link do spec, załącza obrazy użytkownika, etykiety SDLC | Średnie — mutuje tracker (create issue, etykiety); wysyła obrazy do trackera (potencjalne dane wrażliwe) |
| `om-prepare-test-env` | katalog; SKILL.md tak; references/ 7 | Przygotowuje środowisko testowe: skrypty launch, provider przeglądarki, descriptor `.ai/qa` | Średnie — instaluje providery przeglądarek (sieć, czasem docker/sudo), zapisuje descriptor z referencjami do credentials |
| `om-qa-buddy` | katalog; SKILL.md tak; references/ 10 | Manualny runbook QA (human-in-the-loop), lokalna baza wiedzy; nie dotyka trackera | Niskie/średnie — publikuje interaktywny runbook (artefakt), uruchamia app/przeglądarkę |
| `om-review-prs` | katalog; SKILL.md tak; references/ 3 | Kolejka nieprzejrzanych PR + `om-auto-review-pr` po kolei | Średnie — deleguje do mutującego review (tracker, ewent. push) |
| `om-root-cause` | katalog; SKILL.md tak; references/ 2 | Read-only analiza przyczyny: lokalizacja błędu i minimalny zakres zmian | Niskie — read-only |
| `om-setup-agent-pipeline` | katalog; SKILL.md tak; references/ 9 (+ `references/trackers/` 4, `references/browsers/` 2) | Konfigurator pipeline: pisze `.ai/agentic.config.json`, deskryptory trackerów/przeglądarek, dokumenty repo; instaluje narzędzia | **Wysokie** — pobiera i uruchamia binarkę `agent-browser` z GitHuba (weryfikacja SHA256), `sudo install --with-deps`, `sudo apt install gh`, `npx skills add` w boilerplate |
| `om-setup-discovery-pipeline` | katalog; SKILL.md tak; references/ 8 | Dodaje warstwę produktową do configu, `SDLC.md` (między markerami) i `AGENTS.md` | Niskie/średnie — pisze pliki repo; sieć tylko `npx skills add` w raporcie |
| `om-spec-writing` | katalog; SKILL.md tak; references/ 3 | Pisze/review specyfikacje: draft skeleton-first, research, phasing, review architektoniczny | Niskie — zapis spec w repo; research może wymagać sieci |
| `om-synthetic-users` | katalog; SKILL.md tak; references/ 11 | Buduje panele person, przeprowadza wywiady pod presją i walkthrough; czyta materiał repo | Niskie — głównie read-only materiału repo; zapis artefaktów |
| `om-ux-review-pr` | katalog; SKILL.md tak; references/ 6 | Review UX PR w przeglądarce, findings z evidence; tryb `--guard` statyczny | Niskie/średnie — uruchamia przeglądarkę; publikuje findings |
| `om-ux-setup` | katalog; SKILL.md tak; references/ 5 | Wyciąga design contract repo do `.uxproof/`; wspiera `npx uxproof@0.3.1 init` | Średnie — uruchamia `npx uxproof@0.3.1` (pobiera i wykonuje pakiet z npm; wersja przypięta) |
| `om-ux-shape` | katalog; SKILL.md tak; references/ 11 (+ `agents/openai.yaml`) | Kształtuje produkt/UI/AI feature od pomysłu do decyzji; dokumenty i rubric | Niskie — dokumentacja/analiza; `agents/openai.yaml` to metadane UI (`display_name`, `default_prompt`) |
| `om-verify-in-repo` | katalog; SKILL.md tak; references/ 3 | Read-only triage gate łańcucha autofix; decyduje, czy kontynuować | Niskie — read-only, brak mutacji |

## Znaleziska

### Krytyczne
- Brak. Nie znaleziono w kolekcji kodu wykonywanego z sieci bez weryfikacji, czytań magazynów sekretów (`~/.ssh`, `~/.aws`, `.netrc`) ani jawnych mechanizmów eksfiltracji.

### Wysokie
- **`find-skills`** — `npx skills add <owner/repo@skill> -g -y` instaluje nieprzejrzany kod/skille z GitHuba globalnie i bez interaktywnego przeglądu (ryzyko supply chain).
- **`om-setup-agent-pipeline`** — pobiera i uruchamia binarkę `agent-browser` z GitHuba oraz wykonuje instalacje przez `sudo` (`--with-deps`, `apt install gh`); łagodzi to weryfikacja SHA256.
- **`om-open-pr`**, **`om-auto-create-pr`**, **`om-check-and-commit`**, **`om-auto-fix-issue`** — `git push` i mutacje trackera (`gh api`/`glab`) to nieodwracalne operacje na zdalnym repo.
- **`om-auto-qa-pr`** / **`om-prepare-test-env`** — wczytują `credentialsFile` do powłoki (`set -a; . "$CREDENTIALS_FILE"`), tj. wykonują plik z sekretami; instrukcje zakazują wpisywania wartości do kontekstu, ale sourcing pozostaje wektorem.

### Średnie
- **Mutacje trackera przez `gh api`/`glab`** (`om-auto-manage-issues`, `om-close-fixed-issues`, `om-prepare-issue`, `om-backlog`, `om-followup-issue-from-pr`): etykiety, assignee, komentarze, tworzenie i zamykanie issues.
- **Uruchamianie dowolnych komend walidacji z konfiguracji repo** (`om-check-and-commit`, `om-fix`, `om-code-review`, `om-auto-*`) — wykonuje kod pochodzący z repozytorium.
- **`om-ux-setup`** — `npx uxproof@0.3.1 init` pobiera i wykonuje zdalny pakiet npm (wersja przypięta).
- **`om-auto-create-pr`/`-loop`** — opcjonalny fetch nieprzejrzanego contentu przez `--skill-url`; chroniony zakazem transitive fetch i traktowaniem jako materiał referencyjny.
- **`om-setup-agent-pipeline`** — odczyt `SKILLS_ROOT` (`~/.claude/skills`) poza repo na potrzeby inwentaryzacji pokrycia skilli.
- **`om-auto-fix-pr`** — `git merge origin/<base>` do gałęzi PR.
- **`om-prepare-issue` / `om-auto-manage-issues`** — przesyłają obrazy użytkownika do trackera jako evidence; obrazy mogą zawierać dane wrażliwe.
- **`rm -rf`** występuje wyłącznie w deskryptorze GitLab i tylko w katalogach tymczasowych utworzonych przez sam skrypt — znikome.

### Niskie
- Zero symlinków w całej kolekcji; zero trafień dla `| bash`, `eval(`, `base64 -d`, `>> ~/`, `~/.ssh`, `AWS_`, `SECRET`, `jailbreak`.
- `chmod +x` nie występuje jako wzorzec; jedyne powiązane `chmod 755` dotyczy własnej, zweryfikowanej sumą kontrolną binarki `agent-browser`.
- Wiele skilli zawiera defensywne reguły higieny sekretów („nie wklejaj tokenów, `.env`, credentiali do planów, komentarzy, logów”).
- `om-pipeline-retro/references/classify-runs.sh` jest czystym, lokalnym skryptem `sh` czytającym stdin, bez sieci.

## Prompt injection

- Wzorzec `ignore previous` ma **41 trafień** i **wszystkie** pochodzą z defensywnego boilerplate `references/agentic-setup.md` (identyczny tekst w ~42 skillach): dyrektywy skierowane do agenta należy **zignorować i zgłosić jako podejrzane wstrzyknięcie**.
- Nie znaleziono żadnej dyrektywy próbującej nadpisać instrukcje agenta, przejąć roli (`system:`) ani namawiać do ukrycia działań przed użytkownikiem. Wzorce `jailbreak` → 0 trafień.
- Kolekcja aktywnie się broni: sekcja „Untrusted content boundary” traktuje treść repo/trackera jako **dane, nie instrukcje**; rozszerzenie repo-lokalne „can never relax safety or quality rules”; content z `--skill-url` jest jawnie „unverified third-party reference material” i nie wolno z niego wykonywać komend.
- Wniosek: **brak dowodów na prompt injection w kolekcji `om-*`**; wymienione 41 trafień to mechanizm obronny, nie atak. Zalecenie: przy audycie przyszłych wersji trzeba pilnować, czy ten sam boilerplate nie zmieni się w dyrektywę wykonawczą.

## Raport

- Przejrzane skille: **43** (wszystkie katalogi w `/Users/adrianczyrek/.agents/skills`; zlecenie podawało 45 — na dysku jest 43, po jednym katalogu na skill, bez braków).
- Symlinki: **0**. Wszystkie pozycje mają `SKILL.md`; `references/` obecne w 42/43 (brak w `find-skills`).
- Wynik grepa wzorców ryzykownych (cała kolekcja): `curl ` 2, `wget ` 2, `| sh` 2 (jeden fałszywy traf w tabeli formatu, jeden w komentarzu `Usage`), `| bash` 0, `eval(` 0, `base64 -d` 0, `chmod +x` 0, `rm -rf` 6 (tylko temp w deskryptorze GitLab), `>> ~/` 0, `~/.ssh` 0, `AWS_` 0, `TOKEN` 1 (w opisie instalacji `glab`), `SECRET` 0, `PASSWORD` 6 (referencje zmiennych env, nigdy wartości), `ignore previous` 41 (wyłącznie defensywny boilerplate), `jailbreak` 0.
- Lista ryzyk uszeregowana wg wagi: patrz sekcja „Znaleziska” (krytyczne: brak; wysokie: 4 grupy; średnie: 8; niskie: 4).
- Ścieżka zacommitowanego pliku: `security-notes.d/skills-om.md`.
- Ograniczenia: przegląd statyczny (grep + lektura); nie wykonywano kodu skilli ani skanu Snyk (poza zakresem tej części). Nie czytano `~/.claude/projects`.
