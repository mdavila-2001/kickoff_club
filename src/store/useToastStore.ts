import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  readonly id: string;
  readonly message: string;
  readonly type: ToastType;
  readonly duration?: number;
}

export interface ToastState {
  readonly toasts: ToastItem[];
  readonly showToast: (message: string, type: ToastType, duration?: number) => void;
  readonly dismissToast: (id: string) => void;
}

const activeTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  showToast: (message, type, duration = 4000) => {
    const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `toast-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const newToast: ToastItem = { id, message, type, duration };

    set((state) => ({ toasts: [...state.toasts, newToast] }));

    if (duration > 0) {
      const timer = setTimeout(() => {
        get().dismissToast(id);
      }, duration);
      activeTimers.set(id, timer);
    }
  },

  dismissToast: (id) => {
    const timer = activeTimers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      activeTimers.delete(id);
    }

    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

// Compatibility helper object to prevent breaking existing imports in the application
export const toast = {
  success: (message: string, duration?: number) =>
    useToastStore.getState().showToast(message, 'success', duration),
  error: (message: string, duration?: number) =>
    useToastStore.getState().showToast(message, 'error', duration),
  info: (message: string, duration?: number) =>
    useToastStore.getState().showToast(message, 'info', duration),
  warning: (message: string, duration?: number) =>
    useToastStore.getState().showToast(message, 'info', duration),
} as const;
