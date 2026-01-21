'use client';

import { BackButton } from '@frontend/components/activities/BackButton/BackButton';
import { Button } from '@frontend/components/ui/Button';
import { Field, Input } from '@frontend/components/ui/Form';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

import styles from './page.module.css';

export default function LancerUnDefiStep1() {
    const t = useExtracted('app.(1village).(activities).lancer-un-defi.(libre).1');
    const tCommon = useExtracted('common');

    const router = useRouter();

    const { activity, setActivity } = useContext(ActivityContext);

    if (!activity || activity.type !== 'defi' || activity?.data?.theme !== 'libre') {
        return null;
    }

    return (
        <PageContainer>
            <BackButton href="/lancer-un-defi" />
            <Steps
                steps={[
                    { label: t('Thème'), href: '/lancer-un-defi/1' },
                    { label: t('Action'), href: '/lancer-un-defi/2' },
                    { label: t('Le défi'), href: '/lancer-un-defi/3' },
                    { label: tCommon('Pré-visualiser'), href: '/lancer-un-defi/4' },
                ]}
                activeStep={1}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t('Choisissez le thème de votre défi')}
            </Title>
            <Field
                label={t('Thème')}
                name="theme"
                input={
                    <Input
                        isFullWidth
                        type="text"
                        value={activity?.data?.themeName ?? ''}
                        onChange={(e) => {
                            setActivity({ ...activity, data: { ...activity.data, theme: 'libre', themeName: e.target.value } });
                        }}
                    />
                }
            />
            <div className={styles.buttonContainer}>
                <Button
                    disabled={!activity?.data?.themeName}
                    color="primary"
                    label={tCommon('Étape suivante')}
                    rightIcon={<ChevronRightIcon />}
                    onClick={() => router.push('/lancer-un-defi/2')}
                />
            </div>
        </PageContainer>
    );
}
