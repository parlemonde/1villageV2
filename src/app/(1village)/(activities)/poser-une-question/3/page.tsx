'use client';

import { QUESTION_STEPS_VALIDATORS } from '@app/(1village)/(activities)/poser-une-question/validators';
import { sendToast } from '@frontend/components/Toasts';
import { ActivityStepPreview } from '@frontend/components/activities/ActivityStepPreview';
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

export default function PoserUneQuestionStep3() {
    const t = useExtracted('app.(1village).(activities).poser-une-question.3');
    const tCommon = useExtracted('common');

    const router = useRouter();

    const { activity, onUpdateActivity, onPublishActivity } = useContext(ActivityContext);

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!activity || activity.type !== 'question') {
        return null;
    }

    const onSubmit = () => {
        setIsSubmitting(true);
        try {
            if (activity.publishDate) {
                onUpdateActivity();
            } else {
                onPublishActivity();
            }
            router.push('/poser-une-question/success');
        } catch {
            sendToast({
                type: 'error',
                message: tCommon('Une erreur est survenue lors de la publication de votre activité'),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: t('Les questions'), href: '/poser-une-question/1', status: 'success' },
                    {
                        label: t('Poser ses questions'),
                        href: '/poser-une-question/2',
                        status: QUESTION_STEPS_VALIDATORS.isStep2Valid(activity) ? 'success' : 'warning',
                    },
                    { label: tCommon('Pré-visualiser'), href: '/poser-une-question/3' },
                ]}
                activeStep={3}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t('Pré-visualisez vos questions et publiez-les')}
            </Title>
            <p>{tCommon('Relisez votre publication une dernière fois avant de la publier !')}</p>
            <ActivityStepPreview
                stepName={t('Les questions posées aux pélicopains')}
                href="/poser-une-question/2"
                status={QUESTION_STEPS_VALIDATORS.isStep2Valid(activity) ? 'success' : 'warning'}
                style={{ marginTop: '32px' }}
            >
                {activity.data?.questions?.map((question, index) => (
                    <div key={question.id} className={styles.question}>
                        <p>
                            <strong>
                                {t('Question')} {index + 1}
                            </strong>
                        </p>
                        <p>{question.text}</p>
                    </div>
                ))}
            </ActivityStepPreview>
            <div className={styles.buttonsContainer}>
                <Button as="a" href="/poser-une-question/2" label={tCommon('Étape précédente')} leftIcon={<ChevronLeftIcon />} color="primary" />
                <Button
                    disabled={!QUESTION_STEPS_VALIDATORS.isStep2Valid(activity)}
                    onClick={onSubmit}
                    label={tCommon('Publier')}
                    color="primary"
                    variant="contained"
                />
            </div>
            <Loader isLoading={isSubmitting} />
        </PageContainer>
    );
}
