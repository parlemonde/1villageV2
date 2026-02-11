'use client';

import { ThemeSelectorButton } from '@frontend/components/ThemeSelectorButton/ThemeSelectorButton';
import { Button } from '@frontend/components/ui/Button';
import { Field, Input } from '@frontend/components/ui/Form';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

import styles from './page.module.css';

const useChallenges = (themeName?: string) => {
    const t = useExtracted('app.(1village).(activities).lancer-un-defi.(libre).3');

    const theme = themeName ?? t("choisi à l'étape 1");

    const CHALLENGES = [
        {
            title: t('Réalisez notre action à votre tour'),
            description: t('Les pélicopains devront réaliser la même action que vous.'),
            value: 'redo',
        },
        {
            title: t('Réalisez une autre action sur le même thème'),
            description: `${t('Les pélicopains devront réaliser une action sur le thème')} ${theme}.`,
            value: 'new',
        },
        {
            title: t('Un autre défi'),
            description: t('Rédigez vous-même le défi pour vos pélicopains !'),
            value: 'other',
        },
    ];

    return CHALLENGES;
};

export default function LancerUnDefiStep3() {
    const t = useExtracted('app.(1village).(activities).lancer-un-defi.(libre).3');
    const tCommon = useExtracted('common');

    const router = useRouter();

    const { activity, setActivity } = useContext(ActivityContext);

    const themeName =
        activity?.type === 'defi' && activity?.data?.theme === 'libre' && activity?.data?.themeName ? activity?.data?.themeName : undefined;

    const challenges = useChallenges(themeName);

    if (!activity || activity.type !== 'defi' || activity?.data?.theme !== 'libre') {
        return null;
    }

    const goToNextStep = (challengeKind: string) => {
        setActivity({ ...activity, data: { ...activity.data, theme: 'libre', challengeKind } });
        router.push('/lancer-un-defi/4');
    };

    return (
        <PageContainer>
            <Steps
                steps={[
                    {
                        label: activity.data?.themeName ?? t('Thème'),
                        href: '/lancer-un-defi/1',
                        status: activity.data.themeName ? 'success' : 'warning',
                    },
                    {
                        label: t('Action'),
                        href: '/lancer-un-defi/2',
                        status: activity.data.content && activity.data.content?.length > 0 ? 'success' : 'warning',
                    },
                    { label: t('Le défi'), href: '/lancer-un-defi/3' },
                    { label: tCommon('Pré-visualiser'), href: '/lancer-un-defi/4' },
                ]}
                activeStep={3}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t('Quel défi souhaitez-vous lancer à vos Pélicopains ?')}
            </Title>
            <div className={styles.container}>
                {challenges.map((c) => (
                    <ThemeSelectorButton
                        key={c.value}
                        title={c.title}
                        description={c.description}
                        onClick={() => goToNextStep(c.title)}
                        dropdownContent={
                            c.value === 'other' && (
                                <div className={styles.other}>
                                    <Field
                                        label={t('Défi')}
                                        name="challenge"
                                        input={
                                            <Input
                                                name="challenge"
                                                onChange={(e) => {
                                                    setActivity({
                                                        ...activity,
                                                        data: {
                                                            ...activity.data,
                                                            theme: 'libre',
                                                            challengeKind: e.target.value,
                                                        },
                                                    });
                                                }}
                                            />
                                        }
                                    />
                                    <Button
                                        disabled={!activity.data?.challengeKind}
                                        onClick={() => router.push('/lancer-un-defi/4')}
                                        color="primary"
                                        label={tCommon('Étape suivante')}
                                        leftIcon={<ChevronRightIcon />}
                                    />
                                </div>
                            )
                        }
                    />
                ))}
            </div>
            <Button as="a" href="/lancer-un-defi/3" color="primary" label={tCommon('Étape précédente')} leftIcon={<ChevronLeftIcon />} />
        </PageContainer>
    );
}
