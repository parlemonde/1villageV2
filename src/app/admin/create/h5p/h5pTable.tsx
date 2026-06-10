'use client';

import { AdminTable } from '@frontend/components/AdminTable';
import { IconButton } from '@frontend/components/ui/Button';
import { Modal } from '@frontend/components/ui/Modal';
import { Tooltip } from '@frontend/components/ui/Tooltip/Tooltip';
import { Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import type { H5pContent } from '@server/database/schemas/h5p';
import { useState } from 'react';

interface H5pTableProps {
    h5pContents: H5pContent[];
}

export const H5pTable = ({ h5pContents }: H5pTableProps) => {
    const [h5pToDeleteId, setH5pToDeleteId] = useState<string | null>(null);
    const contentToDelete = h5pContents.find((content) => content.id === h5pToDeleteId);
    const [isDeletingH5p, setIsDeletingH5p] = useState(false);
    return (
        <div>
            <AdminTable
                columns={[
                    {
                        id: 'title',
                        header: 'Titre',
                        accessor: (content) => {
                            const metadata = content.metadata as { title?: string } | null;
                            return metadata?.title ?? content.id;
                        },
                        isSortable: true,
                    },
                    {
                        id: 'library',
                        header: 'Type',
                        accessor: (content) => {
                            const metadata = content.metadata as { mainLibrary?: string } | null;
                            return metadata?.mainLibrary ?? '';
                        },
                        isSortable: true,
                    },
                    {
                        id: 'actions',
                        header: 'Actions',
                        accessor: (content) => (
                            <>
                                <Tooltip content="Modifier l'activité H5P" hasArrow>
                                    <IconButton
                                        as="a"
                                        href={`/admin/create/h5p/${content.id}`}
                                        variant="borderless"
                                        color="primary"
                                        icon={Pencil1Icon}
                                    />
                                </Tooltip>
                                <Tooltip content="Supprimer l'activité H5P" hasArrow>
                                    <IconButton variant="borderless" color="error" icon={TrashIcon} onClick={() => setH5pToDeleteId(content.id)} />
                                </Tooltip>
                            </>
                        ),
                        width: '100px',
                        align: 'right',
                        cellPadding: '0 8px',
                    },
                ]}
                data={h5pContents}
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
                {contentToDelete && (
                    <p>
                        Êtes-vous sûr de vouloir supprimer l&apos;activité H5P{' '}
                        <strong>{(contentToDelete.metadata as { title?: string } | null)?.title ?? contentToDelete.id}</strong>?
                    </p>
                )}
            </Modal>
        </div>
    );
};
