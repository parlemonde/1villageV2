'use client';

import { ActivityCard } from '@frontend/components/activities/ActivityCard';
import type { ActivityFiltersState } from '@frontend/components/activities/ActivityFilters/ActivityFilters';
import { ActivityFilters } from '@frontend/components/activities/ActivityFilters/ActivityFilters';
import { BackButton } from '@frontend/components/activities/BackButton/BackButton';
import { Button } from '@frontend/components/ui/Button';
import { CircularProgress } from '@frontend/components/ui/CircularProgress';
import { RadioGroup } from '@frontend/components/ui/Form/RadioGroup';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { FamilyContext } from '@frontend/contexts/familyContext';
import { VillageContext } from '@frontend/contexts/villageContext';
import { getClassroomFromMap } from '@lib/get-classroom';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import { ChevronRightIcon, EyeNoneIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import type { Activity } from '@server/database/schemas/activities';
import classNames from 'clsx';
import { useExtracted } from 'next-intl';
import { useContext, useState } from 'react';
import useSWR from 'swr';

import styles from './page.module.css';

export default function FamillesStep1() {
    const t = useExtracted('app.(1village).familles.1');
    const tCommon = useExtracted('common');

    const { village, usersMap, classroomsMap } = useContext(VillageContext);
    const { form, setActivitiesVisibility } = useContext(FamilyContext);

    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState<ActivityFiltersState>({
        activityTypes: [], // Empty array -> all activity types
        countries: village?.countries ?? [],
        isPelico: true,
        search: '',
    });

    const toggleVisibility = async (activityId: number) => {
        const serverValue = activities?.find((a) => a.id === activityId)?.isHidden;
        const currentValue = form.activityVisibilityMap[activityId] ?? serverValue ?? false;
        await setActivitiesVisibility({
            activityVisibilityMap: {
                ...form.activityVisibilityMap,
                [activityId]: !currentValue,
            },
        });
    };

    const toggleGlobalVisibility = async (value: string) => {
        setIsLoading(true);
        await setActivitiesVisibility({
            showOnlyClassroomActivities: value === 'true',
        });
        await mutate();
        setIsLoading(false);
    };

    const { data: activities, mutate } = useSWR<(Activity & { isHidden: boolean })[]>(
        village
            ? `/api/activities${serializeToQueryUrl({
                  villageId: village.id,
                  countries: filters.countries,
                  isPelico: filters.isPelico,
                  search: filters.search,
                  type: filters.activityTypes,
                  visibility: 'all',
              })}`
            : null,
        jsonFetcher,
    );

    const mergedActivities = activities?.map((a) => ({
        ...a,
        isHidden: form.activityVisibilityMap[a.id] ?? a.isHidden,
    }));

    return (
        <PageContainer>
            <BackButton href="/" />
            <Steps
                steps={[
                    { label: t('Visibilité'), href: '/familles/1' },
                    { label: t('Ajout enfants'), href: '/familles/2' },
                    { label: t('Communication'), href: '/familles/3' },
                    { label: t('Gestion'), href: '/familles/4' },
                ]}
                activeStep={1}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                <p>{t('Choisissez parmi ces 2 options')}</p>
            </Title>
            <RadioGroup
                options={[
                    { label: t('Les familles peuvent voir toutes les activités publiées sur 1Village'), value: 'false' },
                    { label: t('Les familles ne peuvent voir que les activités publiées par notre classe'), value: 'true' },
                ]}
                value={`${form.showOnlyClassroomActivities}`}
                onChange={(value) => toggleGlobalVisibility(value)}
                marginBottom="md"
            />
            <div className={styles.buttonContainer}>
                <Button
                    as="a"
                    color="primary"
                    href="/familles/2"
                    label={tCommon('Étape suivante')}
                    rightIcon={<ChevronRightIcon />}
                    marginBottom="md"
                />
            </div>
            <p className={styles.marginBottom}>{t('Vous pouvez également choisir individuellement la visibilité des activités déjà publiées :')}</p>
            <ActivityFilters filters={filters} setFilters={setFilters} />
            <div className={styles.activities}>
                {mergedActivities?.map((activity) => (
                    <div key={activity.id} className={styles.visibilityToggle} onClick={() => toggleVisibility(activity.id)}>
                        {activity.isHidden ? <EyeNoneIcon width="40px" height="40px" /> : <EyeOpenIcon width="40px" height="40px" />}

                        <div
                            className={classNames(styles.cardWrapper, {
                                [styles.grayOverlay]: activity.isHidden,
                            })}
                        >
                            <ActivityCard
                                activity={activity}
                                user={usersMap[activity.userId]}
                                classroom={getClassroomFromMap(classroomsMap, activity.classroomId)}
                                shouldDisableButtons
                            />
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className={styles.loader}>
                        <CircularProgress />
                    </div>
                )}
            </div>
        </PageContainer>
    );
}
