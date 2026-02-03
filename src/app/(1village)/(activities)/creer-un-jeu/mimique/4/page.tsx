'use client';

import { isGestureGame } from '@app/(1village)/(activities)/creer-un-jeu/mimique/helpers';
import { GESTURE_GAME_STEPS_VALIDATORS } from '@app/(1village)/(activities)/creer-un-jeu/mimique/validators';
import { sendToast } from '@frontend/components/Toasts';
import { GamePreviewCard } from '@frontend/components/activities/game/GamePreviewCard';
import { Button } from '@frontend/components/ui/Button';
import { Loader } from '@frontend/components/ui/Loader';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext, useState } from 'react';

import styles from './page.module.css';

export default function CreerUnJeuMimiqueStep4() {
    const t = useExtracted('app.(1village).(activities).creer-un-jeu.mimique.4');
    const tCommon = useExtracted('common');

    const router = useRouter();

    const { activity, onUpdateActivity, onPublishActivity } = useContext(ActivityContext);

    const [isSubmitting, setisSubmitting] = useState(false);

    if (!activity || !isGestureGame(activity)) {
        return null;
    }

    const onSubmit = () => {
        setisSubmitting(true);
        try {
            if (activity.publishDate) {
                onUpdateActivity();
            } else {
                onPublishActivity();
            }
            router.push('/creer-un-jeu/success');
        } catch {
            sendToast({
                type: 'error',
                message: t('Une erreur est survenue lors de la publication du jeu'),
            });
        } finally {
            setisSubmitting(false);
        }
    };

    const renderGameCards = () => {
        return activity.data?.gestures
            ?.filter((gesture) => gesture !== null)
            .map((gesture, index) => {
                const options = [];
                if (gesture?.meaning) {
                    options.push({ label: gesture.meaning, value: 'true' });
                }
                gesture?.falseMeanings?.forEach((falseMeaning, index) => {
                    options.push({ label: falseMeaning, value: index.toString() }); // value must be unique
                });

                return (
                    <GamePreviewCard
                        key={index}
                        label={gesture.origin}
                        videoUrl={gesture.videoUrl}
                        options={options}
                        href={`/creer-un-jeu/mimique/${gesture.stepId}`}
                    />
                );
            });
    };

    return (
        <PageContainer>
            <Steps
                steps={[
                    {
                        label: t('1ère mimique'),
                        href: '/creer-un-jeu/mimique/1',
                        status: GESTURE_GAME_STEPS_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: t('2ème mimique'),
                        href: '/creer-un-jeu/mimique/2',
                        status: GESTURE_GAME_STEPS_VALIDATORS.isStep2Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: t('3ème mimique'),
                        href: '/creer-un-jeu/mimique/3',
                        status: GESTURE_GAME_STEPS_VALIDATORS.isStep3Valid(activity) ? 'success' : 'warning',
                    },
                    { label: tCommon('Pré-visualiser'), href: '/creer-un-jeu/mimique/4' },
                ]}
                activeStep={4}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t('Pré-visualisez votre jeu et publiez-le')}
            </Title>
            <p>{tCommon('Relisez votre publication une dernière fois avant de la publier !')}</p>
            <div className={styles.gamePreview}>{renderGameCards()}</div>
            <div className={styles.buttonsContainer}>
                <Button as="a" href="/creer-un-jeu/mimique/3" color="primary" label={tCommon('Étape précédente')} leftIcon={<ChevronLeftIcon />} />
                <Button
                    disabled={!GESTURE_GAME_STEPS_VALIDATORS.areAllStepsValid(activity)}
                    onClick={onSubmit}
                    color="primary"
                    label={tCommon('Publier')}
                    variant="contained"
                />
            </div>
            <Loader isLoading={isSubmitting} />
        </PageContainer>
    );
}
