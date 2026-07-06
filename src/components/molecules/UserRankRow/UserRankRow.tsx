import React from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { Skeleton } from '../../atoms/Skeleton/Skeleton';
import styles from './UserRankRow.module.css';

export interface UserRankDTO {
  readonly id: string;
  readonly username: string;
  readonly totalPoints: number;
  readonly exactPredictionsCount: number;
  readonly efficiencyRate: number;
}

export interface UserRankRowProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly rank: number;
  readonly userSnapshot: UserRankDTO;
  readonly rankDelta: number;
  readonly isCurrentUser?: boolean;
  readonly isLoading?: boolean;
}

const getDeltaLabel = (delta: number): string => {
  if (delta > 0) {
    return `Subió ${delta} ${delta === 1 ? 'posición' : 'posiciones'}`;
  }
  if (delta < 0) {
    const dropped = Math.abs(delta);
    return `Bajó ${dropped} ${dropped === 1 ? 'posición' : 'posiciones'}`;
  }
  return 'Posición estable';
};

const UserRankRowComponent = ({
  rank,
  userSnapshot,
  rankDelta,
  isCurrentUser = false,
  isLoading = false,
  className = '',
  ...props
}: UserRankRowProps) => {
  const containerClasses = [
    styles.rowContainer,
    isCurrentUser ? styles.currentUser : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (isLoading) {
    return (
      <div className={containerClasses} aria-busy="true" {...props}>
        <Skeleton variant="text" width="24px" style={{ marginBottom: 0 }} />
        <span className={styles.userInfo}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" style={{ marginBottom: 0 }} />
        </span>
        <Skeleton variant="text" width="48px" style={{ marginBottom: 0 }} />
        <Skeleton variant="text" width="32px" style={{ marginBottom: 0 }} />
      </div>
    );
  }

  let deltaClass = styles.deltaStable;
  let DeltaIcon = Minus;

  if (rankDelta > 0) {
    deltaClass = styles.deltaUp;
    DeltaIcon = ArrowUp;
  } else if (rankDelta < 0) {
    deltaClass = styles.deltaDown;
    DeltaIcon = ArrowDown;
  }

  return (
    <div
      className={containerClasses}
      aria-current={isCurrentUser ? 'true' : undefined}
      {...props}
    >
      <span className={styles.rankNumber}>{rank}</span>

      <span className={styles.userInfo}>
        <span className={styles.username}>{userSnapshot.username}</span>
        <span className={styles.userStats}>
          {userSnapshot.exactPredictionsCount} exactos · {userSnapshot.efficiencyRate}% efectividad
        </span>
      </span>

      <span className={styles.points}>
        {userSnapshot.totalPoints}
        <span className={styles.pointsUnit}>pts</span>
      </span>

      <span
        className={`${styles.delta} ${deltaClass}`}
        role="img"
        aria-label={getDeltaLabel(rankDelta)}
      >
        <DeltaIcon size={14} aria-hidden="true" />
        {rankDelta !== 0 && <span aria-hidden="true">{Math.abs(rankDelta)}</span>}
      </span>
    </div>
  );
};

UserRankRowComponent.displayName = 'UserRankRow';

export const UserRankRow = React.memo(UserRankRowComponent);
