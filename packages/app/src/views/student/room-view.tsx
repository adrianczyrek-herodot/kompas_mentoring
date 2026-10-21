"use client";

import { canJoin, type Session } from "@devmentor/core/domain";
import { DEMO_NOW } from "@devmentor/db/fixtures";
import { Avatar } from "@devmentor/ui/frontend/avatar";
import { buttonVariants } from "@devmentor/ui/frontend/button";
import { cardClass } from "@devmentor/ui/frontend/card";
import { Icon } from "@devmentor/ui/frontend/icon";
import { Spinner } from "@devmentor/ui/frontend/spinner";
import { ErrorState } from "@devmentor/ui/frontend/state";
import { toast } from "@devmentor/ui/frontend/toast";
import { h2Class, smallMuted } from "@devmentor/ui/frontend/typography";
import { fmtTime } from "@devmentor/ui/lib/format";
import { cn } from "@devmentor/ui/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { completeSession, markNoShow } from "@/demo/actions";
import { mentorById, sessionById } from "@/demo/store";
import { useDemoStore } from "@/demo/use-demo-store";
import { useViewState } from "@/demo/use-view-state";
import { BackLink, MentorSummary, firstName } from "./common";

/** U6 — pokój sesji: test sprzętu (domyślnie) i rozmowa (`?krok=pokoj`). */
export function RoomView({ id }: { id: string }) {
  useDemoStore();
  const state = useViewState();
  const phase = useSearchParams().get("krok") === "pokoj" ? "room" : "check";
  const s = sessionById(id);

  if (!s) return <ErrorState text="Nie znaleziono sesji." />;
  if (state === "error") {
    return (
      <div className={cn(cardClass, "mx-auto max-w-[640px] space-y-3")}>
        <Icon name="alert" />
        <h1 className={h2Class}>Brak dostępu do kamery i mikrofonu</h1>
        <p>Przeglądarka zablokowała dostęp. Kliknij ikonę kłódki obok adresu strony, zezwól na kamerę i mikrofon, a potem odśwież.</p>
        <div className="flex gap-2">
          <Link className={buttonVariants()} href={`/sesje/${s.id}/pokoj`}>Spróbuj ponownie</Link>
          <Link className={buttonVariants({ variant: "ghost" })} href={`/sesje/${s.id}/pokoj?krok=pokoj`}>Wejdź tylko z czatem</Link>
        </div>
      </div>
    );
  }
  if (state === "loading") {
    return (
      <div aria-busy="true" className="flex min-h-[calc(100vh-92px)] flex-col items-center justify-center gap-3 bg-mock text-[#e7f0ec]">
        <Spinner large className="text-white" /><p>Łączenie z pokojem…</p>
      </div>
    );
  }
  return phase === "check" ? <DeviceCheck s={s} /> : <Room s={s} waiting={state === "empty"} />;
}

function DeviceCheck({ s }: { s: Session }) {
  const m = mentorById(s.mentorId)!;
  const ok = (text: string) => <span className="text-ok"><Icon name="check" /> {text}</span>;
  return (
    <div className="mx-auto max-w-[1160px] px-4 pt-5 pb-12">
      <BackLink href={`/sesje/${s.id}`}>Szczegóły sesji</BackLink>
      <div className="grid gap-5 min-[900px]:grid-cols-[1fr_360px] min-[900px]:items-start">
        <section className={cn(cardClass, "space-y-3")}>
          <h1 className={h2Class}>Test sprzętu</h1>
          <div className="grid aspect-[4/3] content-center place-items-center gap-2 rounded-card bg-[radial-gradient(circle_at_30%_30%,#2a6b5e,#0f2e29)] text-center text-[#e7f0ec]">
            <Avatar name="Ty" hue={12} size={80} /><span>Podgląd kamery</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between"><span><Icon name="cam" /> Kamera</span>{ok("działa")}</div>
            <div className="flex items-center justify-between">
              <span><Icon name="mic" /> Mikrofon</span>
              <span className="h-1.5 w-[100px] overflow-hidden rounded-[3px] bg-line-2"><span className="block h-full w-[60%] animate-meter bg-ok" /></span>
            </div>
            <div className="flex items-center justify-between"><span>Połączenie</span>{ok("dobre (38 ms)")}</div>
          </div>
        </section>
        <aside className={cn(cardClass, "flex flex-col gap-3.5")}>
          <MentorSummary mentor={m}>{fmtTime(s.startsAt)} · {s.durationMin} min</MentorSummary>
          <p className="text-[0.85rem]"><Icon name="target" /> {s.goal}</p>
          {canJoin(s, DEMO_NOW)
            ? <Link className={buttonVariants({ block: true })} href={`/sesje/${s.id}/pokoj?krok=pokoj`}>Dołącz do sesji</Link>
            : <button type="button" className={buttonVariants({ block: true })} disabled>Pokój otworzy się 10 min przed startem</button>}
        </aside>
      </div>
    </div>
  );
}

const ctrl = "grid size-12 cursor-pointer place-items-center rounded-full border-0 bg-[#2a3532] text-white";

