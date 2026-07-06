import React from 'react';
import styles from './Skeleton.module.css';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly variant?: 'text' | 'circle' | 'rect';
  readonly width?: string;
  readonly height?: string;
  readonly animation?: 'shimmer' | 'pulse' | 'none';
}

export const Skeleton = ({
  variant = 'rect',
  width,
  height,
  animation = 'shimmer',
  className = '',
  style,
  ...props
}: SkeletonProps) => {
  const skeletonClasses = [
    styles.skeleton,
    styles[variant],
    animation !== 'none' ? styles[animation] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const mergedStyle: React.CSSProperties = { width, height, ...style };

  return (
    <div
      aria-valuetext="Cargando contenido"
      {...props}
      className={skeletonClasses}
      style={mergedStyle}
      aria-busy="true"
      role="progressbar"
    />
  );
};

Skeleton.displayName = 'Skeleton';
