'use client';

import { isCulinaryChallenge } from '@app/(1village)/(activities)/lancer-un-defi/culinaire/helpers';
import { CULINARY_CHALLENGE_VALIDATORS } from '@app/(1village)/(activities)/lancer-un-defi/culinaire/validators';
import { ActivityStepPreview } from '@frontend/components/activities/ActivityStepPreview';
import { ContentViewer } from '@frontend/components/content/ContentViewer';
import { Button } from '@frontend/components/ui/Button';
import { Loader } from '@frontend/components/ui/Loader';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext, useState } from 'react';

import styles from './page.module.css';

export default function LancerUnDefiCulinaireStep4() {
    const t = useExtracted('app.(1village).(activities).lancer-un-defi.culinaire.4');
    const tCommon = useExtracted('common');

    const router = useRouter();

    const { activity, onPublishActivity, onUpdateActivity } = useContext(ActivityContext);

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!activity || !isCulinaryChallenge(activity)) {
        return null;
    }

    const onSubmit = () => {
        setIsSubmitting(true);
        try {
            if (activity.publishDate) {
                onUpdateActivity();
            } else {
                onPublishActivity();
            }
            router.push('/lancer-un-defi/success');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageContainer>
            <Steps
                steps={[
                    {
                        label: t('Votre  plat'),
                        href: '/lancer-un-defi/culinaire/1',
                        status: CULINARY_CHALLENGE_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: t('La recette'),
                        href: '/lancer-un-defi/culinaire/2',
                        status: CULINARY_CHALLENGE_VALIDATORS.isStep2Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: t('Le défi'),
                        href: '/lancer-un-defi/culinaire/3',
                        status: CULINARY_CHALLENGE_VALIDATORS.isStep3Valid(activity) ? 'success' : 'warning',
                    },
                    { label: t('Pré-visualiser'), href: '/lancer-un-defi/culinaire/4' },
                ]}
                activeStep={3}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t('Pré-visualiser votre défi et publiez-le')}
            </Title>
            <p>{tCommon('Relisez votre publication une dernière fois avant de la publier !')}</p>
            <ActivityStepPreview
                stepName={t('Votre  plat')}
                href="/lancer-un-defi/culinaire/1"
                status={CULINARY_CHALLENGE_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                <div className={styles.dishTitle}>
                    <strong>{activity.data.dish?.name}</strong>
                </div>
                <div className={styles.dish}>
                    <div className={styles.dishImage}>
                        {activity?.data?.dish?.imageUrl && (
                            <Image
                                src={activity.data.dish.imageUrl}
                                alt={activity.data.dish?.name || ''}
                                width={200}
                                height={200}
                                style={{ objectFit: 'cover' }}
                            />
                        )}
                    </div>
                    <div className={styles.dishDescription}>
                        <p>{activity.data.dish?.history}</p>
                        <br />
                        <p>{activity.data.dish?.description}</p>
                    </div>
                </div>
            </ActivityStepPreview>
            <ActivityStepPreview
                stepName={t('La recette')}
                href="/lancer-un-defi/culinaire/2"
                status={CULINARY_CHALLENGE_VALIDATORS.isStep2Valid(activity) ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                <ContentViewer content={activity.data.content} activityId={activity.id} />
            </ActivityStepPreview>
            <ActivityStepPreview
                stepName={t('Le défi lancé aux pélicopains')}
                href="/lancer-un-defi/culinaire/3"
                status={CULINARY_CHALLENGE_VALIDATORS.isStep3Valid(activity) ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                <p>
                    {t('Votre défi :')} {activity.data.challengeKind}
                </p>
            </ActivityStepPreview>
            <div className={styles.buttons}>
                <Button
                    as="a"
                    href="/lancer-un-defi/culinaire/3"
                    color="primary"
                    variant="outlined"
                    label={tCommon('Étape précédente')}
                    leftIcon={<ChevronLeftIcon />}
                />
                <Button
                    color="primary"
                    variant="contained"
                    label={activity.publishDate ? tCommon('Modifier') : tCommon('Publier')}
                    disabled={!CULINARY_CHALLENGE_VALIDATORS.areAllStepsValid(activity)}
                    onClick={onSubmit}
                />
            </div>
            <Loader isLoading={isSubmitting} />
        </PageContainer>
    );
}
