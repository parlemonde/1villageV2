'use client';

import { Input } from '@frontend/components/ui/Form';
import type { ActivityType } from '@server/database/schemas/activity-types';

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
    setFilters: (filters: ActivityFiltersState) => void;
}
export const ActivityFilters = ({ filters, setFilters }: ActivityFiltersProps) => {
    return (
        <div className={styles.activityFilters}>
            <span className={styles.filtersLabel}>Filtres :</span>
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
                    setFilters({
                        ...filters,
                        countries,
                    });
                }}
                setIsPelico={(isPelico) => {
                    setFilters({
                        ...filters,
                        isPelico,
                    });
                }}
            />
            <span style={{ flex: '1 1 300px' }}>
                <Input
                    isFullWidth
                    placeholder="Rechercher"
                    size="sm"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
            </span>
        </div>
    );
};
