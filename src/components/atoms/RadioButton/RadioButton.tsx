import React, { useId, forwardRef } from 'react';
import styles from './RadioButton.module.css';

export interface RadioButtonProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  readonly label: string;
  readonly accentColor?: string;
}

export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
  ({ label, accentColor, id, name, value, checked, className = '', onChange, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const isSelected = checked;

    const optionClasses = [
      styles.optionItem,
      isSelected ? styles.optionSelected : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <label
        htmlFor={inputId}
        className={optionClasses}
        style={
          accentColor
            ? ({ '--radio-accent': accentColor } as React.CSSProperties)
            : undefined
        }
      >
        <input
          ref={ref}
          type="radio"
          id={inputId}
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          className={styles.radioInput}
          {...props}
        />
        <span className={styles.radioIndicator} aria-hidden="true" />
        <span className={styles.optionLabel}>{label}</span>
      </label>
    );
  }
);

RadioButton.displayName = 'RadioButton';
