'use client';

import { Modal } from '@frontend/components/ui/Modal';
import { SelectH5pModal } from '@frontend/components/upload/SelectH5pModal';
import { UploadDocumentModal } from '@frontend/components/upload/UploadDocumentModal';
import { UploadImageModal } from '@frontend/components/upload/UploadImageModal';
import { UploadSoundModal } from '@frontend/components/upload/UploadSoundModal';
import { UploadVideoModal } from '@frontend/components/upload/UploadVideoModal';
import { UserContext } from '@frontend/contexts/userContext';
import React, { useContext, useState } from 'react';
import isEqual from 'react-fast-compare';
import { v4 } from 'uuid';

import { AddContentCard } from '../AddContentCard';
import { AnyContentEditor } from './AnyContentEditor';
import type { AnyContent, AnyContentType, Content } from '../content.types';

const DEFAULT_CONTENT: AnyContent[] = [
    {
        type: 'html',
        html: '',
    },
];

const USER_ALLOWED_CONTENT_TYPES: AnyContentType[] = ['html', 'image', 'audio', 'video'];
const PELICO_ALLOWED_CONTENT_TYPES: AnyContentType[] = ['html', 'image', 'audio', 'video', 'document', 'h5p'];

interface ContentEditorProps {
    content?: Content;
    setContent: (content: Content) => void;
    activityId?: number;
    getActivityId: () => Promise<number | null>;
}

