import React, { useState } from 'react';
import { Skeleton } from '../Skeleton/Skeleton';
import styles from './ScoreInput.module.css';

export interface ScoreInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  readonly value?: number | '';
  readonly onChange?: (value: number) => void;
  readonly isLocked?: boolean;
  readonly isLoading?: boolean;
  readonly ariaLabel: string;
}

const BLOCKED_KEYS = new Set(['-', '+', '.', ',', 'e', 'E']);

export const ScoreInput = ({
  value = '',
  onChange,
  isLocked = false,
  isLoading = false,
  ariaLabel,
  className = '',
  onKeyDown,
  onBlur,
  ...props
}: ScoreInputProps) => {
  const [buffer, setBuffer] = useState<string>(String(value));
  const [syncedValue, setSyncedValue] = useState<number | ''>(value);

  // Sincroniza el buffer local solo cuando la prop cambia desde el exterior
  // (patrón "adjust state during render", sin useEffect ni render extra).
  if (value !== syncedValue) {
    setSyncedValue(value);
    setBuffer(String(value));
  }

  const flushBuffer = () => {
    const parsed = Number.parseInt(buffer, 10);

    if (Number.isInteger(parsed) && parsed >= 0) {
      setBuffer(String(parsed));
      onChange?.(parsed);
    } else {
      setBuffer(String(value));
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (BLOCKED_KEYS.has(event.key)) {
      event.preventDefault();
      return;
    }

    if (event.key === 'Enter') {
      flushBuffer();
    }

    onKeyDown?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    flushBuffer();
    onBlur?.(event);
  };

  if (isLoading) {
    return <Skeleton variant="rect" width="48px" height="40px" />;
  }

  if (isLocked) {
    return (
      <output className={styles.lockedScore} aria-label={ariaLabel}>
        {value === '' ? '—' : value}
      </output>
    );
  }

  return (
    <input
      {...props}
      type="number"
      inputMode="numeric"
      min={0}
      step={1}
      className={[styles.scoreInput, className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
      value={buffer}
      onChange={(event) => {
        const val = event.target.value;
        setBuffer(val);
        const parsed = Number.parseInt(val, 10);
        if (Number.isInteger(parsed) && parsed >= 0) {
          onChange?.(parsed);
        }
      }}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    />
  );
};

ScoreInput.displayName = 'ScoreInput';
