'use client';

import { Button } from '@frontend/components/ui/Button';
import { Field, Input } from '@frontend/components/ui/Form';
import { Modal } from '@frontend/components/ui/Modal';
import { UploadIcon } from '@radix-ui/react-icons';
import { useState, useMemo } from 'react';

import { uploadSound } from './upload-sound';

interface UploadSoundModalProps {
    isOpen: boolean;
    initialSoundUrl?: string | null;
    isPelicoSound?: boolean;
    onClose: () => void;
    onNewSound?: (soundUrl: string) => void;
    getActivityId: () => Promise<number>;
}

const isValidSoundUrl = (url: string) => {
    return url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('/media/audios');
};

export const UploadSoundModal = ({
    isOpen,
    initialSoundUrl = null,
    isPelicoSound = false,
    onClose,
    onNewSound,
    getActivityId,
}: UploadSoundModalProps) => {
    const [soundUrlOrFile, setSoundUrlOrFile] = useState<string | File | null>(initialSoundUrl);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [duration, setDuration] = useState(0);

    const soundUrl = useMemo(
        () =>
            soundUrlOrFile instanceof File ? URL.createObjectURL(soundUrlOrFile) : isValidSoundUrl(soundUrlOrFile || '') ? soundUrlOrFile || '' : '',
        [soundUrlOrFile],
    );

    // -- reset state when modal is closed --
    if (!isOpen && soundUrlOrFile !== initialSoundUrl) {
        setSoundUrlOrFile(initialSoundUrl);
    }
    if (isOpen && soundUrlOrFile === null && initialSoundUrl !== null) {
        setSoundUrlOrFile(initialSoundUrl);
    }
    if (!soundUrl && duration !== 0) {
        setDuration(0);
    }

    const onSubmit = async () => {
        if (soundUrlOrFile === null) {
            return;
        }
        if (typeof soundUrlOrFile === 'string') {
            onNewSound?.(soundUrlOrFile);
        } else {
            setIsSubmitting(true);
            const activityId = await getActivityId();
            const uploadedSoundUrl = await uploadSound(soundUrlOrFile, isPelicoSound, duration, activityId);
            onNewSound?.(uploadedSoundUrl);
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
            title={'Choisir un son'}
            isLoading={isSubmitting}
            cancelLabel={'Annuler'}
            confirmLabel={'Choisir'}
            onConfirm={() => {
                if (soundUrl === '') {
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
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', gap: '8px' }}>
                <div style={{ flex: '1 1 0', padding: '32px 16px' }}>
                    <Field
                        name="sound-url"
                        label="Url du son"
                        input={
                            <Input
                                id="sound-url"
                                name="sound-url"
                                isFullWidth
                                color="secondary"
                                placeholder="Entrez l'URL du son"
                                onBlur={(e) => {
                                    if (isValidSoundUrl(e.target.value)) {
                                        setSoundUrlOrFile(e.target.value);
                                    }
                                }}
                            />
                        }
                    />
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
                            as="label"
                            tabIndex={0}
                            htmlFor="sound-file"
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
                    </div>
                    <input
                        style={{ display: 'none' }}
                        type="file"
                        id="sound-file"
                        name="sound-file"
                        value=""
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                setSoundUrlOrFile(e.target.files?.[0]);
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
                    {soundUrl && <audio src={soundUrl} controls onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} />}
                </div>
            </div>
        </Modal>
    );
};
