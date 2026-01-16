'use client';

import { ChooseOptionButton } from '@app/(1village)/(activities)/lancer-un-defi/ChooseOptionButton';
import { isEcologicalChallenge } from '@app/(1village)/(activities)/lancer-un-defi/ecologique/helpers';
import { ECOLOGICAL_CHALLENGE_VALIDATORS } from '@app/(1village)/(activities)/lancer-un-defi/ecologique/validators';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

import styles from './page.module.css';

const useChallenges = () => {
    const t = useExtracted('app.(1village).(activities).lancer-un-defi.ecologique.3');

    const CHALLENGES = [
        {
            title: t('Réaliser cette action pour la planète à votre tour'),
            description: t('Les pélicopains devront refaire cette action chez eux.'),
        },
        {
            title: t('Imaginer et réaliser une nouvelle action pour la planète'),
            description: t('Les pélicopains devront réaliser une autre action.'),
        },
        {
            title: t('Un autre défi'),
            description: t('Rédigez vous-même le défi pour vos pélicopains !'),
        },
    ];

    return CHALLENGES;
};

export default function LancerUnDefiEcologiqueStep3() {
    const t = useExtracted('app.(1village).(activities).lancer-un-defi.ecologique.3');
    const tCommon = useExtracted('common');

    const router = useRouter();

    const { activity, setActivity } = useContext(ActivityContext);

    const challenges = useChallenges();

    if (!activity || !isEcologicalChallenge(activity)) {
        return null;
    }

    const goToNextStep = (challengeKind: string) => {
        setActivity({ ...activity, data: { ...activity.data, theme: 'ecologique', challengeKind } });
        router.push('/lancer-un-defi/ecologique/4');
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
                    { label: t('Le défi'), href: '/lancer-un-defi/ecologique/3' },
                    { label: tCommon('Pré-visualiser'), href: '/lancer-un-defi/ecologique/4' },
                ]}
                activeStep={3}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t('Quel défi voulez-vous lancer aux pélicopains ?')}
            </Title>
            <div className={styles.container}>
                {challenges.map((challenge, index) => (
                    <ChooseOptionButton
                        key={index}
                        title={challenge.title}
                        description={challenge.description}
                        onClick={() => goToNextStep(challenge.title)}
                    />
                ))}
            </div>
            <Button as="a" href="/lancer-un-defi/ecologique/2" color="primary" label={tCommon('Étape précédente')} leftIcon={<ChevronLeftIcon />} />
        </PageContainer>
    );
}
