'use client';

import styles from '@app/(1village)/(activities)/creer-une-histoire/page.module.css';
import { getErrorSteps } from '@frontend/components/activities/storyChecks';
import { BackDrop } from '@frontend/components/ui/BackDrop';
import { Button } from '@frontend/components/ui/Button';
import { CircularProgress } from '@frontend/components/ui/CircularProgress';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { Tooltip } from '@frontend/components/ui/Tooltip';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { UserContext } from '@frontend/contexts/userContext';
import { ChevronLeftIcon, Pencil1Icon } from '@radix-ui/react-icons';
import type { ActivityData } from '@server/database/schemas/activity-types';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { AspectRatio } from 'radix-ui';
import React, { useContext, useState } from 'react';

// Preview container for each story step
type ImageStepContainerProps = {
    urlStep: string;
    imageUrl: string | null | undefined;
    isValid: boolean;
    error: boolean;
    description: string | null | undefined;
    t: ReturnType<typeof useExtracted>;
};

const ImageStepContainer = ({ urlStep, imageUrl, error, description, t }: ImageStepContainerProps) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                position: 'relative',
            }}
        >
            <div style={{ width: '150px', flexShrink: 0 }}>
                <AspectRatio.Root ratio={3 / 2}>
                    <div
                        style={{
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid ${error ? 'var(--warning-color)' : 'var(--border-color)'}`,
                            borderRadius: '8px',
                            overflow: 'hidden',
                        }}
                    >
                        {imageUrl ? (
                            <Image layout="fill" objectFit="cover" alt={t("Image de l'étape")} src={imageUrl} unoptimized />
                        ) : (
                            <span style={{ color: 'var(--text-secondary)' }}>{t('Aucune image')}</span>
                        )}
                    </div>
                </AspectRatio.Root>
            </div>
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    border: `1px dashed ${error ? 'var(--warning-color)' : 'var(--success-color)'}`,
                    borderRadius: '8px',
                    padding: '1rem',
                    minHeight: '80px',
                }}
            >
                <p style={{ margin: 0 }}>{description || <em>{t('Aucune description')}</em>}</p>
            </div>
            <Link
                href={urlStep}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: error ? 'var(--warning-background)' : '#E8F5E9',
                    border: error ? '1px solid var(--warning-color)' : '1px solid var(--success-color)',
                    color: error ? 'var(--warning-color)' : 'var(--success-color)',
                    textDecoration: 'none',
                    flexShrink: 0,
                }}
            >
                <Pencil1Icon width={18} height={18} />
            </Link>
        </div>
    );
};

const StoryStep5 = () => {
    const t = useExtracted('app.(1village).(activities).creer-une-histoire.5');
    const tCommon = useExtracted('common');

    const router = useRouter();
    const searchParams = useSearchParams();
    const { activity, onPublishActivity, setActivity } = useContext(ActivityContext);
    const { user } = useContext(UserContext);
    const [isLoading, setIsLoading] = useState(false);
    const data = (activity?.data as ActivityData<'histoire'>) || null;
    // Check if this is an edit (activity has been published before)
    const isEdit = activity !== null && activity?.publishDate !== null && activity?.publishDate !== undefined;

    // Check if user is an observer (parent role has limited permissions)
    const isObservator = user?.role === 'parent';

    const errorSteps = React.useMemo(() => {
        const errors: number[] = [];
        if (data !== null) {
            if (getErrorSteps(data.odd, 1).length > 0) {
                errors.push(0);
            }
            if (getErrorSteps(data.object, 2).length > 0) {
                errors.push(1);
            }
            if (getErrorSteps(data.place, 3).length > 0) {
                errors.push(2);
            }
            if (getErrorSteps(data.tale, 4).length > 0) {
                errors.push(3);
            }
            return errors;
        }
        return [];
    }, [data]);

    const isValid = errorSteps.length === 0;

    React.useEffect(() => {
        if (activity === null && !searchParams.has('activity-id') && !sessionStorage.getItem('activity')) {
            router.push('/creer-une-histoire');
        } else if (activity && !(activity.type === 'histoire')) {
            router.push('/creer-une-histoire');
        }
    }, [activity, router, searchParams]);

    // useEffect here to update inspiredStoryId if equal to 0
    React.useEffect(() => {
        if (
            data !== null &&
            data.odd &&
            data.object &&
            data.place &&
            (data.odd.inspiredStoryId === 0 || data.object.inspiredStoryId === 0 || data.place.inspiredStoryId === 0)
        ) {
            setActivity({
                data: {
                    ...data,
                    odd: { ...data.odd, inspiredStoryId: activity?.id },
                    object: { ...data.object, inspiredStoryId: activity?.id },
                    place: { ...data.place, inspiredStoryId: activity?.id },
                },
            });
        }
    }, [activity?.id, data, setActivity]);

    const onPublish = async () => {
        window.sessionStorage.setItem(`story-step-1-next`, 'false');
        setIsLoading(true);
        await onPublishActivity();
        router.push('/creer-une-histoire/succes');
        setIsLoading(false);
    };

    if (data === null || activity === null || !(activity?.type === 'histoire')) {
        return <div></div>;
    }

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: t('ODD'), href: '/creer-une-histoire/1?edit', status: errorSteps.includes(0) ? 'warning' : 'success' },
                    { label: t('Objet'), href: '/creer-une-histoire/2', status: errorSteps.includes(1) ? 'warning' : 'success' },
                    { label: t('Lieu'), href: '/creer-une-histoire/3', status: errorSteps.includes(2) ? 'warning' : 'success' },
                    { label: t('Histoire'), href: '/creer-une-histoire/4', status: errorSteps.includes(3) ? 'warning' : 'success' },
                    { label: t('Prévisualisation'), href: '/creer-une-histoire/5' },
                ]}
                activeStep={4}
                marginTop="xl"
                marginBottom="md"
            />

            <Title variant="h2" marginBottom="md">
                {t('Pré-visualisez votre histoire')}
                {!isEdit && t(' et publiez-la')}
            </Title>
            <p className="text" style={{ fontSize: '1.1rem', margin: '1rem 0' }}>
                {t('Relisez votre publication une dernière fois avant de la publier !')}
            </p>

            {isEdit ? (
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', margin: '1rem 0' }}>
                    <Button as="a" color="secondary" variant="contained" href="/creer-une-histoire/2" label={t("Modifier à l'étape précédente")} />
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={onPublish}
                        disabled={isObservator || !isValid}
                        label={t('Enregistrer les changements')}
                    />
                </div>
            ) : (
                <>
                    {!isValid && (
                        <p>
                            <b>{t('Avant de publier votre histoire, il faut corriger les étapes incomplètes, marquées en orange.')}</b>
                        </p>
                    )}
                    <div style={{ width: '100%', textAlign: 'right', margin: '1rem 0' }}>
                        {isObservator ? (
                            <Tooltip content={t('Action non autorisée')} hasArrow>
                                <span>
                                    <Button variant="outlined" color="primary" disabled label={tCommon('Publier')} />
                                </span>
                            </Tooltip>
                        ) : (
                            <Button variant="outlined" color="primary" onClick={onPublish} disabled={!isValid} label={tCommon('Publier')} />
                        )}
                    </div>
                </>
            )}

            {/* ODD */}
            <div className={`${styles['preview-block']} ${errorSteps.includes(0) ? styles['preview-block-error'] : styles['preview-block-valid']}`}>
                <ImageStepContainer
                    urlStep={`/creer-une-histoire/1?edit=${activity.id}`}
                    imageUrl={data.odd?.imageUrl}
                    isValid={isValid}
                    error={errorSteps.includes(0)}
                    description={data.odd?.description}
                    t={t}
                />
            </div>

            {/* Object */}
            <div className={`${styles['preview-block']} ${errorSteps.includes(1) ? styles['preview-block-error'] : styles['preview-block-valid']}`}>
                <ImageStepContainer
                    urlStep={`/creer-une-histoire/2`}
                    imageUrl={data.object?.imageUrl}
                    isValid={isValid}
                    error={errorSteps.includes(1)}
                    description={data.object?.description}
                    t={t}
                />
            </div>

            {/* Place */}
            <div className={`${styles['preview-block']} ${errorSteps.includes(2) ? styles['preview-block-error'] : styles['preview-block-valid']}`}>
                <ImageStepContainer
                    urlStep={`/creer-une-histoire/3`}
                    imageUrl={data.place?.imageUrl}
                    isValid={isValid}
                    error={errorSteps.includes(2)}
                    description={data.place?.description}
                    t={t}
                />
            </div>

            {/* Tale */}
            <div className={`${styles['preview-block']} ${errorSteps.includes(3) ? styles['preview-block-error'] : styles['preview-block-valid']}`}>
                <ImageStepContainer
                    urlStep={`/creer-une-histoire/4`}
                    imageUrl={data.tale?.imageStory}
                    isValid={isValid}
                    error={errorSteps.includes(3)}
                    description={data.tale?.tale}
                    t={t}
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '32px 0' }}>
                <Button
                    as="a"
                    href="/creer-une-histoire/4"
                    color="primary"
                    variant="outlined"
                    label={tCommon('Étape précédente')}
                    leftIcon={<ChevronLeftIcon />}
                />
            </div>
            {isLoading && (
                <BackDrop style={{ zIndex: 2000, color: 'white' }}>
                    <CircularProgress color="inherit" />
                </BackDrop>
            )}
        </PageContainer>
    );
};

export default StoryStep5;
