'use client';

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
import { useContext, useState } from 'react';

import styles from './page.module.css';
import { MASCOT_STEPS_VALIDATORS } from '../validators';

export default function CreerLaMascotteStep3() {
    const router = useRouter();
    const { activity, setActivity } = useContext(ActivityContext);

    const [spokenByAll, setSpokenByAll] = useState<string[]>([]);
    const [spokenBySome, setSpokenBySome] = useState<string[]>([]);
    const [taught, setTaught] = useState<string[]>([]);
    const [currencies, setCurrencies] = useState<string[]>([]);

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

    const isValid = spokenByAll.length > 0 && spokenBySome.length > 0 && taught.length > 0 && currencies.length > 0;

    const saveActivity = () => {
        // TODO
    };

    const goToNextStep = () => {
        saveActivity();
        router.push('/creer-la-mascotte/4');
    };

    return (
        <PageContainer>
            <Steps
                steps={[
                    {
                        label: 'Votre classe',
                        href: '/creer-la-mascotte/1',
                        status: MASCOT_STEPS_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: activity.data?.mascot?.name || 'Votre mascotte',
                        href: '/creer-la-mascotte/2',
                        status: MASCOT_STEPS_VALIDATORS.isStep2Valid(activity) ? 'success' : 'warning',
                    },
                    { label: 'Langues et monnaies', href: '/creer-la-mascotte/3' },
                    { label: 'Le web de Pélico', href: '/creer-la-mascotte/4' },
                    { label: 'Pré-visualiser', href: '/creer-la-mascotte/5' },
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
                input={<MultiSelect value={spokenByAll} onChange={setSpokenByAll} options={languagesOptions} isFullWidth />}
            />
            <Field
                label={
                    <label>
                        Quelles sont les langues parlées couramment par <strong>au moins un enfant</strong> de votre classe ?
                    </label>
                }
                marginBottom="md"
                input={<MultiSelect value={spokenBySome} onChange={setSpokenBySome} options={languagesOptions} isFullWidth />}
            />
            <Field
                label="Quelles sont les langues étrangères apprises par les enfants de votre classe ?"
                marginBottom="md"
                input={<MultiSelect value={taught} onChange={setTaught} options={languagesOptions} isFullWidth />}
            />
            <Title variant="h2" marginBottom="md">
                Monnaies utilisées dans votre classe
            </Title>
            <Field
                label="Quelles sont les monnaies utilisées par les enfants de votre classe ?"
                marginBottom="md"
                input={<MultiSelect value={currencies} onChange={setCurrencies} options={currenciesOptions} isFullWidth />}
            />
            <div className={styles.buttons}>
                <Button
                    as="a"
                    href="/creer-la-mascotte/2"
                    color="primary"
                    variant="outlined"
                    label="Étape précédente"
                    leftIcon={<ChevronLeftIcon />}
                />
                <Button
                    disabled={!isValid}
                    onClick={goToNextStep}
                    color="primary"
                    variant="outlined"
                    label="Étape suivante"
                    rightIcon={<ChevronRightIcon />}
                />
            </div>
        </PageContainer>
    );
}
