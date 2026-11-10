"use client";

import { firstError, range, required } from "@devmentor/core/validation";
import { MENTOR_BOOKED_SLOTS } from "@devmentor/db/fixtures";
import { Alert, AlertDescription } from "@devmentor/ui/backend/alert";
import { Button } from "@devmentor/ui/backend/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@devmentor/ui/backend/card";
import { Checkbox } from "@devmentor/ui/backend/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@devmentor/ui/backend/dialog";
import { Input } from "@devmentor/ui/backend/input";
import { Label } from "@devmentor/ui/backend/label";
import { Skeleton } from "@devmentor/ui/backend/skeleton";
import { toast } from "@devmentor/ui/backend/sonner";
import { ToggleGroup, ToggleGroupItem } from "@devmentor/ui/backend/toggle-group";
import { PageHeader } from "@devmentor/ui/backend/state";
import { dayShort } from "@devmentor/ui/lib/format";
import { CheckIcon, TriangleAlertIcon } from "lucide-react";
import { useState, type FormEvent } from "react";
import { setAvailability } from "@/demo/actions";
import { useDemoStore } from "@/demo/use-demo-store";
import { useViewState } from "@/demo/use-view-state";
import { AvailabilityGrid } from "@/panel/availability-grid";
import { FormField } from "@/panel/form-field";

/** M3 — kalendarz: szablon tygodniowy dostępności, ustawienia rezerwacji, wyjątki, Google Calendar. */
export function CalendarView() {
  const store = useDemoStore();
  const state = useViewState();
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [exception, setException] = useState(false);
  const empty = state === "empty";

  const saveSettings = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next = { notice: range(2, 48, " h")(String(fd.get("notice"))), buffer: range(0, 30, " min")(String(fd.get("buffer"))) };
    setErrors(next);
    if (!next.notice && !next.buffer) toast("Ustawienia zapisane");
  };

  return (
    <>
      <PageHeader title="Kalendarz i dostępność"><span className="text-sm text-muted-foreground">Europe/Warsaw</span></PageHeader>
      {empty && <Alert className="mb-4"><TriangleAlertIcon /><AlertDescription>Nie masz ustawionej dostępności — uczniowie nie mogą cię zarezerwować.</AlertDescription></Alert>}
      {state === "error" && (
        <Alert variant="destructive" className="mb-4" role="alert">
          <AlertDescription className="flex flex-wrap items-center gap-2">
            Synchronizacja z Google Calendar przestała działać.
            <Button variant="link" size="sm" className="h-auto p-0" data-resync onClick={() => toast("Przekierowanie do Google…")}>Połącz ponownie</Button>
          </AlertDescription>
        </Alert>
      )}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>Tydzień 19–25 paź</CardTitle>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="size-3 rounded-sm border border-primary/40 bg-primary/15" />dostępne</span>
                <span className="flex items-center gap-1"><span className="size-3 rounded-sm bg-primary" />sesja</span>
                <span className="flex items-center gap-1"><span className="size-3 rounded-sm border bg-muted/40" />niedostępne</span>
              </div>
            </div>
            <CardDescription>Kliknij lub przeciągnij po siatce, żeby zmienić szablon tygodniowy.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {state === "loading" ? <div aria-busy="true" className="grid gap-2">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-8" />)}</div> : (
              <>
                <AvailabilityGrid
                  selected={empty ? new Set() : store.mentorTemplate}
                  booked={MENTOR_BOOKED_SLOTS}
                  dayLabel={(d) => `${dayShort(d)} ${19 + d}`}
                  onChange={(k, on) => { setAvailability("template", k, on); setDirty(true); }}
                />
                <p className="text-sm text-muted-foreground" data-avail-sum>{store.mentorTemplate.size} h tygodniowo</p>
              </>
            )}
            <div className="flex items-center gap-3">
              <Button data-save onClick={() => { setDirty(false); toast("Szablon dostępności zapisany"); }}>Zapisz szablon</Button>
              {dirty && <span className="text-sm text-muted-foreground" data-dirty>Niezapisane zmiany</span>}
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4">
          <Card>
            <CardHeader><CardTitle>Ustawienia rezerwacji</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={saveSettings} noValidate className="grid gap-4">
                <FormField label="Minimalne wyprzedzenie (h)" htmlFor="f-notice" error={errors.notice}>
                  <Input id="f-notice" name="notice" type="number" min={2} max={48} defaultValue="6" aria-invalid={errors.notice ? true : undefined} />
                </FormField>
                <FormField label="Przerwa między sesjami (min)" htmlFor="f-buffer" error={errors.buffer}>
                  <Input id="f-buffer" name="buffer" type="number" min={0} max={30} defaultValue="10" aria-invalid={errors.buffer ? true : undefined} />
                </FormField>
                <Label className="flex items-center gap-2 font-normal"><Checkbox name="accepting" defaultChecked /> Przyjmuję nowych uczniów</Label>
                <Button type="submit" variant="outline">Zapisz ustawienia</Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Wyjątki</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              <p className="text-sm">31 paź – 2 lis · urlop</p>
              <Button variant="outline" size="sm" className="w-fit" data-exception onClick={() => setException(true)}>Dodaj wyjątek</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Google Calendar</CardTitle></CardHeader>
            <CardContent className="text-sm">
              {state === "error" ? <span className="text-destructive">Rozłączono</span>
                : <span className="flex gap-2"><CheckIcon className="size-4 shrink-0" /> Połączono · zajęte terminy z kalendarza są automatycznie niedostępne</span>}
            </CardContent>
          </Card>
        </div>
      </div>
      {exception && <ExceptionDialog onClose={() => setException(false)} />}
    </>
  );
}

function ExceptionDialog({ onClose }: { onClose: () => void }) {
  const [kind, setKind] = useState("off");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const from = String(fd.get("from") ?? "");
    const to = String(fd.get("to") ?? "");
    const next = {
      from: required("Podaj datę.")(from),
      to: firstError(to, [required("Podaj datę."), (v) => (v >= from ? null : "Data końca nie może być wcześniejsza.")]),
    };
    setErrors(next);
    if (next.from || next.to) return;
    onClose();
    toast("Wyjątek dodany. 1 sesja w tym okresie wymaga przełożenia — wysłaliśmy uczniowi prośbę.");
  };
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Dodaj wyjątek</DialogTitle></DialogHeader>
        <form onSubmit={submit} noValidate className="grid gap-4">
          <ToggleGroup type="single" variant="outline" value={kind} onValueChange={(v) => v && setKind(v)} className="w-fit">
            <ToggleGroupItem value="off">Niedostępność</ToggleGroupItem>
            <ToggleGroupItem value="extra">Dodatkowe godziny</ToggleGroupItem>
          </ToggleGroup>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Od" htmlFor="f-from" error={errors.from}><Input id="f-from" name="from" type="date" aria-invalid={errors.from ? true : undefined} /></FormField>
            <FormField label="Do" htmlFor="f-to" error={errors.to}><Input id="f-to" name="to" type="date" aria-invalid={errors.to ? true : undefined} /></FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Anuluj</Button>
            <Button type="submit">Dodaj</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
