'use client';

import { CountryFlag } from '@frontend/components/CountryFlag';
import { VillageContext } from '@frontend/contexts/villageContext';
import PelicoNeutreIcon from '@frontend/svg/pelico/pelico-neutre.svg';
import * as Checkbox from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';
import type { ActivityType } from '@server/database/schemas/activities';
import React, { useContext, useMemo } from 'react';

import styles from './ActivityFilters.module.css';
import { ActivityTypeSelect } from './ActivityTypeSelect';

export interface ActivityFiltersState {
    activityTypes: ActivityType[];
    isPelico: boolean | null;
    searchQuery: string;
    selectedCountries: string[];
}

interface ActivityFiltersProps {
    filters: ActivityFiltersState;
    onActivityTypeToggle: (type: ActivityType) => void;
    onActivityTypeSelectAll: () => void;
    onPelicoToggle: () => void;
    onSearchChange: (query: string) => void;
    onCountryToggle: (country: string) => void;
}

const ActivityFiltersComponent = ({
    filters,
    onActivityTypeToggle,
    onActivityTypeSelectAll,
    onPelicoToggle,
    onSearchChange,
    onCountryToggle,
}: ActivityFiltersProps) => {
    const { village } = useContext(VillageContext);

    const pelicoIcon = useMemo(() => <PelicoNeutreIcon className={styles.pelicoIcon} />, []);

    return (
        <div className={styles.filtersContainer}>
            <span className={styles.filtersLabel}>Filtres :</span>

            <ActivityTypeSelect selectedTypes={filters.activityTypes} onToggle={onActivityTypeToggle} onSelectAllToggle={onActivityTypeSelectAll} />

            {/* Country and Pelico Filters */}
            {village && village.countries.length > 0 && (
                <div className={styles.filterGroup}>
                    {village.countries.map((country) => (
                        <label key={country} className={styles.filterItem} title={country}>
                            <Checkbox.Root
                                checked={filters.selectedCountries.includes(country)}
                                onCheckedChange={() => onCountryToggle(country)}
                                className={styles.checkboxRoot}
                            >
                                <Checkbox.Indicator className={styles.checkboxIndicator}>
                                    <CheckIcon />
                                </Checkbox.Indicator>
                            </Checkbox.Root>
                            <span className={styles.iconLabel}>
                                <CountryFlag country={country} size="medium" />
                            </span>
                        </label>
                    ))}

                    {/* isPelico Filter */}
                    <label
                        className={styles.filterItem}
                        title={filters.isPelico === true ? 'Toutes les activités (avec et sans Pélico)' : 'Activités sans Pélico uniquement'}
                    >
                        <Checkbox.Root checked={filters.isPelico === true} onCheckedChange={onPelicoToggle} className={styles.checkboxRoot}>
                            <Checkbox.Indicator className={styles.checkboxIndicator}>
                                <CheckIcon />
                            </Checkbox.Indicator>
                        </Checkbox.Root>
                        <span className={styles.iconLabel}>{pelicoIcon}</span>
                    </label>
                </div>
            )}

            {/* Search Input */}
            <input
                type="text"
                placeholder="Rechercher"
                value={filters.searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className={styles.searchInput}
            />
        </div>
    );
};

export const ActivityFilters = React.memo(ActivityFiltersComponent);
