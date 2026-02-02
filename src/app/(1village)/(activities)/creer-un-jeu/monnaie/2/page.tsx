'use client';

import { CurrencyForm } from '@app/(1village)/(activities)/creer-un-jeu/monnaie/CurrencyForm';
import { isCurrencyGame } from '@app/(1village)/(activities)/creer-un-jeu/monnaie/helpers';
import { CURRENCY_GAME_STEPS_VALIDATORS } from '@app/(1village)/(activities)/creer-un-jeu/monnaie/validators';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { CURRENCIES } from '@frontend/lib/iso-4217-currencies-french';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

import styles from './page.module.css';

export default function CreerUnJeuMonnaieStep2() {
    const t = useExtracted('app.(1village).(activities).creer-un-jeu.monnaie.2');
    const tCommon = useExtracted('common');

    const router = useRouter();

    const { activity, setActivity, getOrCreateDraft } = useContext(ActivityContext);

    if (!activity || !isCurrencyGame(activity)) {
        return null;
    }

    return (
        <PageContainer>
            <Steps
                steps={[
                    {
                        label: activity.data?.currency ? CURRENCIES[activity.data.currency] : t('Monnaie'),
                        href: '/creer-un-jeu/monnaie/1',
                        status: CURRENCY_GAME_STEPS_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning',
                    },
                    { label: t('Objet 1'), href: '/creer-un-jeu/monnaie/2' },
                    { label: t('Objet 2'), href: '/creer-un-jeu/monnaie/3' },
                    { label: t('Objet 3'), href: '/creer-un-jeu/monnaie/4' },
                    { label: tCommon('Pré-visualiser'), href: '/creer-un-jeu/monnaie/5' },
                ]}
                activeStep={2}
                marginTop="xl"
                marginBottom="md"
            />
            <CurrencyForm
                activity={activity}
                setActivity={setActivity}
                getOrCreateDraft={getOrCreateDraft}
                number={1}
                stepId={2}
                title={t('Choisissez un objet dont le prix moyen est faible')}
            />
            <div className={styles.buttonsContainer}>
                <Button as="a" href="/creer-un-jeu/monnaie/1" color="primary" leftIcon={<ChevronLeftIcon />} label={tCommon('Étape précédente')} />
                <Button
                    disabled={!CURRENCY_GAME_STEPS_VALIDATORS.isStep2Valid(activity)}
                    onClick={() => router.push('/creer-un-jeu/monnaie/3')}
                    color="primary"
                    rightIcon={<ChevronRightIcon />}
                    label={tCommon('Étape suivante')}
                />
            </div>
        </PageContainer>
    );
}
