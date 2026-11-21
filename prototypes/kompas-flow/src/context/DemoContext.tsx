import React, { createContext, useContext, useReducer, useCallback, useMemo, useState, ReactNode } from 'react';
import type { Role, ViewState, PaymentSimulation, ScreenId, StudentPersona, Session, Thread, Notification, TrialRequest } from '../utils/types';
import { 
  ROLE_LABELS, 
  DEFAULT_ROUTE, 
  STUDENT_PERSONAS, 
  MENTORS, 
  SESSIONS, 
  THREADS, 
  NOTIFICATIONS, 
  REQUESTS, 
  DEMO_NOW, 
  mentorById, 
  canCancelFree, 
  canJoin, 
  hasStarted 
} from '../utils/types';

interface BookingDraft {
  mentorId: string;
  startsAt?: string;
  durationMin: number;
  type: 'trial' | 'plan';
  holdExpires?: number;
  goal?: string;
}

interface Subscription {
  mentorId: string;
  perWeek: number;
  durationMin: number;
  renewsOn: string;
  status: 'active' | 'paused';
}

interface DemoState {
  // Auth & role
  role: Role;
  loggedIn: boolean;
  returnTo: string;
  currentStudent: StudentPersona | null;
  
  // Booking flow
  draft: BookingDraft | null;
  favorites: Set<string>;
  
  // Data
  sessions: Session[];
  threads: Thread[];
  requests: TrialRequest[];
  notifications: Notification[];
  balances: Record<string, number>;
  subscription: Subscription | null;
  
  // UI state
  viewState: ViewState;
  paymentSimulation: PaymentSimulation;
  forceNextError: boolean;
  simulateSlotConflict: boolean;
  simulateSessionExpiry: boolean;
  activeScreen: ScreenId | null;
  
  // Theme
  darkMode: boolean;
}

type DemoAction =
  | { type: 'SET_ROLE'; payload: Role }
  | { type: 'SET_LOGGED_IN'; payload: boolean }
  | { type: 'SET_RETURN_TO'; payload: string }
  | { type: 'APPLY_STUDENT'; payload: StudentPersona }
  | { type: 'CLEAR_STUDENT' }
  | { type: 'SET_DRAFT'; payload: BookingDraft | null }
  | { type: 'UPDATE_DRAFT'; payload: Partial<BookingDraft> }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'SET_SESSIONS'; payload: Session[] }
  | { type: 'ADD_SESSION'; payload: Session }
  | { type: 'UPDATE_SESSION'; payload: { id: string; changes: Partial<Session> } }
  | { type: 'SET_THREADS'; payload: Thread[] }
  | { type: 'ADD_MESSAGE'; payload: { threadId: string; message: { me: boolean; text: string; at: string } } }
  | { type: 'SET_REQUESTS'; payload: TrialRequest[] }
  | { type: 'UPDATE_REQUEST'; payload: { id: string; changes: Partial<TrialRequest> } }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'SET_BALANCES'; payload: Record<string, number> }
  | { type: 'SET_SUBSCRIPTION'; payload: Subscription | null }
  | { type: 'SET_VIEW_STATE'; payload: ViewState }
  | { type: 'SET_PAYMENT_SIMULATION'; payload: PaymentSimulation }
  | { type: 'TOGGLE_FORCE_ERROR' }
  | { type: 'TOGGLE_SLOT_CONFLICT' }
  | { type: 'TOGGLE_SESSION_EXPIRY' }
  | { type: 'SET_ACTIVE_SCREEN'; payload: ScreenId }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'RESET_DEMO' };

const initialState: DemoState = {
  role: 'guest',
  loggedIn: false,
  returnTo: '',
  currentStudent: null,
  draft: null,
  favorites: new Set(['m3']),
  sessions: SESSIONS.map(s => ({ ...s, actionItems: s.actionItems?.map(a => ({ ...a })) })),
  threads: THREADS.map(t => ({ ...t, messages: [...t.messages] })),
  requests: [...REQUESTS],
  notifications: NOTIFICATIONS.map(n => ({ ...n })),
  balances: { m1: 3, m3: 0 },
  subscription: { mentorId: 'm1', perWeek: 1, durationMin: 60, renewsOn: '2026-11-03', status: 'active' },
  viewState: 'success',
  paymentSimulation: 'success',
  forceNextError: false,
  simulateSlotConflict: false,
  simulateSessionExpiry: false,
  activeScreen: null,
  darkMode: false,
};

