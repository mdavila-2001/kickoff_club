import React, { useRef } from 'react';
import { Skeleton } from '../../atoms/Skeleton/Skeleton';
import styles from './GroupSelectorCard.module.css';

export interface GroupOptionDTO {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly memberCount: number;
}

export interface GroupSelectorCardProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly groups: readonly GroupOptionDTO[];
  readonly activeGroupId: string;
  readonly onGroupChange: (groupId: string) => void;
  readonly isLoading?: boolean;
}

const SKELETON_PILL_KEYS = ['sk-1', 'sk-2', 'sk-3'] as const;

const formatMembers = (count: number): string =>
  `${count} ${count === 1 ? 'miembro' : 'miembros'}`;

const GroupSelectorCardComponent = ({
  groups,
  activeGroupId,
  onGroupChange,
  isLoading = false,
  className = '',
  ...props
}: GroupSelectorCardProps) => {
  const optionRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const cardClasses = [styles.cardContainer, className].filter(Boolean).join(' ');

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (groups.length === 0) {
      return;
    }

    const currentIndex = Math.max(
      0,
      groups.findIndex((group) => group.id === activeGroupId)
    );

    let nextIndex: number;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (currentIndex + 1) % groups.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (currentIndex - 1 + groups.length) % groups.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = groups.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const nextGroup = groups[nextIndex];
    onGroupChange(nextGroup.id);
    optionRefs.current[nextGroup.id]?.focus();
  };

  if (isLoading) {
    return (
      <div className={cardClasses} aria-busy="true" {...props}>
        <div className={styles.optionsList}>
          {SKELETON_PILL_KEYS.map((key) => (
            <Skeleton key={key} variant="rect" width="150px" height="52px" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cardClasses} {...props}>
      {groups.length === 0 ? (
        <p className={styles.emptyState}>No perteneces a ningún grupo todavía</p>
      ) : (
        <div
          className={styles.optionsList}
          role="radiogroup"
          aria-label="Selector de grupo de quiniela"
          onKeyDown={handleKeyDown}
        >
          {groups.map((group) => {
            const isActive = group.id === activeGroupId;

            const optionClasses = [
              styles.option,
              isActive ? styles.activeOption : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={group.id}
                ref={(element) => {
                  optionRefs.current[group.id] = element;
                }}
                type="button"
                role="radio"
                aria-checked={isActive}
                tabIndex={isActive ? 0 : -1}
                className={optionClasses}
                onClick={() => onGroupChange(group.id)}
              >
                <span className={styles.optionName}>{group.name}</span>
                <span className={styles.optionMeta}>
                  {group.code} · {formatMembers(group.memberCount)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

GroupSelectorCardComponent.displayName = 'GroupSelectorCard';

const arePropsEqual = (
  prev: GroupSelectorCardProps,
  next: GroupSelectorCardProps
): boolean =>
  prev.groups === next.groups &&
  prev.activeGroupId === next.activeGroupId &&
  prev.isLoading === next.isLoading &&
  prev.onGroupChange === next.onGroupChange &&
  prev.className === next.className;

export const GroupSelectorCard = React.memo(GroupSelectorCardComponent, arePropsEqual);
