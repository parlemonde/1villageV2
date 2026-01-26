'use client';

import { getErrorSteps } from '@frontend/components/activities/storyChecks';
import { BackDrop } from '@frontend/components/ui/BackDrop';
import { Button } from '@frontend/components/ui/Button';
import { CircularProgress } from '@frontend/components/ui/CircularProgress';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Tooltip } from '@frontend/components/ui/Tooltip';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { UserContext } from '@frontend/contexts/userContext';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import type { ActivityData } from '@server/database/schemas/activity-types';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AspectRatio } from 'radix-ui';
import React, { useContext, useState } from 'react';

// Preview container for each story step
type ImageStepContainerProps = {
    urlStep: string;
    imageUrl: string | null | undefined;
    isValid: boolean;
    error: boolean;
    description: string | null | undefined;
};

const ImageStepContainer = ({ urlStep, imageUrl, error, description }: ImageStepContainerProps) => {
    return (
        <div
            style={{
                display: 'flex',
                gap: '1rem',
                padding: '1rem',
                marginBottom: '1rem',
                border: `2px solid ${error ? 'var(--warning-color)' : 'var(--border-color)'}`,
                borderRadius: '10px',
                backgroundColor: error ? 'var(--warning-background)' : 'transparent',
            }}
        >
            <div style={{ width: '150px', flexShrink: 0 }}>
                <AspectRatio.Root ratio={2 / 3}>
                    <div
                        style={{
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                        }}
                    >
                        {imageUrl ? (
                            <Image layout="fill" objectFit="cover" alt="Image de l'étape" src={imageUrl} unoptimized />
                        ) : (
                            <span style={{ color: 'var(--text-secondary)' }}>Aucune image</span>
                        )}
                    </div>
                </AspectRatio.Root>
            </div>
            <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 0.5rem 0' }}>{description || <em>Aucune description</em>}</p>
                <Link href={urlStep} passHref>
                    <Button as="a" href={urlStep} variant="borderless" color="primary" label="Modifier" size="sm" />
                </Link>
            </div>
        </div>
    );
};

const StoryStep5 = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { activity, onPublishActivity, setActivity } = useContext(ActivityContext);
    const { user } = useContext(UserContext);
    const [isLoading, setIsLoading] = useState(false);
    const data = (activity?.data as ActivityData<'histoire'>) || null;
    // Check if this is an edit (activity has been published before)
    const isEdit = activity !== null && activity?.publishDate !== null;
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
        if (data !== null && (data.odd.inspiredStoryId === 0 || data.object.inspiredStoryId === 0 || data.place.inspiredStoryId === 0)) {
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
                    { label: 'ODD', href: '/creer-une-histoire/1?edit', status: errorSteps.includes(0) ? 'warning' : undefined },
                    { label: 'Objet', href: '/creer-une-histoire/2', status: errorSteps.includes(1) ? 'warning' : undefined },
                    { label: 'Lieu', href: '/creer-une-histoire/3', status: errorSteps.includes(2) ? 'warning' : undefined },
                    { label: 'Histoire', href: '/creer-une-histoire/4', status: errorSteps.includes(3) ? 'warning' : undefined },
                    { label: 'Prévisualisation', href: '/creer-une-histoire/5' },
                ]}
                activeStep={4}
            />

            <div className="width-900">
                <h1>Pré-visualisez votre histoire{!isEdit && ' et publiez-la'}</h1>
                <p className="text" style={{ fontSize: '1.1rem' }}>
                    Relisez votre publication une dernière fois avant de la publier !
                </p>

                {isEdit ? (
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', margin: '1rem 0' }}>
                        <Link href="/creer-une-histoire/2" passHref>
                            <Button as="a" color="secondary" variant="contained" href="/creer-une-histoire/2" label="Modifier à l'étape précédente" />
                        </Link>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={onPublish}
                            disabled={isObservator || !isValid}
                            label="Enregistrer les changements"
                        />
                    </div>
                ) : (
                    <>
                        {!isValid && (
                            <p>
                                <b>Avant de publier votre histoire, il faut corriger les étapes incomplètes, marquées en orange.</b>
                            </p>
                        )}
                        <div style={{ width: '100%', textAlign: 'right', margin: '1rem 0' }}>
                            {isObservator ? (
                                <Tooltip content="Action non autorisée" hasArrow>
                                    <span>
                                        <Button variant="outlined" color="primary" disabled label="Publier" />
                                    </span>
                                </Tooltip>
                            ) : (
                                <Button variant="outlined" color="primary" onClick={onPublish} disabled={!isValid} label="Publier" />
                            )}
                        </div>
                    </>
                )}

                {/* ODD */}
                <ImageStepContainer
                    urlStep={`/creer-une-histoire/1?edit=${activity.id}`}
                    imageUrl={data.odd?.imageUrl}
                    isValid={isValid}
                    error={errorSteps.includes(0)}
                    description={data.odd?.description}
                />
                {/* Object */}
                <ImageStepContainer
                    urlStep={`/creer-une-histoire/2`}
                    imageUrl={data.object?.imageUrl}
                    isValid={isValid}
                    error={errorSteps.includes(1)}
                    description={data.object?.description}
                />

                {/* Place */}
                <ImageStepContainer
                    urlStep={`/creer-une-histoire/3`}
                    imageUrl={data.place?.imageUrl}
                    isValid={isValid}
                    error={errorSteps.includes(2)}
                    description={data.place?.description}
                />

                {/* Tale */}
                <ImageStepContainer
                    urlStep={`/creer-une-histoire/4`}
                    imageUrl={data.tale?.imageStory}
                    isValid={isValid}
                    error={errorSteps.includes(3)}
                    description={data.tale?.tale}
                />
                {/* <StepsButton prev="/creer-une-histoire/4" /> */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '32px 0' }}>
                    <Button
                        as="a"
                        href="/creer-une-histoire/4"
                        color="primary"
                        variant="outlined"
                        label="Étape précédente"
                        leftIcon={<ChevronLeftIcon />}
                    />
                </div>
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
