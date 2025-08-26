'use client';

import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import React, { Fragment } from 'react';
import useSWR from 'swr';

import styles from './villages-table.module.css';
import { CountryFlag } from '@/components/CountryFlag';
import { IconButton } from '@/components/ui/Button';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { Input } from '@/components/ui/Form';
import { Select } from '@/components/ui/Form/Select';
import { Modal } from '@/components/ui/Modal';
import { Tooltip } from '@/components/ui/Tooltip/Tooltip';
import type { Village } from '@/database/schemas/villages';
import { COUNTRIES } from '@/lib/iso-3166-countries-french';
import { jsonFetcher } from '@/lib/json-fetcher';
import { deleteVillage } from '@/server-actions/villages/delete-village';

export function VillagesTable() {
    const [search, setSearch] = React.useState('');
    const [limit, setLimit] = React.useState(10);
    const [page, setPage] = React.useState(1);
    const [isDeletingVillage, setIsDeletingVillage] = React.useState(false);
    const [deleteVillageIndex, setDeleteVillageIndex] = React.useState<number | null>(null);

    const { data: villages, isLoading, mutate } = useSWR<Village[], Error>('/api/villages', jsonFetcher);

    const filteredVillages = (villages || []).filter((v) => v.name.toLowerCase().includes(search.toLowerCase()));
    const total = filteredVillages.length;
    const paginatedVillages = filteredVillages.slice((page - 1) * limit, page * limit);

    // Reset page if it's out of bounds
    if (page !== 1 && page > Math.ceil(total / limit)) {
        setPage(1);
    }

    return (
        <div>
            <Input
                iconAdornment={<MagnifyingGlassIcon width={20} height="auto" fill="currentColor" />}
                iconAdornmentProps={{
                    position: 'left',
                }}
                isFullWidth
                placeholder="Rechercher un village-monde..."
                size="sm"
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                }}
            />
            <table className={styles.table}>
                {/* <colgroup>
                    <col style={{ width: '0px' }} />
                    <col style={{ width: '0px' }} />
                    <col style={{ minWidth: '140px' }} />
                    <col style={{ minWidth: '150px' }} />
                    <col style={{ minWidth: '140px' }} />
                    <col style={{ minWidth: '100px' }} />
                </colgroup> */}
                <thead>
                    <tr>
                        <th className={styles.headerCell} align="left">
                            Nom du village
                        </th>
                        <th className={styles.headerCell} align="left">
                            Pays
                        </th>
                        <th className={styles.headerCell} style={{ minWidth: '110px', width: '110px', boxSizing: 'border-box' }}>
                            Phase active
                        </th>
                        <th className={styles.headerCell} style={{ minWidth: '150px', width: '150px', boxSizing: 'border-box' }}>
                            Nombre de classes
                        </th>
                        <th className={styles.headerCell} style={{ minWidth: '140px', width: '140px', boxSizing: 'border-box' }}>
                            Nombre de posts
                        </th>
                        <th
                            className={styles.headerCell}
                            align="right"
                            style={{ paddingRight: 16, minWidth: '90px', width: '90px', boxSizing: 'border-box' }}
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading && villages === undefined ? (
                        <tr>
                            <td colSpan={6} align="center" style={{ padding: '32px 0' }}>
                                <CircularProgress size={25} />
                            </td>
                        </tr>
                    ) : (
                        paginatedVillages.map((village, index) => (
                            <tr key={village.id} className={styles.row}>
                                <td className={styles.cell}>{village.name}</td>
                                <td className={styles.cell}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                        {village.countries.map((countryCode, index) => {
                                            const country = COUNTRIES[countryCode];
                                            return (
                                                <Fragment key={countryCode}>
                                                    <CountryFlag country={countryCode} size="small" />
                                                    {country || countryCode}
                                                    {index < village.countries.length - 1 && <span>&middot;</span>}
                                                </Fragment>
                                            );
                                        })}
                                    </div>
                                </td>
                                <td className={styles.cell} align="center">
                                    {village.activePhase}
                                </td>
                                <td className={styles.cell} align="center">
                                    {Object.values(village.classroomCount).reduce((acc, count) => acc + count, 0)}
                                </td>
                                <td className={styles.cell} align="center">
                                    0
                                </td>
                                <td className={styles.cell} align="right" style={{ padding: '0 8px' }}>
                                    <Tooltip content="Modifier le village" hasArrow>
                                        <IconButton
                                            as="a"
                                            href={`/admin/manage/villages/${village.id}`}
                                            icon={Pencil1Icon}
                                            variant="borderless"
                                            color="primary"
                                        />
                                    </Tooltip>
                                    <Tooltip content="Supprimer le village" hasArrow>
                                        <IconButton
                                            icon={TrashIcon}
                                            variant="borderless"
                                            color="error"
                                            onClick={() => setDeleteVillageIndex(index)}
                                        />
                                    </Tooltip>
                                </td>
                            </tr>
                        ))
                    )}
                    <tr style={{ backgroundColor: 'white' }}>
                        <th colSpan={6} align="right">
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ marginRight: 16 }}>Lignes par pages:</span>
                                <Select
                                    value={`${limit}`}
                                    onChange={(value) => {
                                        setLimit(Number(value));
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
                                    {total === 0 ? 0 : (page - 1) * limit + 1}-{Math.min(total, page * limit)} sur {total}
                                </span>
                                <IconButton
                                    marginY="xs"
                                    marginLeft="sm"
                                    aria-label="previous"
                                    onClick={() => {
                                        setPage(page - 1);
                                    }}
                                    variant="borderless"
                                    disabled={page === 1}
                                    icon={ChevronLeftIcon}
                                ></IconButton>
                                <IconButton
                                    marginY="xs"
                                    marginRight="sm"
                                    aria-label="next"
                                    onClick={() => {
                                        setPage(page + 1);
                                    }}
                                    disabled={page * limit >= total}
                                    variant="borderless"
                                    icon={ChevronRightIcon}
                                ></IconButton>
                            </div>
                        </th>
                    </tr>
                </tbody>
            </table>
            <Modal
                isOpen={deleteVillageIndex !== null}
                onClose={() => setDeleteVillageIndex(null)}
                title="Supprimer le village"
                confirmLabel="Supprimer"
                confirmLevel="error"
                onConfirm={async () => {
                    if (deleteVillageIndex === null) {
                        return;
                    }
                    try {
                        setIsDeletingVillage(true);
                        await deleteVillage(paginatedVillages[deleteVillageIndex].id);
                        await mutate(); // refresh the villages list
                    } catch (error) {
                        console.error(error);
                    } finally {
                        setIsDeletingVillage(false);
                        setDeleteVillageIndex(null);
                    }
                }}
                isLoading={isDeletingVillage}
            >
                {deleteVillageIndex !== null && (
                    <p>
                        Êtes-vous sûr de vouloir supprimer le village <strong>{paginatedVillages[deleteVillageIndex]?.name}</strong> ?
                    </p>
                )}
            </Modal>
        </div>
    );
}
