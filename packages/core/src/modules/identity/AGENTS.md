# Moduł `identity` — konta, role, sesje, zgody

Odpowiada za: konta i sesje logowania (Better Auth), role i uprawnienia, `returnTo` po zalogowaniu, zgody z wersjami dokumentów, 2FA dla adminów, podstawy S3 (spec stacku §2.3, faza F1 — `.ai/specs/2026-11-10-f1-tozsamosc.md`).

## Język domeny
- `role` — `student`, `mentor`, `admin_trust`, `admin_finance`; `permission` — np. `account.manage.own`, `admin.access` (lista rośnie w kolejnych fazach).
- `consent` — zgoda na dokument (`terms`, `privacy`, `marketing`) z wersją i czasem.

## Niezmienniki
- Rola i uprawnienie sprawdzane w każdej komendzie i zapytaniu (nie tylko w UI); brak uprawnień → 403, cudzy zasób → 404 (spec §8).
- `returnTo` tylko ścieżki wewnętrzne — `domain/policies/return-to.policy.ts` (ochrona przed open redirect).
- Hasło 10–128 znaków (`password.policy.ts`); sprawdzenie w bazie wycieków (HIBP, plugin Better Auth; `AUTH_BREACHED_PASSWORD_CHECK=off` tylko w testach) — przy awarii HIBP rejestracja jest odrzucana (fail closed, Q8).
- Sesje: 30 dni odnawiane; admini 12 h od zalogowania — Better Auth przedłuża każdą sesję o `expiresIn`, więc limit admina egzekwuje `sessionExpiresAt` przy odczycie sesji; admin bez 2FA nie wchodzi na trasy admina (`session.policy.ts`, Q4–Q5).
- Zgody zapisujemy z wersją dokumentu z `domain/policies/config.ts` i czasem z `Clock` (Q6).
- Zmiany w tym module wymagają przeglądu człowieka (spec §10.2).

## Struktura (spec §2.4)
- `domain/` czysty TS · `application/` komendy (fabryki z zależnościami, porty jako interfejsy) · `infrastructure/` Better Auth + Kysely, repozytoria · `migrations/` SQL Better Auth (schemat `identity`) i tabele modułu.
- Better Auth dostaje Kysely z puli MikroORM (`orm.em.getConnection().getClient()`) z `TimestampParsingPlugin` — pula MikroORM zwraca `timestamptz` jako tekst, a Better Auth porównuje daty. Tabele Better Auth mają kolumny camelCase; tabele modułu (`consent`) — snake_case.
- SQL Better Auth w `migrations/` generujemy, nie piszemy: `getMigrations(auth.options).compileMigrations()` na pustej bazie (Testcontainers) po każdej zmianie konfiguracji auth (pluginy, pola dodatkowe).
- Konta adminów tylko przez CLI: `ADMIN_PASSWORD=… pnpm admin:create --email … [--name …] [--role admin_trust|admin_finance]` (Q4); 2FA admin włącza przy pierwszym wejściu na `/admin`.
