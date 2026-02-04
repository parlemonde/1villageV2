'use client';

import { GestureForm } from '@app/(1village)/(activities)/creer-un-jeu/mimique/GestureForm';
import { isGestureGame } from '@app/(1village)/(activities)/creer-un-jeu/mimique/helpers';
import { GESTURE_GAME_STEPS_VALIDATORS } from '@app/(1village)/(activities)/creer-un-jeu/mimique/validators';
import { BackButton } from '@frontend/components/activities/BackButton/BackButton';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

import styles from './page.module.css';

export default function CreerUnJeuMimiqueStep1() {
    const t = useExtracted('app.(1village).(activities).creer-un-jeu.mimique.1');
    const tCommon = useExtracted('common');

    const router = useRouter();

    const { activity, setActivity, getOrCreateDraft } = useContext(ActivityContext);

    if (!activity || !isGestureGame(activity)) {
        return null;
    }

    return (
        <PageContainer>
            <BackButton href="/creer-un-jeu" />
            <Steps
                steps={[
                    { label: t('1ère mimique'), href: '/creer-un-jeu/mimique/1' },
                    { label: t('2ème mimique'), href: '/creer-un-jeu/mimique/2' },
                    { label: t('3ème mimique'), href: '/creer-un-jeu/mimique/3' },
                    { label: tCommon('Pré-visualiser'), href: '/creer-un-jeu/mimique/4' },
                ]}
                activeStep={1}
                marginTop="xl"
                marginBottom="md"
            />
            <GestureForm
                activity={activity}
                setActivity={setActivity}
                getOrCreateDraft={getOrCreateDraft}
                number={1}
                stepId={1}
                title={t('Présentez en vidéo une 1ère mimique à vos pélicopains')}
            />
            <div className={styles.buttonContainer}>
                <Button
                    disabled={!GESTURE_GAME_STEPS_VALIDATORS.isStep1Valid(activity)}
                    label={tCommon('Étape suivante')}
                    rightIcon={<ChevronRightIcon />}
                    color="primary"
                    onClick={() => router.push('/creer-un-jeu/mimique/2')}
                />
            </div>
        </PageContainer>
    );
}
