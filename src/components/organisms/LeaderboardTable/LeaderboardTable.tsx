import React from 'react';
import { Skeleton } from '../../atoms/Skeleton/Skeleton';
import styles from './LeaderboardTable.module.css';

export interface LeaderboardRowDTO {
  readonly userId: string;
  readonly rank: number;
  readonly username: string;
  readonly predictionsMade: number;
  readonly exactHits: number;
  readonly points: number;
}

export interface LeaderboardTableProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly data: readonly LeaderboardRowDTO[];
  readonly currentUserId?: string | null;
  readonly isLoading?: boolean;
}

const COLUMN_COUNT = 5;
const SKELETON_ROW_KEYS = ['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5'] as const;

const FLUSH_TEXT = { marginBottom: 0 } as const;
const FLUSH_TEXT_CENTERED = { marginBottom: 0, marginLeft: 'auto', marginRight: 'auto' } as const;
const FLUSH_TEXT_RIGHT = { marginBottom: 0, marginLeft: 'auto' } as const;

const renderSkeletonRows = (): readonly React.ReactElement[] =>
  SKELETON_ROW_KEYS.map((key) => (
    <tr key={key} className={styles.bodyRow} aria-busy="true">
      <td className={styles.rankCell}>
        <Skeleton variant="text" width="24px" style={FLUSH_TEXT_CENTERED} />
      </td>
      <td className={styles.userCell}>
        <Skeleton variant="text" width="60%" style={FLUSH_TEXT} />
      </td>
      <td className={styles.predictionsCell}>
        <Skeleton variant="text" width="32px" style={FLUSH_TEXT_RIGHT} />
      </td>
      <td className={styles.hitsCell}>
        <Skeleton variant="text" width="28px" style={FLUSH_TEXT_RIGHT} />
      </td>
      <td className={styles.pointsCell}>
        <Skeleton variant="text" width="40px" style={FLUSH_TEXT_RIGHT} />
      </td>
    </tr>
  ));

const getRankClass = (rank: number): string => {
  if (rank === 1) return styles.rankGold;
  if (rank === 2) return styles.rankSilver;
  if (rank === 3) return styles.rankBronze;
  return '';
};

const LeaderboardTableComponent = ({
  data,
  currentUserId = null,
  isLoading = false,
  className = '',
  ...props
}: LeaderboardTableProps) => {
  const wrapperClasses = [styles.tableWrapper, className].filter(Boolean).join(' ');
  const isEmpty = !isLoading && data.length === 0;

  return (
    <div className={wrapperClasses} {...props}>
      <table className={styles.table}>
        <caption className={styles.srOnly}>
          Clasificación de participantes de la quiniela
        </caption>

        <thead>
          <tr>
            <th scope="col" className={styles.rankCell}>
              #
            </th>
            <th scope="col" className={styles.userCell}>
              Usuario
            </th>
            <th scope="col" className={styles.predictionsCell}>
              Predicciones
            </th>
            <th scope="col" className={styles.hitsCell}>
              Plenos
            </th>
            <th scope="col" className={styles.pointsCell}>
              Puntos
            </th>
          </tr>
        </thead>

        <tbody>
          {isLoading && renderSkeletonRows()}

          {isEmpty && (
            <tr>
              <td colSpan={COLUMN_COUNT} className={styles.emptyCell}>
                No hay registros disponibles en la clasificación
              </td>
            </tr>
          )}

          {!isLoading &&
            data.map((row) => {
              const isCurrentUser =
                currentUserId !== null && row.userId === currentUserId;

              const rowClasses = [
                styles.bodyRow,
                isCurrentUser ? styles.currentUserRow : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <tr
                  key={row.userId}
                  className={rowClasses}
                  aria-current={isCurrentUser ? 'true' : undefined}
                >
                  <td className={`${styles.rankCell} ${getRankClass(row.rank)}`.trim()}>
                    {row.rank}
                  </td>
                  <th scope="row" className={styles.userCell}>
                    {row.username}
                  </th>
                  <td className={styles.predictionsCell}>{row.predictionsMade}</td>
                  <td className={styles.hitsCell}>{row.exactHits}</td>
                  <td className={styles.pointsCell}>{row.points}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

LeaderboardTableComponent.displayName = 'LeaderboardTable';

export const LeaderboardTable = React.memo(LeaderboardTableComponent);