function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'SET_ROLE': {
      const newRole = action.payload;
      const newLoggedIn = newRole !== 'guest';
      let newStudent = state.currentStudent;
      if (newRole === 'student' && !newStudent) {
        newStudent = STUDENT_PERSONAS[0];
      } else if (newRole !== 'student') {
        newStudent = null;
      }
      return {
        ...state,
        role: newRole,
        loggedIn: newLoggedIn,
        currentStudent: newStudent,
        returnTo: newLoggedIn ? DEFAULT_ROUTE[newRole] : '',
      };
    }
    case 'SET_LOGGED_IN':
      return { ...state, loggedIn: action.payload };
    case 'SET_RETURN_TO':
      return { ...state, returnTo: action.payload };
    case 'APPLY_STUDENT':
      return { ...state, currentStudent: action.payload, role: 'student', loggedIn: true };
    case 'CLEAR_STUDENT':
      return { ...state, currentStudent: null, sessions: [], threads: [], balances: {}, subscription: null };
    case 'SET_DRAFT':
      return { ...state, draft: action.payload };
    case 'UPDATE_DRAFT':
      return { ...state, draft: state.draft ? { ...state.draft, ...action.payload } : null };
    case 'TOGGLE_FAVORITE': {
      const newFavorites = new Set(state.favorites);
      if (newFavorites.has(action.payload)) newFavorites.delete(action.payload);
      else newFavorites.add(action.payload);
      return { ...state, favorites: newFavorites };
    }
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload };
    case 'ADD_SESSION':
      return { ...state, sessions: [...state.sessions, action.payload] };
    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map(s => s.id === action.payload.id ? { ...s, ...action.payload.changes } : s),
      };
    case 'SET_THREADS':
      return { ...state, threads: action.payload };
    case 'ADD_MESSAGE':
      return {
        ...state,
        threads: state.threads.map(t =>
          t.id === action.payload.threadId
            ? { ...t, messages: [...t.messages, action.payload.message], unread: t.unread + (action.payload.message.me ? 0 : 1) }
            : t
        ),
      };
    case 'SET_REQUESTS':
      return { ...state, requests: action.payload };
    case 'UPDATE_REQUEST':
      return {
        ...state,
        requests: state.requests.map(r => r.id === action.payload.id ? { ...r, ...action.payload.changes } : r),
      };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => n.link === action.payload ? { ...n, unread: false } : n),
      };
    case 'SET_BALANCES':
      return { ...state, balances: action.payload };
    case 'SET_SUBSCRIPTION':
      return { ...state, subscription: action.payload };
    case 'SET_VIEW_STATE':
      return { ...state, viewState: action.payload };
    case 'SET_PAYMENT_SIMULATION':
      return { ...state, paymentSimulation: action.payload };
    case 'TOGGLE_FORCE_ERROR':
      return { ...state, forceNextError: !state.forceNextError };
    case 'TOGGLE_SLOT_CONFLICT':
      return { ...state, simulateSlotConflict: !state.simulateSlotConflict };
    case 'TOGGLE_SESSION_EXPIRY':
      return { ...state, simulateSessionExpiry: !state.simulateSessionExpiry };
    case 'SET_ACTIVE_SCREEN':
      return { ...state, activeScreen: action.payload };
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };
    case 'RESET_DEMO':
      return initialState;
    default:
      return state;
  }
}

