'use client';

import { ActivityCard } from '@frontend/components/activities/ActivityCard';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { UserContext } from '@frontend/contexts/userContext';
import { VillageContext } from '@frontend/contexts/villageContext';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import type { Activity } from '@server/database/schemas/activities';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';
import useSWR from 'swr';

import styles from './page.module.css';

export default function PoserUneQuestionStep1() {
    const t = useExtracted('app.(1village).(activities).poser-une-question.1');
    const tCommon = useExtracted('common');

    const router = useRouter();

    const { village, usersMap } = useContext(VillageContext);
    const { onCreateActivity } = useContext(ActivityContext);
    const { user } = useContext(UserContext);

    const isPelico = user.role === 'admin' || user.role === 'mediator';

    const { data: allQuestionActivities = [] } = useSWR<Activity[]>(
        village
            ? `/api/activities${serializeToQueryUrl({
                  villageId: village.id,
                  type: ['question'],
              })}`
            : null,
        jsonFetcher,
        {
            keepPreviousData: true,
        },
    );

    const questionActivities = allQuestionActivities.filter((a) => a.userId !== user.id);

    const goToNextStep = () => {
        onCreateActivity('question', isPelico, { questions: [{ id: 1, text: '' }] });
        router.push('/poser-une-question/2');
    };

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: t('Les questions'), href: '/poser-une-question/1' },
                    { label: t('Poser ses questions'), href: '/poser-une-question/2' },
                    { label: tCommon('Pré-visualiser'), href: '/poser-une-question/3' },
                ]}
                activeStep={1}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t('Les questions déjà posées')}
            </Title>
            <p>
                {t(
                    'Vous trouverez ici les questions qui ont été posées par les pélicopains. Si vous vous posez la même question que certains, vous pouvez cliquer sur "Je me pose la question."',
                )}
            </p>
            {questionActivities.length === 0 ? (
                <p className={styles.card}>
                    <strong>{t("Aucune question n'a été posée dans votre village monde, soyez la première classe à poser une question !")}</strong>
                </p>
            ) : (
                <div className={styles.mainContainer}>
                    {questionActivities.map((activity, index) => (
                        <ActivityCard key={index} activity={activity} user={usersMap[activity.userId]} hasActions shouldDisableButtons={true} />
                    ))}
                </div>
            )}
            <div className={styles.buttonContainer}>
                <Button onClick={goToNextStep} color="primary" label={tCommon('Étape suivante')} rightIcon={<ChevronRightIcon />} />
            </div>
        </PageContainer>
    );
}
