"use client";

import { firstError, length, required } from "@devmentor/core/validation";
import { STUDENTS } from "@devmentor/db/fixtures";
import { Button } from "@devmentor/ui/backend/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@devmentor/ui/backend/card";
import { Input } from "@devmentor/ui/backend/input";
import { Label } from "@devmentor/ui/backend/label";
import { toast } from "@devmentor/ui/backend/sonner";
import { ErrorState } from "@devmentor/ui/backend/state";
import { Textarea } from "@devmentor/ui/backend/textarea";
import { fmtDateLong } from "@devmentor/ui/lib/format";
import { ArrowLeftIcon, TargetIcon } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useDemoStore } from "@/demo/use-demo-store";
import { useSetViewState, useViewState } from "@/demo/use-view-state";
import { CountedTextarea, FieldError } from "@/panel/form-field";
import { PersonAvatar } from "@/panel/person-avatar";

/** M4 — uczeń: notatka po sesji z zadaniami, historia, prywatne notatki. */
export function StudentView({ id }: { id: string }) {
  const store = useDemoStore();
  const state = useViewState();
  const setState = useSetViewState();
  const [items, setItems] = useState(1);
  const [formKey, setFormKey] = useState(0);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const s = STUDENTS.find((x) => x.id === id);
  if (!s || state === "error") return <ErrorState text="Nie znaleziono ucznia." onRetry={() => setState("success")} />;
  const past = s.id === "st1" ? store.sessions.filter((x) => x.mentorId === "m1" && x.status === "completed") : [];

  const send = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const tasks = fd.getAll("item").map((v) => String(v).trim()).filter(Boolean);
    const next = {
      covered: firstError(String(fd.get("covered") ?? ""), [required(), length(20, 3000)]),
      item: tasks.find((t) => t.length < 3 || t.length > 200) ? "Zadanie: 3–200 znaków." : null,
    };
    setErrors(next);
    if (next.covered || next.item) return;
    toast(`Notatka wysłana${tasks.length ? ` z ${tasks.length} zadaniem/ami` : ""}`);
    setItems(1);
    setFormKey((k) => k + 1);
  };

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-4"><Link href="/mentor/uczniowie"><ArrowLeftIcon /> Uczniowie</Link></Button>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="grid gap-6">
          <Card>
            <CardContent className="flex flex-wrap items-start gap-4">
              <PersonAvatar name={s.name} hue={s.hue} className="size-16 text-lg" />
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-semibold">{s.name}</h1>
                <p className="flex items-center gap-1.5 text-sm"><TargetIcon className="size-4" /> {s.goal}</p>
                <p className="text-sm text-muted-foreground">Plan: {s.plan} · saldo: {s.balance} · {s.sessions} sesji</p>
              </div>
              <Button asChild variant="outline" size="sm"><Link href="/wiadomosci/t1">Napisz</Link></Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Notatka po sesji · 18 paź</CardTitle></CardHeader>
            <CardContent>
              <form key={formKey} onSubmit={send} noValidate className="grid gap-4">
                <CountedTextarea name="covered" label="Co omówiliśmy" max={3000} rows={3} error={errors.covered} placeholder="np. Rozdzielenie logiki formularza od prezentacji…" />
                <div className="grid gap-2">
                  <Label>Zadania dla ucznia</Label>
                  {Array.from({ length: items }, (_, i) => (
                    <div key={i} className="flex gap-2">
                      <Input name="item" placeholder={i === 0 ? "np. Dodaj testy do walidacji" : "Zadanie"} aria-label="Zadanie" />
                      <Input name="due" type="date" className="w-40" aria-label="Termin" />
                    </div>
                  ))}
                  <Button type="button" variant="link" size="sm" className="h-auto w-fit p-0" data-add-item onClick={() => setItems((n) => n + 1)}>+ Dodaj zadanie</Button>
                  <FieldError>{errors.item}</FieldError>
                </div>
                <CountedTextarea name="next" label="Na następną sesję (opcjonalnie)" max={3000} rows={2} />
                <Button type="submit" className="w-fit">Wyślij notatkę uczniowi</Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Historia</CardTitle></CardHeader>
            <CardContent>
              {past.length ? (
                <ol className="grid gap-4 border-l-2 pl-4">
                  {past.map((p) => (
                    <li key={p.id} className="grid gap-1">
                      <span><strong>{fmtDateLong(p.startsAt)}</strong> · {p.goal}</span>
                      {p.note ? <p className="text-sm text-muted-foreground">{p.note}</p> : <p className="text-sm text-destructive">Brak notatki</p>}
                    </li>
                  ))}
                </ol>
              ) : <p className="text-muted-foreground">Brak odbytych sesji.</p>}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Prywatne notatki</CardTitle><CardDescription>Widzisz tylko Ty.</CardDescription></CardHeader>
          <CardContent className="grid gap-3">
            <Textarea rows={6} aria-label="Prywatne notatki" defaultValue="Mocny w CSS, słabszy w testach. Motywuje go konkretny termin." />
            <Button variant="outline" size="sm" className="w-fit" data-priv onClick={() => toast("Zapisano")}>Zapisz</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
