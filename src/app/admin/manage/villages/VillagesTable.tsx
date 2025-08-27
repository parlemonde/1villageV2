'use client';

import { MagnifyingGlassIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import React, { Fragment } from 'react';
import useSWR from 'swr';

import { AdminTable } from '@/components/AdminTable';
import { CountryFlag } from '@/components/CountryFlag';
import { IconButton } from '@/components/ui/Button';
import { Input } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { Tooltip } from '@/components/ui/Tooltip/Tooltip';
import type { Village } from '@/database/schemas/villages';
import { COUNTRIES } from '@/lib/iso-3166-countries-french';
import { jsonFetcher } from '@/lib/json-fetcher';
import { deleteVillage } from '@/server-actions/villages/delete-village';

export function VillagesTable() {
    const [search, setSearch] = React.useState('');
    const [isDeletingVillage, setIsDeletingVillage] = React.useState(false);
    const [deleteVillageId, setDeleteVillageId] = React.useState<number | null>(null);

    const { data: villages, isLoading, mutate } = useSWR<Village[], Error>('/api/villages', jsonFetcher);

    const filteredVillages = (villages || []).filter((v) => v.name.toLowerCase().includes(search.toLowerCase()));

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
            <AdminTable
                data={filteredVillages}
                columns={[
                    {
                        id: 'name',
                        header: 'Nom du village',
                        accessor: 'name',
                    },
                    {
                        id: 'countries',
                        header: 'Pays',
                        accessor: (village) => (
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
                        ),
                    },
                    {
                        id: 'activePhase',
                        header: 'Phase active',
                        accessor: 'activePhase',
                        align: 'center',
                        width: 110,
                    },
                    {
                        id: 'classroomCount',
                        header: 'Nombre de classes',
                        accessor: (village) => Object.values(village.classroomCount).reduce((acc, count) => acc + count, 0),
                        align: 'center',
                        width: 150,
                    },
                    {
                        id: 'postCount',
                        header: 'Nombre de posts',
                        accessor: () => 0,
                        align: 'center',
                        width: 140,
                    },
                    {
                        id: 'actions',
                        header: 'Actions',
                        accessor: (village) => (
                            <>
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
                                    <IconButton icon={TrashIcon} variant="borderless" color="error" onClick={() => setDeleteVillageId(village.id)} />
                                </Tooltip>
                            </>
                        ),
                        align: 'right',
                        width: 90,
                        cellPadding: '0 8px',
                    },
                ]}
                isLoading={isLoading && villages === undefined}
                emptyState={
                    (villages || []).length > 0 ? (
                        'Aucun village trouvé !'
                    ) : (
                        <span>
                            {"Il n'existe aucun village. "}
                            <Link href="/admin/manage/villages/new" style={{ color: 'inherit', textDecoration: 'underline' }}>
                                En créer un?
                            </Link>
                        </span>
                    )
                }
            />
            <Modal
                isOpen={deleteVillageId !== null}
                onClose={() => setDeleteVillageId(null)}
                title="Supprimer le village"
                confirmLabel="Supprimer"
                confirmLevel="error"
                onConfirm={async () => {
                    if (deleteVillageId === null) {
                        return;
                    }
                    try {
                        setIsDeletingVillage(true);
                        await deleteVillage(deleteVillageId);
                        await mutate(); // refresh the villages list
                    } catch (error) {
                        console.error(error);
                    } finally {
                        setIsDeletingVillage(false);
                        setDeleteVillageId(null);
                    }
                }}
                isLoading={isDeletingVillage}
            >
                {deleteVillageId !== null && (
                    <p>
                        Êtes-vous sûr de vouloir supprimer le village <strong>{villages?.find((v) => v.id === deleteVillageId)?.name}</strong> ?
                    </p>
                )}
            </Modal>
        </div>
    );
}
