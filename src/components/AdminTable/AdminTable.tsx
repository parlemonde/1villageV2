import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import classNames from 'clsx';
import React from 'react';

import styles from './admin-table.module.css';
import { IconButton } from '../ui/Button';
import { CircularProgress } from '../ui/CircularProgress';
import { Select } from '../ui/Form/Select';
import PelicoSearchIcon from '@/svg/pelico/pelico-search.svg';

export interface AdminTableColumn<T> {
    id: string;
    header: string;
    accessor: string | ((row: T, index: number) => React.ReactNode);
    width?: string | number; // default to auto
    align?: 'left' | 'center' | 'right' | 'justify'; // default to left
    isSortable?: boolean; // default to false
    getSortValue?: (row: T, index: number) => string | number;
    cellPadding?: string | number; // default to 8px
}

export interface AdminTableProps<T> {
    columns: AdminTableColumn<T>[];
    data: T[];
    isLoading?: boolean;
    emptyState?: React.ReactNode;
}

interface CellAccessorProps<T> {
    column: AdminTableColumn<T>;
    row: T;
    index: number;
}

const isObjectLike = (obj: unknown): obj is Record<string, unknown> => {
    return typeof obj === 'object' && obj !== null;
};
const isPrimitive = (obj: unknown): obj is string | number | boolean | null | undefined => {
    return obj === null || obj === undefined || typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean';
};

/**
 * Get a value from an object using a path
 */
const get = (obj: unknown, path: string, defaultValue = undefined): unknown => {
    if (path === '') {
        return obj;
    }
    if (!isObjectLike(obj)) {
        return defaultValue;
    }
    const travel = (regexp: RegExp) =>
        String.prototype.split
            .call(path, regexp)
            .filter(Boolean)
            .reduce<unknown>((res, key) => (isObjectLike(res) ? res[key] : res), obj);
    const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
    return result === undefined || result === obj ? defaultValue : result;
};

const CellAccessor = <T,>({ column, row, index }: CellAccessorProps<T>): React.ReactNode => {
    if (typeof column.accessor === 'function') {
        return column.accessor(row, index);
    }
    const data = get(row, column.accessor);
    if (isPrimitive(data)) {
        return data;
    }
    return <>{JSON.stringify(data)}</>;
};

