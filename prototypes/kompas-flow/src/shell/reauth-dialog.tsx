/**
 * Review-bar scenario „wygaśnięcie sesji”: the next request of a signed-in user answers 401. The
 * screen stays mounted under this dialog, so typed data and choices survive re-login (zasada 7).
 * Logging in again is simulated — no password is asked for or stored.
 */
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  useToast,
} from '@kompas/ui';
import { navigate, withQuery } from '../lib/router';
import { useDemo } from '../state/demo-context';

export function ReauthDialog({ returnTo }: { returnTo: string }) {
  const { state, dispatch, account } = useDemo();
  const toast = useToast();
  const close = () => {
    dispatch({ type: 'set-reauth', value: false });
  };
  return (
    <AlertDialog open={state.world.reauth}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sesja logowania wygasła</AlertDialogTitle>
          <AlertDialogDescription>
            Zaloguj się ponownie jako {account.name}, żeby dokończyć. Wpisane dane zostają na ekranie.
            W prototypie logowanie jest symulacją — nie podajesz hasła.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              close();
              dispatch({ type: 'switch-account', accountId: 'guest' });
              navigate(withQuery('/logowanie', { returnTo }));
            }}
          >
            Wyloguj
          </Button>
          <Button
            onClick={() => {
              close();
              toast.add({ title: 'Zalogowano ponownie', description: 'Ponów ostatnią akcję.' });
            }}
          >
            Zaloguj ponownie (symulacja)
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
