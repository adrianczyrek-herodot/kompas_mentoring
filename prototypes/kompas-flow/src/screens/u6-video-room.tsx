/**
 * U6 — Pokój sesji wideo z mentorem.
 * DS-GAP: VideoRoom (symulacja), DeviceCheck
 */
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Switch,
  Textarea,
} from '@kompas/ui';
import { useState } from 'react';
import type { Route } from '../lib/router';
import { useDemo } from '../state/demo-context';

export function U6VideoRoom({ route }: { route: Route }) {
  const { state, account, myBookings, now } = useDemo();
  const booking = myBookings.find((b) => b.id === (route.params)['id']);
  if (!booking) return null;

  const mentorName = booking.mentorId === 'm1' ? 'Kasia Nowicka' : 'Mentor';
  const isNoShow = state.scenarios.mentorNoShow;
  const minutesUntil = getMinutesUntil(booking.startsAt, now);
  const canJoin = minutesUntil >= 0 && !isNoShow;
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [leaveOpen, setLeaveOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <Card className="border-surface-border bg-surface-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-heading-sm text-text-primary">Pokój sesji</CardTitle>
            <Badge variant={canJoin ? 'success' : 'warning'}>
              {canJoin ? 'Sesja trwa' : isNoShow ? 'Mentor nie dołączył' : 'Czekaj na start'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-body text-text-muted">
            Sesja z {mentorName} — {new Date(booking.startsAt).toLocaleString('pl-PL', {
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          {booking.goal && (
            <p className="mt-2 text-body-dense text-text-muted">Cel: {booking.goal}</p>
          )}
        </CardContent>
      </Card>

      {/* Video simulation */}
      <Card className="aspect-video flex items-center justify-center bg-surface-secondary">
        {isNoShow ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-heading-md text-text-primary">Mentor jeszcze nie dołączył</p>
            <p className="text-body text-text-muted">
              Czekamy… Jeśli mentor nie dołączy w ciągu 5 minut, możesz opuścić pokój.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setLeaveOpen(true);
              }}
            >
              Opuść pokój
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-48 w-48 items-center justify-center rounded-full bg-surface-tertiary">
              <span className="text-4xl font-bold text-text-primary">KN</span>
            </div>
            <p className="text-body-dense text-text-muted">{mentorName} (wideo)</p>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-surface-tertiary">
                  <span className="text-2xl font-bold text-text-primary">Ty</span>
                </div>
                <p className="text-meta text-text-muted">Ty (wideo)</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Controls */}
      <Card className="border-surface-border bg-surface-primary">
        <CardContent className="flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="mic"
                checked={micOn}
                onCheckedChange={setMicOn}
              />
              <label htmlFor="mic" className="text-body-dense text-text-primary">
                Mikrofon
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="cam"
                checked={camOn}
                onCheckedChange={setCamOn}
              />
              <label htmlFor="cam" className="text-body-dense text-text-primary">
                Kamera
              </label>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setLeaveOpen(true);
            }}
          >
            Opuść pokój
          </Button>
        </CardContent>
      </Card>

      {/* Chat sidebar note */}
      <Card className="border-surface-border bg-surface-primary">
        <CardHeader className="pb-2">
          <CardTitle className="text-heading-sm text-text-primary">Notatki z sesji</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Zapisz uwagi z sesji..."
            rows={4}
          />
          <Button size="sm" className="mt-2">
            Zapisz notatkę
          </Button>
        </CardContent>
      </Card>

      {/* Leave confirmation dialog */}
      <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz opuścić pokój?</AlertDialogTitle>
            <AlertDialogDescription>
              Sesja zostanie oznaczona jako „przerwana". Mentor zostanie powiadomiony.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setLeaveOpen(false); }}>Anuluj</Button>
            <Button variant="destructive" onClick={() => { setLeaveOpen(false); }}>Opuść pokój</Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function getMinutesUntil(startsAt: string, now: string): number {
  const start = new Date(startsAt).getTime();
  const nowTime = new Date(now).getTime();
  return Math.round((start - nowTime) / 60_000);
}
