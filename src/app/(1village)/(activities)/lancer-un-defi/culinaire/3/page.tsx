'use client';

import { isCulinaryChallenge } from '@app/(1village)/(activities)/lancer-un-defi/culinaire/helpers';
import { CULINARY_CHALLENGE_VALIDATORS } from '@app/(1village)/(activities)/lancer-un-defi/culinaire/validators';
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

const useChallenges = () => {
    const t = useExtracted('app.(1village).(activities).lancer-un-defi.3');

    const CHALLENGES = [
        {
            title: t('Réaliser notre recette à votre tour'),
            description: t('Les pélicopains devront créer une présentation sous forme de texte, son, image ou vidéo.'),
        },
        {
            title: t('Présentez-nous une de vos recettes traditionnelles'),
            description: t('Les pélicopains devront créer une présentation sous form de texte, son, image ou vidéo.'),
        },
        {
            title: t('Un autre défi'),
            description: t('Rédigez vous-même le défi pour vos pélicopains !'),
        },
    ];

    return CHALLENGES;
};

export default function LancerUnDefiCulinaireStep3() {
    const t = useExtracted('app.(1village).(activities).lancer-un-defi.3');
    const tCommon = useExtracted('common');

    const router = useRouter();

    const challenges = useChallenges();

    const { activity, setActivity } = useContext(ActivityContext);

    if (!activity || !isCulinaryChallenge(activity)) {
        return null;
    }

    const goToNextStep = (challengeKind: string) => {
        setActivity({
            ...activity,
            data: {
                ...activity.data,
                theme: 'culinaire',
                challengeKind,
            },
        });

        router.push('/lancer-un-defi/culinaire/4');
    };

    return (
        <PageContainer>
            <Steps
                steps={[
                    {
                        label: t('Votre  plat'),
                        href: '/lancer-un-defi/culinaire/1',
                        status: CULINARY_CHALLENGE_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: t('La recette'),
                        href: '/lancer-un-defi/culinaire/2',
                        status: CULINARY_CHALLENGE_VALIDATORS.isStep2Valid(activity) ? 'success' : 'warning',
                    },
                    { label: t('Le défi'), href: '/lancer-un-defi/culinaire/3' },
                    { label: t('Pré-visualiser'), href: '/lancer-un-defi/culinaire/4' },
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
                    <button key={index} className={styles.button} onClick={() => goToNextStep(challenge.title)}>
                        <div className={styles.buttonContent}>
                            <div className={styles.left}>
                                <p>{challenge.title}</p>
                                <span>{challenge.description}</span>
                            </div>
                            <div className={styles.right}>
                                <ChevronRightIcon className={styles.icon} />
                            </div>
                        </div>
                    </button>
                ))}
            </div>
            <Button as="a" href="/lancer-un-defi/culinaire/2" color="primary" label={tCommon('Étape précédente')} leftIcon={<ChevronLeftIcon />} />
        </PageContainer>
    );
}
