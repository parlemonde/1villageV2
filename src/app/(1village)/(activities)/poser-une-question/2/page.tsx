'use client';

import { QUESTION_STEPS_VALIDATORS } from '@app/(1village)/(activities)/poser-une-question/validators';
import { Button, IconButton } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { Tooltip } from '@frontend/components/ui/Tooltip/Tooltip';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

import styles from './page.module.css';

export default function PoserUneQuestionStep2() {
    const t = useExtracted('app.(1village).(activities).poser-une-question.2');
    const tCommon = useExtracted('common');

    const router = useRouter();

    const { activity, setActivity } = useContext(ActivityContext);

    if (!activity || activity.type !== 'question') {
        return null;
    }

    const initialData = [{ id: 1, text: '' }];

    const getMaxId = () => {
        return activity.data?.questions?.reduce((max, question) => (question.id > max ? question.id : max), 0) ?? 1;
    };

    const deleteQuestion = (questionId: number) => {
        setActivity({
            ...activity,
            data: {
                ...activity.data,
                questions: activity.data?.questions?.filter((question) => question.id !== questionId) ?? initialData,
            },
        });
    };

    const addQuestion = () => {
        if (activity.data && activity.data?.questions && activity.data.questions.length >= 3) {
            return;
        }

        setActivity({
            ...activity,
            data: {
                ...activity.data,
                questions: [...(activity.data?.questions ?? initialData), { id: activity.data?.questions ? getMaxId() + 1 : 1, text: '' }],
            },
        });
    };

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: t('Les questions'), href: '/poser-une-question/1', status: 'success' },
                    { label: t('Poser ses questions'), href: '/poser-une-question/2' },
                    { label: tCommon('Pré-visualiser'), href: '/poser-une-question/3' },
                ]}
                activeStep={2}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t('Écrivez vos questions')}
            </Title>
            <p>{t('Vous pouvez écrire un maximmum de 3 questions !')}</p>
            {activity.data?.questions?.map((question) => (
                <div key={question.id} className={styles.question}>
                    <input
                        placeholder={t('Écrivez votre question ici')}
                        type="text"
                        className={styles.questionInput}
                        value={activity.data?.questions?.find((q) => q.id === question.id)?.text ?? ''}
                        onChange={(e) =>
                            setActivity({
                                ...activity,
                                data: {
                                    ...activity.data,
                                    questions:
                                        activity.data?.questions?.map((q) => (q.id === question.id ? { ...q, text: e.target.value } : q)) ??
                                        initialData,
                                },
                            })
                        }
                    />
                    {activity.data?.questions && activity.data.questions.length > 1 && (
                        <Tooltip content="Supprimer">
                            <IconButton
                                icon={TrashIcon}
                                variant="outlined"
                                color="error"
                                className={styles.trashButton}
                                onClick={() => deleteQuestion(question.id)}
                            />
                        </Tooltip>
                    )}
                </div>
            ))}
            {activity.data?.questions && activity.data?.questions.length < 3 && (
                <button className={styles.addQuestionCard} onClick={addQuestion}>
                    <PlusIcon width={24} height={24} color="var(--primary-color)" />
                    <span>
                        <strong>{t('Ajouter une autre question')}</strong>
                    </span>
                </button>
            )}
            <div className={styles.buttonsContainer}>
                <Button as="a" label={tCommon('Étape précédente')} leftIcon={<ChevronLeftIcon />} color="primary" href="/poser-une-question/1" />
                <Button
                    disabled={!QUESTION_STEPS_VALIDATORS.isStep2Valid(activity)}
                    onClick={() => router.push('/poser-une-question/3')}
                    label={tCommon('Étape suivante')}
                    rightIcon={<ChevronRightIcon />}
                    color="primary"
                />
            </div>
        </PageContainer>
    );
}
