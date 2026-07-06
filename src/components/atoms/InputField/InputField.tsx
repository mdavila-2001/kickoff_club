import React, { useId, forwardRef, useState } from 'react';
import styles from './InputField.module.css';

export interface InputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  readonly label?: string;
  readonly error?: string;
  readonly type?: 'text' | 'number' | 'password' | 'file';
}

/* ── Íconos SVG inline para el toggle de contraseña ─────── */
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, type = 'text', className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;

    const isPassword = type === 'password';
    const [showPassword, setShowPassword] = useState(false);

    const resolvedType = isPassword && showPassword ? 'text' : type;

    const inputClasses = [
      styles.inputElement,
      error ? styles.hasError : '',
      isPassword ? styles.hasToggle : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={styles.fieldContainer}>
        {label && (
          <label htmlFor={inputId} className={styles.labelElement}>
            {label}
          </label>
        )}

        <div className={styles.inputWrapper}>
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            className={inputClasses}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              className={styles.toggleButton}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          )}
        </div>

        {error && (
          <span id={errorId} className={styles.errorMessage} role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
