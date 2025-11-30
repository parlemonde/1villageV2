'use client';

import { AddContentCard } from '@frontend/components/content/AddContentCard';
import { ContentEditor } from '@frontend/components/content/ContentEditor';
import type { AnyContent, AnyContentType } from '@frontend/components/content/content.types';
import { Button } from '@frontend/components/ui/Button';
import { Link } from '@frontend/components/ui/Link';
import { Modal } from '@frontend/components/ui/Modal';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { SelectH5pModal } from '@frontend/components/upload/SelectH5pModal';
import { UploadDocumentModal } from '@frontend/components/upload/UploadDocumentModal';
import { UploadImageModal } from '@frontend/components/upload/UploadImageModal';
import { UploadSoundModal } from '@frontend/components/upload/UploadSoundModal';
import { UploadVideoModal } from '@frontend/components/upload/UploadVideoModal';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { UserContext } from '@frontend/contexts/userContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useContext, useState } from 'react';
import isEqual from 'react-fast-compare';
import { v4 } from 'uuid';

import styles from './page.module.css';

const DEFAULT_CONTENT: AnyContent[] = [
    {
        type: 'html',
        html: '',
    },
];

const USER_ALLOWED_CONTENT_TYPES: AnyContentType[] = ['html', 'image', 'audio', 'video'];
const PELICO_ALLOWED_CONTENT_TYPES: AnyContentType[] = ['html', 'image', 'audio', 'video', 'document', 'h5p'];

