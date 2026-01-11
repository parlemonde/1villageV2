'use client';

import { Button } from '@frontend/components/ui/Button';
import { Field, Input } from '@frontend/components/ui/Form';
import { Modal } from '@frontend/components/ui/Modal';
import { VideoPlayer } from '@frontend/components/ui/VideoPlayer';
import { UploadIcon } from '@radix-ui/react-icons';
import React from 'react';

import { uploadVideo } from './upload-video';

const isValidVideoUrl = (url: string | null = null): url is string => {
    return url !== null && (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('/media/videos'));
};

interface UploadVideoModalProps {
    isOpen: boolean;
    initialVideoUrl?: string | null;
    isPelicoVideo?: boolean;
    onClose: () => void;
    onNewVideo?: (videoUrl: string) => void;
    getActivityId: () => Promise<number | null>;
}
export const UploadVideoModal = ({
    isOpen,
    initialVideoUrl = null,
    isPelicoVideo = false,
    onClose,
    onNewVideo,
    getActivityId,
}: UploadVideoModalProps) => {
    const [videoUrlOrFile, setVideoUrlOrFile] = React.useState<string | File | null>(initialVideoUrl);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const videoUrl = React.useMemo(
        () => (videoUrlOrFile instanceof File ? URL.createObjectURL(videoUrlOrFile) : isValidVideoUrl(videoUrlOrFile) ? videoUrlOrFile : ''),
        [videoUrlOrFile],
    );
    const fileType = React.useMemo(() => {
        if (videoUrlOrFile instanceof File) {
            return videoUrlOrFile.type;
        }
        return null;
    }, [videoUrlOrFile]);

    // -- reset state when modal is closed --
    if (!isOpen && videoUrlOrFile !== initialVideoUrl) {
        setVideoUrlOrFile(initialVideoUrl);
    }
    if (isOpen && videoUrlOrFile === null && initialVideoUrl !== null) {
        setVideoUrlOrFile(initialVideoUrl);
    }

    const onSubmit = async () => {
        if (videoUrlOrFile === null) {
            return;
        }
        if (typeof videoUrlOrFile === 'string') {
            onNewVideo?.(videoUrlOrFile);
        } else {
            setIsSubmitting(true);
            const activityId = await getActivityId();
            const uploadedVideoUrl = await uploadVideo(videoUrlOrFile, isPelicoVideo, activityId);
            onNewVideo?.(uploadedVideoUrl);
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
            title={'Choisir une vidéo'}
            isLoading={isSubmitting}
            cancelLabel={'Annuler'}
            confirmLabel={'Choisir'}
            onConfirm={() => {
                if (videoUrl === '') {
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
                        name="video-url"
                        label="Url de la vidéo"
                        input={
                            <Input
                                id="video-url"
                                name="video-url"
                                isFullWidth
                                color="secondary"
                                placeholder="Entrez l'URL de la vidéo"
                                onBlur={(e) => {
                                    if (isValidVideoUrl(e.target.value)) {
                                        setVideoUrlOrFile(e.target.value);
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
                            htmlFor="video-file"
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
                        id="video-file"
                        name="video-file"
                        value=""
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                setVideoUrlOrFile(e.target.files?.[0]);
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
                    {videoUrl && <VideoPlayer src={videoUrl} mimeType={fileType} />}
                </div>
            </div>
        </Modal>
    );
};
