"use client";

import { DISPUTE_RESOLUTIONS, resolutionErrors, type Dispute } from "@devmentor/core/domain";
import { Badge } from "@devmentor/ui/backend/badge";
import { Button } from "@devmentor/ui/backend/button";
import { Card, CardContent } from "@devmentor/ui/backend/card";
import { Input } from "@devmentor/ui/backend/input";
import { Label } from "@devmentor/ui/backend/label";
import { RadioGroup, RadioGroupItem } from "@devmentor/ui/backend/radio-group";
import { Skeleton } from "@devmentor/ui/backend/skeleton";
import { toast } from "@devmentor/ui/backend/sonner";
import { EmptyState, ErrorState, PageHeader } from "@devmentor/ui/backend/state";
import { fmtDate, money } from "@devmentor/ui/lib/format";
import { cn } from "@devmentor/ui/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { resolveDispute } from "@/demo/actions";
import { useDemoStore } from "@/demo/use-demo-store";
import { useSetViewState, useViewState } from "@/demo/use-view-state";
import { CountedTextarea, FieldError, FormField } from "@/panel/form-field";

/** A2 — spory i zwroty: oś zdarzeń pokoju, stanowiska stron, rozstrzygnięcie (`?id=` wybrany spór). */
export function DisputesView() {
  const store = useDemoStore();
  const state = useViewState();
  const setState = useSetViewState();
  const selectedId = useSearchParams().get("id");
  const list = state === "empty" ? [] : store.disputes;
  const sel = list.find((d) => d.id === selectedId) ?? list[0];

  return (
    <>
      <PageHeader title="Spory i zwroty" />
      {state === "loading" && <div aria-busy="true" className="grid gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14" />)}</div>}
      {state === "error" && <ErrorState text="Nie udało się wczytać sporów." onRetry={() => setState("success")} />}
      {(state === "empty" || (state === "success" && !sel)) && <EmptyState title="Brak otwartych sporów" text="Nowe zgłoszenia problemów pojawią się tutaj." />}
      {state === "success" && sel && (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
          <Card className="gap-0 py-0">
            <ul className="divide-y">
              {list.map((d) => (
                <li key={d.id}>
                  <Link href={`/admin/spory?id=${d.id}`} className={cn("block px-4 py-3 hover:bg-muted/50", d === sel && "bg-muted")}>
                    <strong>{d.reason}</strong>
                    <p className="text-sm text-muted-foreground">{d.student} ↔ {d.mentor} · {fmtDate(d.opened)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <Resolution key={sel.id} dispute={sel} />
        </div>
      )}
    </>
  );
}

function Resolution({ dispute: d }: { dispute: Dispute }) {
  const router = useRouter();
  const [resolution, setResolution] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next = resolutionErrors({ resolution, amount: String(fd.get("amount") ?? ""), max: d.amount, why: String(fd.get("why") ?? "") });
    setErrors(next);
    if (Object.keys(next).length) return;
    resolveDispute(d.id);
    toast("Spór rozstrzygnięty. Obie strony dostały powiadomienie.");
    router.replace("/admin/spory");
  };

  const quote = (who: string, text: string) => (
    <div className="rounded-lg bg-muted p-3">
      <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">{who}</p>
      <p className="text-sm">{text}</p>
    </div>
  );

  return (
    <Card>
      <CardContent className="grid gap-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">{d.reason}</h2>
          <Badge variant="secondary">Otwarty</Badge>
        </div>
        <p className="-mt-3 text-sm text-muted-foreground">Sesja {d.sessionId} · wartość {money(d.amount)}</p>
        <div>
          <h3 className="mb-2 font-medium">Oś zdarzeń pokoju</h3>
          <ol className="grid gap-2 border-l-2 pl-4 font-mono text-sm">{d.events.map((ev) => <li key={ev}>{ev}</li>)}</ol>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {quote(`Uczeń · ${d.student}`, d.studentSays)}
          {quote(`Mentor · ${d.mentor}`, d.mentorSays)}
        </div>
        <form onSubmit={submit} noValidate className="grid gap-4">
          <fieldset className="grid gap-2">
            <legend className="mb-2 font-medium">Rozstrzygnięcie</legend>
            <RadioGroup name="res" value={resolution} onValueChange={setResolution}>
              {DISPUTE_RESOLUTIONS.map(([v, l]) => <Label key={v} className="flex items-center gap-2 font-normal"><RadioGroupItem value={v} /> {l}</Label>)}
            </RadioGroup>
            <FieldError>{errors.res}</FieldError>
          </fieldset>
          {resolution === "partial" && (
            <FormField label={`Kwota zwrotu (maks. ${d.amount} zł)`} htmlFor="f-amount" error={errors.amount}>
              <Input id="f-amount" name="amount" type="number" className="w-40" aria-invalid={errors.amount ? true : undefined} />
            </FormField>
          )}
          <CountedTextarea name="why" label="Uzasadnienie (otrzymają obie strony)" max={1000} rows={3} error={errors.why} />
          <Button type="submit" className="w-fit">Rozstrzygnij spór</Button>
        </form>
      </CardContent>
    </Card>
  );
}
