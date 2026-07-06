import React from 'react';
import styles from './Table.module.css';

export interface ColumnConfig<T> {
  readonly key: keyof T | string;
  readonly header: React.ReactNode;
  readonly align?: 'left' | 'center' | 'right';
  readonly render?: (row: T) => React.ReactNode;
}

export interface TableProps<T> {
  readonly columns: readonly ColumnConfig<T>[];
  readonly data: readonly T[];
  readonly emptyMessage?: string;
  readonly rowKey?: (row: T, index: number) => string | number;
}

const ALIGN_CLASSES = {
  left: 'alignLeft',
  center: 'alignCenter',
  right: 'alignRight',
} as const;

const toDisplayValue = (value: unknown): React.ReactNode => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }
  return String(value);
};

const resolveCellContent = <T,>(row: T, column: ColumnConfig<T>): React.ReactNode => {
  if (column.render) {
    return column.render(row);
  }
  return toDisplayValue((row as Record<PropertyKey, unknown>)[column.key as PropertyKey]);
};

export const Table = <T,>({
  columns,
  data,
  emptyMessage = 'No hay datos disponibles',
  rowKey,
}: TableProps<T>) => {
  const alignClass = (align: ColumnConfig<T>['align']) =>
    styles[ALIGN_CLASSES[align ?? 'left']];

  return (
    <div className={styles.tableContainer}>
      <table className={styles.mainTable}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                scope="col"
                className={`${styles.th} ${alignClass(column.align)}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr className={styles.tr}>
              <td className={styles.td} colSpan={columns.length}>
                <div className={styles.emptyState}>{emptyMessage}</div>
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={rowKey ? rowKey(row, index) : index} className={styles.tr}>
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={`${styles.td} ${alignClass(column.align)}`}
                  >
                    {resolveCellContent(row, column)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
