'use client';

import { isIdiomGame } from '@app/(1village)/(activities)/creer-un-jeu/expression/helpers';
import { IDIOM_GAME_STEPS_VALIDATORS } from '@app/(1village)/(activities)/creer-un-jeu/expression/validators';
import { sendToast } from '@frontend/components/Toasts';
import { GamePreviewCard } from '@frontend/components/activities/game/GamePreviewCard';
import { Button } from '@frontend/components/ui/Button';
import { Loader } from '@frontend/components/ui/Loader';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import isoLanguages from '@server-actions/languages/iso-639-languages.json';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext, useState } from 'react';

import styles from './page.module.css';

export default function CreerUnJeuExpressionStep5() {
    const t = useExtracted('app.(1village).(activities).creer-un-jeu.expression.5');
    const tCommon = useExtracted('common');

    const router = useRouter();

    const { activity, onUpdateActivity, onPublishActivity } = useContext(ActivityContext);

    const [isSubmitting, setisSubmitting] = useState(false);

    if (!activity || !isIdiomGame(activity)) {
        return null;
    }

    const language = isoLanguages.find((l) => l.code === activity.data?.language)?.name;

    const onSubmit = () => {
        setisSubmitting(true);
        try {
            if (activity.publishDate) {
                onUpdateActivity();
            } else {
                onPublishActivity();
            }
            router.push('/creer-un-jeu/expression/success');
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
        return activity.data?.idioms?.map((idiom, index) => {
            const options = [{ label: idiom.meaning ?? '', value: 'true' }];
            idiom.falseMeanings?.forEach((falseMeaning, index) => {
                options.push({ label: falseMeaning, value: index.toString() }); // value serves as unique identifier
            });
            return (
                <GamePreviewCard
                    key={index}
                    label={idiom.value}
                    imageUrl={idiom.imageUrl}
                    options={options}
                    href={`/creer-un-jeu/expression/${idiom.stepId}`}
                />
            );
        });
    };

    return (
        <PageContainer>
            <Steps
                steps={[
                    {
                        label: language ?? t('Langue'),
                        href: '/creer-un-jeu/expression/1',
                        status: IDIOM_GAME_STEPS_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: t('1ère expression'),
                        href: '/creer-un-jeu/expression/2',
                        status: IDIOM_GAME_STEPS_VALIDATORS.isStep2valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: t('2ème expression'),
                        href: '/creer-un-jeu/expression/3',
                        status: IDIOM_GAME_STEPS_VALIDATORS.isStep3Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: t('3ème expression'),
                        href: '/creer-un-jeu/expression/4',
                        status: IDIOM_GAME_STEPS_VALIDATORS.isStep4Valid(activity) ? 'success' : 'warning',
                    },
                    { label: tCommon('Pré-visualiser'), href: '/creer-un-jeu/expression/5' },
                ]}
                activeStep={5}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t('Pré-visualisez votre jeu et publiez-le')}
            </Title>
            <p>{tCommon('Relisez votre publication une dernière fois avant de la publier !')}</p>
            <div className={styles.gamePreview}>{renderGameCards()}</div>
            <div className={styles.buttonsContainer}>
                <Button as="a" href="/creer-un-jeu/expression/4" color="primary" label={tCommon('Étape précédente')} leftIcon={<ChevronLeftIcon />} />
                <Button onClick={onSubmit} color="primary" label={tCommon('Publier')} variant="contained" />
            </div>
            <Loader isLoading={isSubmitting} />
        </PageContainer>
    );
}
