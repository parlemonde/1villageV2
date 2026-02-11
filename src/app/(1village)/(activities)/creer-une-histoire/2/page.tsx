'use client';

import styles from '@app/(1village)/(activities)/creer-une-histoire/page.module.css';
import { getErrorSteps } from '@frontend/components/activities/storyChecks';
import { useImageStoryRequests } from '@frontend/components/activities/useImagesStory';
import { Button, IconButton } from '@frontend/components/ui/Button';
import { Field, TextArea } from '@frontend/components/ui/Form';
import { Modal } from '@frontend/components/ui/Modal';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { UploadImageModal } from '@frontend/components/upload/UploadImageModal';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import type { ActivityData } from '@server/database/schemas/activity-types';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { AspectRatio } from 'radix-ui';
import React, { useContext, useState } from 'react';

const StoryStep2 = () => {
    const t = useExtracted('app.(1village).(activities).creer-une-histoire.2');
    const tCommon = useExtracted('common');

    const router = useRouter();
    const searchParams = useSearchParams();
    const { activity, setActivity, getOrCreateDraft } = useContext(ActivityContext);
    const { deleteStoryImage } = useImageStoryRequests();
    const data = (activity?.data as ActivityData<'histoire'>) || null;
    const [isUploadImageModalOpen, setIsUploadImageModalOpen] = useState(false);
    const [isError] = useState<boolean>(false);

    const errorSteps = React.useMemo(() => {
        if (data !== null) {
            return getErrorSteps(data.odd, 1);
        }
        return [];
    }, [data]);

    React.useEffect(() => {
        if (activity === null && !searchParams.has('activity-id') && !sessionStorage.getItem('activity')) {
            router.push('/creer-une-histoire');
        } else if (activity && !(activity.type === 'histoire')) {
            router.push('/creer-une-histoire');
        }
    }, [activity, router, searchParams]);

    /* const dataChange = (key: keyof StoryElement) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.slice(0, 400);
        const { object } = data;
        const newData = { ...data, object: { ...object, [key]: value } };
        setActivity({ data: newData });
    }; */

    // Update the "object step" image url, when upload an image.
    const setImage = (imageUrl: string) => {
        if (!data) return;
        const { object } = data;
        // imageId = 0 when we are changing the image of the object step.
        setActivity({
            ...activity,
            type: 'histoire',
            data: { ...data, object: { ...object, imageUrl, imageId: 0 } } as ActivityData<'histoire'>,
        });
    };

    /* const onNext = () => {
        onPublishActivity().catch(console.error);
        router.push('/creer-une-histoire/3');
    }; */

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelete = () => {
        if (!data) return;
        deleteStoryImage(data.object.imageId, data, 1);
        setImage('');
    };

    if (data === null || activity === null || !(activity?.type === 'histoire')) {
        return <div></div>;
    }
    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: tCommon('ODD'), href: '/creer-une-histoire/1?edit', status: errorSteps.includes(0) ? 'warning' : 'success' },
                    { label: tCommon('Objet'), href: '/creer-une-histoire/2' },
                    { label: tCommon('Lieu'), href: '/creer-une-histoire/3' },
                    { label: tCommon('Histoire'), href: '/creer-une-histoire/4' },
                    { label: tCommon('Prévisualisation'), href: '/creer-une-histoire/5' },
                ]}
                activeStep={1}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t('Imaginez et dessinez votre objet magique')}
            </Title>
            <p className="text">
                {t(
                    "Grâce à ses pouvoirs, votre objet magique doit permettre d'atteindre l'objectif du développement durable que vous avez choisi à l'étape précédente.",
                )}
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
                                        {data?.object?.imageUrl ? (
                                            <Image
                                                layout="fill"
                                                objectFit="cover"
                                                alt={t("image de l'objet")}
                                                src={data?.object?.imageUrl}
                                                unoptimized
                                            />
                                        ) : (
                                            <PlusIcon width={80} height={80} color="var(--primary-color)" />
                                        )}
                                    </div>
                                </AspectRatio.Root>
                                {data?.object?.imageUrl && (
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
                                title={tCommon("Êtes-vous sûr de vouloir supprimer l'image ?")}
                                confirmLabel={tCommon("Supprimer l'image")}
                                onClose={() => setIsModalOpen(false)}
                                onConfirm={() => {
                                    handleDelete();
                                    setIsModalOpen(false);
                                }}
                            />
                            <UploadImageModal
                                isOpen={isUploadImageModalOpen}
                                initialImageUrl={data?.object?.imageUrl || ''}
                                onClose={() => setIsUploadImageModalOpen(false)}
                                getActivityId={getOrCreateDraft}
                                onNewImage={(imageUrl) => setImage(imageUrl)}
                            />
                        </div>
                    </div>

                    {/* Description section - sous l'image */}
                    <Field
                        helperText={t('Écrivez la description de votre image !')}
                        name="standard-multiline-static"
                        input={
                            <TextArea
                                id="object-description"
                                name="object-description"
                                isFullWidth
                                placeholder={t("Décrivez l'objet magique")}
                                value={data?.object?.description || ''}
                                onChange={(e) => {
                                    if (!data) return;
                                    const { object } = data;
                                    setActivity({
                                        ...activity,
                                        type: 'histoire',
                                        data: { ...data, object: { ...object, description: e.target.value } } as ActivityData<'histoire'>,
                                    });
                                }}
                                style={{ width: '100%' }}
                                maxLength={400}
                            />
                        }
                        marginTop="md"
                    />
                    <div style={{ width: '100%', textAlign: 'right', color: 'var(--grey-400)', paddingRight: '8px' }}>
                        <span className="text text--small">{data?.object?.description?.length || 0}/400</span>
                    </div>
                </div>
            </div>
            {/* <StepsButton prev={`/creer-une-histoire/1?edit=${activity.id}`} next={onNext} /> */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '32px 0' }}>
                <Button
                    as="a"
                    href="/creer-une-histoire/1"
                    color="primary"
                    variant="outlined"
                    label={tCommon('Étape précédente')}
                    leftIcon={<ChevronLeftIcon />}
                />
                <Button
                    as="a"
                    href="/creer-une-histoire/3"
                    color="primary"
                    variant="outlined"
                    label={tCommon('Étape suivante')}
                    leftIcon={<ChevronRightIcon />}
                />
            </div>
        </PageContainer>
    );
};
export default StoryStep2;
