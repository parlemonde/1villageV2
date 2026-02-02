'use client';

import { CUSTOM_THEME_VALUE, useGetStepThemeName, type ThemeName } from '@app/(1village)/(activities)/creer-une-enigme/enigme-constants';
import { sendToast } from '@frontend/components/Toasts';
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

export default function CreerUneEnigmeStep4() {
    const router = useRouter();
    const { activity, onPublishActivity, onUpdateActivity } = useContext(ActivityContext);
    const [isSubmiting, setIsSubmiting] = useState(false);
    const defaultTheme: ThemeName = (activity?.type === 'enigme' ? activity.data?.defaultTheme : undefined) || CUSTOM_THEME_VALUE;
    const customTheme = activity?.type === 'enigme' ? activity.data?.customTheme : undefined;
    const stepTheme = useGetStepThemeName(defaultTheme, customTheme);
    const tCommon = useExtracted('common');
    const t = useExtracted('app.(1village).(activities).creer-une-enigme.4');

    if (!activity || activity.type !== 'enigme') {
        return null;
    }

    const isFirstStepDone = !!(activity?.data?.customTheme || activity?.data?.defaultTheme);
    const isSecondStepDone = (activity?.data?.content || []).length > 0;
    const isThirdStepDone = (activity?.data?.answer || []).length > 0;
    const isValid = isFirstStepDone && isSecondStepDone && isThirdStepDone;

    const onSubmit = async () => {
        setIsSubmiting(true);
        try {
            if (activity.publishDate) {
                await onUpdateActivity();
            } else {
                await onPublishActivity();
            }
            router.push('/creer-une-enigme/success');
        } catch {
            sendToast({
                type: 'error',
                message: t('Une erreur est survenue lors de la publication de votre énigme.'),
            });
        } finally {
            setIsSubmiting(false);
        }
    };

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: stepTheme || tCommon('Énigme'), href: '/creer-une-enigme/1', status: isFirstStepDone ? 'success' : 'warning' },
                    { label: tCommon("Créer l'énigme"), href: '/creer-une-enigme/2', status: isSecondStepDone ? 'success' : 'warning' },
                    { label: tCommon('Réponse'), href: '/creer-une-enigme/3', status: isThirdStepDone ? 'success' : 'warning' },
                    { label: tCommon('Pré-visualiser'), href: '/creer-une-enigme/4' },
                ]}
                activeStep={4}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t('Pré-visualisez votre énigme et publiez-la')}
            </Title>
            <p>{t('Relisez votre publication une dernière fois avant de la publier !')}</p>
            <ActivityStepPreview
                stepName="Énigme"
                href="/creer-une-enigme/1"
                status={isFirstStepDone ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                {stepTheme}
            </ActivityStepPreview>
            <ActivityStepPreview
                stepName="Contenu"
                href="/creer-une-enigme/2"
                status={isSecondStepDone ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                <ContentViewer content={activity.data?.content} activityId={activity.id} />
            </ActivityStepPreview>
            <ActivityStepPreview
                stepName="Réponse"
                href="/creer-une-enigme/3"
                status={isThirdStepDone ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                <ContentViewer content={activity.data?.answer} activityId={activity.id} />
            </ActivityStepPreview>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '32px 0' }}>
                <Button
                    as="a"
                    href="/creer-une-enigme/3"
                    color="primary"
                    variant="outlined"
                    label={tCommon('Étape précédente')}
                    leftIcon={<ChevronLeftIcon />}
                />
                <Button
                    color="primary"
                    variant="contained"
                    label={activity.publishDate ? tCommon('Modifier') : tCommon('Publier')}
                    disabled={!isValid}
                    onClick={onSubmit}
                />
            </div>
            {isSubmiting && <Loader isLoading={isSubmiting} />}
        </PageContainer>
    );
}
