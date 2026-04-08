'use client';

import type { PhaseActivitiesResponse } from '@app/api/statistics/phase/[id]/types';
import { IconButton } from '@frontend/components/ui/Button';
import { CircularProgress } from '@frontend/components/ui/CircularProgress';
import { Select } from '@frontend/components/ui/Form/Select';
import { Title } from '@frontend/components/ui/Title';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import { ChevronLeftIcon, ChevronRightIcon, DoubleArrowDownIcon, DoubleArrowUpIcon } from '@radix-ui/react-icons';
import type { ActivityType } from '@server/database/schemas/activity-types';
import classNames from 'clsx';
import { useExtracted } from 'next-intl';
import { useState } from 'react';
import useSWR from 'swr';

import styles from './phase-table.module.css';

const DEFAULT_ITEMS_PER_PAGE = 5;

interface PhaseTableProps {
    phase: number;
    countryCode: string;
    villageId: string;
    classroomId: string;
}

const getUrl = (phase: number, classroomId: string, villageId: string, countryCode: string, page: number, itemsPerPage: number) => {
    let url = `/api/statistics/phase/${phase}`;
    if (classroomId) {
        url = `/api/statistics/phase/${phase}/classroom/${classroomId}`;
    }
    if (villageId) {
        url = `/api/statistics/phase/${phase}/village/${villageId}`;
    }
    if (countryCode) {
        url = `/api/statistics/phase/${phase}/country/${countryCode}`;
    }

    url += serializeToQueryUrl({ page: page, itemsPerPage: itemsPerPage });
    return url;
};

export const PhaseTable = ({ phase, countryCode, villageId, classroomId }: PhaseTableProps) => {
    const t = useExtracted('PhaseTable');
    const [expanded, setExpanded] = useState(true);

    const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
    const [currentPage, setCurrentPage] = useState(1);

    const url = getUrl(phase, classroomId, villageId, countryCode, currentPage, itemsPerPage);

    const { data, isLoading: isLoadingData } = useSWR<PhaseActivitiesResponse>(url, jsonFetcher);
    const { data: columns, isLoading: isLoadingColumns } = useSWR<ActivityType[]>(
        `/api/activities/types${serializeToQueryUrl({ phase: phase })}`,
        jsonFetcher,
    );

    const label = classroomId ? t('Classe') : villageId ? t('Village') : countryCode ? t('Pays') : t('Nom du village');
    const totalElements = data?.totalElements ?? 0;
    const maxPage = Math.ceil(totalElements / itemsPerPage);

    const eltLabel = totalElements === 1 ? t('élément') : t('éléments');

    return (
        <div className={styles.container}>
            <div className={classNames(styles.header, { [styles.expanded]: expanded })} onClick={() => setExpanded(!expanded)}>
                <Title variant="h3">
                    {t('Phase')} {phase}
                </Title>
                {expanded ? (
                    <DoubleArrowUpIcon width={20} height={20} className={styles.arrowIcon} />
                ) : (
                    <DoubleArrowDownIcon width={20} height={20} className={styles.arrowIcon} />
                )}
            </div>
            {(isLoadingColumns || isLoadingData) && (
                <div className={styles.loader}>
                    <CircularProgress />
                </div>
            )}
            <div
                className={classNames({
                    [styles.collapsed]: !expanded,
                })}
            >
                <div className={styles.separator} />
                <div className={styles.tableContainer}>
                    <div className={styles.tableScroll}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>{label}</th>
                                    {columns?.map((column) => (
                                        <th key={column}>{column}</th>
                                    ))}
                                    <th>{t('Vidéos')}</th>
                                    <th>{t('Brouillons')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.totals && (
                                    <tr className={styles.totalRow}>
                                        <td>{t('Total')}</td>
                                        {columns?.map((column) => (
                                            <td key={column}>{data.totals?.[column] ?? '-'}</td>
                                        ))}
                                        <td>{data.totals.video || '-'}</td>
                                        <td>{data.totals.draft || '-'}</td>
                                    </tr>
                                )}

                                {data?.rows.map((row, index) => (
                                    <tr key={index}>
                                        <td>{row.name}</td>
                                        {columns?.map((column) => (
                                            <td key={column}>{row.activities[column] ?? '-'}</td>
                                        ))}
                                        <td>{row.activities.video || '-'}</td>
                                        <td>{row.activities.draft || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className={styles.footer}>
                        <div className={styles.pagination}>
                            {totalElements <= itemsPerPage ? (
                                <span>
                                    {totalElements} {eltLabel}
                                </span>
                            ) : (
                                <div className={styles.flexRow}>
                                    <div className={styles.itemsPerPageSelector}>
                                        <span>{t('Lignes par page')}</span>
                                        <Select
                                            size="sm"
                                            className={styles.select}
                                            value={itemsPerPage.toString()}
                                            onChange={(value) => setItemsPerPage(Number(value))}
                                            options={[
                                                { label: '5', value: '5' },
                                                { label: '10', value: '10' },
                                                { label: '20', value: '20' },
                                                { label: '50', value: '50' },
                                            ]}
                                        />
                                    </div>
                                    <div className={styles.pageSelector}>
                                        <span>
                                            {t('{start} - {end} sur {total} {elements}', {
                                                start: `${(currentPage - 1) * itemsPerPage + 1}`,
                                                end: `${Math.min(currentPage * itemsPerPage, totalElements)}`,
                                                total: `${totalElements}`,
                                                elements: eltLabel,
                                            })}
                                        </span>
                                    </div>
                                    <div className={styles.paginationButtons}>
                                        <IconButton
                                            icon={ChevronLeftIcon}
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            variant="borderless"
                                            size="sm"
                                        />
                                        <IconButton
                                            icon={ChevronRightIcon}
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={maxPage === currentPage}
                                            variant="borderless"
                                            size="sm"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
