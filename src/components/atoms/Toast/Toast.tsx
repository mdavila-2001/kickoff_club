import React, { useEffect, useState } from 'react';
import type { ToastType } from '../../../store/useToastStore';
import styles from './Toast.module.css';

export interface ToastProps {
  readonly id: string;
  readonly message: string;
  readonly type: ToastType;
  readonly duration?: number;
  readonly onClose: () => void;
}

const SuccessIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ErrorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type,
  duration = 4000,
  onClose,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration <= 0) return;

    // Start fadeOut animation 250ms before duration ends
    const exitAnimationOffset = 250;
    const animationDelay = Math.max(0, duration - exitAnimationOffset);

    const timer = setTimeout(() => {
      setIsExiting(true);
    }, animationDelay);

    return () => {
      clearTimeout(timer);
    };
  }, [duration]);

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <SuccessIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'info':
      default:
        return <InfoIcon />;
    }
  };

  const toastClasses = [
    styles.toast,
    styles[type],
    isExiting ? styles.exiting : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      id={`toast-${id}`}
      className={toastClasses}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <span className={styles.iconWrapper}>{renderIcon()}</span>
      <span className={styles.message}>{message}</span>
      <button
        type="button"
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Cerrar notificación"
      >
        <CloseIcon />
      </button>
    </div>
  );
};

Toast.displayName = 'Toast';
