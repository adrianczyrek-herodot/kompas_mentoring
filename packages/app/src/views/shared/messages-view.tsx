"use client";

import { OFF_PLATFORM, type Thread } from "@devmentor/core/domain";
import { firstError, length, required } from "@devmentor/core/validation";
import { DEMO_NOW } from "@devmentor/db/fixtures";
import { Avatar } from "@devmentor/ui/frontend/avatar";
import { buttonVariants } from "@devmentor/ui/frontend/button";
import { Icon } from "@devmentor/ui/frontend/icon";
import { inputClass } from "@devmentor/ui/frontend/field";
import { listClass, listItemClass } from "@devmentor/ui/frontend/list";
import { Skeleton } from "@devmentor/ui/frontend/skeleton";
import { EmptyState, ErrorState } from "@devmentor/ui/frontend/state";
import { toast } from "@devmentor/ui/frontend/toast";
import { h1Class, smallMuted } from "@devmentor/ui/frontend/typography";
import { fmtDate, fmtTime } from "@devmentor/ui/lib/format";
import { cn } from "@devmentor/ui/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { markThreadRead, rememberReturnTo, sendMessage, threadWith } from "@/demo/actions";
import { mentorById } from "@/demo/store";
import { useDemoStore } from "@/demo/use-demo-store";
import { useSetViewState, useViewState } from "@/demo/use-view-state";

