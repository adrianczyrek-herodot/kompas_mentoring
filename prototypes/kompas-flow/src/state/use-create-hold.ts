/**
 * POST /bookings/holds (KONCEPCJA §U1): a 10-minute hold on the chosen slot when entering checkout.
 * Answers per review-bar scenario: 409 (slot just taken → refreshed grid + toast), one-shot
 * network/server error (selection kept), or success.
 */
import { useToast } from '@kompas/ui';
import { type RequestFailure, useDemo, useFakeRequest } from './demo-context';

export type HoldResult = 'held' | 'conflict' | RequestFailure;

export function useCreateHold() {
  const { state, dispatch, now } = useDemo();
  const request = useFakeRequest();
  const toast = useToast();
  return async (): Promise<HoldResult> => {
    const slotId = state.draft?.slotId;
    const conflict = state.scenarios.slotConflict;
    const answer = await request(400);
    if (!answer.ok) return answer.kind;
    if (conflict && slotId) {
      dispatch({ type: 'set-scenarios', patch: { slotConflict: false } });
      dispatch({ type: 'remove-slot', slotId });
      dispatch({ type: 'release-hold' });
      toast.add({
        title: 'Ten termin został właśnie zajęty',
        description: 'Odświeżyliśmy listę — wybierz inny termin.',
      });
      return 'conflict';
    }
    dispatch({ type: 'create-hold', now });
    return 'held';
  };
}
