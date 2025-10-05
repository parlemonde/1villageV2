'use client';

import type { CropperRef } from '@frontend/components/Cropper';
import { Cropper } from '@frontend/components/Cropper';
import { Modal } from '@frontend/components/ui/Modal';
import { useRef, useState, useMemo } from 'react';

import { isValidImageUrl, UploadImageForm } from './UploadImageForm';
import { uploadImage } from './upload-image';

interface UploadImageModalProps {
    isOpen: boolean;
    initialImageUrl?: string | null;
    isPelicoImage?: boolean;
    onClose: () => void;
    onNewImage?: (imageUrl: string) => void;
}

export const UploadImageModal = ({ isOpen, initialImageUrl = null, isPelicoImage, onClose, onNewImage }: UploadImageModalProps) => {
    const [isResizing, setIsResizing] = useState(false);
    const [imageUrlOrFile, setImageUrlOrFile] = useState<string | File | null>(initialImageUrl);
    const [resizedImageBlob, setResizedImageBlob] = useState<Blob | null>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const cropperRef = useRef<CropperRef | null>(null);

    const imageUrl = useMemo(
        () =>
            imageUrlOrFile instanceof File ? URL.createObjectURL(imageUrlOrFile) : isValidImageUrl(imageUrlOrFile || '') ? imageUrlOrFile || '' : '',
        [imageUrlOrFile],
    );
    const resizedImageUrl = useMemo(() => (resizedImageBlob ? URL.createObjectURL(resizedImageBlob) : ''), [resizedImageBlob]);

    // -- reset state when modal is closed --
    if (!isOpen && imageUrlOrFile !== initialImageUrl) {
        setImageUrlOrFile(initialImageUrl);
    }
    if (isOpen && imageUrlOrFile === null && initialImageUrl !== null) {
        setImageUrlOrFile(initialImageUrl);
    }
    if (!isOpen && resizedImageBlob !== null) {
        setResizedImageBlob(null);
    }
    if (!isOpen && isResizing) {
        setIsResizing(false);
    }

    const finalImageUrl = resizedImageUrl || imageUrl;

    const onResize = async () => {
        setIsCropping(true);
        try {
            const blob = await cropperRef.current?.onCrop();
            if (blob) {
                setResizedImageBlob(blob);
                setIsResizing(false);
            }
        } catch {
            // ignore
        } finally {
            setIsCropping(false);
        }
    };

    const onSubmit = async () => {
        const imageToUpload = resizedImageBlob || imageUrlOrFile;
        if (imageToUpload === null) {
            return;
        }
        if (typeof imageToUpload === 'string') {
            onNewImage?.(imageToUpload);
        } else {
            setIsSubmitting(true);
            const uploadedImageUrl = await uploadImage(imageToUpload, isPelicoImage);
            onNewImage?.(uploadedImageUrl);
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
            title={isResizing ? "Redimensionner l'image" : 'Choisir une image'}
            isLoading={isCropping || isSubmitting}
            cancelLabel={isResizing ? 'Retour' : 'Annuler'}
            onCancel={() => {
                if (isResizing) {
                    setIsResizing(false);
                } else {
                    onClose();
                }
            }}
            confirmLabel={isResizing ? 'Redimensionner' : 'Choisir'}
            onConfirm={() => {
                if (imageUrl === '') {
                    return;
                }
                if (isResizing) {
                    onResize().catch();
                } else {
                    onSubmit()
                        .catch()
                        .finally(() => {
                            onClose();
                            setIsSubmitting(false);
                        });
                }
            }}
        >
            {isResizing ? (
                <div style={{ backgroundColor: 'var(--grey-100)' }}>
                    <Cropper imageUrl={imageUrl} cropperRef={cropperRef} />
                </div>
            ) : (
                <UploadImageForm
                    imageUrl={finalImageUrl}
                    setImageUrlOrFile={(newImageUrlOrFile) => {
                        setImageUrlOrFile(newImageUrlOrFile);
                        setResizedImageBlob(null);
                    }}
                    onResize={() => {
                        setIsResizing(true);
                    }}
                />
            )}
        </Modal>
    );
};
