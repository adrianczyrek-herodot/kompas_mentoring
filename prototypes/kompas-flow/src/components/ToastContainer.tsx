import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastContextValue {
  addToast: (message: string, type: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info', duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts(prev => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div 
        style={{ 
          position: 'fixed', 
          left: '50%', 
          bottom: '120px', 
          transform: 'translateX(-50%)', 
          zIndex: 1000,
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px',
          pointerEvents: 'none',
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              background: toast.type === 'error' ? 'var(--status-danger-fg)' : 
                          toast.type === 'success' ? 'var(--status-success-fg)' : 'var(--text-default)',
              color: toast.type === 'error' ? 'var(--text-on-danger)' : 
                     toast.type === 'success' ? 'var(--status-success-bg)' : '#fff',
              padding: '10px 18px',
              borderRadius: '999px',
              fontSize: '0.9rem',
              boxShadow: '0 8px 24px rgba(0, 0, 0, .2)',
              animation: 'toast-in 0.3s ease-out',
              maxWidth: 'calc(100vw - 32px)',
              textAlign: 'center',
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

export function ToastContainer() {
  // This is rendered by ToastProvider, but we need a placeholder
  return null;
}