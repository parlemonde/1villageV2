'use client';

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
import { send } from 'node:process';
import { sendToast } from '@frontend/components/Toasts';

export default function LancerUnDefiStep4() {
    const t = useExtracted('app.(1village).(activities).lancer-un-defi.(libre).4');
    const tCommon = useExtracted('common');

    const router = useRouter();

    const { activity, onUpdateActivity, onPublishActivity } = useContext(ActivityContext);

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!activity || activity.type !== 'defi' || activity?.data?.theme !== 'libre') {
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
                    { label: t('Thème'), href: '/lancer-un-defi/1', status: activity.data.themeName ? 'success' : 'warning' },
                    {
                        label: t('Action'),
                        href: '/lancer-un-defi/2',
                        status: activity.data.content && activity.data.content?.length > 0 ? 'success' : 'warning',
                    },
                    { label: t('Le défi'), href: '/lancer-un-defi/3', status: activity.data.challengeKind ? 'success' : 'warning' },
                    { label: tCommon('Pré-visualiser'), href: '/lancer-un-defi/4' },
                ]}
                activeStep={4}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t('Pré-visualisez votre défi et publiez-le')}
            </Title>
            <p>{t('Relisez votre publication une dernière fois avant de la publier !')}</p>
            <ActivityStepPreview
                stepName={t('Thème')}
                href="/lancer-un-defi/1"
                status={activity.data.themeName ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                {activity.data.themeName}
            </ActivityStepPreview>
            <ActivityStepPreview
                stepName={t('Action')}
                href="/lancer-un-defi/2"
                status={activity.data.content && activity.data.content?.length > 0 ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                <ContentViewer content={activity.data.content} activityId={activity.id} />
            </ActivityStepPreview>
            <ActivityStepPreview
                stepName={t('Le défi')}
                href="/lancer-un-defi/3"
                status={activity.data.challengeKind ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                {t('Votre défi :')} {activity.data.challengeKind}
            </ActivityStepPreview>
            <div className={styles.buttonsContainer}>
                <Button as="a" href="/lancer-un-defi/3" color="primary" label={tCommon('Étape précédente')} leftIcon={<ChevronLeftIcon />} />
                <Button
                    disabled={!activity.data.themeName || !activity.data.content || !activity.data.challengeKind}
                    onClick={onSubmit}
                    label={activity.publishDate ? tCommon('Modifier') : tCommon('Publier')}
                    color="primary"
                    variant="contained"
                />
            </div>
            <Loader isLoading={isSubmitting} />
        </PageContainer>
    );
}
