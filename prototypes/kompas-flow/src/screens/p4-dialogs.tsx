/** P4 simulations: sign-in with an external provider and password reset. Nothing leaves the page. */
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldLabel,
  Input,
} from '@kompas/ui';
import { Info } from 'lucide-react';
import { useId, useState } from 'react';

export type Provider = 'Google' | 'LinkedIn';

export function SocialSignInDialog({
  provider,
  onClose,
  onContinue,
}: {
  provider: Provider | null;
  onClose: () => void;
  onContinue: () => void;
}) {
  return (
    <Dialog
      open={provider !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent closeLabel="Zamknij">
        <DialogHeader>
          <DialogTitle>Logowanie przez {provider ?? ''} — symulacja</DialogTitle>
          <DialogDescription>
            W prototypie nie łączymy się z serwisem {provider ?? ''} i nie pobieramy żadnych danych.
            W aplikacji tu otworzy się okno logowania dostawcy.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={onContinue}>Kontynuuj jako konto demo Adrian C.</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PasswordResetDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const id = useId();
  const [sent, setSent] = useState(false);
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setSent(false);
          onClose();
        }
      }}
    >
      <DialogContent closeLabel="Zamknij">
        <DialogHeader>
          <DialogTitle>Reset hasła</DialogTitle>
          <DialogDescription>
            Podaj e-mail konta. Wyślemy link do ustawienia nowego hasła (E3-S9).
          </DialogDescription>
        </DialogHeader>
        {sent ? (
          <Alert variant="neutral">
            <Info aria-hidden="true" />
            <AlertTitle>Symulacja — nic nie wysłaliśmy</AlertTitle>
            <AlertDescription>
              W aplikacji e-mail z linkiem przyjdzie, jeśli konto istnieje (bez ujawniania, czy
              istnieje). W prototypie nie wysyłamy wiadomości.
            </AlertDescription>
          </Alert>
        ) : (
          <Field>
            <FieldLabel htmlFor={id}>E-mail</FieldLabel>
            <Input id={id} type="email" autoComplete="off" placeholder="np. adrian@example.com" />
          </Field>
        )}
        <DialogFooter>
          {sent ? (
            <Button
              onClick={() => {
                setSent(false);
                onClose();
              }}
            >
              Zamknij
            </Button>
          ) : (
            <Button
              onClick={() => {
                setSent(true);
              }}
            >
              Wyślij link
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
