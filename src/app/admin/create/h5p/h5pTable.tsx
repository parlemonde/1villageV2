'use client';

import { AdminTable } from '@frontend/components/AdminTable';
import { IconButton } from '@frontend/components/ui/Button';
import { Modal } from '@frontend/components/ui/Modal';
import { Tooltip } from '@frontend/components/ui/Tooltip/Tooltip';
import { Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import type { Media } from '@server/database/schemas/medias';
import { useState } from 'react';

interface H5pTableProps {
    h5pMedias: Media[];
}

export const H5pTable = ({ h5pMedias }: H5pTableProps) => {
    const [h5pToDeleteId, setH5pToDeleteId] = useState<string | null>(null);
    const mediaToDelete = h5pMedias.find((media) => media.id === h5pToDeleteId);
    const [isDeletingH5p, setIsDeletingH5p] = useState(false);
    return (
        <div>
            <AdminTable
                columns={[
                    {
                        id: 'title',
                        header: 'Titre',
                        accessor: 'metadata.title',
                        isSortable: true,
                    },
                    {
                        id: 'library',
                        header: 'Type',
                        accessor: 'metadata.library',
                        isSortable: true,
                    },
                    {
                        id: 'actions',
                        header: 'Actions',
                        accessor: (media) => (
                            <>
                                <Tooltip content="Modifier l'activité H5P" hasArrow>
                                    <IconButton
                                        as="a"
                                        href={`/admin/create/h5p/${media.id}`}
                                        variant="borderless"
                                        color="primary"
                                        icon={Pencil1Icon}
                                    />
                                </Tooltip>
                                <Tooltip content="Supprimer l'activité H5P" hasArrow>
                                    <IconButton variant="borderless" color="error" icon={TrashIcon} onClick={() => setH5pToDeleteId(media.id)} />
                                </Tooltip>
                            </>
                        ),
                        width: '100px',
                        align: 'right',
                        cellPadding: '0 8px',
                    },
                ]}
                data={h5pMedias}
                emptyState="Aucun contenu H5P trouvé !"
            />
            <Modal
                isOpen={h5pToDeleteId !== null}
                onClose={() => setH5pToDeleteId(null)}
                title="Supprimer l'activité H5P"
                confirmLabel="Supprimer"
                confirmLevel="error"
                onConfirm={async () => {
                    if (h5pToDeleteId === null) {
                        return;
                    }
                    try {
                        setIsDeletingH5p(true);
                        await fetch(`/api/h5p/data/${h5pToDeleteId}`, {
                            method: 'DELETE',
                        });
                    } catch (error) {
                        console.error(error);
                    } finally {
                        setIsDeletingH5p(false);
                        setH5pToDeleteId(null);
                    }
                }}
                isLoading={isDeletingH5p}
            >
                {h5pToDeleteId !== undefined && (
                    <p>
                        Êtes-vous sûr de vouloir supprimer l&apos;activité H5P{' '}
                        {mediaToDelete?.metadata && 'title' in mediaToDelete.metadata && <strong>{mediaToDelete.metadata.title}</strong>}?
                    </p>
                )}
            </Modal>
        </div>
    );
};
