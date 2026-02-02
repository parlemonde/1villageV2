'use client';

import { CUSTOM_THEME_VALUE, useGetStepThemeName, type ThemeName } from '@app/(1village)/(activities)/creer-une-enigme/enigme-constants';
import { ContentEditor } from '@frontend/components/content/ContentEditor';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

export default function CreerUneEnigmeStep3() {
    const { activity, setActivity, getOrCreateDraft } = useContext(ActivityContext);
    const defaultTheme: ThemeName = (activity?.type === 'enigme' ? activity.data?.defaultTheme : undefined) || CUSTOM_THEME_VALUE;
    const customTheme = activity?.type === 'enigme' ? activity.data?.customTheme : undefined;
    const stepTheme = useGetStepThemeName(defaultTheme, customTheme);
    const tCommon = useExtracted('common');
    const t = useExtracted('app.(1village).(activities).creer-une-enigme.3');

    if (!activity || activity.type !== 'enigme') {
        return null;
    }

    const isFirstStepDone = !!(activity?.data?.customTheme || activity?.data?.defaultTheme);
    const isSecondStepDone = (activity?.data?.content || []).length > 0;

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: stepTheme || tCommon('Énigme'), href: '/creer-une-enigme/1', status: isFirstStepDone ? 'success' : 'warning' },
                    { label: tCommon("Créer l'énigme"), href: '/creer-une-enigme/2', status: isSecondStepDone ? 'success' : 'warning' },
                    { label: tCommon('Réponse'), href: '/creer-une-enigme/3' },
                    { label: tCommon('Pré-visualiser'), href: '/creer-une-enigme/4' },
                ]}
                activeStep={3}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t('Entrez la réponse de votre énigme :')}
            </Title>
            <div style={{ marginTop: '16px' }}>
                <ContentEditor
                    content={activity.data?.answer}
                    setContent={(answer) => setActivity({ ...activity, data: { ...activity.data, answer } })}
                    activityId={activity.id}
                    getActivityId={getOrCreateDraft}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <Button
                        as="a"
                        href="/creer-une-enigme/2"
                        color="primary"
                        variant="outlined"
                        label={tCommon('Étape précédente')}
                        leftIcon={<ChevronLeftIcon />}
                    />
                    <Button
                        as="a"
                        href="/creer-une-enigme/4"
                        color="primary"
                        label={tCommon('Étape suivante')}
                        rightIcon={<ChevronRightIcon />}
                    ></Button>
                </div>
            </div>
        </PageContainer>
    );
}
