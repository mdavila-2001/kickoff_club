import React from 'react';
import { Skeleton } from '../../atoms/Skeleton/Skeleton';
import styles from './PredictionSummary.module.css';

export interface PredictionStatsDTO {
  readonly totalPredictions: number;
  readonly exactHits: number;
  readonly outcomeHits: number;
  readonly efficiencyPercentage: number;
}

export interface PredictionSummaryProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly stats: PredictionStatsDTO | null;
  readonly isLoading?: boolean;
}

const EMPTY_VALUE = '—';

const formatEfficiency = (value: number): string =>
  `${Math.min(100, Math.max(0, Math.round(value)))}%`;

interface MetricCardProps {
  readonly label: string;
  readonly isLoading: boolean;
  readonly valueClassName?: string;
  readonly children: React.ReactNode;
}

const MetricCard = ({
  label,
  isLoading,
  valueClassName = '',
  children,
}: MetricCardProps) => (
  <dl className={styles.metricCard}>
    <dt className={styles.metricLabel}>{label}</dt>
    <dd className={`${styles.metricValue} ${valueClassName}`.trim()}>
      {isLoading ? (
        <Skeleton variant="rect" width="48px" height="28px" animation="pulse" />
      ) : (
        children
      )}
    </dd>
  </dl>
);

export const PredictionSummary = ({
  stats,
  isLoading = false,
  className = '',
  ...props
}: PredictionSummaryProps) => {
  const gridClasses = [styles.summaryGrid, className].filter(Boolean).join(' ');

  return (
    <section
      className={gridClasses}
      aria-label="Resumen de rendimiento de predicciones"
      aria-busy={isLoading || undefined}
      {...props}
    >
      <MetricCard label="Predicciones" isLoading={isLoading}>
        {stats?.totalPredictions ?? EMPTY_VALUE}
      </MetricCard>

      <MetricCard label="Plenos" isLoading={isLoading} valueClassName={styles.exactValue}>
        {stats?.exactHits ?? EMPTY_VALUE}
      </MetricCard>

      <MetricCard label="Aciertos" isLoading={isLoading}>
        {stats?.outcomeHits ?? EMPTY_VALUE}
      </MetricCard>

      <MetricCard
        label="Efectividad"
        isLoading={isLoading}
        valueClassName={styles.efficiencyValue}
      >
        {stats ? formatEfficiency(stats.efficiencyPercentage) : EMPTY_VALUE}
      </MetricCard>
    </section>
  );
};

PredictionSummary.displayName = 'PredictionSummary';
