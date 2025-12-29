'use client';

import { Button } from '@frontend/components/ui/Button';
import { Modal } from '@frontend/components/ui/Modal';
import { UploadIcon } from '@radix-ui/react-icons';
import { useState, useMemo } from 'react';

import { uploadDocument } from './upload-document';

interface UploadDocumentModalProps {
    isOpen: boolean;
    initialDocumentUrl?: string | null;
    isPelicoDocument?: boolean;
    onClose: () => void;
    onNewDocument?: (documentUrl: string) => void;
    getActivityId: () => Promise<number>;
}

const isValidDocumentUrl = (url: string) => {
    return url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('/media/documents');
};

export const UploadDocumentModal = ({
    isOpen,
    initialDocumentUrl = null,
    isPelicoDocument = false,
    onClose,
    onNewDocument,
    getActivityId,
}: UploadDocumentModalProps) => {
    const [documentUrlOrFile, setDocumentUrlOrFile] = useState<string | File | null>(initialDocumentUrl);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [duration, setDuration] = useState(0);

    const documentUrl = useMemo(
        () =>
            documentUrlOrFile instanceof File
                ? URL.createObjectURL(documentUrlOrFile)
                : isValidDocumentUrl(documentUrlOrFile || '')
                  ? documentUrlOrFile || ''
                  : '',
        [documentUrlOrFile],
    );

    // -- reset state when modal is closed --
    if (!isOpen && documentUrlOrFile !== initialDocumentUrl) {
        setDocumentUrlOrFile(initialDocumentUrl);
    }
    if (isOpen && documentUrlOrFile === null && initialDocumentUrl !== null) {
        setDocumentUrlOrFile(initialDocumentUrl);
    }
    if (!documentUrl && duration !== 0) {
        setDuration(0);
    }

    const onSubmit = async () => {
        if (documentUrlOrFile === null) {
            return;
        }
        if (typeof documentUrlOrFile === 'string') {
            onNewDocument?.(documentUrlOrFile);
        } else {
            setIsSubmitting(true);
            const activityId = await getActivityId();
            const uploadedDocumentUrl = await uploadDocument(documentUrlOrFile, isPelicoDocument, activityId);
            onNewDocument?.(uploadedDocumentUrl);
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            width="lg"
            hasBottomSeparator
            hasPadding={false}
            title={'Choisir un document'}
            isLoading={isSubmitting}
            cancelLabel={'Annuler'}
            confirmLabel={'Choisir'}
            onConfirm={() => {
                if (documentUrl === '') {
                    return;
                }
                onSubmit()
                    .catch()
                    .finally(() => {
                        onClose();
                        setIsSubmitting(false);
                    });
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', gap: '8px', minHeight: '60vh' }}>
                <div
                    style={{
                        flex: '1 1 0',
                        padding: '32px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Button
                        as="label"
                        tabIndex={0}
                        htmlFor="document-file"
                        leftIcon={<UploadIcon />}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.currentTarget.click();
                            }
                        }}
                        color="secondary"
                        variant="outlined"
                        label="Importer"
                    />
                    <input
                        style={{ display: 'none' }}
                        type="file"
                        id="document-file"
                        name="document-file"
                        value=""
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                setDocumentUrlOrFile(e.target.files?.[0]);
                            }
                        }}
                    />
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
                    {documentUrl && <iframe src={documentUrl} style={{ width: '100%', height: '60vh', border: 'none' }} />}
                </div>
            </div>
        </Modal>
    );
};
