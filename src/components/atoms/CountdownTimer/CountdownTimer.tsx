import React, { useEffect, useRef, useState } from 'react';
import { Skeleton } from '../Skeleton/Skeleton';
import styles from './CountdownTimer.module.css';

export interface CountdownTimerProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly targetDate: string | Date;
  readonly onExpire?: () => void;
  readonly isLoading?: boolean;
}

const TICK_INTERVAL_MS = 1000;
const CRITICAL_THRESHOLD_MS = 15 * 60 * 1000;
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;

const padTwoDigits = (value: number): string => String(value).padStart(2, '0');

const formatTime = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / MS_PER_SECOND));
  const days = Math.floor(totalSeconds / SECONDS_PER_DAY);
  const hours = Math.floor((totalSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR);
  const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;

  if (totalSeconds < SECONDS_PER_HOUR) {
    return `${padTwoDigits(minutes)}:${padTwoDigits(seconds)}`;
  }

  if (days > 0) {
    return `${days}d ${padTwoDigits(hours)}h ${padTwoDigits(minutes)}m ${padTwoDigits(seconds)}s`;
  }

  return `${padTwoDigits(hours)}h ${padTwoDigits(minutes)}m ${padTwoDigits(seconds)}s`;
};

export const CountdownTimer = ({
  targetDate,
  onExpire,
  isLoading = false,
  className = '',
  ...props
}: CountdownTimerProps) => {
  const targetMs = new Date(targetDate).getTime();

  const [remainingMs, setRemainingMs] = useState<number>(() => targetMs - Date.now());
  const [syncedTargetMs, setSyncedTargetMs] = useState(targetMs);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasExpiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  // Resincroniza el contador en el mismo render cuando la fecha objetivo
  // cambia desde el exterior: se ajusta por el desplazamiento entre fechas
  // (cálculo puro, sin leer el reloj) y el siguiente tick corrige la deriva.
  if (targetMs !== syncedTargetMs) {
    setRemainingMs(remainingMs + (targetMs - syncedTargetMs));
    setSyncedTargetMs(targetMs);
  }

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const expireOnce = () => {
      if (!hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onExpireRef.current?.();
      }
    };

    if (targetMs - Date.now() <= 0) {
      expireOnce();
      return;
    }

    hasExpiredRef.current = false;

    intervalRef.current = setInterval(() => {
      const remaining = targetMs - Date.now();
      setRemainingMs(remaining);

      if (remaining <= 0) {
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        expireOnce();
      }
    }, TICK_INTERVAL_MS);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [targetMs]);

  if (isLoading) {
    return <Skeleton variant="rect" width="110px" height="1.5rem" />;
  }

  const isCritical = remainingMs <= CRITICAL_THRESHOLD_MS;

  const timerClasses = [
    styles.timerContainer,
    isCritical ? styles.critical : styles.normal,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div {...props} className={timerClasses} role="timer">
      {formatTime(remainingMs)}
    </div>
  );
};

CountdownTimer.displayName = 'CountdownTimer';
