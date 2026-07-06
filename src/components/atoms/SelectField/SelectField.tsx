import React, { useId, forwardRef, useState } from 'react';
import styles from './SelectField.module.css';

export interface SelectOption {
  readonly value: string | number;
  readonly label: string;
}

export interface SelectFieldProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  readonly label?: string;
  readonly error?: string;
  readonly options: readonly SelectOption[];
  readonly placeholder?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, options, placeholder, className = '', id, onChange, value, defaultValue, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;

    const [localValue, setLocalValue] = useState(() => defaultValue ?? '');
    const currentValue = value ?? localValue;
    const isPlaceholderActive = !!placeholder && (currentValue === '' || currentValue === undefined || currentValue === null);

    const selectClasses = [
      styles.selectElement,
      error ? styles.selectError : '',
      isPlaceholderActive ? styles.placeholderActive : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setLocalValue(e.target.value);
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className={styles.fieldContainer}>
        {label && (
          <label htmlFor={selectId} className={styles.labelElement}>
            {label}
          </label>
        )}

        <div className={styles.selectWrapper}>
          <select
            ref={ref}
            id={selectId}
            className={selectClasses}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <span className={styles.chevron} aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
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

SelectField.displayName = 'SelectField';
