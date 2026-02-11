'use client';

import { isLinguisticActivity } from '@app/(1village)/(activities)/lancer-un-defi/linguistique/helpers';
import { LINGUISTIC_CHALLENGE_VALIDATORS } from '@app/(1village)/(activities)/lancer-un-defi/linguistique/validators';
import { ThemeSelectorButton } from '@frontend/components/ThemeSelectorButton/ThemeSelectorButton';
import { Button } from '@frontend/components/ui/Button';
import { Field, Input } from '@frontend/components/ui/Form';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import isoLanguages from '@server-actions/languages/iso-639-languages.json';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

import styles from './page.module.css';

export const useTextKind = (languageParam?: string) => {
    const t = useExtracted('app.(1village).(activities).lancer-un-defi.linguistique.2');
    const language = isoLanguages.find((l) => l.code === languageParam)?.name ?? t("(langue non choisie à l'étape 1)");
    return [
        {
            title: t('Un mot'),
            description: `${t("Choisissez un mot qui a quelque chose d'original (prononciation, origine...) dans la langue")} ${language}.`,
            value: 'word',
        },
        {
            title: t('Une expression'),
            description: `${t('Choisissez une expression surprenante dans la langue')} ${language}.`,
            value: 'idiom',
        },
        {
            title: t('Une poésie'),
            description: `${t('Choisissez une poésie écrite dans la langue')} ${language}.`,
            value: 'poem',
        },
        {
            title: t('Une chanson'),
            description: `${t('Choisissez une chanson écrite dans la langue')} ${language}.`,
            value: 'song',
        },
        {
            title: t('Autre'),
            description: t('Choisissez une autre façon de présenter votre langue.'),
            value: 'other',
        },
    ];
};

export default function LancerUnDefiLinguistiqueStep2() {
    const t = useExtracted('app.(1village).(activities).lancer-un-defi.linguistique.2');
    const tCommon = useExtracted('common');

    const router = useRouter();

    const { activity, setActivity } = useContext(ActivityContext);

    const language = activity && isLinguisticActivity(activity) ? activity.data.language : undefined;

    const textKinds = useTextKind(language);

    if (!activity || !isLinguisticActivity(activity)) {
        return;
    }

    const goToNextStep = (textKind: string) => {
        setActivity({ ...activity, data: { ...activity.data, textKind } });
        router.push('/lancer-un-defi/linguistique/3');
    };

    return (
        <PageContainer>
            <Steps
                steps={[
                    {
                        label: isoLanguages.find((l) => l.code === activity.data?.language)?.name ?? t('Langue'),
                        href: '/lancer-un-defi/linguistique/1',
                        status: LINGUISTIC_CHALLENGE_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning',
                    },
                    { label: t('Thème'), href: '/lancer-un-defi/linguistique/2' },
                    { label: t('Présentation'), href: '/lancer-un-defi/linguistique/3' },
                    { label: t('Le défi'), href: '/lancer-un-defi/linguistique/4' },
                    { label: tCommon('Pré-visualiser'), href: '/lancer-un-defi/linguistique/5' },
                ]}
                activeStep={2}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2">{t('Choisissez le thème de votre défi linguistique')}</Title>
            <p>Vous pourrez ensuite le présenter en détail.</p>
            <div className={styles.container}>
                {textKinds.map((textKind, index) => (
                    <ThemeSelectorButton
                        key={index}
                        title={textKind.title}
                        description={textKind.description}
                        onClick={() => goToNextStep(textKind.title)}
                        dropdownContent={
                            textKind.value === 'other' && (
                                <div className={styles.other}>
                                    <Field
                                        label={t('Par exexmple un proverbe...')}
                                        input={
                                            <Input
                                                type="text"
                                                value={activity.data.textKind ?? ''}
                                                onChange={(e) => setActivity({ ...activity, data: { ...activity.data, textKind: e.target.value } })}
                                            />
                                        }
                                    />
                                    <Button
                                        disabled={!activity.data.textKind}
                                        onClick={() => router.push('/lancer-un-defi/linguistique/3')}
                                        color="primary"
                                        label={tCommon('Étape suivante')}
                                        rightIcon={<ChevronRightIcon />}
                                    />
                                </div>
                            )
                        }
                    />
                ))}
            </div>
            <Button as="a" href="/lancer-un-defi/linguistique/1" color="primary" label={tCommon('Étape précédente')} leftIcon={<ChevronLeftIcon />} />
        </PageContainer>
    );
}