interface DemoContextValue extends DemoState {
  dispatch: React.Dispatch<DemoAction>;
  // Convenience methods
  setRole: (role: Role) => void;
  loginAsStudent: (persona?: StudentPersona) => void;
  logout: () => void;
  startBooking: (mentorId: string, type: 'trial' | 'plan') => void;
  selectSlot: (startsAt: string, durationMin: number) => void;
  setGoal: (goal: string) => void;
  confirmBooking: () => void;
  cancelBooking: (sessionId: string) => void;
  rescheduleBooking: (sessionId: string, newStartsAt: string) => void;
  addMessage: (threadId: string, text: string) => void;
  toggleDarkMode: () => void;
  resetDemo: () => void;
  setViewState: (state: ViewState) => void;
  setPaymentSimulation: (sim: PaymentSimulation) => void;
  toggleForceError: () => void;
  toggleSlotConflict: () => void;
  toggleSessionExpiry: () => void;
  setActiveScreen: (screenId: ScreenId | null) => void;
  // Computed
  currentMentor: ReturnType<typeof mentorById> | null;
  upcomingSessions: Session[];
  pastSessions: Session[];
  unreadCount: number;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, initialState);
  const [, forceUpdate] = useState(0);

  // Force re-render when Set/Map changes
  const triggerUpdate = useCallback(() => forceUpdate(n => n + 1), []);

  const value = useMemo<DemoContextValue>(() => ({
    ...state,
    dispatch,
    setRole: (role: Role) => { dispatch({ type: 'SET_ROLE', payload: role }); triggerUpdate(); },
    loginAsStudent: (persona?: StudentPersona) => { 
      dispatch({ type: 'APPLY_STUDENT', payload: persona || STUDENT_PERSONAS[0] }); 
      triggerUpdate();
    },
    logout: () => { dispatch({ type: 'SET_ROLE', payload: 'guest' }); triggerUpdate(); },
    startBooking: (mentorId: string, type: 'trial' | 'plan') => {
      const durationMin = type === 'trial' ? 30 : 60;
      const holdExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      dispatch({ type: 'SET_DRAFT', payload: { mentorId, durationMin, type, holdExpires } });
      triggerUpdate();
    },
    selectSlot: (startsAt: string, durationMin: number) => {
      dispatch({ type: 'UPDATE_DRAFT', payload: { startsAt, durationMin } });
      triggerUpdate();
    },
    setGoal: (goal: string) => {
      dispatch({ type: 'UPDATE_DRAFT', payload: { goal } });
      triggerUpdate();
    },
    confirmBooking: () => {
      if (!state.draft?.startsAt) return;
      const newSession: Session = {
        id: `s${Date.now()}`,
        mentorId: state.draft.mentorId,
        student: state.currentStudent?.name || 'Ty',
        startsAt: state.draft.startsAt,
        durationMin: state.draft.durationMin,
        type: state.draft.type,
        status: 'scheduled',
        goal: state.draft.goal || '',
      };
      dispatch({ type: 'ADD_SESSION', payload: newSession });
      dispatch({ type: 'SET_DRAFT', payload: null });
      triggerUpdate();
    },
    cancelBooking: (sessionId: string) => {
      dispatch({ type: 'UPDATE_SESSION', payload: { id: sessionId, changes: { status: 'cancelled' } } });
      triggerUpdate();
    },
    rescheduleBooking: (sessionId: string, newStartsAt: string) => {
      dispatch({ type: 'UPDATE_SESSION', payload: { id: sessionId, changes: { startsAt: newStartsAt } } });
      triggerUpdate();
    },
    addMessage: (threadId: string, text: string) => {
      dispatch({ type: 'ADD_MESSAGE', payload: { threadId, message: { me: true, text, at: new Date().toISOString() } } });
      triggerUpdate();
    },
    toggleDarkMode: () => { dispatch({ type: 'TOGGLE_DARK_MODE' }); triggerUpdate(); },
    resetDemo: () => { dispatch({ type: 'RESET_DEMO' }); triggerUpdate(); },
    setViewState: (viewState: ViewState) => { dispatch({ type: 'SET_VIEW_STATE', payload: viewState }); triggerUpdate(); },
    setPaymentSimulation: (sim: PaymentSimulation) => { dispatch({ type: 'SET_PAYMENT_SIMULATION', payload: sim }); triggerUpdate(); },
    toggleForceError: () => { dispatch({ type: 'TOGGLE_FORCE_ERROR' }); triggerUpdate(); },
    toggleSlotConflict: () => { dispatch({ type: 'TOGGLE_SLOT_CONFLICT' }); triggerUpdate(); },
    toggleSessionExpiry: () => { dispatch({ type: 'TOGGLE_SESSION_EXPIRY' }); triggerUpdate(); },
    setActiveScreen: (screenId: ScreenId | null) => { dispatch({ type: 'SET_ACTIVE_SCREEN', payload: screenId }); triggerUpdate(); },
    currentMentor: state.draft?.mentorId ? mentorById(state.draft.mentorId) : null,
    upcomingSessions: state.sessions.filter(s => s.status === 'scheduled' && new Date(s.startsAt) >= DEMO_NOW),
    pastSessions: state.sessions.filter(s => s.status !== 'scheduled' || new Date(s.startsAt) < DEMO_NOW),
    unreadCount: state.notifications.filter(n => n.unread).length + state.threads.reduce((sum, t) => sum + t.unread, 0),
  }), [state, triggerUpdate]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used within DemoProvider');
  return context;
}