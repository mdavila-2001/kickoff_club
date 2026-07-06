import React from 'react';
import { Skeleton } from '../../atoms/Skeleton/Skeleton';
import styles from './TeamDisplay.module.css';

export interface TeamDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly name: string;
  readonly shortName: string;
  readonly flagUrl: string;
  readonly alignment: 'left' | 'right';
  readonly isLoading?: boolean;
}

export const TeamDisplay = ({
  name,
  shortName,
  flagUrl,
  alignment,
  isLoading = false,
  className = '',
  ...props
}: TeamDisplayProps) => {
  const containerClasses = [
    styles.teamContainer,
    alignment === 'right' ? styles.alignRight : styles.alignLeft,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (isLoading) {
    return (
      <div className={containerClasses} aria-busy="true" {...props}>
        <Skeleton variant="circle" width="32px" height="32px" />
        <Skeleton variant="rect" width="80px" height="0.875rem" />
      </div>
    );
  }

  return (
    <div className={containerClasses} {...props}>
      <span className={styles.flagWrapper}>
        <img
          src={flagUrl}
          alt=""
          className={styles.flagImage}
          loading="lazy"
          draggable={false}
        />
      </span>

      <span className={styles.teamName}>
        <span className={styles.fullName}>{name}</span>
        <span className={styles.shortName}>{shortName}</span>
      </span>
    </div>
  );
};

TeamDisplay.displayName = 'TeamDisplay';
