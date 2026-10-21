"use client";

import { CATEGORIES, MIN_PAYOUT, ONBOARDING_STEPS, SESSION_LANGUAGES, mentorNetFor, onboardingErrors } from "@devmentor/core/domain";
import { Alert, AlertDescription } from "@devmentor/ui/backend/alert";
import { Badge } from "@devmentor/ui/backend/badge";
import { Button } from "@devmentor/ui/backend/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devmentor/ui/backend/card";
import { Checkbox } from "@devmentor/ui/backend/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@devmentor/ui/backend/dialog";
import { Input } from "@devmentor/ui/backend/input";
import { Label } from "@devmentor/ui/backend/label";
import { Progress } from "@devmentor/ui/backend/progress";
import { Skeleton } from "@devmentor/ui/backend/skeleton";
import { toast } from "@devmentor/ui/backend/sonner";
import { money } from "@devmentor/ui/lib/format";
import { cn } from "@devmentor/ui/lib/utils";
import { CheckIcon, CirclePlayIcon, ShieldCheckIcon, UserIcon, WalletIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { enterMentorPanel, saveOnboarding, setAvailability, submitOnboarding } from "@/demo/actions";
import { useDemoStore } from "@/demo/use-demo-store";
import { useForcedState, useViewState } from "@/demo/use-view-state";
import { AvailabilityGrid } from "@/panel/availability-grid";
import { CountedTextarea, FieldError, FormField } from "@/panel/form-field";
import { PersonAvatar } from "@/panel/person-avatar";

/** Pola wielokrotnego wyboru — zapisywane jako lista po przecinku. */
const MULTI = ["lang", "cat"];

function ChoiceChips({ name, options, checked, error }: { name: string; options: readonly string[]; checked: string[]; error?: string }) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Label key={o} className="flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 font-normal has-[:checked]:border-primary has-[:checked]:bg-accent">
            <Checkbox name={name} value={o} defaultChecked={checked.includes(o)} /> {o}
          </Label>
        ))}
      </div>
      <FieldError>{error}</FieldError>
    </>
  );
}

function TextField({ name, label, errors, value, ...props }: { name: string; label: string; errors: Record<string, string>; value?: string; type?: string; placeholder?: string; min?: number; max?: number; step?: number; onChange?: (v: string) => void }) {
  const { onChange, ...rest } = props;
  return (
    <FormField label={label} htmlFor={`f-${name}`} error={errors[name]}>
      <Input id={`f-${name}`} name={name} defaultValue={value} aria-invalid={errors[name] ? true : undefined} {...rest} onChange={(e) => onChange?.(e.target.value)} />
    </FormField>
  );
}

