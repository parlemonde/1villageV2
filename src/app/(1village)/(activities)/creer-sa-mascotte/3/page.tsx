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
import { LANGUAGES } from '@lib/iso-639-languages-french';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';

import styles from './page.module.css';

export default function CreerSaMascotteStep3() {
    const router = useRouter();
    const { activity, setActivity } = useContext(ActivityContext);

    if (!activity || activity.type !== 'mascotte') {
        return null;
    }

    const languagesOptions = Object.entries(LANGUAGES).map((language) => ({
        value: language[0],
        label: language[1],
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
                        label: 'Votre classe',
                        href: '/creer-sa-mascotte/1',
                        status: MASCOT_STEPS_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: activity.data?.mascot?.name || 'Votre mascotte',
                        href: '/creer-sa-mascotte/2',
                        status: MASCOT_STEPS_VALIDATORS.isStep2Valid(activity) ? 'success' : 'warning',
                    },
                    { label: 'Langues et monnaies', href: '/creer-sa-mascotte/3' },
                    { label: 'Le web de Pélico', href: '/creer-sa-mascotte/4' },
                    { label: 'Pré-visualiser', href: '/creer-sa-mascotte/5' },
                ]}
                activeStep={3}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                Langues parlées dans votre classe
            </Title>
            <Field
                label={
                    <label>
                        Quelles sont les langues parlées couramment par <strong>tous les enfants</strong> de votre classe ?
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
                        Quelles sont les langues parlées couramment par <strong>au moins un enfant</strong> de votre classe ?
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
                label="Quelles sont les langues étrangères apprises par les enfants de votre classe ?"
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
                Monnaies utilisées dans votre classe
            </Title>
            <Field
                label="Quelles sont les monnaies utilisées par les enfants de votre classe ?"
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
                    label="Étape précédente"
                    leftIcon={<ChevronLeftIcon />}
                />
                <Button
                    disabled={!MASCOT_STEPS_VALIDATORS.isStep3Valid(activity)}
                    onClick={() => router.push('/creer-sa-mascotte/4')}
                    color="primary"
                    variant="outlined"
                    label="Étape suivante"
                    rightIcon={<ChevronRightIcon />}
                />
            </div>
        </PageContainer>
    );
}
