import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

type ToastContextValue = {
  notify: (message: string, type?: ToastType) => void;
};

export type ToastType = 'success' | 'warning' | 'error' | 'info';

type ToastMessage = {
  message: string;
  type: ToastType;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const notify = useCallback((message: string, type: ToastType = 'info') => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setToast({ message, type });
    timeoutRef.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <div className={`toast toast${toast.type}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
}
