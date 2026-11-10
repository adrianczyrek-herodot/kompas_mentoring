"use client";

import { DECLINE_REASONS, declineErrors } from "@devmentor/core/domain";
import { MENTOR_KPIS, STUDENTS } from "@devmentor/db/fixtures";
import { Badge } from "@devmentor/ui/backend/badge";
import { Button } from "@devmentor/ui/backend/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@devmentor/ui/backend/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@devmentor/ui/backend/dialog";
import { Label } from "@devmentor/ui/backend/label";
import { RadioGroup, RadioGroupItem } from "@devmentor/ui/backend/radio-group";
import { Skeleton } from "@devmentor/ui/backend/skeleton";
import { toast } from "@devmentor/ui/backend/sonner";
import { EmptyState, ErrorState, PageHeader } from "@devmentor/ui/backend/state";
import { fmtDate, fmtTime } from "@devmentor/ui/lib/format";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { answerTrialRequest } from "@/demo/actions";
import { useDemoStore } from "@/demo/use-demo-store";
import { useSetViewState, useViewState } from "@/demo/use-view-state";
import { CountedTextarea, FieldError } from "@/panel/form-field";
import { PersonAvatar } from "@/panel/person-avatar";

/** M2 — pulpit mentora: wskaźniki, dzisiejsze sesje, prośby o sesję próbną, zadania. */
export function DashboardView() {
  const store = useDemoStore();
  const router = useRouter();
  const state = useViewState();
  const setState = useSetViewState();
  const [declining, setDeclining] = useState<string | null>(null);
  const today = STUDENTS.filter((s) => s.nextSession?.startsWith("2026-10-20"));
  const requests = state === "empty" ? [] : store.requests;

  return (
    <>
      <PageHeader eyebrow="Wtorek, 20 października" title="Dzień dobry, Kasia" />
      {state === "error" && <ErrorState text="Nie udało się wczytać panelu." onRetry={() => setState("success")} />}
      {state === "loading" && <div aria-busy="true" className="grid gap-4 md:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>}
      {(state === "success" || state === "empty") && (
        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {MENTOR_KPIS.map(([label, value, note, up]) => (
              <Card key={label} className="gap-1 py-4">
                <CardContent className="grid gap-1">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <strong className="text-2xl font-semibold">{value}</strong>
                  <span className={up ? "text-xs font-medium text-foreground" : "text-xs text-muted-foreground"}>{up ? "▲ " : ""}{note}</span>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Dziś</CardTitle>
                <Button asChild variant="link" size="sm"><Link href="/mentor/kalendarz">Kalendarz</Link></Button>
              </CardHeader>
              <CardContent>
                {state === "empty" || !today.length ? (
                  <EmptyState title="Brak sesji dzisiaj" text="Dodaj wieczorne godziny dostępności — to najczęściej wyszukiwana pora."
                    action={<Button asChild variant="outline"><Link href="/mentor/kalendarz">Edytuj dostępność</Link></Button>} />
                ) : (
                  <ul className="divide-y">
                    {today.map((s) => (
                      <li key={s.id} className="flex items-center gap-3 py-3">
                        <span className="w-14 rounded-md bg-muted py-1.5 text-center font-semibold">{fmtTime(s.nextSession!)}</span>
                        <div className="min-w-0 flex-1"><strong>{s.name}</strong><p className="truncate text-sm text-muted-foreground">{s.goal}</p></div>
                        {fmtTime(s.nextSession!) === "14:05"
                          ? <Button size="sm" data-join onClick={() => router.push("/sesje/s1/pokoj")}>Dołącz</Button>
                          : <Badge variant="secondary">Za 3 h</Badge>}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">Prośby o sesję próbną {requests.length > 0 && <Badge>{requests.length}</Badge>}</CardTitle>
                <CardDescription>Odpowiedz w 24 h — potem zaakceptujemy automatycznie, jeśli termin jest wolny.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {requests.length ? requests.map((r) => (
                  <article key={r.id} data-req={r.id} className="grid gap-2 rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <PersonAvatar name={r.student} hue={r.hue} />
                      <div><strong>{r.student}</strong><p className="text-sm text-muted-foreground">{fmtDate(r.startsAt)}, {fmtTime(r.startsAt)} · 30 min</p></div>
                    </div>
                    <p className="text-sm">„{r.goal}”</p>
                    <div className="flex gap-2">
                      <Button size="sm" data-accept={r.id} onClick={() => { answerTrialRequest(r.id); toast("Sesja próbna potwierdzona. Uczeń dostał powiadomienie."); }}>Akceptuj</Button>
                      <Button size="sm" variant="outline" data-decline={r.id} onClick={() => setDeclining(r.id)}>Odrzuć</Button>
                    </div>
                  </article>
                )) : <EmptyState title="Brak nowych próśb" text="Nowe prośby o sesję próbną pojawią się tutaj." />}
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Do zrobienia</CardTitle></CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm">
                <li><Link className="font-medium underline" href="/mentor/uczniowie/st1">Dodaj notatkę po sesji z Adrianem C. (18 paź)</Link></li>
                <li><Link className="font-medium underline" href="/wiadomosci">Odpowiedz na 1 wiadomość</Link></li>
                <li><Link className="font-medium underline" href="/mentor/kalendarz">Brak dostępności w weekend 31 paź – 1 lis — uzupełnij lub oznacz urlop</Link></li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
      {declining && <DeclineDialog id={declining} onClose={() => setDeclining(null)} />}
    </>
  );
}

function DeclineDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const [why, setWhy] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = declineErrors(why, String(new FormData(e.currentTarget).get("other") ?? ""));
    setErrors(next);
    if (Object.keys(next).length) return;
    answerTrialRequest(id);
    onClose();
    toast("Prośba odrzucona, uczeń dostanie zwrot.");
  };
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Odrzuć prośbę</DialogTitle>
          <DialogDescription>Uczeń dostanie automatyczny zwrot i propozycję 3 podobnych mentorów.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="grid gap-4">
          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-medium">Powód (uczeń go zobaczy)</legend>
            <RadioGroup name="why" value={why} onValueChange={setWhy}>
              {DECLINE_REASONS.map((r) => (
                <Label key={r} className="flex items-center gap-2 font-normal"><RadioGroupItem value={r} /> {r}</Label>
              ))}
            </RadioGroup>
            <FieldError>{errors.why}</FieldError>
          </fieldset>
          <CountedTextarea name="other" label="Wyjaśnienie" max={300} rows={2} error={errors.other} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Anuluj</Button>
            <Button type="submit" variant="destructive">Odrzuć</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
