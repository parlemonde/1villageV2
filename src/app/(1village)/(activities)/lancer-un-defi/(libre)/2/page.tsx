'use client';

import { ContentEditor } from '@frontend/components/content/ContentEditor';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

import styles from './page.module.css';

export default function LancerUnDefiStep2() {
    const t = useExtracted('app.(1village).(activities).lancer-un-defi.(libre).2');
    const tCommon = useExtracted('common');

    const router = useRouter();

    const { activity, setActivity, getOrCreateDraft } = useContext(ActivityContext);

    if (!activity || activity.type !== 'defi' || activity?.data?.theme !== 'libre') {
        return null;
    }

    return (
        <PageContainer>
            <Steps
                steps={[
                    {
                        label: activity.data?.themeName ?? t('Thème'),
                        href: '/lancer-un-defi/1',
                        status: activity.data?.themeName ? 'success' : 'warning',
                    },
                    { label: t('Action'), href: '/lancer-un-defi/2' },
                    { label: t('Le défi'), href: '/lancer-un-defi/3' },
                    { label: tCommon('Pré-visualiser'), href: '/lancer-un-defi/4' },
                ]}
                activeStep={2}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t('Choisissez une action et décrivez-la')}
            </Title>
            <ContentEditor
                content={activity.data.content}
                setContent={(content) => setActivity({ ...activity, data: { ...activity.data, theme: 'libre', content } })}
                getActivityId={getOrCreateDraft}
            />
            <div className={styles.buttonsContainer}>
                <Button as="a" href="/lancer-un-defi/1" label={tCommon('Étape précédente')} leftIcon={<ChevronLeftIcon />} color="primary" />
                <Button
                    disabled={!activity.data.content || activity.data.content.length === 0}
                    label={tCommon('Étape suivante')}
                    rightIcon={<ChevronRightIcon />}
                    onClick={() => router.push('/lancer-un-defi/3')}
                    color="primary"
                />
            </div>
        </PageContainer>
    );
}
