'use client';

import { isLinguisticActivity } from '@app/(1village)/(activities)/lancer-un-defi/linguistique/helpers';
import { LINGUISTIC_CHALLENGE_VALIDATORS } from '@app/(1village)/(activities)/lancer-un-defi/linguistique/validators';
import { ActivityStepPreview } from '@frontend/components/activities/ActivityStepPreview';
import { ContentViewer } from '@frontend/components/content/ContentViewer';
import { Button } from '@frontend/components/ui/Button';
import { Loader } from '@frontend/components/ui/Loader';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import isoLanguages from '@server-actions/languages/iso-639-languages.json';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { act, useContext, useState } from 'react';

import styles from './page.module.css';
import { sendToast } from '@frontend/components/Toasts';

export default function LancerUnDefiLinguistiqueStep5() {
    const t = useExtracted('app.(1village).(activities).lancer-un-defi.linguistique.5');
    const tCommon = useExtracted('common');

    const router = useRouter();

    const { activity, onUpdateActivity, onPublishActivity } = useContext(ActivityContext);

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!activity || !isLinguisticActivity(activity)) {
        return null;
    }

    const language = isoLanguages.find((l) => l.code === activity.data.language)?.name ?? '';

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
                        label: t('Langue'),
                        href: '/lancer-un-defi/linguistique/1',
                        status: LINGUISTIC_CHALLENGE_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: t('Thème'),
                        href: '/lancer-un-defi/linguistique/2',
                        status: LINGUISTIC_CHALLENGE_VALIDATORS.isStep2Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: t('Présentation'),
                        href: '/lancer-un-defi/linguistique/3',
                        status: LINGUISTIC_CHALLENGE_VALIDATORS.isStep3Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: t('Le défi'),
                        href: '/lancer-un-defi/linguistique/4',
                        status: LINGUISTIC_CHALLENGE_VALIDATORS.isStep4Valid(activity) ? 'success' : 'warning',
                    },
                    { label: tCommon('Pré-visualiser'), href: '/lancer-un-defi/linguistique/5' },
                ]}
                activeStep={5}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t('Pré-visualiez votre défi et publiez-le')}
            </Title>
            <p>Relisez votre publication une dernière fois avant de publier !</p>
            <ActivityStepPreview
                stepName={t('Langue')}
                href="/lancer-un-defi/linguistique/1"
                status={LINGUISTIC_CHALLENGE_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                {activity.data.language && activity.data.textKind && activity.data.languageKnowledge && (
                    <>
                        {t('Voilà')} {activity.data.textKind?.toLowerCase()} {t('en')} {language}, {t('une langue')} {activity.data.languageKnowledge}
                    </>
                )}
            </ActivityStepPreview>
            <ActivityStepPreview
                stepName={t('Thème')}
                href="/lancer-un-defi/linguistique/2"
                status={LINGUISTIC_CHALLENGE_VALIDATORS.isStep2Valid(activity) ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                {activity.data.textKind}
            </ActivityStepPreview>
            <ActivityStepPreview
                stepName={t('Présentation')}
                href="/lancer-un-defi/linguistique/3"
                status={LINGUISTIC_CHALLENGE_VALIDATORS.isStep3Valid(activity) ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                <ContentViewer content={activity.data?.content} activityId={activity.id} />
            </ActivityStepPreview>
            <ActivityStepPreview
                stepName={t('Le défi lancé aux pélicopains')}
                href="/lancer-un-defi/linguistique/4"
                status={LINGUISTIC_CHALLENGE_VALIDATORS.isStep4Valid(activity) ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                {t('Votre défi :')} {activity.data?.challengeKind}
            </ActivityStepPreview>
            <div className={styles.buttonsContainer}>
                <Button
                    as="a"
                    href="/lancer-un-defi/linguistique/4"
                    color="primary"
                    label={tCommon('Étape précédente')}
                    leftIcon={<ChevronLeftIcon />}
                />
                <Button
                    disabled={!LINGUISTIC_CHALLENGE_VALIDATORS.areAllStepsValid(activity)}
                    onClick={onSubmit}
                    color="primary"
                    variant="contained"
                    label={activity.publishDate ? tCommon('Modifier') : tCommon('Publier')}
                />
            </div>
            <Loader isLoading={isSubmitting} />
        </PageContainer>
    );
}
