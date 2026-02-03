'use client';

import { isCurrencyGame } from '@app/(1village)/(activities)/creer-un-jeu/monnaie/helpers';
import { CURRENCY_GAME_STEPS_VALIDATORS } from '@app/(1village)/(activities)/creer-un-jeu/monnaie/validators';
import { sendToast } from '@frontend/components/Toasts';
import { GamePreviewCard } from '@frontend/components/activities/game/GamePreviewCard';
import { Button } from '@frontend/components/ui/Button';
import type { RadioOption } from '@frontend/components/ui/Form/RadioGroup';
import { Loader } from '@frontend/components/ui/Loader';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { CURRENCIES } from '@frontend/lib/iso-4217-currencies-french';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext, useState } from 'react';

import styles from './page.module.css';

export default function CreerUnJeuMonnaieStep5() {
    const t = useExtracted('app.(1village).(activities).creer-un-jeu.monnaie.5');
    const tCommon = useExtracted('common');

    const router = useRouter();

    const { activity, onUpdateActivity, onPublishActivity } = useContext(ActivityContext);

    const [isSubmitting, setisSubmitting] = useState(false);

    if (!activity || !isCurrencyGame(activity)) {
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
        return activity.data?.objects
            ?.filter((obj) => obj !== null)
            ?.map((obj, index) => {
                const options: RadioOption[] = [];
                if (activity.data.currency) {
                    options.push({ label: `${obj.price} ${CURRENCIES[activity.data.currency]}`, value: 'true' });
                }
                obj.falsePrices?.forEach((falsePrice, index) => {
                    options.push({ label: `${falsePrice} ${CURRENCIES[activity.data.currency ?? '']}`, value: index.toString() }); // value must be unique
                });

                return (
                    <GamePreviewCard
                        key={index}
                        label={obj.name}
                        imageUrl={obj.imageUrl}
                        options={options}
                        href={`/creer-un-jeu/monnaie/${obj.stepId}`}
                    />
                );
            });
    };

    return (
        <PageContainer>
            <Steps
                steps={[
                    {
                        label: activity.data?.currency ? CURRENCIES[activity.data.currency] : t('Monnaie'),
                        href: '/creer-un-jeu/monnaie/1',
                        status: CURRENCY_GAME_STEPS_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: t('Objet 1'),
                        href: '/creer-un-jeu/monnaie/2',
                        status: CURRENCY_GAME_STEPS_VALIDATORS.isStep2Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: t('Objet 2'),
                        href: '/creer-un-jeu/monnaie/3',
                        status: CURRENCY_GAME_STEPS_VALIDATORS.isStep3Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: t('Objet 3'),
                        href: '/creer-un-jeu/monnaie/4',
                        status: CURRENCY_GAME_STEPS_VALIDATORS.isStep4Valid(activity) ? 'success' : 'warning',
                    },
                    { label: tCommon('Pré-visualiser'), href: '/creer-un-jeu/monnaie/5' },
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
                <Button as="a" href="/creer-un-jeu/monnaie/4" color="primary" label={tCommon('Étape précédente')} leftIcon={<ChevronLeftIcon />} />
                <Button
                    disabled={!CURRENCY_GAME_STEPS_VALIDATORS.areAllStepsValid(activity)}
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
