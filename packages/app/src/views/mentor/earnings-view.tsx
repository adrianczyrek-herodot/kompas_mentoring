"use client";

import { MIN_PAYOUT, availableForPayout, commissionRate, nextTier, pendingEarnings, type Earning } from "@devmentor/core/domain";
import { EARNINGS, MENTOR_HOURS_WORKED } from "@devmentor/db/fixtures";
import { Alert, AlertDescription } from "@devmentor/ui/backend/alert";
import { Badge } from "@devmentor/ui/backend/badge";
import { Button } from "@devmentor/ui/backend/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devmentor/ui/backend/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@devmentor/ui/backend/dialog";
import { Progress } from "@devmentor/ui/backend/progress";
import { Skeleton } from "@devmentor/ui/backend/skeleton";
import { toast } from "@devmentor/ui/backend/sonner";
import { EmptyState, PageHeader } from "@devmentor/ui/backend/state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@devmentor/ui/backend/table";
import { fmtDate, money } from "@devmentor/ui/lib/format";
import { CircleAlertIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { requestPayout } from "@/demo/actions";
import { useDemoStore } from "@/demo/use-demo-store";
import { useViewState } from "@/demo/use-view-state";

const STATUS_VARIANT: Record<Earning["status"], "default" | "secondary" | "outline"> = { dostępne: "default", oczekujące: "secondary", wypłacone: "outline" };

/** M5 — zarobki: dostępne do wypłaty, oczekujące, próg prowizji, historia. */
export function EarningsView() {
  const store = useDemoStore();
  const state = useViewState();
  const [payout, setPayout] = useState(false);
  const hours = MENTOR_HOURS_WORKED;
  const rate = commissionRate(hours);
  const tier = nextTier(hours);
  const available = availableForPayout(EARNINGS, store.payoutDone);
  const pending = pendingEarnings(EARNINGS);
  const list = state === "empty" ? [] : EARNINGS;

  return (
    <>
      <PageHeader title="Zarobki i wypłaty">
        <Button variant="outline" size="sm" data-csv onClick={() => toast("Pobieranie zarobki-2026-10.csv")}>Eksport CSV</Button>
      </PageHeader>
      {state === "error" && (
        <Alert variant="destructive" className="mb-4" role="alert">
          <CircleAlertIcon />
          <AlertDescription>
            <span>Ostatnia wypłata nie powiodła się: bank odrzucił przelew (nieprawidłowy IBAN). <Link href="/konto" className="font-medium underline">Zaktualizuj dane do wypłat</Link></span>
          </AlertDescription>
        </Alert>
      )}
      {state === "loading" ? <div aria-busy="true" className="mb-6 grid gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-32" />)}</div> : (
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="grid gap-2">
              <span className="text-sm text-muted-foreground">Dostępne do wypłaty</span>
              <strong className="text-2xl font-semibold" data-available>{money(available)}</strong>
              <Button size="sm" className="w-fit" data-payout disabled={available < MIN_PAYOUT} onClick={() => setPayout(true)}>Wypłać</Button>
              {available < MIN_PAYOUT && <span className="text-xs text-muted-foreground">Minimum wypłaty: {MIN_PAYOUT} zł</span>}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="grid gap-2">
              <span className="text-sm text-muted-foreground">Oczekujące</span>
              <strong className="text-2xl font-semibold">{money(pending)}</strong>
              <span className="text-xs text-muted-foreground">Dostępne 48 h po sesji, jeśli nie ma zgłoszenia</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="grid gap-2">
              <span className="text-sm text-muted-foreground">Twoja prowizja</span>
              <strong className="text-2xl font-semibold">{Math.round(rate * 100)}%</strong>
              {tier ? (
                <>
                  <Progress value={(hours / tier) * 100} />
                  <span className="text-xs text-muted-foreground">{hours} h z {tier} h do progu {Math.round(commissionRate(tier) * 100)}%</span>
                </>
              ) : <span className="text-xs text-muted-foreground">Najniższy próg</span>}
            </CardContent>
          </Card>
        </div>
      )}
      <Card>
        <CardHeader><CardTitle>Historia</CardTitle></CardHeader>
        <CardContent>
          {list.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead><TableHead>Uczeń</TableHead><TableHead>Typ</TableHead>
                  <TableHead className="text-right">Brutto</TableHead><TableHead className="text-right">Prowizja</TableHead><TableHead className="text-right">Netto</TableHead><TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((e) => (
                  <TableRow key={`${e.date}-${e.student}-${e.gross}-${e.status}`}>
                    <TableCell>{fmtDate(e.date)}</TableCell><TableCell>{e.student}</TableCell><TableCell>{e.type}</TableCell>
                    <TableCell className="text-right">{money(e.gross)}</TableCell><TableCell className="text-right">−{money(e.fee)}</TableCell>
                    <TableCell className="text-right font-semibold">{money(e.gross - e.fee)}</TableCell>
                    <TableCell><Badge variant={STATUS_VARIANT[e.status]}>{store.payoutDone && e.status === "dostępne" ? "w drodze" : e.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <EmptyState title="Brak zarobków" text="Twoje rozliczone sesje pojawią się tutaj." />}
        </CardContent>
      </Card>
      <Dialog open={payout} onOpenChange={setPayout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wypłata {money(available)}</DialogTitle>
            <DialogDescription>Na konto PL61 •••• •••• 4420. Środki zwykle docierają w 1–2 dni robocze. Limit: 1 ręczna wypłata na dobę.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayout(false)}>Anuluj</Button>
            <Button data-ok onClick={() => { requestPayout(); setPayout(false); toast("Wypłata zlecona"); }}>Zleć wypłatę</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
