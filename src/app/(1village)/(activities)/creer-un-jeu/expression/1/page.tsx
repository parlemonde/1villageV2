'use client';

import { isIdiomGame } from '@app/(1village)/(activities)/creer-un-jeu/expression/helpers';
import { IDIOM_GAME_STEPS_VALIDATORS } from '@app/(1village)/(activities)/creer-un-jeu/expression/validators';
import { BackButton } from '@frontend/components/activities/BackButton/BackButton';
import { Button } from '@frontend/components/ui/Button';
import { Field } from '@frontend/components/ui/Form';
import { RadioGroup } from '@frontend/components/ui/Form/RadioGroup';
import { Select } from '@frontend/components/ui/Form/Select';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import isoLanguages from '@server-actions/languages/iso-639-languages.json';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

import styles from './page.module.css';

export const useLanguageKnowledge = () => {
    const t = useExtracted('app.(1village).(activities).creer-un-jeu.expression.1');

    const LANGUAGE_KNOWLEDGE = [
        { label: t('maternelle chez tous les enfants') },
        { label: t('maternelle chez certains enfants') },
        { label: t("qu'on utilise pour faire cours") },
        { label: t("qu'on apprend comme langue étrangère") },
    ];

    return LANGUAGE_KNOWLEDGE;
};

export default function CreerUnJeuExpressionStep1() {
    const t = useExtracted('app.(1village).(activities).creer-un-jeu.expression.1');
    const tCommon = useExtracted('common');

    const router = useRouter();

    const { activity, setActivity } = useContext(ActivityContext);

    const languageKnowledge = useLanguageKnowledge();

    if (!activity || !isIdiomGame(activity)) {
        return null;
    }

    const languagesOptions = isoLanguages.map((language) => ({
        label: language.name,
        value: language.code,
    }));

    const language = isoLanguages.find((l) => l.code === activity.data?.language)?.name;

    return (
        <PageContainer>
            <BackButton href="/creer-un-jeu" />
            <Steps
                steps={[
                    { label: language ?? t('Langue'), href: '/creer-un-jeu/expression/1' },
                    { label: t('1ère expression'), href: '/creer-un-jeu/expression/2' },
                    { label: t('2ème expression'), href: '/creer-un-jeu/expression/3' },
                    { label: t('3ème expression'), href: '/creer-un-jeu/expression/4' },
                    { label: tCommon('Pré-visualiser'), href: '/creer-un-jeu/expression/5' },
                ]}
                activeStep={1}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t('Choisissez la langue de vos expressions')}
            </Title>
            <Field
                label={t('Langue')}
                marginTop="xl"
                marginBottom="md"
                input={
                    <Select
                        placeholder={t('Choisir une langue')}
                        isFullWidth
                        options={languagesOptions}
                        value={activity?.data?.language ?? ''}
                        onChange={(language) => setActivity({ ...activity, data: { ...activity.data, language } })}
                    />
                }
            />
            {activity?.data?.language && (
                <div className={styles.radioContainer}>
                    <p>
                        {t('Dans votre classe, {language} est une langue :', {
                            language: language || '',
                        })}
                    </p>
                    <RadioGroup
                        marginTop="lg"
                        options={languageKnowledge.map((l) => ({ label: l.label, value: l.label }))}
                        value={activity?.data?.languageKnowledge}
                        onChange={(languageKnowledge) => setActivity({ ...activity, data: { ...activity.data, languageKnowledge } })}
                    />
                    <div className={styles.buttonContainer}>
                        <Button
                            disabled={!IDIOM_GAME_STEPS_VALIDATORS.isStep1Valid(activity)}
                            color="primary"
                            onClick={() => router.push('/creer-un-jeu/expression/2')}
                            label={tCommon('Étape suivante')}
                            rightIcon={<ChevronRightIcon />}
                            marginTop="md"
                        />
                    </div>
                </div>
            )}
        </PageContainer>
    );
}
