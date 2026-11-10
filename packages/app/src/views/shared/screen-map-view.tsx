"use client";

import type { Role } from "@devmentor/core/domain";
import { cardClass } from "@devmentor/ui/frontend/card";
import { h1Class, h3Class } from "@devmentor/ui/frontend/typography";
import { cn } from "@devmentor/ui/lib/utils";
import Link from "next/link";
import { assumeRole, selectSlot, switchRole } from "@/demo/actions";
import { toUrl } from "@/demo/navigation";
import { store } from "@/demo/store";

// [id, nazwa, trasa mockupu, rola ustawiana przed przejściem]
const SCREEN_MAP: { group: string; items: [string, string, string, Role][] }[] = [
  { group: "Publiczne", items: [
    ["P1", "Strona główna", "#/", "guest"], ["P2", "Wyszukiwarka mentorów", "#/mentorzy", "guest"], ["P3", "Profil mentora", "#/mentorzy/m1", "guest"],
    ["P4", "Logowanie / rejestracja", "#/rejestracja", "guest"]] },
  { group: "Uczeń", items: [
    ["U1", "Wybór terminu", "#/rezerwacja/m5", "student"], ["U2", "Checkout", "#/rezerwacja/m5/platnosc", "student"], ["U3", "Potwierdzenie", "#/potwierdzenie/s3", "student"],
    ["U4", "Moje sesje", "#/sesje", "student"], ["U5", "Szczegóły sesji", "#/sesje/s2", "student"], ["U6", "Pokój sesji", "#/sesje/s1/pokoj", "student"],
    ["U7", "Ocena sesji (po próbnej)", "#/sesje/s5/ocena", "student"], ["U8", "Plany i saldo", "#/plany", "student"], ["U9", "Postępy", "#/postepy", "student"],
    ["S1", "Wiadomości", "#/wiadomosci/t1", "student"], ["S2", "Powiadomienia", "#/powiadomienia", "student"], ["S3", "Konto", "#/konto", "student"]] },
  { group: "Mentor", items: [
    ["M1", "Onboarding (6 kroków)", "#/mentor/onboarding/1", "mentor"], ["M2", "Panel mentora", "#/mentor", "mentor"], ["M3", "Kalendarz i dostępność", "#/mentor/kalendarz", "mentor"],
    ["M4", "Uczniowie i notatki", "#/mentor/uczniowie/st1", "mentor"], ["M5", "Zarobki i wypłaty", "#/mentor/zarobki", "mentor"]] },
  { group: "Admin", items: [["A1", "Weryfikacja mentorów", "#/admin/weryfikacja", "admin"], ["A2", "Spory i zwroty", "#/admin/spory", "admin"]] },
];

const FLOWS: { name: string; steps: string }[] = [
  { name: "F1 Wyszukanie → sesja próbna", steps: "Gość: Strona główna → szukaj „React” → profil Kasi → wybierz termin → rejestracja → płatność (kod KOMPAS10) → potwierdzenie" },
  { name: "F2 Sesja → ocena → plan", steps: "Uczeń: Moje sesje → Dołącz (sesja o 14:05) → test sprzętu → pokój → Zakończ → ocena (sesja próbna z 9 paź) → wybór planu" },
  { name: "F3 Przełożenie i anulowanie", steps: "Uczeń: Moje sesje → sesja 23 paź → Przełóż / Anuluj (bezpłatnie) · sesja dziś 14:05 → Anuluj (ostrzeżenie: przepada)" },
  { name: "F4 Onboarding mentora", steps: "Gość: „Zostań mentorem” → 6 kroków z walidacją → wysłano → Admin: Weryfikacja → zatwierdź" },
  { name: "F5 Praca mentora", steps: "Mentor: Panel → akceptuj/odrzuć prośby → Kalendarz (przeciągnij po siatce) → Uczniowie → notatka → Zarobki → wypłata" },
  { name: "F6 Spór i zwrot", steps: "Uczeń: sesja z 18 paź → Zgłoś problem · Admin: Spory → rozstrzygnij" },
];

/** Ustawia rolę ekranu (uczeń dostaje personę demo tylko przy zmianie roli), a dla checkoutu — przykładowy wybrany termin. */
function prepare(role: Role, route: string): void {
  if (role === "student" && store.role === "student") assumeRole("student"); else switchRole(role);
  if (route === "#/rezerwacja/m5/platnosc") selectSlot({ mentorId: "m5", startsAt: "2026-10-22T09:00:00.000Z", durationMin: 30, type: "trial" });
}

/** Mapa ekranów — pomoc do przeglądu mockupu. */
export function ScreenMapView() {
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h1 className={cn(h1Class, "m-0")}>Mapa ekranów</h1></div>
      <p className="text-ink-2">Kliknięcie ustawia odpowiednią rolę i otwiera ekran. Każdy ekran ma podgląd stanów w pasku mockupu na dole.</p>
      <section className={cardClass}>
        <h2 className={h3Class}>Ścieżki do przejścia</h2>
        <ol className="m-0 grid gap-2.5 pl-5">
          {FLOWS.map((f) => <li key={f.name}><strong>{f.name}</strong><br /><span className="text-[0.85rem]">{f.steps}</span></li>)}
        </ol>
      </section>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {SCREEN_MAP.map((g) => (
          <section key={g.group} className={cardClass}>
            <h2 className={h3Class}>{g.group}</h2>
            <ul className="m-0 grid list-none gap-0.5 p-0">
              {g.items.map(([id, name, route, role]) => (
                <li key={id}>
                  <Link href={toUrl(route)} data-role-go={role} onClick={() => prepare(role, route)}
                    className="flex items-center gap-2.5 rounded-lg px-1.5 py-2 no-underline hover:bg-brand-soft">
                    <span className="min-w-8 rounded-[5px] bg-brand px-1.5 py-px text-center font-mono text-[0.78rem] text-white">{id}</span>{name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