export default function FreeContentStep1() {
    const { user } = useContext(UserContext);
    const { activity, setActivity } = useContext(ActivityContext);
    const data = activity?.type === 'libre' ? activity.data : undefined;

    const [modalContentIndex, setModalContentIndex] = useState<AnyContentType | number | null>(null); // null: no modal open, number: index of the content to edit, AnyContentType: type of the content to add
    const [contentWithIds, setContentWithIds] = useState<{ id: string; content: AnyContent }[]>(
        (data?.content || DEFAULT_CONTENT).map((content) => ({ id: v4(), content })),
    );
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

    if (!activity || activity.type !== 'libre') {
        return null;
    }

    // If the content has changed, update the content with ids
    if (
        !isEqual(
            contentWithIds.map(({ content }) => content),
            data?.content || DEFAULT_CONTENT,
        )
    ) {
        setContentWithIds((data?.content || DEFAULT_CONTENT).map((content) => ({ id: v4(), content })));
    }

    const isPelico = user?.role === 'admin' || user?.role === 'mediator';
    const contentToEdit = typeof modalContentIndex === 'number' ? contentWithIds[modalContentIndex]?.content : undefined;

    return (
        <PageContainer className={styles.page}>
            <Link href="/contenu-libre" className={styles.backButton}>
                <ChevronLeftIcon /> Retour
            </Link>
            <Steps
                steps={[
                    { label: 'Contenu', href: '/contenu-libre/1' },
                    { label: 'Forme', href: '/contenu-libre/2' },
                    { label: 'Pré-visualiser', href: '/contenu-libre/3' },
                ]}
                activeStep={1}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                Écrivez le contenu de votre publication
            </Title>
            <p>
                Utilisez l&apos;éditeur de bloc pour définir le contenu de votre publication. Dans l&apos;étape 2 vous pourrez définir l&apos;aspect
                de la carte résumée de votre publication.
            </p>
            <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {contentWithIds.map(({ id, content }, index) => (
                        <ContentEditor
                            key={id}
                            content={content}
                            activityId={activity.id}
                            setContent={(newContent) => {
                                const newContentArray = [...contentWithIds];
                                newContentArray[index].content = newContent;
                                setContentWithIds(newContentArray);
                                setActivity({ ...activity, data: { ...data, content: newContentArray.map(({ content }) => content) } });
                            }}
                            hasDottedBorder
                            isDraggable
                            htmlEditorPlaceholder="Commencez à écrire ici, ou ajoutez une vidéo, un son ou une image."
                            onEdit={() => {
                                if (content.type === 'html') {
                                    return;
                                } else {
                                    setModalContentIndex(index);
                                }
                            }}
                            onDelete={() => {
                                const isEmptyContent = content.type === 'html' && !content.html;
                                if (isEmptyContent) {
                                    const newContentArray = [...contentWithIds];
                                    newContentArray.splice(index, 1);
                                    setContentWithIds(newContentArray);
                                    setActivity({ ...activity, data: { ...data, content: newContentArray.map(({ content }) => content) } });
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
                                    content: {
                                        type: 'html',
                                        html: '',
                                    },
                                });
                                setContentWithIds(newContentArray);
                                setActivity({ ...activity, data: { ...data, content: newContentArray.map(({ content }) => content) } });
                            } else {
                                setModalContentIndex(newContentType);
                            }
                        }}
                    />
                </div>
                <div style={{ textAlign: 'right', marginTop: '16px' }}>
                    <Button as="a" href="/contenu-libre/2" color="primary" label="Étape suivante" rightIcon={<ChevronRightIcon />}></Button>
                </div>
            </div>
            <UploadImageModal
                isOpen={modalContentIndex === 'image' || contentToEdit?.type === 'image'}
                initialImageUrl={contentToEdit?.type === 'image' ? contentToEdit.imageUrl : undefined}
                onClose={() => setModalContentIndex(null)}
                onNewImage={(imageUrl) => {
                    const newContentArray = [...contentWithIds];
                    if (modalContentIndex === 'image') {
                        newContentArray.push({ id: v4(), content: { type: 'image', imageUrl } });
                    } else if (contentToEdit?.type === 'image' && typeof modalContentIndex === 'number') {
                        newContentArray[modalContentIndex].content = {
                            ...contentToEdit,
                            imageUrl,
                        };
                    }
                    setContentWithIds(newContentArray);
                    setActivity({ ...activity, data: { ...data, content: newContentArray.map(({ content }) => content) } });
                    setModalContentIndex(null);
                }}
            />
            <UploadSoundModal
                isOpen={modalContentIndex === 'audio' || contentToEdit?.type === 'audio'}
                initialSoundUrl={contentToEdit?.type === 'audio' ? contentToEdit.audioUrl : undefined}
                onClose={() => setModalContentIndex(null)}
                onNewSound={(soundUrl) => {
                    const newContentArray = [...contentWithIds];
                    if (modalContentIndex === 'audio') {
                        newContentArray.push({ id: v4(), content: { type: 'audio', audioUrl: soundUrl } });
                    } else if (contentToEdit?.type === 'audio' && typeof modalContentIndex === 'number') {
                        newContentArray[modalContentIndex].content = {
                            ...contentToEdit,
                            audioUrl: soundUrl,
                        };
                    }
                    setContentWithIds(newContentArray);
                    setActivity({ ...activity, data: { ...data, content: newContentArray.map(({ content }) => content) } });
                    setModalContentIndex(null);
                }}
            />
            <UploadDocumentModal
                isOpen={modalContentIndex === 'document' || contentToEdit?.type === 'document'}
                initialDocumentUrl={contentToEdit?.type === 'document' ? contentToEdit.documentUrl : undefined}
                onClose={() => setModalContentIndex(null)}
                onNewDocument={(documentUrl) => {
                    const newContentArray = [...contentWithIds];
                    if (modalContentIndex === 'document') {
                        newContentArray.push({ id: v4(), content: { type: 'document', documentUrl } });
                    } else if (contentToEdit?.type === 'document' && typeof modalContentIndex === 'number') {
                        newContentArray[modalContentIndex].content = {
                            ...contentToEdit,
                            documentUrl,
                        };
                    }
                    setContentWithIds(newContentArray);
                    setActivity({ ...activity, data: { ...data, content: newContentArray.map(({ content }) => content) } });
                    setModalContentIndex(null);
                }}
            />
            <UploadVideoModal
                isOpen={modalContentIndex === 'video' || contentToEdit?.type === 'video'}
                initialVideoUrl={contentToEdit?.type === 'video' ? contentToEdit.videoUrl : undefined}
                onClose={() => setModalContentIndex(null)}
                onNewVideo={(videoUrl) => {
                    const newContentArray = [...contentWithIds];
                    if (modalContentIndex === 'video') {
                        newContentArray.push({ id: v4(), content: { type: 'video', videoUrl } });
                    } else if (contentToEdit?.type === 'video' && typeof modalContentIndex === 'number') {
                        newContentArray[modalContentIndex].content = {
                            ...contentToEdit,
                            videoUrl,
                        };
                    }
                    setContentWithIds(newContentArray);
                    setActivity({ ...activity, data: { ...data, content: newContentArray.map(({ content }) => content) } });
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
                        newContentArray.push({ id: v4(), content: { type: 'h5p', h5pId: contentId } });
                    } else if (contentToEdit?.type === 'h5p' && typeof modalContentIndex === 'number') {
                        newContentArray[modalContentIndex].content = {
                            ...contentToEdit,
                            h5pId: contentId,
                        };
                    }
                    setContentWithIds(newContentArray);
                    setActivity({ ...activity, data: { ...data, content: newContentArray.map(({ content }) => content) } });
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
                    setActivity({ ...activity, data: { ...data, content: newContentArray.map(({ content }) => content) } });
                    setDeleteIndex(null);
                }}
            >
                <p>Voulez vous vraiment supprimer ce bloc ?</p>
            </Modal>
        </PageContainer>
    );
}
