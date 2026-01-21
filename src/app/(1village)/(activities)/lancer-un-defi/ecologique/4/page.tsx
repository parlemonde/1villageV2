'use client';

import { isEcologicalChallenge } from '@app/(1village)/(activities)/lancer-un-defi/ecologique/helpers';
import { ECOLOGICAL_CHALLENGE_VALIDATORS } from '@app/(1village)/(activities)/lancer-un-defi/ecologique/validators';
import { ActivityStepPreview } from '@frontend/components/activities/ActivityStepPreview';
import { ContentViewer } from '@frontend/components/content/ContentViewer';
import { Button } from '@frontend/components/ui/Button';
import { Loader } from '@frontend/components/ui/Loader';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext, useState } from 'react';

import styles from './page.module.css';
import { sendToast } from '@frontend/components/Toasts';

export default function LancerUnDefiEcologiqueStep4() {
    const t = useExtracted('app.(1village).(activities).lancer-un-defi.ecologique.4');
    const tCommon = useExtracted('common');

    const router = useRouter();
    const { activity, onUpdateActivity, onPublishActivity } = useContext(ActivityContext);

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!activity || !isEcologicalChallenge(activity)) {
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
            sendToast({
                type: 'error',
                message: t('Une erreur est survenue lors de la publication de votre défi'),
            })
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageContainer>
            <Steps
                steps={[
                    {
                        label: t('Votre geste pour la planète'),
                        href: '/lancer-un-defi/ecologique/1',
                        status: ECOLOGICAL_CHALLENGE_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: t("Description de l'action"),
                        href: '/lancer-un-defi/ecologique/2',
                        status: ECOLOGICAL_CHALLENGE_VALIDATORS.isStep2Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: t('Le défi'),
                        href: '/lancer-un-defi/ecologique/3',
                        status: ECOLOGICAL_CHALLENGE_VALIDATORS.isStep3Valid(activity) ? 'success' : 'warning',
                    },
                    { label: tCommon('Pré-visualiser'), href: '/lancer-un-defi/ecologique/4' },
                ]}
                activeStep={4}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t('Pré-visualisez votre défi et publiez-le')}
            </Title>
            <p>{tCommon('Relisez votre publication une dernière fois avant de la publier !')}</p>
            <ActivityStepPreview
                stepName={t('Votre action')}
                href="/lancer-un-defi/ecologique/1"
                status={ECOLOGICAL_CHALLENGE_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                {activity?.data?.action}
            </ActivityStepPreview>
            <ActivityStepPreview
                stepName={t('Description')}
                href="/lancer-un-defi/ecologique/2"
                status={ECOLOGICAL_CHALLENGE_VALIDATORS.isStep2Valid(activity) ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                <ContentViewer content={activity?.data?.content} activityId={activity.id} />
            </ActivityStepPreview>
            <ActivityStepPreview
                stepName={t('Le défi lancé aux pélicopains')}
                href="/lancer-un-defi/ecologique/3"
                status={ECOLOGICAL_CHALLENGE_VALIDATORS.isStep3Valid(activity) ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                {t('Votre défi :')} {activity.data?.challengeKind}
            </ActivityStepPreview>
            <div className={styles.buttons}>
                <Button
                    as="a"
                    href="/lancer-un-defi/ecologique/3"
                    color="primary"
                    label={tCommon('Étape précédente')}
                    leftIcon={<ChevronLeftIcon />}
                />
                <Button
                    color="primary"
                    label={activity.publishDate ? tCommon('Modifier') : tCommon('Publier')}
                    variant="contained"
                    onClick={onSubmit}
                    disabled={!ECOLOGICAL_CHALLENGE_VALIDATORS.areAllStepsValid(activity)}
                />
            </div>
            <Loader isLoading={isSubmitting} />
        </PageContainer>
    );
}