export const ContentEditor = ({ content = DEFAULT_CONTENT, setContent, activityId, getActivityId }: ContentEditorProps) => {
    const { user } = useContext(UserContext);
    const [modalContentIndex, setModalContentIndex] = useState<AnyContentType | number | null>(null); // null: no modal open, number: index of the content to edit, AnyContentType: type of the content to add
    const [contentWithIds, setContentWithIds] = useState<{ id: string; anyContent: AnyContent }[]>(content.map((c) => ({ id: v4(), anyContent: c })));
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

    // If the content has changed, update the content with ids
    if (
        !isEqual(
            contentWithIds.map(({ anyContent }) => anyContent),
            content,
        )
    ) {
        setContentWithIds(content.map((c) => ({ id: v4(), anyContent: c })));
    }

    const isPelico = user?.role === 'admin' || user?.role === 'mediator';
    const contentToEdit = typeof modalContentIndex === 'number' ? contentWithIds[modalContentIndex]?.anyContent : undefined;

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {contentWithIds.map(({ id, anyContent }, index) => (
                    <AnyContentEditor
                        key={id}
                        content={anyContent}
                        activityId={activityId}
                        setContent={(newContent) => {
                            const newContentArray = [...contentWithIds];
                            newContentArray[index].anyContent = newContent;
                            setContentWithIds(newContentArray);
                            setContent(newContentArray.map(({ anyContent: newAnyContent }) => newAnyContent));
                        }}
                        hasDottedBorder
                        isDraggable
                        htmlEditorPlaceholder="Commencez à écrire ici, ou ajoutez une vidéo, un son ou une image."
                        onEdit={() => {
                            if (anyContent.type === 'html') {
                                return;
                            } else {
                                setModalContentIndex(index);
                            }
                        }}
                        onDelete={() => {
                            const isEmptyContent = anyContent.type === 'html' && !anyContent.html;
                            if (isEmptyContent) {
                                const newContentArray = [...contentWithIds];
                                newContentArray.splice(index, 1);
                                setContentWithIds(newContentArray);
                                setContent(newContentArray.map(({ anyContent: newAnyContent }) => newAnyContent));
                            } else {
                                setDeleteIndex(index);
                            }
                        }}
                    />
                ))}
            </div>
            <div style={{ margin: '32px 0', width: '100%', textAlign: 'center' }}>
                <AddContentCard
                    addContentLabel="Ajouter à votre publication :"
                    availableContentTypes={isPelico ? PELICO_ALLOWED_CONTENT_TYPES : USER_ALLOWED_CONTENT_TYPES}
                    onAddContent={(newContentType) => {
                        if (newContentType === 'html') {
                            const newContentArray = [...contentWithIds];
                            newContentArray.push({
                                id: v4(),
                                anyContent: {
                                    type: 'html',
                                    html: '',
                                },
                            });
                            setContentWithIds(newContentArray);
                            setContent(newContentArray.map(({ anyContent }) => anyContent));
                        } else {
                            setModalContentIndex(newContentType);
                        }
                    }}
                />
            </div>
            <UploadImageModal
                getActivityId={getActivityId}
                isPelicoImage={isPelico}
                isOpen={modalContentIndex === 'image' || contentToEdit?.type === 'image'}
                initialImageUrl={contentToEdit?.type === 'image' ? contentToEdit.imageUrl : undefined}
                onClose={() => setModalContentIndex(null)}
                onNewImage={(imageUrl) => {
                    const newContentArray = [...contentWithIds];
                    if (modalContentIndex === 'image') {
                        newContentArray.push({ id: v4(), anyContent: { type: 'image', imageUrl } });
                    } else if (contentToEdit?.type === 'image' && typeof modalContentIndex === 'number') {
                        newContentArray[modalContentIndex].anyContent = {
                            ...contentToEdit,
                            imageUrl,
                        };
                    }
                    setContentWithIds(newContentArray);
                    setContent(newContentArray.map(({ anyContent }) => anyContent));
                    setModalContentIndex(null);
                }}
            />
            <UploadSoundModal
                getActivityId={getActivityId}
                isOpen={modalContentIndex === 'audio' || contentToEdit?.type === 'audio'}
                initialSoundUrl={contentToEdit?.type === 'audio' ? contentToEdit.audioUrl : undefined}
                onClose={() => setModalContentIndex(null)}
                onNewSound={(soundUrl) => {
                    const newContentArray = [...contentWithIds];
                    if (modalContentIndex === 'audio') {
                        newContentArray.push({ id: v4(), anyContent: { type: 'audio', audioUrl: soundUrl } });
                    } else if (contentToEdit?.type === 'audio' && typeof modalContentIndex === 'number') {
                        newContentArray[modalContentIndex].anyContent = {
                            ...contentToEdit,
                            audioUrl: soundUrl,
                        };
                    }
                    setContentWithIds(newContentArray);
                    setContent(newContentArray.map(({ anyContent }) => anyContent));
                    setModalContentIndex(null);
                }}
            />
            <UploadDocumentModal
                getActivityId={getActivityId}
                isOpen={modalContentIndex === 'document' || contentToEdit?.type === 'document'}
                initialDocumentUrl={contentToEdit?.type === 'document' ? contentToEdit.documentUrl : undefined}
                onClose={() => setModalContentIndex(null)}
                onNewDocument={(documentUrl) => {
                    const newContentArray = [...contentWithIds];
                    if (modalContentIndex === 'document') {
                        newContentArray.push({ id: v4(), anyContent: { type: 'document', documentUrl } });
                    } else if (contentToEdit?.type === 'document' && typeof modalContentIndex === 'number') {
                        newContentArray[modalContentIndex].anyContent = {
                            ...contentToEdit,
                            documentUrl,
                        };
                    }
                    setContentWithIds(newContentArray);
                    setContent(newContentArray.map(({ anyContent }) => anyContent));
                    setModalContentIndex(null);
                }}
            />
            <UploadVideoModal
                getActivityId={getActivityId}
                isOpen={modalContentIndex === 'video' || contentToEdit?.type === 'video'}
                initialVideoUrl={contentToEdit?.type === 'video' ? contentToEdit.videoUrl : undefined}
                onClose={() => setModalContentIndex(null)}
                onNewVideo={(videoUrl) => {
                    const newContentArray = [...contentWithIds];
                    if (modalContentIndex === 'video') {
                        newContentArray.push({ id: v4(), anyContent: { type: 'video', videoUrl } });
                    } else if (contentToEdit?.type === 'video' && typeof modalContentIndex === 'number') {
                        newContentArray[modalContentIndex].anyContent = {
                            ...contentToEdit,
                            videoUrl,
                        };
                    }
                    setContentWithIds(newContentArray);
                    setContent(newContentArray.map(({ anyContent: newContent }) => newContent));
                    setModalContentIndex(null);
                }}
            />
            <SelectH5pModal
                isOpen={modalContentIndex === 'h5p' || contentToEdit?.type === 'h5p'}
                initialContentId={contentToEdit?.type === 'h5p' ? contentToEdit.h5pId : undefined}
                onClose={() => setModalContentIndex(null)}
                onSelect={(contentId) => {
                    const newContentArray = [...contentWithIds];
                    if (modalContentIndex === 'h5p') {
                        newContentArray.push({ id: v4(), anyContent: { type: 'h5p', h5pId: contentId } });
                    } else if (contentToEdit?.type === 'h5p' && typeof modalContentIndex === 'number') {
                        newContentArray[modalContentIndex].anyContent = {
                            ...contentToEdit,
                            h5pId: contentId,
                        };
                    }
                    setContentWithIds(newContentArray);
                    setContent(newContentArray.map(({ anyContent }) => anyContent));
                    setModalContentIndex(null);
                }}
            />
            <Modal
                isOpen={deleteIndex !== null}
                onClose={() => setDeleteIndex(null)}
                title="Supprimer le contenu"
                confirmLabel="Supprimer"
                confirmLevel="error"
                cancelLabel="Annuler"
                onConfirm={() => {
                    if (deleteIndex === null) {
                        return;
                    }
                    const newContentArray = [...contentWithIds];
                    newContentArray.splice(deleteIndex, 1);
                    setContentWithIds(newContentArray);
                    setContent(newContentArray.map(({ anyContent }) => anyContent));
                    setDeleteIndex(null);
                }}
            >
                <p>Voulez vous vraiment supprimer ce bloc ?</p>
            </Modal>
        </>
    );
};
