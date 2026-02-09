'use client';

import { isLinguisticActivity } from '@app/(1village)/(activities)/lancer-un-defi/linguistique/helpers';
import { LINGUISTIC_CHALLENGE_VALIDATORS } from '@app/(1village)/(activities)/lancer-un-defi/linguistique/validators';
import { ContentEditor } from '@frontend/components/content/ContentEditor';
import { Button } from '@frontend/components/ui/Button';
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

export default function LancerUnDefiLinguistiqueStep3() {
    const t = useExtracted('app.(1village).(activities).lancer-un-defi.linguistique.3');
    const tCommon = useExtracted('common');

    const router = useRouter();

    const { activity, setActivity, getOrCreateDraft } = useContext(ActivityContext);

    if (!activity || !isLinguisticActivity(activity)) {
        return null;
    }

    const description = (): string => {
        switch (activity.data.textKind) {
            case 'word':
                return t("Écrivez votre mot puis expliquez pourquoi vous avez choisi celui-ci, ce qu'il signifie et quand vous l'utilisez");
            case 'idiom':
                return t("Écrivez votre expression puis expliquez pourquoi avoir choisi celle-ci, ce qu'elle signifie et quand vous l'utilisez");
            case 'poem':
                return t("Écrivez votre poésie puis expliquez pourquoi avoir choisi celle-ci et ce qu'elle signifie");
            case 'song':
                return t("Écrivez votre chanson puis expliquez pourquoi avoir choisi celle-ci et ce qu'elle signifie");
            default:
                return t("Expliquez votre choix, ce qu'il signifie et quand vous l'utilisez");
        }
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
                    {
                        label: t('Thème'),
                        href: '/lancer-un-defi/linguistique/2',
                        status: LINGUISTIC_CHALLENGE_VALIDATORS.isStep2Valid(activity) ? 'success' : 'warning',
                    },
                    { label: t('Présentation'), href: '/lancer-un-defi/linguistique/3' },
                    { label: t('Le défi'), href: '/lancer-un-defi/linguistique/4' },
                    { label: tCommon('Pré-visualiser'), href: '/lancer-un-defi/linguistique/5' },
                ]}
                activeStep={3}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t('Expliquez votre choix')}
            </Title>
            <p className={styles.description}>{description()}</p>
            <ContentEditor
                content={activity.data.content}
                getActivityId={getOrCreateDraft}
                setContent={(content) => setActivity({ ...activity, data: { ...activity.data, content } })}
            />
            <div className={styles.buttonsContainer}>
                <Button
                    as="a"
                    href="/lancer-un-defi/linguistique/2"
                    color="primary"
                    label={tCommon('Étape précédente')}
                    leftIcon={<ChevronLeftIcon />}
                />
                <Button
                    disabled={!LINGUISTIC_CHALLENGE_VALIDATORS.isStep3Valid(activity)}
                    onClick={() => router.push('/lancer-un-defi/linguistique/4')}
                    color="primary"
                    label={tCommon('Étape suivante')}
                    rightIcon={<ChevronRightIcon />}
                />
            </div>
        </PageContainer>
    );
}
