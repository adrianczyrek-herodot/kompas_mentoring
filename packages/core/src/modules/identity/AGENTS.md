# Moduł `identity` — konta, role, sesje, zgody

Odpowiada za: konta i sesje logowania (Better Auth), role i uprawnienia, `returnTo` po zalogowaniu, zgody z wersjami dokumentów, 2FA dla adminów, podstawy S3 (spec stacku §2.3, faza F1 — `.ai/specs/2026-11-10-f1-tozsamosc.md`).

## Język domeny
- `role` — `student`, `mentor`, `admin_trust`, `admin_finance`; `permission` — np. `account.manage.own`, `admin.access` (lista rośnie w kolejnych fazach).
- `consent` — zgoda na dokument (`terms`, `privacy`, `marketing`) z wersją i czasem.

## Niezmienniki
- Rola i uprawnienie sprawdzane w każdej komendzie i zapytaniu (nie tylko w UI); brak uprawnień → 403, cudzy zasób → 404 (spec §8).
- `returnTo` tylko ścieżki wewnętrzne — `domain/policies/return-to.policy.ts` (ochrona przed open redirect).
- Hasło 10–128 znaków (`password.policy.ts`); sprawdzenie w bazie wycieków (HIBP) to port w `infrastructure/` (Q8).
- Sesje: 30 dni użytkownicy, 12 h admini; admin bez 2FA nie wchodzi na trasy admina (`session.policy.ts`, Q4–Q5).
- Zgody zapisujemy z wersją dokumentu z `domain/policies/config.ts` i czasem z `Clock` (Q6).
- Zmiany w tym module wymagają przeglądu człowieka (spec §10.2).

## Struktura (spec §2.4)
- `domain/` czysty TS · `application/` komendy (fabryki z zależnościami, porty jako interfejsy) · `infrastructure/` Better Auth + Kysely, repozytoria · `migrations/` SQL Better Auth (schemat `identity`) i tabele modułu.
