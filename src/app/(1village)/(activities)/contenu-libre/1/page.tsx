'use client';

import { AddContentCard } from '@frontend/components/content/AddContentCard';
import { ContentEditor } from '@frontend/components/content/ContentEditor';
import type { AnyContent } from '@frontend/components/content/content.types';
import { Button } from '@frontend/components/ui/Button';
import { Link } from '@frontend/components/ui/Link';
import { Modal } from '@frontend/components/ui/Modal';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { UploadImageModal } from '@frontend/components/upload/UploadImageModal';
import { UploadSoundModal } from '@frontend/components/upload/UploadSoundModal/UploadSoundModal';
import { ActivityContext } from '@frontend/contexts/activityContext';
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

export default function FreeContentStep1() {
    const { activity, setActivity } = useContext(ActivityContext);
    const data = activity?.type === 'libre' ? activity.data : undefined;

    const [uploadImageModalContentIndex, setUploadImageModalContentIndex] = useState<number | null>(null);
    const [uploadSoundModalContentIndex, setUploadSoundModalContentIndex] = useState<number | null>(null);
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

    const uploadImageModalInitialImageUrl =
        uploadImageModalContentIndex !== null &&
        uploadImageModalContentIndex !== -1 &&
        contentWithIds[uploadImageModalContentIndex]?.content.type === 'image'
            ? contentWithIds[uploadImageModalContentIndex]?.content.imageUrl
            : null;
    const uploadSoundModalInitialSoundUrl =
        uploadSoundModalContentIndex !== null &&
        uploadSoundModalContentIndex !== -1 &&
        contentWithIds[uploadSoundModalContentIndex]?.content.type === 'audio'
            ? contentWithIds[uploadSoundModalContentIndex]?.content.audioUrl
            : null;

    return (
        <div className={styles.page} style={{ padding: '16px 32px' }}>
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
                                setUploadImageModalContentIndex(index);
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
                        onAddContent={(newContent) => {
                            if (newContent.type === 'image') {
                                setUploadImageModalContentIndex(-1);
                            } else if (newContent.type === 'audio') {
                                setUploadSoundModalContentIndex(-1);
                            } else {
                                const newContentArray = [...contentWithIds];
                                newContentArray.push({ id: v4(), content: newContent });
                                setContentWithIds(newContentArray);
                                setActivity({ ...activity, data: { ...data, content: newContentArray.map(({ content }) => content) } });
                            }
                        }}
                    />
                </div>
                <div style={{ textAlign: 'right', marginTop: '16px' }}>
                    <Button as="a" href="/contenu-libre/2" color="primary" label="Étape suivante" rightIcon={<ChevronRightIcon />}></Button>
                </div>
            </div>
            <UploadImageModal
                isOpen={uploadImageModalContentIndex !== null}
                initialImageUrl={uploadImageModalInitialImageUrl}
                onClose={() => setUploadImageModalContentIndex(null)}
                onNewImage={(imageUrl) => {
                    if (uploadImageModalContentIndex === null) {
                        return;
                    }
                    const newContentArray = [...contentWithIds];
                    // New content
                    if (uploadImageModalContentIndex === -1) {
                        newContentArray.push({ id: v4(), content: { type: 'image', imageUrl } });
                    } else if (newContentArray[uploadImageModalContentIndex].content.type === 'image') {
                        newContentArray[uploadImageModalContentIndex].content.imageUrl = imageUrl;
                    }
                    setContentWithIds(newContentArray);
                    setActivity({ ...activity, data: { ...data, content: newContentArray.map(({ content }) => content) } });
                    setUploadImageModalContentIndex(null);
                }}
            />
            <UploadSoundModal
                isOpen={uploadSoundModalContentIndex !== null}
                initialSoundUrl={uploadSoundModalInitialSoundUrl}
                onClose={() => setUploadSoundModalContentIndex(null)}
                onNewSound={(soundUrl) => {
                    if (uploadSoundModalContentIndex === null) {
                        return;
                    }
                    const newContentArray = [...contentWithIds];
                    // New content
                    if (uploadSoundModalContentIndex === -1) {
                        newContentArray.push({ id: v4(), content: { type: 'audio', audioUrl: soundUrl } });
                    } else if (newContentArray[uploadSoundModalContentIndex].content.type === 'audio') {
                        newContentArray[uploadSoundModalContentIndex].content.audioUrl = soundUrl;
                    }
                    setContentWithIds(newContentArray);
                    setActivity({ ...activity, data: { ...data, content: newContentArray.map(({ content }) => content) } });
                    setUploadSoundModalContentIndex(null);
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
        </div>
    );
}
