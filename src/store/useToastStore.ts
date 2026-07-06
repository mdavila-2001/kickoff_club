import { create } from 'zustand';

export interface Toast {
  readonly id: string;
  readonly type: 'success' | 'error' | 'warning' | 'info';
  readonly message: string;
  readonly duration?: number;
}

interface ToastState {
  readonly toasts: readonly Toast[];
  readonly addToast: (type: Toast['type'], message: string, duration?: number) => void;
  readonly removeToast: (id: string) => void;
}

const DEFAULT_DURATION_MS = 4000;

const activeTimers = new Map<string, ReturnType<typeof setTimeout>>();

const generateToastId = (): string =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `toast-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (type, message, duration = DEFAULT_DURATION_MS) => {
    const newToast: Toast = {
      id: generateToastId(),
      type,
      message,
      duration,
    };

    set((state) => ({ toasts: [...state.toasts, newToast] }));

    // Auto-limpieza: un duration <= 0 crea un toast persistente
    // que solo se cierra manualmente con removeToast.
    if (duration > 0) {
      const timer = setTimeout(() => get().removeToast(newToast.id), duration);
      activeTimers.set(newToast.id, timer);
    }
  },

  removeToast: (id) => {
    const timer = activeTimers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      activeTimers.delete(id);
    }

    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
  },
}));

/*
 * Atajos para disparar toasts fuera de componentes React
 * (interceptores de axios, servicios, etc.).
 */
export const toast = {
  success: (message: string, duration?: number) =>
    useToastStore.getState().addToast('success', message, duration),
  error: (message: string, duration?: number) =>
    useToastStore.getState().addToast('error', message, duration),
  warning: (message: string, duration?: number) =>
    useToastStore.getState().addToast('warning', message, duration),
  info: (message: string, duration?: number) =>
    useToastStore.getState().addToast('info', message, duration),
} as const;
