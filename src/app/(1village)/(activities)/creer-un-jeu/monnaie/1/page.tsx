'use client';

import { isCurrencyGame } from '@app/(1village)/(activities)/creer-un-jeu/monnaie/helpers';
import { CURRENCY_GAME_STEPS_VALIDATORS } from '@app/(1village)/(activities)/creer-un-jeu/monnaie/validators';
import { BackButton } from '@frontend/components/activities/BackButton/BackButton';
import { Button } from '@frontend/components/ui/Button';
import { Field } from '@frontend/components/ui/Form';
import { Select } from '@frontend/components/ui/Form/Select';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { CURRENCIES } from '@frontend/lib/iso-4217-currencies-french';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

import styles from './page.module.css';

export default function CreerUnJeuMonnaieStep1() {
    const t = useExtracted('app.(1village).(activities).creer-un-jeu.monnaie.1');
    const tCommon = useExtracted('common');

    const router = useRouter();

    const { activity, setActivity } = useContext(ActivityContext);

    if (!activity || !isCurrencyGame(activity)) {
        return null;
    }

    const currenciesOptions = Object.entries(CURRENCIES).map((currency) => ({ label: currency[1], value: currency[0] }));

    return (
        <PageContainer>
            <BackButton href="/creer-un-jeu" />
            <Steps
                steps={[
                    { label: activity.data?.currency ? CURRENCIES[activity.data.currency] : t('Monnaie'), href: '/creer-un-jeu/monnaie/1' },
                    { label: t('Objet 1'), href: '/creer-un-jeu/monnaie/2' },
                    { label: t('Objet 2'), href: '/creer-un-jeu/monnaie/3' },
                    { label: t('Objet 3'), href: '/creer-un-jeu/monnaie/4' },
                    { label: tCommon('Pré-visualiser'), href: '/creer-un-jeu/monnaie/5' },
                ]}
                activeStep={1}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t('Choisissez votre monnaie')}
            </Title>
            <p>{t("C'est la monnaie avec laquelle vous allez donner le prix de vos objets :")}</p>
            <Field
                marginTop="lg"
                name="currency"
                label={t('Monnaie')}
                input={
                    <Select
                        isFullWidth
                        name="currency"
                        value={activity.data?.currency}
                        onChange={(currency) => setActivity({ ...activity, data: { ...activity.data, currency } })}
                        options={currenciesOptions}
                    />
                }
            />
            <div className={styles.buttonContainer}>
                <Button
                    disabled={!CURRENCY_GAME_STEPS_VALIDATORS.isStep1Valid(activity)}
                    color="primary"
                    label={tCommon('Étape suivante')}
                    onClick={() => router.push('/creer-un-jeu/monnaie/2')}
                />
            </div>
        </PageContainer>
    );
}
