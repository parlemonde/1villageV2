'use client';

import { ActivityCard } from '@frontend/components/activities/ActivityCard';
import { VillageContext } from '@frontend/contexts/villageContext';
import { usePhase } from '@frontend/hooks/usePhase';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { Activity } from '@server/database/schemas/activities';
import type { Village } from '@server/database/schemas/villages';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

import { ActivityFilters, type ActivityFiltersState } from './ActivityFilters';

const activitiesContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
};

const ActivitiesComponent = () => {
    const { village, usersMap, classroomsMap } = useContext(VillageContext);
    const [phase] = usePhase();
    const [filters, setFilters] = useState<ActivityFiltersState>({
        activityTypes: [],
        isPelico: true,
        searchQuery: '',
        selectedCountries: village?.countries ?? [],
    });

    const handleFiltersChange = useCallback((newFilters: ActivityFiltersState) => {
        setFilters(newFilters);
    }, []);
    const { data: activities } = useSWR<Activity[]>(
        village
            ? `/api/activities${serializeToQueryUrl({
                  phase,
                  villageId: village.id,
              })}`
            : null,
        jsonFetcher,
    );
    const { data: villages } = useSWR<Village[]>('/api/villages', jsonFetcher);

    const villagesMap = useMemo(() => {
        if (!villages) return {};
        return Object.fromEntries(villages.map((v) => [v.id, v]));
    }, [villages]);

    const selectedCountriesSet = useMemo(() => new Set(filters.selectedCountries), [filters.selectedCountries]);

    const searchQuery = useMemo(() => filters.searchQuery.toLowerCase(), [filters.searchQuery]);

    const filteredActivities = useMemo(() => {
        if (!activities) return [];

        return activities.filter((activity) => {
            // Filter by activity type (multi-select)
            if (filters.activityTypes.length > 0 && !filters.activityTypes.includes(activity.type)) {
                return false;
            }

            // Filter by selected countries (based on classroom countryCode)
            if (selectedCountriesSet.size > 0) {
                if (activity.classroomId === null) {
                    // Global activities (no classroom) are always included
                    return true;
                }

                const classroom = classroomsMap[activity.classroomId];
                if (!classroom) {
                    return false;
                }

                // Check if classroom's countryCode matches selected countries
                if (!selectedCountriesSet.has(classroom.countryCode)) {
                    return false;
                }
            }

            // Filter by isPelico
            if (filters.isPelico === true && !activity.isPelico) {
                return false;
            }

            // Filter by search query
            if (searchQuery) {
                const activityData = activity.data as Record<string, unknown>;
                const title = (activityData?.title as string | undefined)?.toLowerCase() ?? '';
                const resume = (activityData?.resume as string | undefined)?.toLowerCase() ?? '';
                if (!title.includes(searchQuery) && !resume.includes(searchQuery)) {
                    return false;
                }
            }

            return true;
        });
    }, [activities, filters.activityTypes, filters.isPelico, searchQuery, selectedCountriesSet, village, villagesMap]);

    return (
        <div>
            <ActivityFilters onFiltersChange={handleFiltersChange} />
            <div style={activitiesContainerStyle}>
                {filteredActivities?.map((activity) => (
                    <ActivityCard
                        key={activity.id}
                        activity={activity}
                        user={usersMap[activity.userId]}
                        classroom={activity.classroomId !== null ? classroomsMap[activity.classroomId] : undefined}
                    />
                ))}
            </div>
        </div>
    );
};

export const Activities = React.memo(ActivitiesComponent);
