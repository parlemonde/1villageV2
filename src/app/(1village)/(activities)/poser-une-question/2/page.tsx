'use client';

import { Input } from '@frontend/components/ui/Form';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

import styles from './page.module.css';

export default function PoserUneQuestionStep2() {
    const t = useExtracted('app.(1village).(activities).poser-une-question.2');
    const tCommon = useExtracted('common');

    const { activity } = useContext(ActivityContext);

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: t('Les questions'), href: '/poser-une-question/1' },
                    { label: t('Poser ses questions'), href: '/poser-une-question/2' },
                    { label: tCommon('Pré-visualiser'), href: '/poser-une-question/3' },
                ]}
                activeStep={2}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t('Écrivez vos questions')}
            </Title>
            <p>{t('Vous pouvez écrire un maximmum de 3 questions !')}</p>
        </PageContainer>
    );
}
