'use client';

import { Input } from '@frontend/components/ui/Form';
import type { ActivityType } from '@server/database/schemas/activity-types';
import { useExtracted } from 'next-intl';
import React from 'react';

import { ActivityCountriesSelect } from './ActivityCountriesSelect/ActivityCountriesSelect';
import { ActivityTypeSelect } from './ActivityTypeSelect/ActivityTypeSelect';
import styles from './activity-filters.module.css';

export interface ActivityFiltersState {
    activityTypes: ActivityType[];
    countries: string[];
    isPelico: boolean;
    search: string;
}

interface ActivityFiltersProps {
    filters: ActivityFiltersState;
    setFilters: React.Dispatch<React.SetStateAction<ActivityFiltersState>>;
}
export const ActivityFilters = ({ filters, setFilters }: ActivityFiltersProps) => {
    const t = useExtracted('ActivityFilters');
    return (
        <div className={styles.activityFilters}>
            <span className={styles.filtersLabel}>{t('Filtres :')}</span>
            <ActivityTypeSelect
                selectedTypes={filters.activityTypes}
                setSelectedTypes={(activityTypes) => {
                    setFilters({
                        ...filters,
                        activityTypes,
                    });
                }}
            />
            <ActivityCountriesSelect
                selectedCountries={filters.countries}
                isPelico={filters.isPelico}
                setSelectedCountries={(countries) => {
                    setFilters((prev) => ({
                        ...prev,
                        countries,
                    }));
                }}
                setIsPelico={(isPelico) => {
                    setFilters((prev) => ({
                        ...prev,
                        isPelico,
                    }));
                }}
            />
            <span style={{ flex: '1 1 300px' }}>
                <Input
                    isFullWidth
                    placeholder={t('Rechercher')}
                    size="sm"
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                />
            </span>
        </div>
    );
};
