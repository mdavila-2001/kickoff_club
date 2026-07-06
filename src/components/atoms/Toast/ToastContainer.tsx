import React from 'react';
import { useToastStore } from '../../../store/useToastStore';
import { Toast } from './Toast';

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 99999,
        pointerEvents: 'none', // Allow clicking elements behind the container gaps
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'auto', // Re-enable clicks on the actual toasts
        }}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => dismissToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

ToastContainer.displayName = 'ToastContainer';
