import React from 'react';
import styles from './Badge.module.css';

export interface BadgeProps {
  readonly variant: 'live' | 'upcoming' | 'finished' | 'exact' | 'winner' | 'missed';
  readonly children: React.ReactNode;
  readonly className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, className = '' }) => {
  const computedClasses = [styles.badge, styles[variant], className].filter(Boolean).join(' ');

  return (
    <span className={computedClasses} role="status">
      {variant === 'live' && <span className={styles.pulseDot} aria-hidden="true" />}
      {children}
    </span>
  );
};
