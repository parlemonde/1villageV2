'use client';

import { mascotActivityHelpers } from '@app/(1village)/(activities)/creer-sa-mascotte/helpers';
import { MASCOT_STEPS_VALIDATORS } from '@app/(1village)/(activities)/creer-sa-mascotte/validators';
import { Button } from '@frontend/components/ui/Button';
import { Field, MultiSelect } from '@frontend/components/ui/Form';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { CURRENCIES } from '@lib/iso-4217-currencies-french';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';
import isoLanguages from '@server-actions/languages/iso-639-languages.json';

import styles from './page.module.css';

export default function CreerSaMascotteStep3() {
    const t = useExtracted('app.(1village).(activities).creer-sa-mascotte.3');
    const tCommon = useExtracted('common');
    const router = useRouter();
    const { activity, setActivity } = useContext(ActivityContext);

    if (!activity || activity.type !== 'mascotte') {
        return null;
    }

    const languagesOptions = isoLanguages.map((language) => ({
        value: language.code,
        label: language.name,
    }));

    const currenciesOptions = Object.entries(CURRENCIES).map((currency) => ({
        value: currency[0],
        label: currency[1],
    }));

    const { setLanguages } = mascotActivityHelpers(activity, setActivity);

    return (
        <PageContainer>
            <Steps
                steps={[
                    {
                        label: t('Votre classe'),
                        href: '/creer-sa-mascotte/1',
                        status: MASCOT_STEPS_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: activity.data?.mascot?.name || t('Votre mascotte'),
                        href: '/creer-sa-mascotte/2',
                        status: MASCOT_STEPS_VALIDATORS.isStep2Valid(activity) ? 'success' : 'warning',
                    },
                    { label: t('Langues et monnaies'), href: '/creer-sa-mascotte/3' },
                    { label: t('Le web de Pélico'), href: '/creer-sa-mascotte/4' },
                    { label: tCommon('Pré-visualiser'), href: '/creer-sa-mascotte/5' },
                ]}
                activeStep={3}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t('Langues parlées dans votre classe')}
            </Title>
            <Field
                label={
                    <label>
                        {t('Quelles sont les langues parlées couramment par')} <strong>{t('tous les enfants')}</strong> {t('de votre classe ?')}
                    </label>
                }
                marginBottom="md"
                input={
                    <MultiSelect
                        value={activity?.data?.languages?.spokenByAll || []}
                        onChange={(languages) => setLanguages('spokenByAll', languages)}
                        options={languagesOptions}
                        isFullWidth
                    />
                }
            />
            <Field
                label={
                    <label>
                        {t('Quelles sont les langues parlées couramment par')} <strong>{t('au moins un enfant')}</strong> {t('de votre classe ?')}
                    </label>
                }
                marginBottom="md"
                input={
                    <MultiSelect
                        value={activity?.data?.languages?.spokenBySome || []}
                        onChange={(languages) => setLanguages('spokenBySome', languages)}
                        options={languagesOptions}
                        isFullWidth
                    />
                }
            />
            <Field
                label={t('Quelles sont les langues étrangères apprises par les enfants de votre classe ?')}
                marginBottom="md"
                input={
                    <MultiSelect
                        value={activity?.data?.languages?.taught || []}
                        onChange={(languages) => setLanguages('taught', languages)}
                        options={languagesOptions}
                        isFullWidth
                    />
                }
            />
            <Title variant="h2" marginBottom="md">
                {t('Monnaies utilisées dans votre classe')}
            </Title>
            <Field
                label={t('Quelles sont les monnaies utilisées par les enfants de votre classe ?')}
                marginBottom="md"
                input={
                    <MultiSelect
                        value={activity?.data?.languages?.currencies || []}
                        onChange={(languages) => setLanguages('currencies', languages)}
                        options={currenciesOptions}
                        isFullWidth
                    />
                }
            />
            <div className={styles.buttons}>
                <Button
                    as="a"
                    href="/creer-sa-mascotte/2"
                    color="primary"
                    variant="outlined"
                    label={tCommon('Étape précédente')}
                    leftIcon={<ChevronLeftIcon />}
                />
                <Button
                    disabled={!MASCOT_STEPS_VALIDATORS.isStep3Valid(activity)}
                    onClick={() => router.push('/creer-sa-mascotte/4')}
                    color="primary"
                    variant="outlined"
                    label={tCommon('Étape suivante')}
                    rightIcon={<ChevronRightIcon />}
                />
            </div>
        </PageContainer>
    );
}
