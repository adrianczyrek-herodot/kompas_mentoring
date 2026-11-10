"use client";

import { FIELDS_TO_FIX, VERIFICATION_CHECKLIST, verificationErrors, type Application } from "@devmentor/core/domain";
import { Badge } from "@devmentor/ui/backend/badge";
import { Button } from "@devmentor/ui/backend/button";
import { Card, CardContent } from "@devmentor/ui/backend/card";
import { Checkbox } from "@devmentor/ui/backend/checkbox";
import { Label } from "@devmentor/ui/backend/label";
import { RadioGroup, RadioGroupItem } from "@devmentor/ui/backend/radio-group";
import { Separator } from "@devmentor/ui/backend/separator";
import { Skeleton } from "@devmentor/ui/backend/skeleton";
import { toast } from "@devmentor/ui/backend/sonner";
import { EmptyState, ErrorState, PageHeader } from "@devmentor/ui/backend/state";
import { fmtDate } from "@devmentor/ui/lib/format";
import { cn } from "@devmentor/ui/lib/utils";
import { CirclePlayIcon, ShieldCheckIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { decideApplication } from "@/demo/actions";
import { useDemoStore } from "@/demo/use-demo-store";
import { useSetViewState, useViewState } from "@/demo/use-view-state";
import { CountedTextarea, FieldError } from "@/panel/form-field";
import { PersonAvatar } from "@/panel/person-avatar";

const KYC_VARIANT = { zweryfikowano: "default", oczekuje: "secondary", niezgodność: "destructive" } as const;

/** A1 — weryfikacja mentorów: kolejka zgłoszeń, checklista, decyzja (`?id=` wybrane zgłoszenie). */
export function VerificationView() {
  const store = useDemoStore();
  const state = useViewState();
  const setState = useSetViewState();
  const selectedId = useSearchParams().get("id");
  const list = state === "empty" ? [] : store.applications;
  const sel = list.find((a) => a.id === selectedId) ?? list[0];

  return (
    <>
      <PageHeader title="Weryfikacja mentorów"><span className="text-sm text-muted-foreground">SLA: 2 dni robocze</span></PageHeader>
      {state === "loading" && <div aria-busy="true" className="grid gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14" />)}</div>}
      {state === "error" && <ErrorState text="Nie udało się wczytać kolejki." onRetry={() => setState("success")} />}
      {(state === "empty" || (state === "success" && !sel)) && <EmptyState title="Kolejka pusta" text="Wszystkie zgłoszenia zostały rozpatrzone." />}
      {state === "success" && sel && (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
          <Card className="gap-0 py-0">
            <ul className="divide-y">
              {list.map((a) => (
                <li key={a.id}>
                  <Link href={`/admin/weryfikacja?id=${a.id}`} className={cn("flex items-center gap-3 px-4 py-3 hover:bg-muted/50", a === sel && "bg-muted")}>
                    <PersonAvatar name={a.name} hue={a.hue} />
                    <div className="min-w-0 flex-1"><strong>{a.name}</strong><p className="text-sm text-muted-foreground">{fmtDate(a.submitted)}</p></div>
                    {a.kyc !== "zweryfikowano" && <TriangleAlertIcon className="size-4 text-muted-foreground" aria-label="KYC do sprawdzenia" />}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <Decision key={sel.id} app={sel} />
        </div>
      )}
    </>
  );
}

function Decision({ app }: { app: Application }) {
  const router = useRouter();
  const [decision, setDecision] = useState("");
  const [checked, setChecked] = useState<boolean[]>(VERIFICATION_CHECKLIST.map(() => false));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next = verificationErrors({
      decision, kycVerified: app.kyc === "zweryfikowano", checklistDone: checked.every(Boolean),
      fieldsToFix: fd.getAll("fieldsToFix").length, comment: String(fd.get("comment") ?? ""),
    });
    setErrors(next);
    if (Object.keys(next).length) return;
    decideApplication(app.id);
    toast(decision === "approve" ? `${app.name}: profil opublikowany` : decision === "changes" ? "Wysłano prośbę o zmiany" : "Zgłoszenie odrzucone");
    router.replace("/admin/weryfikacja");
  };

  return (
    <Card>
      <CardContent className="grid gap-5">
        <div className="flex flex-wrap items-start gap-4">
          <PersonAvatar name={app.name} hue={app.hue} className="size-[72px] text-xl" />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold">{app.name}</h2>
            <p className="text-muted-foreground">{app.headline}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant={KYC_VARIANT[app.kyc]}>KYC: {app.kyc}</Badge>
              <Badge variant="outline">{app.linkedin ? "LinkedIn podany" : "Brak LinkedIn"}</Badge>
              {app.categories.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}
            </div>
          </div>
        </div>
        <div className="grid aspect-[21/9] place-items-center content-center gap-2 rounded-lg bg-muted text-muted-foreground">
          <CirclePlayIcon className="size-8" /><span>Wideo powitalne</span>
        </div>
        <fieldset className="grid gap-2">
          <legend className="mb-2 font-medium">Checklista</legend>
          {VERIFICATION_CHECKLIST.map((c, i) => (
            <Label key={c} className="flex items-center gap-2 font-normal">
              <Checkbox data-chk checked={checked[i]} onCheckedChange={(v) => setChecked((list) => list.map((x, j) => (j === i ? v === true : x)))} /> {c}
            </Label>
          ))}
        </fieldset>
        <Separator />
        <form onSubmit={submit} noValidate className="grid gap-4">
          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-medium">Decyzja</legend>
            <RadioGroup name="decision" value={decision} onValueChange={setDecision} className="flex flex-wrap gap-4">
              {[["approve", "Zatwierdź"], ["changes", "Poproś o zmiany"], ["reject", "Odrzuć"]].map(([v, l]) => (
                <Label key={v} className="flex items-center gap-2 font-normal"><RadioGroupItem value={v!} /> {l}</Label>
              ))}
            </RadioGroup>
            <FieldError>{errors.decision}</FieldError>
          </fieldset>
          {decision === "changes" && (
            <fieldset className="grid gap-2" data-fields>
              <legend className="mb-2 text-sm font-medium">Pola do poprawy</legend>
              <div className="flex flex-wrap gap-2">
                {FIELDS_TO_FIX.map((p) => (
                  <Label key={p} className="flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 font-normal has-[:checked]:border-primary has-[:checked]:bg-accent">
                    <Checkbox name="fieldsToFix" value={p} /> {p}
                  </Label>
                ))}
              </div>
              <FieldError>{errors.fieldsToFix}</FieldError>
            </fieldset>
          )}
          <CountedTextarea name="comment" label="Komentarz dla kandydata" max={1000} rows={3} error={errors.comment} />
          <Button type="submit" className="w-fit">Zapisz decyzję</Button>
        </form>
        <p className="flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheckIcon className="size-4" /> Każda decyzja trafia do dziennika audytu.</p>
      </CardContent>
    </Card>
  );
}
