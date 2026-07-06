import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: 'usa' | 'mex' | 'can' | 'gold' | 'secondary' | 'text';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly radius?: 'sm' | 'md' | 'lg' | 'full';
  readonly isLoading?: boolean;
  readonly iconLeft?: React.ReactNode;
  readonly iconRight?: React.ReactNode;
  readonly iconOnly?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'usa',
  size = 'md',
  radius = 'md',
  isLoading = false,
  iconLeft,
  iconRight,
  iconOnly = false,
  className = '',
  disabled,
  children,
  ...props
}) => {
  const hasIcon = Boolean(iconLeft || iconRight);

  const buttonClasses = [
    styles.btn,
    styles[variant],
    styles[size],
    styles[`radius-${radius}`],
    hasIcon ? styles['has-icon'] : '',
    iconOnly ? styles['icon-only'] : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <output className={styles.spinner} aria-label="Cargando..." />
      ) : (
        <>
          {iconLeft && <span className={styles.icon} aria-hidden="true">{iconLeft}</span>}
          {!iconOnly && children}
          {iconRight && <span className={styles.icon} aria-hidden="true">{iconRight}</span>}
        </>
      )}
    </button>
  );
};
