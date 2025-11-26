'use client';

import { ActivityCard } from '@frontend/components/activities/ActivityCard';
import { VillageContext } from '@frontend/contexts/villageContext';
import { usePhase } from '@frontend/hooks/usePhase';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { Activity, ActivityType } from '@server/database/schemas/activities';
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

    const handleActivityTypeToggle = useCallback((type: ActivityType) => {
        setFilters((prev) => ({
            ...prev,
            activityTypes: prev.activityTypes.includes(type) ? prev.activityTypes.filter((t) => t !== type) : [...prev.activityTypes, type],
        }));
    }, []);

    const handleActivityTypeSelectAll = useCallback(() => {
        setFilters((prev) => ({
            ...prev,
            activityTypes: [],
        }));
    }, []);

    const handlePelicoToggle = useCallback(() => {
        setFilters((prev) => ({
            ...prev,
            isPelico: prev.isPelico === true ? null : true,
        }));
    }, []);

    const handleSearchChange = useCallback((query: string) => {
        setFilters((prev) => ({
            ...prev,
            searchQuery: query,
        }));
    }, []);

    const handleCountryToggle = useCallback((country: string) => {
        setFilters((prev) => ({
            ...prev,
            selectedCountries: prev.selectedCountries.includes(country)
                ? prev.selectedCountries.filter((c) => c !== country)
                : [...prev.selectedCountries, country],
        }));
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
            if (selectedCountriesSet.size > 0 && activity.classroomId !== null) {
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
            // When unchecked (null): show only non-Pelico activities
            // When checked (true): show all activities (both Pelico and non-Pelico)
            if (filters.isPelico !== true && activity.isPelico) {
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
    }, [activities, filters.activityTypes, filters.isPelico, searchQuery, selectedCountriesSet, classroomsMap]);

    return (
        <div>
            <ActivityFilters
                filters={filters}
                onActivityTypeToggle={handleActivityTypeToggle}
                onActivityTypeSelectAll={handleActivityTypeSelectAll}
                onPelicoToggle={handlePelicoToggle}
                onSearchChange={handleSearchChange}
                onCountryToggle={handleCountryToggle}
            />
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
