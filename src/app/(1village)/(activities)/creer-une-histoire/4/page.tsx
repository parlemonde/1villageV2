'use client';

import styles from '@app/(1village)/(activities)/creer-une-histoire/page.module.css';
import { Button, IconButton } from '@frontend/components/ui/Button';
import { Field, TextArea } from '@frontend/components/ui/Form';
import { Modal } from '@frontend/components/ui/Modal';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { UploadImageModal } from '@frontend/components/upload/UploadImageModal';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import type { ActivityData } from '@server/database/schemas/activity-types';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { AspectRatio } from 'radix-ui';
import React, { useContext, useState } from 'react';

const StoryStep4 = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { activity, setActivity, getOrCreateDraft } = useContext(ActivityContext);
    const data = (activity?.data as ActivityData<'histoire'>) || null;
    const [isUploadImageModalOpen, setIsUploadImageModalOpen] = useState(false);
    const [isError] = useState<boolean>(false);

    React.useEffect(() => {
        if (activity === null && !searchParams.has('activity-id') && !sessionStorage.getItem('activity')) {
            router.push('/creer-une-histoire');
        } else if (activity && !(activity.type === 'histoire')) {
            router.push('/creer-une-histoire');
        }
    }, [activity, router, searchParams]);

    // Update the "tale step" image url, when upload an image.
    const setImage = (imageStory: string) => {
        if (!data) return;
        const { tale } = data;
        setActivity({
            ...activity,
            type: 'histoire',
            data: { ...data, tale: { ...tale, imageStory } } as ActivityData<'histoire'>,
        });
    };

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelete = () => {
        setImage('');
    };

    if (data === null || !activity || !(activity.type === 'histoire')) {
        return <div></div>;
    }

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: 'ODD', href: '/creer-une-histoire/1?edit' },
                    { label: 'Objet', href: '/creer-une-histoire/2' },
                    { label: 'Lieu', href: '/creer-une-histoire/3' },
                    { label: 'Histoire', href: '/creer-une-histoire/4' },
                    { label: 'Prévisualisation', href: '/creer-une-histoire/5' },
                ]}
                activeStep={3}
            />
            <div className={styles['width-900']}>
                <h1>Décrivez et dessinez votre village-monde idéal</h1>
                <p className="text">
                    Racontez aux pélicopains à quoi ressemble votre village-monde idéal, comment il fonctionne et comment il atteint l&apos;objectif
                    du développement durable que vous avez choisi.
                </p>
                <div className={styles['odd-container']}>
                    <div className={styles['odd-column']}>
                        <div className={styles['odd-image-wrapper']}>
                            <div style={{ width: '100%', maxWidth: '320px', marginTop: '1rem', position: 'relative' }}>
                                <div style={{ width: '100%', position: 'relative' }}>
                                    <AspectRatio.Root ratio={3 / 2}>
                                        <div
                                            style={{
                                                height: '100%',
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                border: `1px solid ${isError ? 'var(--error-color)' : 'var(--primary-color)'}`,
                                                borderRadius: '10px',
                                                justifyContent: 'center',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => setIsUploadImageModalOpen(true)}
                                        >
                                            {data?.tale?.imageStory ? (
                                                <Image
                                                    layout="fill"
                                                    objectFit="cover"
                                                    alt="image de l'histoire"
                                                    src={data.tale?.imageStory}
                                                    unoptimized
                                                />
                                            ) : (
                                                <PlusIcon width={80} height={80} color="var(--primary-color)" />
                                            )}
                                        </div>
                                    </AspectRatio.Root>
                                    {data?.tale?.imageStory && (
                                        <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
                                            <IconButton
                                                icon={TrashIcon}
                                                variant="outlined"
                                                color="error"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsModalOpen(true);
                                                }}
                                                style={{ backgroundColor: 'white' }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <Modal
                                    isOpen={isModalOpen}
                                    title={"Êtes-vous sûr de vouloir supprimer l'image ?"}
                                    confirmLabel="Supprimer l'image"
                                    onClose={() => setIsModalOpen(false)}
                                    onConfirm={() => {
                                        handleDelete();
                                        setIsModalOpen(false);
                                    }}
                                />
                                <UploadImageModal
                                    isOpen={isUploadImageModalOpen}
                                    initialImageUrl={data?.tale?.imageStory || ''}
                                    onClose={() => setIsUploadImageModalOpen(false)}
                                    getActivityId={getOrCreateDraft}
                                    onNewImage={(imageUrl) => setImage(imageUrl)}
                                />
                            </div>
                        </div>

                        {/* Description section - sous l'image */}
                        <Field
                            helperText={"Écrivez l'histoire de votre village-monde idéal !"}
                            name="standard-multiline-static"
                            label="Écrivez l'histoire de votre village-monde idéal"
                            input={
                                <TextArea
                                    id="tale-story"
                                    name="tale-story"
                                    isFullWidth
                                    placeholder="Écrivez l'histoire de votre village-monde idéal !"
                                    value={data?.tale?.tale || ''}
                                    onChange={(e) => {
                                        if (!data) return;
                                        const { tale } = data;
                                        setActivity({
                                            ...activity,
                                            type: 'histoire',
                                            data: { ...data, tale: { ...tale, tale: e.target.value } } as ActivityData<'histoire'>,
                                        });
                                    }}
                                    style={{ width: '100%' }}
                                />
                            }
                            marginTop="md"
                        />
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '32px 0' }}>
                <Button
                    as="a"
                    href="/creer-une-histoire/3"
                    color="primary"
                    variant="outlined"
                    label="Étape précédente"
                    leftIcon={<ChevronLeftIcon />}
                />
                <Button
                    as="a"
                    href="/creer-une-histoire/5"
                    color="primary"
                    variant="outlined"
                    label="Étape suivante"
                    leftIcon={<ChevronRightIcon />}
                />
            </div>
        </PageContainer>
    );
};

export default StoryStep4;
