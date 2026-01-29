'use client';

import { IdiomForm } from '@app/(1village)/(activities)/creer-un-jeu/expression/IdiomForm';
import { isIdiomGame } from '@app/(1village)/(activities)/creer-un-jeu/expression/helpers';
import { IDIOM_GAME_STEPS_VALIDATORS } from '@app/(1village)/(activities)/creer-un-jeu/expression/validators';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import isoLanguages from '@server-actions/languages/iso-639-languages.json';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

import styles from './page.module.css';

export default function CreerUnJeuExpressionStep2() {
    const t = useExtracted('app.(1village).(activities).creer-un-jeu.expression.2');
    const tCommon = useExtracted('common');

    const router = useRouter();

    const { activity, setActivity, getOrCreateDraft } = useContext(ActivityContext);

    if (!activity || !isIdiomGame(activity)) {
        return null;
    }

    const language = isoLanguages.find((l) => l.code === activity.data?.language)?.name;

    return (
        <PageContainer>
            <Steps
                steps={[
                    {
                        label: language ?? t('Langue'),
                        href: '/creer-un-jeu/expression/1',
                        status: IDIOM_GAME_STEPS_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning',
                    },
                    { label: t('1ère expression'), href: '/creer-un-jeu/expression/2' },
                    { label: t('2ème expression'), href: '/creer-un-jeu/expression/3' },
                    { label: t('3ème expression'), href: '/creer-un-jeu/expression/4' },
                    { label: tCommon('Pré-visualiser'), href: '/creer-un-jeu/expression/5' },
                ]}
                activeStep={2}
                marginTop="xl"
                marginBottom="md"
            />
            <IdiomForm activity={activity} setActivity={setActivity} getOrCreateDraft={getOrCreateDraft} number={1} stepId={2} />
            <div className={styles.buttonsContainer}>
                <Button as="a" href="/creer-un-jeu/expression/1" label={tCommon('Étape précédente')} leftIcon={<ChevronLeftIcon />} color="primary" />
                <Button
                    disabled={!IDIOM_GAME_STEPS_VALIDATORS.isStep2valid(activity)}
                    onClick={() => router.push('/creer-un-jeu/expression/3')}
                    label={tCommon('Étape suivante')}
                    rightIcon={<ChevronRightIcon />}
                    color="primary"
                />
            </div>
        </PageContainer>
    );
}