/** M1 — onboarding mentora w 6 krokach (`/mentor/onboarding/1` … `/6`, `wyslano`). */
export function OnboardingView({ step: stepParam }: { step: string }) {
  const router = useRouter();
  const store = useDemoStore();
  const state = useViewState();
  const forced = useForcedState();
  const form = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<{ name: string; headline: string; bio: string } | null>(null);
  const [rate, setRate] = useState(Number(store.onboarding.data.rate ?? 180));
  const ob = store.onboarding;
  const d = ob.data;

  if (ob.status === "submitted" || stepParam === "wyslano") {
    return (
      <div className="mx-auto grid max-w-2xl gap-6">
        <div className="text-center">
          <CheckIcon className="mx-auto mb-3 size-12 rounded-full bg-accent p-3" />
          <h1 className="text-2xl font-semibold">Profil wysłany do weryfikacji</h1>
          <p className="text-muted-foreground">Zwykle sprawdzamy zgłoszenia w ciągu 2 dni roboczych. Damy znać e-mailem — jeśli czegoś zabraknie, wskażemy konkretne pola.</p>
        </div>
        <Card>
          <CardHeader><CardTitle>Status</CardTitle></CardHeader>
          <CardContent>
            <ol className="grid grid-cols-3 gap-2 text-center text-sm">
              <li className="border-t-4 border-primary/40 pt-2 text-muted-foreground">Szkic</li>
              <li className="border-t-4 border-primary pt-2 font-semibold">Weryfikacja</li>
              <li className="border-t-4 border-border pt-2 text-muted-foreground">Profil publiczny</li>
            </ol>
          </CardContent>
        </Card>
        <p className="text-sm text-muted-foreground">
          Mockup: zatwierdź zgłoszenie jako admin (przełącz rolę) albo{" "}
          <Link href="/mentor" className="font-medium text-foreground underline" data-skip onClick={enterMentorPanel}>przejdź do panelu mentora</Link>.
        </p>
      </div>
    );
  }

  const step = Math.min(6, Math.max(1, Number(stepParam) || 1));
  const list = (k: string) => (d[k] ?? "").split(",").filter(Boolean);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values: Record<string, string> = {};
    fd.forEach((v, k) => { if (!MULTI.includes(k)) values[k] = String(v); });
    if (step === 1) values.lang = fd.getAll("lang").join(",");
    if (step === 2) values.cat = fd.getAll("cat").join(",");
    const next = onboardingErrors(step, values, {
      hasPhoto: Boolean(d.photo), hasVideo: Boolean(d.video), kycDone: Boolean(d.kyc), availabilityHours: ob.availability.size,
    });
    setErrors(next);
    if (Object.keys(next).length) return;
    saveOnboarding(values);
    if (step === 6) {
      submitOnboarding();
      router.push("/mentor/onboarding/wyslano");
    } else {
      toast("Zapisano szkic");
      setErrors({});
      router.push(`/mentor/onboarding/${step + 1}`);
    }
  };

  const verifyItem = (icon: ReactNode, title: string, body: ReactNode) => (
    <div className="grid gap-2 rounded-lg border p-3"><span className="flex items-center gap-2 font-medium">{icon} {title}</span>{body}</div>
  );

  const body: Record<number, ReactNode> = {
    1: (
      <>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col items-center gap-2">
            {d.name ? <PersonAvatar name={d.name} hue={168} className="size-[88px] text-2xl" />
              : <span className="grid size-[88px] place-items-center rounded-full border-2 border-dashed text-muted-foreground"><UserIcon /></span>}
            <Button type="button" variant="outline" size="sm" data-photo onClick={() => { saveOnboarding({ photo: "zdjecie.jpg" }); toast("Dodano zdjęcie (400×400)"); }}>Dodaj zdjęcie</Button>
            <FieldError>{errors.photo}</FieldError>
          </div>
          <div className="grid min-w-60 flex-1 gap-4">
            <TextField name="name" label="Imię i nazwisko" errors={errors} value={d.name} />
            <TextField name="country" label="Kraj" errors={errors} value={d.country ?? "Polska"} />
          </div>
        </div>
        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm font-medium">Języki sesji</legend>
          <ChoiceChips name="lang" options={SESSION_LANGUAGES} checked={d.lang ? list("lang") : ["polski"]} error={errors.lang} />
        </fieldset>
        <p className="text-sm text-muted-foreground">Zdjęcie: JPG/PNG, min. 400×400 px, do 5 MB, wyraźnie widoczna twarz.</p>
      </>
    ),
    2: (
      <>
        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm font-medium">Kategorie (1–5)</legend>
          <ChoiceChips name="cat" options={CATEGORIES} checked={list("cat")} error={errors.cat} />
        </fieldset>
        <TextField name="tags" label="Umiejętności (3–15, oddziel przecinkami)" errors={errors} value={d.tags} placeholder="np. React, TypeScript, Code review" />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="years" label="Lata doświadczenia" type="number" min={1} max={50} errors={errors} value={d.years} />
          <TextField name="companies" label="Firmy (opcjonalnie)" errors={errors} value={d.companies} />
        </div>
      </>
    ),
    3: (
      <>
        <CountedTextarea name="headline" label="Nagłówek profilu" max={80} rows={2} error={errors.headline} defaultValue={d.headline} placeholder="np. Senior Frontend Engineer · React i architektura UI" />
        <CountedTextarea name="bio" label="Opis: z czym pomagasz i jak pracujesz" max={2000} rows={7} error={errors.bio} defaultValue={d.bio} />
        <div className="grid gap-2">
          <Label>Wideo powitalne</Label>
          <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-5 text-center text-sm text-muted-foreground" data-video>
            <CirclePlayIcon className="size-6" />
            <span>{d.video ? `Dodano: ${d.video}` : "Przeciągnij plik MP4/MOV (30 s – 3 min, do 200 MB)"}</span>
            <Button type="button" variant="outline" size="sm" data-video-btn onClick={() => saveOnboarding({ video: "powitanie.mp4 · 1:42" })}>Wybierz plik</Button>
          </div>
          <TextField name="videoUrl" label="albo link YouTube / Vimeo" errors={errors} value={d.videoUrl} placeholder="https://youtu.be/…" />
        </div>
      </>
    ),
    4: (
      <>
        <TextField name="rate" label="Stawka za 60 min (zł)" type="number" min={40} max={1000} step={5} errors={errors} value={d.rate ?? "180"} onChange={(v) => setRate(Number(v) || 0)} />
        <div className="grid grid-cols-2 gap-3" data-earn>
          <div className="rounded-lg bg-muted p-3"><span className="text-sm text-muted-foreground">Zarobisz za 60 min (na start, prowizja 33%)</span><strong className="block text-2xl">{money(mentorNetFor(rate, 0))}</strong></div>
          <div className="rounded-lg bg-muted p-3"><span className="text-sm text-muted-foreground">Po 200 h (prowizja 18%)</span><strong className="block text-2xl">{money(mentorNetFor(rate, 200))}</strong></div>
        </div>
        <p className="text-sm text-muted-foreground">Sesja 30 min kosztuje połowę stawki. Prowizja maleje z liczbą przepracowanych godzin: 33% → 28% → 20% → 18%. Sesja próbna w całości jest prowizją platformy. Minimalna wypłata: {MIN_PAYOUT} zł.</p>
      </>
    ),
    5: (
      <>
        <p className="text-sm">Zaznacz godziny, w których uczniowie mogą rezerwować sesje (Twoja strefa: Europe/Warsaw). Minimum 3 h tygodniowo.</p>
        <AvailabilityGrid selected={ob.availability} onChange={(k, on) => setAvailability("onboarding", k, on)} />
        <p className="text-sm text-muted-foreground" data-avail-sum>{ob.availability.size} h tygodniowo</p>
        <FieldError>{errors.avail}</FieldError>
      </>
    ),
    6: (
      <>
        <div className="grid gap-3">
          {verifyItem(<UserIcon className="size-4" />, "Profil LinkedIn", <TextField name="linkedin" label="Link do profilu" errors={errors} value={d.linkedin} placeholder="https://linkedin.com/in/…" />)}
          {verifyItem(<ShieldCheckIcon className="size-4" />, "Weryfikacja tożsamości", (
            <>
              <Button type="button" variant="outline" size="sm" className="w-fit" data-kyc onClick={() => { saveOnboarding({ kyc: "1" }); toast("Tożsamość zweryfikowana przez operatora"); }}>
                {d.kyc ? <><CheckIcon /> Zweryfikowano</> : "Rozpocznij (u operatora, ok. 3 min)"}
              </Button>
              <FieldError>{errors.kyc}</FieldError>
            </>
          ))}
          {verifyItem(<WalletIcon className="size-4" />, "Dane do wypłat", <TextField name="iban" label="Numer konta (IBAN)" errors={errors} value={d.iban} placeholder="PL00 0000 0000 0000 0000 0000 0000" />)}
        </div>
        <Label className="flex cursor-pointer items-start gap-2 font-normal">
          <Checkbox name="terms" defaultChecked={Boolean(d.terms)} className="mt-0.5" /> Akceptuję regulamin dla mentorów (m.in. zakaz rozliczeń poza platformą)
        </Label>
        <FieldError>{errors.terms}</FieldError>
      </>
    ),
  };

  const openPreview = () => {
    const f = form.current;
    if (!f) return;
    const get = (n: string) => (f.elements.namedItem(n) as HTMLInputElement | HTMLTextAreaElement | null)?.value ?? "";
    setPreview({ name: d.name || "", headline: get("headline"), bio: get("bio") });
  };

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <div className="grid gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Zostań mentorem · krok {step} z 6</p>
        <h1 className="text-2xl font-semibold">{ONBOARDING_STEPS[step - 1]}</h1>
        <Progress value={(step / 6) * 100} />
        <ol className="flex gap-1.5 overflow-x-auto text-xs">
          {ONBOARDING_STEPS.map((s, i) => (
            <li key={s}>
              {i + 1 < step
                ? <Link href={`/mentor/onboarding/${i + 1}`}><Badge variant="secondary">{s}</Badge></Link>
                : <Badge variant={i + 1 === step ? "default" : "outline"}>{s}</Badge>}
            </li>
          ))}
        </ol>
      </div>
      {forced === "error" && <Alert variant="destructive" role="alert"><AlertDescription>Nie udało się zapisać kroku. Twoje dane są w formularzu — spróbuj ponownie.</AlertDescription></Alert>}
      <Card>
        <CardContent>
          <form ref={form} key={step} onSubmit={submit} noValidate className="grid gap-5">
            {state === "loading" ? <div aria-busy="true" className="grid gap-3"><Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-10" /></div> : body[step]}
            <div className="flex items-center justify-between">
              {step > 1 ? <Button asChild variant="outline"><Link href={`/mentor/onboarding/${step - 1}`}>Wstecz</Link></Button> : <span />}
              <div className="flex gap-2">
                {step === 3 && <Button type="button" variant="outline" data-preview onClick={openPreview}>Podgląd profilu</Button>}
                <Button type="submit">{step === 6 ? "Wyślij do weryfikacji" : "Zapisz i dalej"}</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground">Szkic zapisuje się po każdym kroku — możesz wrócić później.</p>
      <Dialog open={preview !== null} onOpenChange={(o) => { if (!o) setPreview(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Podgląd karty w wynikach</DialogTitle></DialogHeader>
          {preview && (
            <Card>
              <CardContent className="grid gap-2">
                <div className="flex items-center gap-2">
                  <PersonAvatar name={preview.name || "Nowy Mentor"} hue={168} className="size-14" />
                  <div><strong>{preview.name || "Twoje imię"}</strong><br /><span className="text-sm">{preview.headline || "Twój nagłówek"}</span></div>
                </div>
                <p className={cn("text-sm text-muted-foreground")}>{(preview.bio || "Twój opis…").slice(0, 180)}</p>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
