'use client';

import { H5pPlayer } from '@frontend/components/h5p';
import { Button } from '@frontend/components/ui/Button';
import { CircularProgress } from '@frontend/components/ui/CircularProgress';
import { Field } from '@frontend/components/ui/Form';
import { Select } from '@frontend/components/ui/Form/Select';
import { Modal } from '@frontend/components/ui/Modal';
import { jsonFetcher } from '@lib/json-fetcher';
import { useId, useState } from 'react';
import useSWR from 'swr';

interface H5pListItem {
    contentId: string;
    title: string;
    mainLibrary: string;
}

interface SelectH5pModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialContentId?: string | null;
    onSelect: (contentId: string) => void;
}

export const SelectH5pModal = ({ isOpen, onClose, initialContentId = null, onSelect }: SelectH5pModalProps) => {
    const id = useId();
    const [contentId, setContentId] = useState<string | null>(initialContentId);

    const { data: h5pList, isLoading } = useSWR<H5pListItem[]>('/api/h5p/data', jsonFetcher);

    // -- reset state when modal is closed --
    if (!isOpen && contentId !== initialContentId) {
        setContentId(initialContentId);
    }
    if (isOpen && contentId === null && initialContentId !== null) {
        setContentId(initialContentId);
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            width="lg"
            hasBottomSeparator
            hasPadding={false}
            title={'Choisir une activité H5P'}
            cancelLabel={'Annuler'}
            confirmLabel={'Choisir'}
            onConfirm={() => {
                if (!contentId) {
                    return;
                }
                onSelect(contentId);
                onClose();
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', gap: '8px', minHeight: '60vh' }}>
                <div
                    style={{
                        flex: '1 1 0',
                        padding: '32px 16px',
                    }}
                >
                    {isLoading ? (
                        <div style={{ width: '100%', textAlign: 'center', marginTop: '16px' }}>
                            <CircularProgress />
                        </div>
                    ) : (
                        <Field
                            name="h5p-select"
                            label="Sélectionner une activité H5P"
                            input={
                                <Select
                                    name="h5p-select"
                                    id="h5p-select"
                                    isFullWidth
                                    color="secondary"
                                    options={(h5pList || []).map((item) => ({
                                        label: item.title || item.contentId,
                                        value: item.contentId,
                                    }))}
                                    value={contentId || ''}
                                    onChange={(value) => setContentId(value)}
                                    placeholder="Sélectionner une activité H5P"
                                />
                            }
                        />
                    )}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            margin: '32px 0',
                        }}
                    >
                        <div style={{ flex: '1 1 0', height: '1px', backgroundColor: 'var(--grey-300)' }} />
                        <span style={{ flexShrink: 0 }}>Ou</span>
                        <div style={{ flex: '1 1 0', height: '1px', backgroundColor: 'var(--grey-300)' }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <Button
                            as="a"
                            href="/admin/create/h5p/new"
                            target="_blank"
                            label="Créer une activité H5P"
                            color="secondary"
                            variant="outlined"
                        />
                    </div>
                </div>
                <div
                    style={{
                        flex: '1 1 0',
                        backgroundColor: 'var(--grey-100)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        gap: '16px',
                    }}
                >
                    <strong>Aperçu</strong>
                    <div style={{ width: '100%', height: '55vh', overflow: 'hidden' }}>
                        {contentId && <H5pPlayer contentId={contentId} contextId={`preview-${id}`} />}
                    </div>
                </div>
            </div>
        </Modal>
    );
};
