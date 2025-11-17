'use client';

import * as Checkbox from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';
import type { ActivityType } from '@server/database/schemas/activities';
import { ACTIVITY_TYPES_ENUM } from '@server/database/schemas/activities';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CountryFlag } from '@frontend/components/CountryFlag';
import { VillageContext } from '@frontend/contexts/villageContext';
import PelicoReflechit from '@frontend/svg/pelico/pelico-reflechit.svg';
import styles from './ActivityFilters.module.css';
import { ActivityTypeSelect } from './ActivityTypeSelect';

export interface ActivityFiltersState {
    activityTypes: ActivityType[];
    isPelico: boolean | null;
    searchQuery: string;
    selectedCountries: string[];
}

interface ActivityFiltersProps {
    onFiltersChange?: (filters: ActivityFiltersState) => void;
}

const ActivityFiltersComponent = ({ onFiltersChange }: ActivityFiltersProps) => {
    const { village } = useContext(VillageContext);
    const [filters, setFilters] = useState<ActivityFiltersState>({
        activityTypes: [],
        isPelico: true,
        searchQuery: '',
        selectedCountries: village?.countries ?? [],
    });

    // Sync selected countries when village changes
    useEffect(() => {
        if (village?.countries) {
            setFilters((prev) => ({
                ...prev,
                selectedCountries: village.countries,
            }));
        }
    }, [village?.countries]);

    const handleActivityTypeToggle = useCallback(
        (type: ActivityType) => {
            setFilters((prev) => {
                const newTypes = prev.activityTypes.includes(type) ? prev.activityTypes.filter((t) => t !== type) : [...prev.activityTypes, type];
                const newFilters = { ...prev, activityTypes: newTypes };
                onFiltersChange?.(newFilters);
                return newFilters;
            });
        },
        [onFiltersChange],
    );

    const handleActivityTypeSelectAll = useCallback(() => {
        setFilters((prev) => {
            const allSelected = prev.activityTypes.length === ACTIVITY_TYPES_ENUM.length;
            const newTypes = allSelected ? [] : [...ACTIVITY_TYPES_ENUM];
            const newFilters = { ...prev, activityTypes: newTypes };
            onFiltersChange?.(newFilters);
            return newFilters;
        });
    }, [onFiltersChange]);

    const handlePelicoToggle = useCallback(() => {
        setFilters((prev) => {
            const newValue = prev.isPelico === true ? null : true;
            const newFilters = { ...prev, isPelico: newValue };
            onFiltersChange?.(newFilters);
            return newFilters;
        });
    }, [onFiltersChange]);

    const handleSearchChange = useCallback(
        (query: string) => {
            setFilters((prev) => {
                const newFilters = { ...prev, searchQuery: query };
                onFiltersChange?.(newFilters);
                return newFilters;
            });
        },
        [onFiltersChange],
    );

    const handleCountryToggle = useCallback(
        (country: string) => {
            setFilters((prev) => {
                const newCountries = prev.selectedCountries.includes(country)
                    ? prev.selectedCountries.filter((c) => c !== country)
                    : [...prev.selectedCountries, country];
                const newFilters = { ...prev, selectedCountries: newCountries };
                onFiltersChange?.(newFilters);
                return newFilters;
            });
        },
        [onFiltersChange],
    );

    const pelicoIcon = useMemo(() => <PelicoReflechit className={styles.pelicoIcon} />, []);

    return (
        <div className={styles.filtersContainer}>
            <span className={styles.filtersLabel}>Filtres :</span>

            <ActivityTypeSelect
                selectedTypes={filters.activityTypes}
                onToggle={handleActivityTypeToggle}
                onSelectAllToggle={handleActivityTypeSelectAll}
            />

            {/* Country Filters */}
            {village && village.countries.length > 0 && (
                <div className={styles.countryFilters}>
                    {village.countries.map((country) => (
                        <label key={country} className={styles.filterCheckbox} title={country}>
                            <Checkbox.Root
                                checked={filters.selectedCountries.includes(country)}
                                onCheckedChange={() => handleCountryToggle(country)}
                                className={styles.checkboxRoot}
                            >
                                <Checkbox.Indicator className={styles.checkboxIndicator}>
                                    <CheckIcon />
                                </Checkbox.Indicator>
                            </Checkbox.Root>
                            <span className={styles.iconLabel}>
                                <CountryFlag country={country} size="small" />
                            </span>
                        </label>
                    ))}
                </div>
            )}

            {/* isPelico Filter */}
            <label
                className={styles.filterCheckbox}
                title={filters.isPelico === true ? 'Toutes les activités' : 'Activités avec Pélico'}
            >
                <Checkbox.Root
                    checked={filters.isPelico === true}
                    onCheckedChange={handlePelicoToggle}
                    className={styles.checkboxRoot}
                >
                    <Checkbox.Indicator className={styles.checkboxIndicator}>
                        <CheckIcon />
                    </Checkbox.Indicator>
                </Checkbox.Root>
                <span className={styles.iconLabel}>{pelicoIcon}</span>
            </label>

            {/* Search Input */}
            <input
                type="text"
                placeholder="Rechercher"
                value={filters.searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className={styles.searchInput}
            />
        </div>
    );
};

export const ActivityFilters = React.memo(ActivityFiltersComponent);
