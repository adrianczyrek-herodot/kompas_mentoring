import {
  createContext,
  type Dispatch,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import type { Account, Booking, StudentId } from '../data/accounts';
import {
  accountOf,
  type Action,
  type DemoState,
  INITIAL_STATE,
  nowOf,
  reducer,
} from './demo-state';

type DemoContextValue = {
  state: DemoState;
  dispatch: Dispatch<Action>;
  account: Account;
  now: string;
  /** Signed-in student, or null for other roles. */
  studentId: StudentId | null;
  myBookings: Booking[];
  balanceWith: (mentorId: string) => number;
};

const DemoContext = createContext<DemoContextValue | null>(null);

function studentIdOf(account: Account): StudentId | null {
  return account.role === 'student' ? (account.id as StudentId) : null;
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const holdRunning = (state.draft?.hold?.secondsLeft ?? 0) > 0;

  // The hold counts down in real seconds while it exists, whichever screen is open.
  useEffect(() => {
    if (!holdRunning) return;
    const timer = window.setInterval(() => {
      dispatch({ type: 'tick-hold' });
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, [holdRunning]);

  const value = useMemo<DemoContextValue>(() => {
    const account = accountOf(state);
    const studentId = studentIdOf(account);
    return {
      state,
      dispatch,
      account,
      now: nowOf(state),
      studentId,
      myBookings: studentId ? state.bookings.filter((b) => b.studentId === studentId) : [],
      balanceWith: (mentorId) => (studentId ? (state.balances[studentId][mentorId] ?? 0) : 0),
    };
  }, [state]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const value = useContext(DemoContext);
  if (!value) throw new Error('useDemo outside DemoProvider');
  return value;
}

/**
 * Simulated request: waits like a network call and applies the one-shot „błąd następnego żądania”
 * scenario. Resolves `{ ok: false, kind }` instead of throwing, like the app's Result type.
 */
export type RequestFailure = 'network' | 'server' | 'expired';

export function useFakeRequest() {
  const { state, dispatch, account } = useDemo();
  return async (delayMs = 600): Promise<{ ok: true } | { ok: false; kind: RequestFailure }> => {
    const fail = state.scenarios.failNext;
    const expired = state.scenarios.sessionExpired && account.role !== 'guest';
    await new Promise((resolve) => window.setTimeout(resolve, delayMs));
    if (expired) {
      // One-shot, like „błąd następnego żądania”: the re-login dialog opens over the screen.
      dispatch({ type: 'set-scenarios', patch: { sessionExpired: false } });
      dispatch({ type: 'set-reauth', value: true });
      return { ok: false, kind: 'expired' };
    }
    if (fail !== 'none') {
      dispatch({ type: 'set-scenarios', patch: { failNext: 'none' } });
      return { ok: false, kind: fail };
    }
    return { ok: true };
  };
}

/** „Ponów” after a forced error: the retry succeeds, so the data-state scenario returns to data. */
export function useRetry() {
  const { dispatch } = useDemo();
  return () => {
    dispatch({ type: 'set-scenarios', patch: { dataState: 'default' } });
  };
}
