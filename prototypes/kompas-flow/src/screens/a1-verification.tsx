/**
 * A1 — Weryfikacja mentorów (admin).
 * DS-GAP: ApplicationQueue, VerificationChecklist, DecisionForm
 */
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from '@kompas/ui';
import { useState } from 'react';

export function A1Verification() {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [decisionOpen, setDecisionOpen] = useState(false);

  // Simulated applications
  const applications = [
    {
      id: 'a1',
      name: 'Adam Górski',
      headline: 'Product Manager · discovery, metryki, rozmowy rekrutacyjne PM',
      companies: 'Pracuj.pl',
      yearsExp: 8,
      status: 'pending' as const,
      submittedAt: '2026-10-19',
    },
    {
      id: 'a2',
      name: 'Marta Kowalska',
      headline: 'DevOps Engineer · CI/CD, Kubernetes, AWS',
      companies: 'Allegro, OTO Bank',
      yearsExp: 10,
      status: 'approved' as const,
      submittedAt: '2026-10-10',
    },
    {
      id: 'a3',
      name: 'Piotr Zieliński',
      headline: 'Backend Developer · Node.js, GraphQL, mikroserwisy',
      companies: 'Comarch',
      yearsExp: 5,
      status: 'rejected' as const,
      submittedAt: '2026-10-05',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-surface-border bg-surface-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-heading-md text-text-primary">Weryfikacja mentorów</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kandydat</TableHead>
                <TableHead>Dane</TableHead>
                <TableHead>Data zgłoszenia</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Akcja</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id} className="hover:bg-surface-hover cursor-pointer" onClick={() => { setSelectedApp(app.id); setDecisionOpen(true); }}>
                  <TableCell className="font-medium text-text-primary">{app.name}</TableCell>
                  <TableCell className="text-text-muted">
                    <p className="text-body-dense">{app.headline}</p>
                    <p className="text-meta">{app.companies} · {app.yearsExp} lat</p>
                  </TableCell>
                  <TableCell className="text-text-muted">
                    {new Date(app.submittedAt).toLocaleDateString('pl-PL')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}>
                      {app.status === 'approved' ? 'Zatwierdzony' : app.status === 'rejected' ? 'Odrzucony' : 'Oczekuje'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedApp(app.id); setDecisionOpen(true); }}>
                      Rozstrzygnij
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Decision dialog */}
      <Dialog open={decisionOpen} onOpenChange={setDecisionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rozstrzygnięcie wniosku</DialogTitle>
            <DialogDescription>
              {selectedApp && applications.find(a => a.id === selectedApp)?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <p className="text-body-dense text-text-muted">
              Sprawdź profil kandydata i zdecyduj.
            </p>
            <Textarea placeholder="Uzasadnienie decyzji (opcjonalne)" rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDecisionOpen(false); }}>Anuluj</Button>
            <Button variant="destructive">Odrzuć</Button>
            <Button>Zatwierdź</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
