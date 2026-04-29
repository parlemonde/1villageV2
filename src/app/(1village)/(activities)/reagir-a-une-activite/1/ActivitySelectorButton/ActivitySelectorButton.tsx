'use client';

import { isReactionStep1Valid } from '@app/(1village)/(activities)/reagir-a-une-activite/validators';
import { ThemeSelectorButton } from '@frontend/components/ThemeSelectorButton/ThemeSelectorButton';
import { ActivityCard } from '@frontend/components/activities/ActivityCard';
import { Button } from '@frontend/components/ui/Button';
import { Pagination } from '@frontend/components/ui/Pagination/Pagination';
import { VillageContext } from '@frontend/contexts/villageContext';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import type { Activity } from '@server/database/schemas/activities';
import type { ReactionActivityDao } from '@server/database/schemas/activity-types';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext, useState } from 'react';

import styles from './activity-selector-button.module.css';

const ITEMS_PER_PAGE = 5;

interface ActivitySelectorButtonProps {
    activity: Partial<ReactionActivityDao>;
    setActivity: (activity: Partial<ReactionActivityDao>) => void;
    title: string;
    activitiesToReact?: Activity[];
}

export const ActivitySelectorButton = ({ title, activitiesToReact, activity, setActivity }: ActivitySelectorButtonProps) => {
    const t = useExtracted('app.(1village).(activities).reagir-a-une-activite.1.ActivitySelectorButton');
    const [currentPage, setCurrentPage] = useState(1);

    const router = useRouter();

    const { usersMap, classroomsMap } = useContext(VillageContext);

    const selectedActivity = activitiesToReact?.find((a) => a.id === activity.data?.activityId);

    const paginatedActivities = activitiesToReact?.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <ThemeSelectorButton
            isActive={selectedActivity !== undefined && selectedActivity.type === activitiesToReact?.[0].type}
            hasHoverEffect={false}
            title={title}
            dropdownContent={
                <div className={styles.dropdownContent}>
                    <div className={styles.activitiesContainer}>
                        {selectedActivity ? (
                            <ActivityCard
                                activity={selectedActivity}
                                user={usersMap[selectedActivity.userId]}
                                classroom={selectedActivity.classroomId ? classroomsMap[selectedActivity.classroomId] : undefined}
                            />
                        ) : (
                            paginatedActivities?.map((a) => (
                                <div
                                    className={styles.activityContainer}
                                    key={a.id}
                                    onClick={() => setActivity({ ...activity, data: { ...activity.data, activityId: a.id } })}
                                >
                                    <ActivityCard
                                        activity={a}
                                        user={usersMap[a.userId]}
                                        classroom={a.classroomId ? classroomsMap[a.classroomId] : undefined}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                    {activity.data?.activityId ? (
                        <div className={styles.buttons}>
                            <Button
                                color="primary"
                                label={t('Choisir une autre activité')}
                                onClick={() => setActivity({ ...activity, data: { ...activity.data, activityId: undefined } })}
                            />
                            <Button
                                color="primary"
                                label={t('Réagir à cette activité')}
                                rightIcon={<ChevronRightIcon />}
                                onClick={() => router.push('/reagir-a-une-activite/2')}
                                disabled={!isReactionStep1Valid(activity)}
                            />
                        </div>
                    ) : (
                        <div className={styles.paginationContainer}>
                            <Pagination
                                variant="borderless"
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                                totalItems={activitiesToReact?.length ?? 0}
                                itemsPerPage={ITEMS_PER_PAGE}
                            />
                        </div>
                    )}
                </div>
            }
        />
    );
};
