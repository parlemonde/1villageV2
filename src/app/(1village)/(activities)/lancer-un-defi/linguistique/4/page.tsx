'use client';

import { useTextKind } from '@app/(1village)/(activities)/lancer-un-defi/linguistique/2/page';
import { isLinguisticActivity } from '@app/(1village)/(activities)/lancer-un-defi/linguistique/helpers';
import { LINGUISTIC_CHALLENGE_VALIDATORS } from '@app/(1village)/(activities)/lancer-un-defi/linguistique/validators';
import { ThemeSelectorButton } from '@frontend/components/ThemeSelectorButton/ThemeSelectorButton';
import { Button } from '@frontend/components/ui/Button';
import { Field, Input } from '@frontend/components/ui/Form';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import isoLanguage from '@server-actions/languages/iso-639-languages.json';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

import styles from './page.module.css';

const useChallengeKinds = ({ languageParam, textKind }: { languageParam?: string; textKind: string }) => {
    const t = useExtracted('app.(1village).(activities).lancer-un-defi.linguistique.4');
    const textKinds = useTextKind();
    const labels: Record<string, string> = {};
    textKinds.forEach((textKind) => {
        labels[textKind.value] = textKind.title.toLowerCase();
    });

    const language = isoLanguage.find((l) => l.code === languageParam)?.name ?? t("(langue non choisie à l'étape 1)");

    const CHALLENGE_KINDS = [
        {
            title: t('Trouvez {textKind} similaire dans une autre langue', { textKind: labels[textKind] }),
            description: t('Les pélicopains devront envoyer un texte, un son ou une vidéo.'),
            value: 'redo',
        },
        {
            title: `${t("Répétez à l'oral en")} ${language}`,
            description: t('Les pélicopains devront envoyer un son ou une vidéo.'),
            value: 'repeat',
        },
        {
            title: `${t('Écrivez en')} ${language}`,
            description: t('Les pélicopains devront envoyer un texte, une image ou une vidéo.'),
            value: 'write',
        },
        {
            title: t('Un autre défi'),
            description: t('Rédigez vous-même le défi pour vos pélicopains !'),
            value: 'other',
        },
    ];

    return CHALLENGE_KINDS;
};

export default function LancerUnDefiLinguistiqueStep4() {
    const t = useExtracted('app.(1village).(activities).lancer-un-defi.linguistique.4');
    const tCommon = useExtracted('common');

    const router = useRouter();

    const { activity, setActivity } = useContext(ActivityContext);

    const language = activity && isLinguisticActivity(activity) ? activity.data.language : undefined;
    const textKind = activity && isLinguisticActivity(activity) ? activity.data.textKind : undefined;

    const challengeKinds = useChallengeKinds({ languageParam: language, textKind: textKind ?? '' });

    if (!activity || !isLinguisticActivity(activity)) {
        return null;
    }

    const goToNextStep = (challengeKind: string) => {
        setActivity({ ...activity, data: { ...activity.data, challengeKind } });
        router.push('/lancer-un-defi/linguistique/5');
    };

    return (
        <PageContainer>
            <Steps
                steps={[
                    {
                        label: t('Langue'),
                        href: '/lancer-un-defi/linguistique/1',
                        status: LINGUISTIC_CHALLENGE_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: t('Thème'),
                        href: '/lancer-un-defi/linguistique/2',
                        status: LINGUISTIC_CHALLENGE_VALIDATORS.isStep2Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: t('Présentation'),
                        href: '/lancer-un-defi/linguistique/3',
                        status: LINGUISTIC_CHALLENGE_VALIDATORS.isStep3Valid(activity) ? 'success' : 'warning',
                    },
                    { label: t('Le défi'), href: '/lancer-un-defi/linguistique/4' },
                    { label: tCommon('Pré-visualiser'), href: '/lancer-un-defi/linguistique/5' },
                ]}
                activeStep={4}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t('Quel défi voulez-vous lancer aux pélicopains ?')}
            </Title>
            <div className={styles.container}>
                {challengeKinds.map((challengeKind, index) => (
                    <ThemeSelectorButton
                        key={index}
                        title={challengeKind.title}
                        description={challengeKind.description}
                        onClick={() => goToNextStep(challengeKind.title)}
                        dropdownContent={
                            challengeKind.value === 'other' && (
                                <div className={styles.other}>
                                    <Field
                                        label={t('Défi')}
                                        input={
                                            <Input
                                                type="text"
                                                onChange={(e) =>
                                                    setActivity({ ...activity, data: { ...activity.data, challengeKind: e.target.value } })
                                                }
                                                value={activity.data.challengeKind ?? ''}
                                            />
                                        }
                                    />
                                    <Button
                                        disabled={!activity.data.challengeKind}
                                        color="primary"
                                        label={t('Étape suivante')}
                                        onClick={() => router.push('/lancer-un-defi/linguistique/5')}
                                    />
                                </div>
                            )
                        }
                    />
                ))}
            </div>
            <Button as="a" href="/lancer-un-defi/linguistique/3" color="primary" label={tCommon('Étape précédente')} leftIcon={<ChevronLeftIcon />} />
        </PageContainer>
    );
}
