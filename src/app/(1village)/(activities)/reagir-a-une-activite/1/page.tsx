'use client';

import { useActivityCardTitle } from '@frontend/components/activities/activities-constants';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { UserContext } from '@frontend/contexts/userContext';
import { VillageContext } from '@frontend/contexts/villageContext';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { Activity } from '@server/database/schemas/activities';
import { useExtracted } from 'next-intl';
import { useContext, useMemo } from 'react';
import useSWR from 'swr';

import { ActivitySelectorButton } from './ActivitySelectorButton/ActivitySelectorButton';
import styles from './page.module.css';

export default function ReagirAUneActiviteStep1() {
    const t = useExtracted('app.(1village).(activities).reagir-a-une-activite.1');
    const { activity, setActivity } = useContext(ActivityContext);
    const { village } = useContext(VillageContext);
    const { classroom } = useContext(UserContext);

    const { data: activities } = useSWR<Activity[]>(
        village?.id ? `/api/activities${serializeToQueryUrl({ villageId: village.id })}` : null,
        jsonFetcher,
    );

    const activityTypes = [...new Set(activities?.map((a) => a.type))];
    const getActivityCardTitle = useActivityCardTitle();

    const activitiesFromOtherClassrooms = useMemo(() => {
        return activities?.filter((a) => a.classroomId !== classroom?.id);
    }, [activities, classroom?.id]);

    const activitiesByType = useMemo(() => {
        return activitiesFromOtherClassrooms?.reduce(
            (acc, a) => {
                acc[a.type] = [...(acc[a.type] || []), a];
                return acc;
            },
            {} as Record<string, Activity[]>,
        );
    }, [activitiesFromOtherClassrooms]);

    if (!activity || activity.type !== 'reaction') {
        return null;
    }

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: t('Activité'), href: '/reagir-a-une-activite/1' },
                    { label: t('Réaction'), href: '/reagir-a-une-activite/2' },
                    { label: t('Pré-visualiser'), href: '/reagir-a-une-activite/3' },
                ]}
                activeStep={1}
                marginBottom="xl"
            />
            <Title variant="h2" marginBottom="md">
                {t('Reagir à une activité')}
            </Title>
            <p>{t('Quand un simple texte ne suffit plus, vous pouvez réagir à une activité déjà publiée par vos pélicopains.')}</p>
            <div className={styles.activityButtonsContainer}>
                {activityTypes.map((type) => {
                    const activityCardTitle = getActivityCardTitle(type);
                    const label = activityCardTitle.substring(activityCardTitle.indexOf(' ') + 1);
                    return (
                        <ActivitySelectorButton
                            key={type}
                            activity={activity}
                            setActivity={setActivity}
                            title={t('Réagir à') + ' ' + label}
                            activitiesToReact={activitiesByType?.[type]}
                        />
                    );
                })}
            </div>
        </PageContainer>
    );
}
