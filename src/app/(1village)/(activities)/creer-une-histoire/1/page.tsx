'use client';

import styles from '@app/(1village)/(activities)/creer-une-histoire/page.module.css';
import { BackButton } from '@frontend/components/activities/BackButton/BackButton';
import { ODD_CHOICE } from '@frontend/components/activities/story.constants';
import { useImageStoryRequests } from '@frontend/components/activities/useImagesStory';
import { Button, IconButton } from '@frontend/components/ui/Button';
import { Field } from '@frontend/components/ui/Form';
import { Select } from '@frontend/components/ui/Form/Select';
import { Modal } from '@frontend/components/ui/Modal';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { UploadImageModal } from '@frontend/components/upload/UploadImageModal';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { UserContext } from '@frontend/contexts/userContext';
import { ChevronRightIcon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import type { ActivityData } from '@server/database/schemas/activity-types';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { AspectRatio } from 'radix-ui';
import { useContext, useEffect, useRef, useState } from 'react';

const StoryStep1 = () => {
    const { activity, onCreateActivity, setActivity, getOrCreateDraft } = useContext(ActivityContext);

    //const { selectedPhase } = useContext(VillageContext);
    const { deleteStoryImage } = useImageStoryRequests();
    const [isUploadImageModalOpen, setIsUploadImageModalOpen] = useState(false);
    const [oDDChoice, setODDChoice] = useState('');
    const data = (activity?.data as ActivityData<'histoire'>) || null;
    //const isEdit = activity !== null && activity?.status !== ActivityStatus.DRAFT;
    const { user } = useContext(UserContext);
    const isPelico = user.role === 'admin' || user.role === 'mediator';
    const searchParams = useSearchParams();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const initialError = typeof window !== 'undefined' && window.sessionStorage.getItem('story-step-1-next') === 'true';
    const [isError] = useState(initialError);

    const handleDelete = () => {
        if (data?.odd?.imageId) {
            deleteStoryImage(data.odd.imageId, data, 3);
        }
        setImage('');
    };

    // Create the story activity.
    const created = useRef(false);
    useEffect(() => {
        if (!created.current) {
            if (!searchParams.has('edit') || (activity && !(activity.type === 'histoire'))) {
                created.current = true;
                onCreateActivity('histoire', isPelico);
            }
        }
    }, [activity, isPelico, onCreateActivity, searchParams]);

    // Update the "odd step" image url, when upload an image.
    const setImage = (imageUrl: string) => {
        const odd = data?.odd ?? { imageId: null, imageUrl: null, description: null };
        setActivity({
            ...activity,
            type: 'histoire',
            data: {
                ...data,
                odd: { ...odd, inspiredStoryId: activity?.id, imageUrl, imageId: 0 },
            } as ActivityData<'histoire'>,
        });
    };

    useEffect(() => {
        // if user navigated to the next step already, let's show the errors if there are any.
        if (initialError) {
            window.sessionStorage.setItem('story-step-1-next', 'false');
        }
    }, [initialError]);

    if (!activity || activity.type !== 'histoire') {
        return null;
    }

    return (
        <PageContainer>
            <BackButton href="/creer-une-histoire" label="Retour" />
            <Steps
                steps={[
                    { label: 'ODD', href: '/creer-une-histoire/1?edit' },
                    { label: 'Objet', href: '/creer-une-histoire/2' },
                    { label: 'Lieu', href: '/creer-une-histoire/3' },
                    { label: 'Histoire', href: '/creer-une-histoire/4' },
                    { label: 'Prévisualisation', href: '/creer-une-histoire/5' },
                ]}
                activeStep={0}
            />

            <div className={styles['width-900']}>
                <h1>Choisissez et dessinez l&apos;objectif du développement durable à atteindre</h1>
                <p className="text">Choisissez votre objectif et dessinez-le.</p>
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
                                            {data?.odd?.imageUrl ? (
                                                <Image
                                                    layout="fill"
                                                    objectFit="cover"
                                                    alt="image de l'objectif de développement durable"
                                                    src={data.odd?.imageUrl}
                                                    unoptimized
                                                />
                                            ) : (
                                                <PlusIcon width={80} height={80} color="var(--primary-color)" />
                                            )}
                                        </div>
                                    </AspectRatio.Root>
                                    {data?.odd?.imageUrl && (
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
                                    getActivityId={getOrCreateDraft}
                                    isOpen={isUploadImageModalOpen}
                                    onClose={() => setIsUploadImageModalOpen(false)}
                                    initialImageUrl={data?.odd?.imageUrl || ''}
                                    onNewImage={(imageUrl) => setImage(imageUrl)}
                                    isPelicoImage={isPelico}
                                />
                            </div>
                            <Field
                                name="select-ODD"
                                label="ODD"
                                helperText="Choisissez votre ODD"
                                helperTextStyle={{ textAlign: 'left' }}
                                input={
                                    <Select
                                        hasError={isError && data?.odd?.description === ''}
                                        id="select-ODD-outlined"
                                        value={oDDChoice || data?.odd?.description || ''}
                                        onChange={(value: string) => {
                                            setODDChoice(value);
                                            const odd = data?.odd ?? { imageId: null, imageUrl: null, description: null };
                                            setActivity({
                                                ...activity,
                                                type: 'histoire',
                                                data: { ...data, odd: { ...odd, description: value } } as ActivityData<'histoire'>,
                                            });
                                        }}
                                        options={ODD_CHOICE.map((v) => ({ label: v.choice, value: v.choice }))}
                                        placeholder="Choisissez votre ODD"
                                        isFullWidth
                                    />
                                }
                                marginTop="md"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Button
                as="a"
                href="/creer-une-histoire/2"
                color="primary"
                variant="outlined"
                label="Étape suivante"
                rightIcon={<ChevronRightIcon />}
                style={{ display: 'flex', justifySelf: 'end' }}
            />
        </PageContainer>
    );
};

export default StoryStep1;
