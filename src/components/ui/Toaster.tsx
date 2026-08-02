'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (title: string, type?: ToastType, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a Toaster');
  }
  return ctx;
}

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-amber-600',
  info: 'text-blue-600',
};

let toastCounter = 0;

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (title: string, type: ToastType = 'info', message?: string) => {
      const id = ++toastCounter;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      <div
        aria-live="polite"
        className="fixed top-4 right-4 z-[100] flex flex-col gap-2"
      >
        {toasts.map((t) => {
          const Icon = iconMap[t.type];
          return (
            <div
              key={t.id}
              className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-lg max-w-sm"
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${colorMap[t.type]}`} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{t.title}</p>
                {t.message && (
                  <p className="mt-0.5 text-sm text-gray-600">{t.message}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
