/**
 * A2 — Spory i zwroty (admin).
 * DS-GAP: DisputeTimeline (SessionEventTimeline)
 */
import {
  Badge,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from '@kompas/ui';
import { useState } from 'react';
import type { Route } from '../lib/router';
import { useDemo } from '../state/demo-context';

export function A2Disputes({ route }: { route: Route }) {
  const { state, account } = useDemo();
  if (account.role !== 'admin') return null;

  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);
  const [decisionOpen, setDecisionOpen] = useState(false);

  // Simulated disputes
  const disputes = [
    {
      id: 'd1',
      studentName: 'Adrian C.',
      mentorName: 'Kasia Nowicka',
      sessionDate: '2026-10-18',
      reason: 'Sesja nie odbyła się — mentor nie dołączył do pokoju',
      status: 'open' as const,
      createdAt: '2026-10-18T15:30:00+02:00',
    },
    {
      id: 'd2',
      studentName: 'Julia M.',
      mentorName: 'Kasia Nowicka',
      sessionDate: '2026-10-15',
      reason: 'Sesja przerwana przed czasem',
      status: 'resolved' as const,
      createdAt: '2026-10-15T18:00:00+02:00',
      resolution: 'Zwrot 50% kwoty',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-surface-border bg-surface-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-heading-md text-text-primary">Spory i zwroty</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zgłaszający</TableHead>
                <TableHead>Mentor</TableHead>
                <TableHead>Data sesji</TableHead>
                <TableHead>Przyczyna</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Akcja</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disputes.map((dispute) => (
                <TableRow key={dispute.id} className="hover:bg-surface-hover cursor-pointer" onClick={() => { setSelectedDispute(dispute.id); setDecisionOpen(true); }}>
                  <TableCell className="font-medium text-text-primary">{dispute.studentName}</TableCell>
                  <TableCell className="text-text-muted">{dispute.mentorName}</TableCell>
                  <TableCell className="text-text-muted">
                    {new Date(dispute.sessionDate).toLocaleDateString('pl-PL')}
                  </TableCell>
                  <TableCell className="max-w-xs text-text-muted">
                    <p className="text-body-dense line-clamp-2">{dispute.reason}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={dispute.status === 'resolved' ? 'success' : 'warning'}>
                      {dispute.status === 'resolved' ? 'Rozstrzygnięty' : 'Otwarty'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedDispute(dispute.id); setDecisionOpen(true); }}>
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
            <DialogTitle>Rozstrzygnięcie sporu</DialogTitle>
            <DialogDescription>
              {selectedDispute && disputes.find(d => d.id === selectedDispute)?.reason}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {selectedDispute && (() => {
              const dispute = disputes.find(d => d.id === selectedDispute);
              if (!dispute) return null;
              return (
                <>
                  <div className="rounded-lg border border-surface-border p-3">
                    <p className="text-body-semibold text-text-primary">{dispute.studentName} vs {dispute.mentorName}</p>
                    <p className="text-meta text-text-muted">
                      Sesja: {new Date(dispute.sessionDate).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                  <Textarea placeholder="Uzasadnienie decyzji..." rows={3} />
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4 accent-accent-primary" />
                      <span className="text-body-dense text-text-primary">Zwrot pełej kwoty</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4 accent-accent-primary" />
                      <span className="text-body-dense text-text-primary">Zwrot częściowy (50%)</span>
                    </label>
                  </div>
                </>
              );
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDecisionOpen(false); }}>Anuluj</Button>
            <Button>Odrzuć zgłoszenie</Button>
            <Button variant="default">Zatwierdź zwrot</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
