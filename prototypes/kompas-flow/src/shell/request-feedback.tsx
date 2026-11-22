/**
 * One way to run a simulated request from any screen: `useAction().run(onOk)` waits, applies the
 * review-bar scenarios („błąd następnego żądania”, „wygaśnięcie sesji”) and calls `onOk` only on
 * success. Nothing typed is lost on failure — the screen keeps its own state.
 */
import { Alert, AlertDescription, AlertTitle } from '@kompas/ui';
import { CircleX } from 'lucide-react';
import { useState } from 'react';
import { type RequestFailure, useFakeRequest } from '../state/demo-context';

const DESCRIPTIONS: Record<RequestFailure, string> = {
  network: 'Brak połączenia z internetem. Nic się nie zmieniło — spróbuj ponownie.',
  server: 'To błąd po naszej stronie. Nic się nie zmieniło — spróbuj ponownie za chwilę.',
  expired: 'Twoja sesja logowania wygasła. Zaloguj się ponownie — wpisane dane zostały na ekranie.',
};

export function FailureAlert({ kind, what }: { kind: RequestFailure | null; what: string }) {
  if (!kind) return null;
  return (
    <Alert variant="danger" role="alert">
      <CircleX aria-hidden="true" />
      <AlertTitle>{what}</AlertTitle>
      <AlertDescription>{DESCRIPTIONS[kind]}</AlertDescription>
    </Alert>
  );
}

export function useAction() {
  const request = useFakeRequest();
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<RequestFailure | null>(null);
  const run = async (onOk: () => void, delayMs?: number) => {
    if (busy) return;
    setBusy(true);
    setFailure(null);
    const answer = await request(delayMs);
    setBusy(false);
    if (answer.ok) onOk();
    else setFailure(answer.kind);
  };
  return {
    busy,
    failure,
    run,
    reset: () => {
      setFailure(null);
    },
  };
}
