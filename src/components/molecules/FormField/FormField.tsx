import React, { useId } from 'react';
import { Skeleton } from '../../atoms/Skeleton/Skeleton';
import styles from './FormField.module.css';

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  error?: string;
  isLoading?: boolean;
  children: React.ReactElement; // Inversión de control para el control input
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  isLoading = false,
  children,
  className = '',
  ...props
}) => {
  const generatedId = useId();
  
  // Cast children for type-safe property access in React 19 typings
  const child = children as React.ReactElement<{
    id?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: string | boolean;
  }>;
  
  // Genera un ID único para el input si el hijo no tiene uno asignado
  const inputId = child.props.id || generatedId;
  const errorId = `${inputId}-error`;

  // Preservación de aria-describedby del hijo
  const childAriaDescribedby = child.props['aria-describedby'];
  const ariaDescribedby = error
    ? (childAriaDescribedby ? `${childAriaDescribedby} ${errorId}` : errorId)
    : childAriaDescribedby;

  const childAriaInvalid = child.props['aria-invalid'];
  const ariaInvalid = error ? 'true' : childAriaInvalid;

  // Inyección segura de propiedades de accesibilidad
  const clonedChild = React.cloneElement(child, {
    id: inputId,
    ...(ariaDescribedby ? { 'aria-describedby': ariaDescribedby } : {}),
    ...(ariaInvalid ? { 'aria-invalid': ariaInvalid } : {}),
  });

  return (
    <div className={`${styles.fieldContainer} ${className}`} {...props}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      
      {isLoading ? (
        <Skeleton variant="rect" height="40px" width="100%" />
      ) : (
        clonedChild
      )}

      <span
        id={errorId}
        className={styles.errorMessage}
        role="alert"
        aria-live="polite"
      >
        {error || ''}
      </span>
    </div>
  );
};

FormField.displayName = 'FormField';
