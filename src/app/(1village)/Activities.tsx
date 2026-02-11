'use client';

import { ActivityCard } from '@frontend/components/activities/ActivityCard';
import { ActivityFilters, type ActivityFiltersState } from '@frontend/components/activities/ActivityFilters/ActivityFilters';
import { Field } from '@frontend/components/ui/Form/Field';
import { Select } from '@frontend/components/ui/Form/Select';
import { Pagination } from '@frontend/components/ui/Pagination/Pagination';
import { VillageContext } from '@frontend/contexts/villageContext';
import { usePhase } from '@frontend/hooks/usePhase';
import { getClassroomFromMap } from '@lib/get-classroom';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { Activity } from '@server/database/schemas/activities';
import { useExtracted } from 'next-intl';
import { useContext, useState } from 'react';
import useSWR from 'swr';

import styles from './activities.module.css';

const STEP_ITEMS_PAGE = 5;

export const Activities = () => {
    const { village, usersMap, classroomsMap } = useContext(VillageContext);
    const [phase] = usePhase();
    const t = useExtracted('app.(1village)');
    const [filters, setFilters] = useState<ActivityFiltersState>({
        activityTypes: [], // Empty array -> all activity types
        countries: village?.countries ?? [],
        isPelico: true,
        search: '',
    });
    const [itemsPerPage, setItemsPerPage] = useState(STEP_ITEMS_PAGE);
    const [currentPage, setCurrentPage] = useState(1);

    const { data: activities } = useSWR<Activity[]>(
        village
            ? `/api/activities${serializeToQueryUrl({
                  phase,
                  villageId: village.id,
                  countries: filters.countries,
                  isPelico: filters.isPelico,
                  search: filters.search,
                  type: filters.activityTypes,
              })}`
            : null,
        jsonFetcher,
        {
            keepPreviousData: true,
        },
    );

    return (
        <div>
            <ActivityFilters filters={filters} setFilters={setFilters} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activities?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((activity) => (
                    <ActivityCard
                        key={activity.id}
                        activity={activity}
                        user={usersMap[activity.userId]}
                        classroom={getClassroomFromMap(classroomsMap, activity.classroomId)}
                    />
                ))}
            </div>
            <div className={styles.paginationContainer}>
                <Field
                    className={styles.itemsPerPageLabel}
                    label={t('Activités par page')}
                    name="nbItemsPerPage"
                    input={
                        <Select
                            id="nbItemsPerPage"
                            options={[
                                { label: STEP_ITEMS_PAGE * 1, value: (STEP_ITEMS_PAGE * 1).toString() },
                                { label: STEP_ITEMS_PAGE * 2, value: (STEP_ITEMS_PAGE * 2).toString() },
                                { label: STEP_ITEMS_PAGE * 4, value: (STEP_ITEMS_PAGE * 4).toString() },
                                { label: STEP_ITEMS_PAGE * 10, value: (STEP_ITEMS_PAGE * 10).toString() },
                            ]}
                            size="sm"
                            value={itemsPerPage.toString()}
                            className={styles.itemsPerPageSelect}
                            margin={'sm'}
                            onChange={(value) => {
                                setCurrentPage(1);
                                setItemsPerPage(parseInt(value));
                            }}
                        ></Select>
                    }
                ></Field>
                <Pagination
                    totalItems={activities?.length ?? 0}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={(page) => setCurrentPage(page)}
                />
            </div>
        </div>
    );
};