export const AdminTable = <T,>({ columns, data, isLoading = false, emptyState }: AdminTableProps<T>) => {
    const [pageSize, setPageSize] = React.useState(10);
    const [pageIndex, setPageIndex] = React.useState(1);
    const [sortColumn, setSortColumn] = React.useState<string | null>(null);
    const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc' | null>(null);

    const total = data.length;
    const columnToSort = columns.find((column) => column.id === sortColumn);
    const sortedData = columnToSort
        ? data.sort((a, b) => {
              let aValue: unknown;
              let bValue: unknown;
              if (columnToSort.getSortValue) {
                  aValue = columnToSort.getSortValue?.(a, 0);
                  bValue = columnToSort.getSortValue?.(b, 0);
              } else if (typeof columnToSort.accessor === 'string') {
                  aValue = get(a, columnToSort.accessor);
                  bValue = get(b, columnToSort.accessor);
              }
              if (typeof aValue === 'number' && typeof bValue === 'number') {
                  return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
              } else if (typeof aValue === 'string' && typeof bValue === 'string') {
                  return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
              }
              return 0;
          })
        : data;
    const paginatedData = sortedData.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);

    // Reset page if it's out of bounds
    if (pageIndex !== 1 && pageIndex > Math.ceil(total / pageSize)) {
        setPageIndex(1);
    }

    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    {columns.map((column) =>
                        column.isSortable ? (
                            <th
                                key={column.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                    if (sortColumn === column.id) {
                                        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                    } else {
                                        setSortColumn(column.id);
                                        setSortDirection('asc');
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        if (sortColumn === column.id) {
                                            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                        } else {
                                            setSortColumn(column.id);
                                            setSortDirection('asc');
                                        }
                                    }
                                }}
                                className={classNames(styles.headerCell, styles.sortableHeaderCell)}
                                align={column.align || 'left'}
                                style={{ width: column.width, minWidth: column.width }}
                            >
                                <div className={styles.headerCellContent}>
                                    <span>{column.header}</span>
                                    {sortColumn === column.id && sortDirection === 'desc' ? (
                                        <ArrowDownIcon />
                                    ) : (
                                        <ArrowUpIcon className={classNames({ [styles.hiddenSortIcon]: sortColumn !== column.id })} />
                                    )}
                                </div>
                            </th>
                        ) : (
                            <th
                                key={column.id}
                                className={classNames(styles.headerCell)}
                                align={column.align || 'left'}
                                style={{ width: column.width, minWidth: column.width }}
                            >
                                {column.header}
                            </th>
                        ),
                    )}
                </tr>
            </thead>
            <tbody>
                {isLoading ? (
                    <tr>
                        <td
                            className={classNames(styles.cell, styles.lastCell)}
                            colSpan={columns.length}
                            align="center"
                            style={{ padding: '32px 0' }}
                        >
                            <CircularProgress size={25} />
                        </td>
                    </tr>
                ) : data.length === 0 ? (
                    <tr>
                        <td
                            className={classNames(styles.cell, styles.lastCell)}
                            colSpan={columns.length}
                            align="center"
                            style={{ padding: '32px 0' }}
                        >
                            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                <PelicoSearchIcon width={100} height={100} />
                                <span style={{ fontSize: '16px', fontWeight: 500, color: 'var(--primary-color)' }}>
                                    {emptyState || 'Cette table est vide !'}
                                </span>
                            </div>
                        </td>
                    </tr>
                ) : (
                    paginatedData.map((row, index) => (
                        <tr key={index} className={styles.row}>
                            {columns.map((column) => (
                                <td
                                    key={column.id}
                                    className={classNames(styles.cell, {
                                        [styles.lastCell]: index === data.length - 1,
                                    })}
                                    align={column.align || 'left'}
                                    style={{ padding: column.cellPadding }}
                                >
                                    <CellAccessor column={column} row={row} index={index} />
                                </td>
                            ))}
                        </tr>
                    ))
                )}
                {data.length > 0 && !isLoading && (
                    <tr style={{ backgroundColor: 'white' }}>
                        <th colSpan={columns.length} align="right">
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ marginRight: 16 }}>Lignes par pages:</span>
                                <Select
                                    value={`${pageSize}`}
                                    onChange={(value) => {
                                        setPageSize(Number(value));
                                    }}
                                    options={[
                                        { label: '5', value: '5' },
                                        { label: '10', value: '10' },
                                        { label: '25', value: '25' },
                                        { label: '50', value: '50' },
                                        { label: '100', value: '100' },
                                    ]}
                                    style={{
                                        borderTop: 'none',
                                        borderLeft: 'none',
                                        borderRight: 'none',
                                        borderRadius: 0,
                                        padding: '4px',
                                        fontWeight: 400,
                                        fontSize: '14px',
                                        lineHeight: '20px',
                                        width: '60px',
                                    }}
                                />
                                <span style={{ margin: '0 16px' }}>
                                    {total === 0 ? 0 : (pageIndex - 1) * pageSize + 1}-{Math.min(total, pageIndex * pageSize)} sur {total}
                                </span>
                                <IconButton
                                    marginY="xs"
                                    marginLeft="sm"
                                    aria-label="previous"
                                    onClick={() => {
                                        setPageIndex(pageIndex - 1);
                                    }}
                                    variant="borderless"
                                    disabled={pageIndex === 1}
                                    icon={ChevronLeftIcon}
                                ></IconButton>
                                <IconButton
                                    marginY="xs"
                                    marginRight="sm"
                                    aria-label="next"
                                    onClick={() => {
                                        setPageIndex(pageIndex + 1);
                                    }}
                                    disabled={pageIndex * pageSize >= total}
                                    variant="borderless"
                                    icon={ChevronRightIcon}
                                ></IconButton>
                            </div>
                        </th>
                    </tr>
                )}
            </tbody>
        </table>
    );
};