function Room({ s, waiting }: { s: Session; waiting: boolean }) {
  const router = useRouter();
  const m = mentorById(s.mentorId)!;
  const [sec, setSec] = useState(0);
  const [toggles, setToggles] = useState({ mic: true, cam: true, screen: false });
  const [panelOpen, setPanelOpen] = useState(false);
  const [tab, setTab] = useState<"chat" | "notes">("chat");
  const [sent, setSent] = useState<string[]>([]);

  useEffect(() => {
    const t = setInterval(() => setSec((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const mmss = `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

  const send = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem("msg") as HTMLInputElement;
    if (!input.value.trim()) return;
    setSent((list) => [...list, input.value]);
    input.value = "";
  };
  const noShow = () => {
    markNoShow(s);
    toast("Zgłoszono nieobecność mentora. Sesja wróciła do salda.");
    router.push(`/sesje/${s.id}`);
  };
  const end = () => {
    completeSession(s);
    router.push(`/sesje/${s.id}/ocena`);
  };
  const toggle = (key: keyof typeof toggles, label: string, icon: string) => (
    <button type="button" data-toggle aria-pressed={toggles[key]} aria-label={label} onClick={() => setToggles((t) => ({ ...t, [key]: !t[key] }))}
      className={cn(ctrl, toggles[key] ? "bg-[#3d4b48]" : "bg-[#5a2420]")}>
      <Icon name={icon} />
    </button>
  );
  const tabBtn = (key: "chat" | "notes", label: string) => (
    <button type="button" data-rtab={key} onClick={() => setTab(key)}
      className={cn("-mb-px cursor-pointer border-0 border-b-2 bg-transparent px-3.5 py-2.5 font-semibold", tab === key ? "border-accent text-white" : "border-transparent text-[#a9b6b2]")}>
      {label}
    </button>
  );

  return (
    <div className="relative flex min-h-[calc(100vh-92px)] flex-col bg-mock text-[#e7f0ec] min-[900px]:grid min-[900px]:grid-cols-[1fr_320px] min-[900px]:grid-rows-[auto_1fr_auto]">
      <div className="flex justify-between px-4 py-3 min-[900px]:col-start-1">
        <strong>{m.name}</strong>
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[0.85rem]" data-timer>{mmss} / {s.durationMin}:00</span>
      </div>
      <div className="relative mx-3 flex-1 min-[900px]:col-start-1">
        <div className="absolute inset-0 grid min-h-80 place-items-center rounded-card bg-[radial-gradient(circle_at_50%_40%,#24443e,#121c1b)]">
          {waiting ? (
            <div className="space-y-2 text-center">
              <Spinner /><p>{firstName(m.name)} jeszcze nie dołączyła</p>
              <button type="button" data-noshow className={buttonVariants({ variant: "light", size: "s" })} onClick={noShow}>Mentor się nie pojawił</button>
              <span className="block text-[0.85rem] text-[#a9b6b2]">Przycisk aktywny po 10 min oczekiwania</span>
            </div>
          ) : (
            <>
              <Avatar name={m.name} hue={m.hue} size={120} />
              <span className="absolute bottom-2 left-2.5 rounded-md bg-black/40 px-2 py-px text-[0.78rem]">{m.name}</span>
            </>
          )}
        </div>
        <div className="absolute right-3 bottom-3 grid h-[90px] w-[120px] place-items-center rounded-card border-2 border-mock bg-[#2a3532]">
          <Avatar name="Ty" hue={12} size={48} />
          <span className="absolute bottom-2 left-2.5 rounded-md bg-black/40 px-2 py-px text-[0.78rem]">Ty</span>
        </div>
      </div>
      <div className="flex justify-center gap-2.5 p-3.5 min-[900px]:col-start-1">
        {toggle("mic", "Mikrofon", "mic")}
        {toggle("cam", "Kamera", "cam")}
        {toggle("screen", "Udostępnij ekran", "screen")}
        <button type="button" data-panel aria-label="Czat i notatki" className={ctrl} onClick={() => setPanelOpen((o) => !o)}><Icon name="chat" /></button>
        <button type="button" data-end aria-label="Zakończ" className="cursor-pointer rounded-full border-0 bg-err px-[18px] font-semibold text-white" onClick={end}>Zakończ</button>
      </div>
      <aside className={cn("mx-3 mb-3 rounded-card bg-[#172220] p-3 min-[900px]:col-start-2 min-[900px]:row-span-3 min-[900px]:m-3 min-[900px]:block", panelOpen ? "block" : "hidden")} data-room-panel>
        <div className="mb-4 flex gap-1 border-b border-[#2a3532]">{tabBtn("chat", "Czat")}{tabBtn("notes", "Wspólne notatki")}</div>
        {tab === "chat" ? (
          <div className="space-y-2">
            <div className="w-fit max-w-[80%] rounded-[14px_14px_14px_4px] bg-line-2 px-3 py-2 text-[0.92rem] text-ink">Hej! Wrzuć link do repo, przejrzymy na ekranie.</div>
            {sent.map((t, i) => <div key={i} className="ml-auto w-fit max-w-[80%] rounded-[14px_14px_4px_14px] bg-brand px-3 py-2 text-[0.92rem] text-white">{t}</div>)}
            <form className="flex items-center gap-2" onSubmit={send}>
              <input name="msg" placeholder="Wiadomość…" aria-label="Wiadomość" className="min-h-[42px] w-full rounded-field border border-[#2a3532] bg-mock px-3 py-2.5 text-white" />
              <button type="submit" className={buttonVariants({ size: "s" })}>Wyślij</button>
            </form>
          </div>
        ) : (
          <div>
            <textarea rows={8} aria-label="Wspólne notatki" defaultValue={"- Rozdzielić walidację od komponentu formularza\n- "}
              className="w-full rounded-field border border-[#2a3532] bg-mock px-3 py-2.5 text-white" />
            <p className={cn(smallMuted, "text-[#a9b6b2]")}>Zapisuje się automatycznie.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
