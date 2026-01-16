'use client';

import { ChooseOptionButton } from '@app/(1village)/(activities)/lancer-un-defi/ChooseOptionButton';
import { isEcologicalChallenge } from '@app/(1village)/(activities)/lancer-un-defi/ecologique/helpers';
import { BackButton } from '@frontend/components/activities/BackButton/BackButton';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

import styles from './page.module.css';

const useActionsForPlanet = () => {
    const t = useExtracted('app.(1village).(activities).lancer-un-defi.ecologique.1');

    const ACTIONS = [
        {
            title: t('Ramassage des déchets dans notre région'),
        },
        { title: t("Recyclage d'un objet du quotidien") },
        { title: t("Mise en place d'écogestes dans la classe") },
        { title: t("Actions auprès d'une association locale") },
        { title: t('Action libre') },
    ];

    return ACTIONS;
};

export default function LancerUnDefiEcologiqueStep1() {
    const t = useExtracted('app.(1village).(activities).lancer-un-defi.ecologique.1');
    const tCommon = useExtracted('common');

    const router = useRouter();
    const { activity, setActivity } = useContext(ActivityContext);

    const actions = useActionsForPlanet();

    if (!activity || !isEcologicalChallenge(activity)) {
        return null;
    }

    const goToNextStep = (action: string) => {
        setActivity({ ...activity, data: { ...activity.data, action: action } });
        router.push('/lancer-un-defi/ecologique/2');
    };

    return (
        <PageContainer>
            <BackButton href="/lancer-un-defi" label="Retour" />
            <Steps
                steps={[
                    { label: t('Votre geste pour la planète'), href: '/lancer-un-defi/ecologique/1' },
                    { label: t("Description de l'action"), href: '/lancer-un-defi/ecologique/2' },
                    { label: t('Le défi'), href: '/lancer-un-defi/ecologique/3' },
                    { label: tCommon('Pré-visualiser'), href: '/lancer-un-defi/ecologique/4' },
                ]}
                activeStep={1}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                Quel geste pour la planète souhaitez-vous présenter ?
            </Title>
            <div className={styles.container}>
                {actions.map((action, index) => (
                    <ChooseOptionButton key={index} title={action.title} onClick={() => goToNextStep(action.title)} />
                ))}
            </div>
        </PageContainer>
    );
}