/** S1 — wiadomości; `/wiadomosci/nowa?m=<mentor>` otwiera (albo zakłada) rozmowę z mentorem. */
export function MessagesView({ id }: { id?: string }) {
  const store = useDemoStore();
  const router = useRouter();
  const params = useSearchParams();
  const state = useViewState();
  const setState = useSetViewState();
  const newWith = id === "nowa" ? mentorById(params.get("m") ?? "") : undefined;

  // Nowa rozmowa: gość musi się zalogować (wróci do rozmowy), zalogowany trafia pod adres wątku.
  useEffect(() => {
    if (!newWith) return;
    const t = threadWith(newWith);
    if (!store.loggedIn) {
      rememberReturnTo(`#/wiadomosci/${t.id}`);
      toast("Zaloguj się, aby napisać do mentora");
      router.push("/logowanie");
    } else router.replace(`/wiadomosci/${t.id}`);
  }, [newWith, store.loggedIn, router]);

  const threads = state === "empty" ? [] : store.threads;
  const t = threads.find((x) => x.id === id);
  useEffect(() => { if (t) markThreadRead(t); }, [t]);
  if (newWith) return null;

  return (
    <>
      <div className={cn("mb-4 flex flex-wrap items-center justify-between gap-3", t && "max-md:hidden")}><h1 className={cn(h1Class, "m-0")}>Wiadomości</h1></div>
      {state === "loading" && <Skeleton rows={4} kind="line" />}
      {state === "error" && <ErrorState text="Nie udało się wczytać wiadomości." onRetry={() => setState("success")} />}
      {state === "empty" && (
        <EmptyState title="Brak wiadomości" text="Napisz do mentora z jego profilu, żeby zapytać o szczegóły przed rezerwacją."
          action={<Link className={buttonVariants()} href="/mentorzy">Przeglądaj mentorów</Link>} />
      )}
      {state === "success" && (
        <div className="grid gap-4 md:h-[calc(100vh-200px)] md:min-h-[460px] md:grid-cols-[320px_1fr]">
          <div className={cn(listClass, "md:overflow-auto", t && "max-md:hidden")}>
            {threads.map((x) => {
              const last = x.messages[x.messages.length - 1];
              return (
                <Link key={x.id} href={`/wiadomosci/${x.id}`} className={cn(listItemClass, "hover:bg-[#fbfaf6]", x === t && "bg-brand-soft hover:bg-brand-soft")}>
                  <Avatar name={x.withName} hue={x.hue} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between"><strong>{x.withName}</strong><span className={smallMuted}>{last ? fmtDate(last.at) : ""}</span></div>
                    <span className={cn(smallMuted, "block truncate")}>{last?.text ?? "Nowa rozmowa"}</span>
                  </div>
                  {x.unread > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-[10px] bg-accent px-1.5 text-[0.72rem] font-bold text-white">{x.unread}</span>}
                </Link>
              );
            })}
          </div>
          {t ? <ThreadPane key={t.id} t={t} /> : (
            <div className="hidden flex-col justify-center overflow-hidden rounded-card border border-line bg-surface md:flex">
              <EmptyState title="Wybierz rozmowę" text="Wiadomości z mentorami i uczniami są tutaj." />
            </div>
          )}
        </div>
      )}
    </>
  );
}

function ThreadPane({ t }: { t: Thread }) {
  const store = useDemoStore();
  const body = useRef<HTMLDivElement>(null);
  const [warn, setWarn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failed, setFailed] = useState<string[]>([]);
  const upcoming = store.sessions.find((s) => mentorById(s.mentorId)?.name === t.withName && s.status === "scheduled");

  useEffect(() => { body.current?.scrollTo({ top: body.current.scrollHeight }); }, [t.messages.length, failed.length]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ta = e.currentTarget.elements.namedItem("text") as HTMLTextAreaElement;
    const err = firstError(ta.value, [required("Wiadomość nie może być pusta."), length(1, 2000)]);
    setError(err);
    if (err) return;
    const text = ta.value.trim();
    ta.value = "";
    setWarn(false);
    // Mockup: wiadomość ze słowem „błąd” symuluje nieudane wysłanie.
    if (text.toLowerCase().includes("błąd")) { setFailed((f) => [...f, text]); return; }
    sendMessage(t, text, DEMO_NOW);
  };
  const resend = (i: number) => {
    sendMessage(t, failed[i]!, DEMO_NOW);
    setFailed((f) => f.filter((_, j) => j !== i));
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); }
  };

  return (
    <div className="flex min-h-[60vh] flex-col overflow-hidden rounded-card border border-line bg-surface md:min-h-0">
      <div className="flex items-center gap-2.5 border-b border-line-2 px-3.5 py-3">
        <Link href="/wiadomosci" className="inline-flex text-ink-2 md:hidden" aria-label="Wróć"><Icon name="back" /></Link>
        <Avatar name={t.withName} hue={t.hue} size={36} /><strong>{t.withName}</strong>
      </div>
      {upcoming && (
        <Link href={`/sesje/${upcoming.id}`} className="mx-3.5 mt-2.5 flex items-center gap-2 rounded-field bg-brand-soft px-3 py-2 text-[0.85rem] font-semibold text-brand no-underline">
          <Icon name="cal" /> Najbliższa sesja: {fmtDate(upcoming.startsAt)}, {fmtTime(upcoming.startsAt)}
        </Link>
      )}
      <div ref={body} className="flex flex-1 flex-col gap-2 overflow-auto p-3.5" data-body>
        {t.messages.length || failed.length ? (
          <>
            {t.messages.map((m, i) => (
              <div key={i} className={cn("w-fit max-w-[80%] px-3 py-2 text-[0.92rem]", m.me ? "ml-auto rounded-[14px_14px_4px_14px] bg-brand text-white" : "rounded-[14px_14px_14px_4px] bg-line-2 text-ink")}>
                {m.text}<span className="block text-right text-[0.68rem] opacity-65">{fmtTime(m.at)}</span>
              </div>
            ))}
            {failed.map((text, i) => (
              <div key={`f${i}`} className="ml-auto w-fit max-w-[80%] rounded-[14px_14px_4px_14px] bg-err-soft px-3 py-2 text-[0.92rem] text-err">
                {text}
                <button type="button" data-resend className="block cursor-pointer border-0 bg-transparent p-0 text-[0.85rem] font-semibold text-err" onClick={() => resend(i)}>Nie wysłano · Ponów</button>
              </div>
            ))}
          </>
        ) : <p className="m-0 p-6 text-center text-ink-2">Przedstaw się i napisz, z czym przychodzisz. Mentorzy odpowiadają zwykle w ciągu kilku godzin.</p>}
      </div>
      {warn && (
        <p className="mx-3.5 flex flex-wrap items-start gap-2 rounded-field bg-warn-soft px-3.5 py-2.5 text-[0.85rem] text-warn" data-warn>
          <Icon name="shield" /> Dla Twojego bezpieczeństwa rozliczaj się tylko przez Kompas — poza platformą nie działa gwarancja ani zwroty.
        </p>
      )}
      <form onSubmit={submit} noValidate className="flex gap-2 border-t border-line-2 px-3 py-2.5">
        <textarea name="text" rows={1} placeholder="Napisz wiadomość…" aria-label="Wiadomość" aria-invalid={error ? true : undefined}
          className={cn(inputClass, "resize-none")} onChange={(e) => setWarn(OFF_PLATFORM.test(e.target.value))} onKeyDown={onKey} />
        <button type="submit" aria-label="Wyślij" className={cn(buttonVariants(), "w-11 flex-none px-0")}><Icon name="arrow" /></button>
      </form>
      {error && <p className="m-0 px-3 pb-2 text-[0.82rem] text-err" aria-live="polite">{error}</p>}
    </div>
  );
}
