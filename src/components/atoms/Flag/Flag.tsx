import React, { useState } from 'react';
import styles from './Flag.module.css';

export interface FlagProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  readonly code: string;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly shape?: 'circle' | 'shield';
  readonly fallbackText: string;
}

export const Flag = ({
  code,
  size = 'md',
  shape = 'circle',
  fallbackText,
  className = '',
  onLoad,
  onError,
  ...props
}: FlagProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const wrapperClasses = [
    styles.flagWrapper,
    styles[size],
    styles[shape],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    onLoad?.(event);
  };

  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    setIsLoading(false);
    onError?.(event);
  };

  if (hasError) {
    return (
      <div
        className={`${wrapperClasses} ${styles.fallbackPlaceholder}`}
        role="img"
        aria-label={`Escudo de selección de ${code}`}
      >
        {fallbackText}
      </div>
    );
  }

  return (
    <span className={wrapperClasses}>
      {isLoading && <span className={styles.skeleton} aria-hidden="true" />}
      <img
        className={styles.flagImage}
        alt={`Escudo de selección de ${code}`}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </span>
  );
};

Flag.displayName = 'Flag';
