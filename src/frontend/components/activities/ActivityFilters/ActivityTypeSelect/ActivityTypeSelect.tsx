'use client';

import { useActivityName } from '@frontend/components/activities/activities-constants';
import { Dropdown } from '@frontend/components/ui/Dropdown';
import { VillageContext } from '@frontend/contexts/villageContext';
import { usePhase } from '@frontend/hooks/usePhase';
import ArrowDownIcon from '@frontend/svg/arrowDown.svg';
import CheckedIcon from '@frontend/svg/checkedIcon.svg';
import UncheckedIcon from '@frontend/svg/uncheckedIcon.svg';
import { jsonFetcher } from '@lib/json-fetcher';
import type { ActivityType } from '@server/database/schemas/activity-types';
import classNames from 'clsx';
import { useExtracted } from 'next-intl';
import { DropdownMenu } from 'radix-ui';
import React, { useContext } from 'react';
import useSWR from 'swr';

import styles from './activity-type-select.module.css';

interface ActivityTypeSelectProps {
    selectedTypes: ActivityType[];
    setSelectedTypes: (types: ActivityType[]) => void;
}
export const ActivityTypeSelect = ({ selectedTypes, setSelectedTypes }: ActivityTypeSelectProps) => {
    const t = useExtracted('common');
    const { village } = useContext(VillageContext);
    const [phase] = usePhase();
    const { data: availableTypesForPhase = [] } = useSWR<ActivityType[]>(
        village !== undefined && phase !== null ? `/api/activities/types?phase=${phase}` : null,
        jsonFetcher,
        {
            keepPreviousData: true,
        },
    );

    // Always include the "libre" type in the available types.
    const availableTypes = React.useMemo<ActivityType[]>(
        () => (!availableTypesForPhase.includes('libre') ? ['libre', ...availableTypesForPhase] : availableTypesForPhase),
        [availableTypesForPhase],
    );

    const selectedTypesSet = new Set(selectedTypes);
    const areAllTypesSelected = availableTypes.every((type) => selectedTypesSet.has(type));
    const showAllAsSelected = areAllTypesSelected || selectedTypesSet.size === 0;

    // Update selected types when available types change. (village or phase changed.)
    const previousAvailableTypes = React.useRef(availableTypes);
    React.useEffect(() => {
        const availableTypesSet = new Set(availableTypes);
        const extraTypes = selectedTypes.filter((type) => !availableTypesSet.has(type));
        if (previousAvailableTypes.current.join(',') !== availableTypes.join(',')) {
            setSelectedTypes([]); // Reset to all.
        } else if (extraTypes.length > 0) {
            setSelectedTypes(selectedTypes.filter((type) => availableTypesSet.has(type)));
        }

        previousAvailableTypes.current = availableTypes;
    }, [availableTypes, selectedTypes, setSelectedTypes]);

    const { getActivityName } = useActivityName();

    return (
        <Dropdown
            trigger={
                <button className={styles.trigger}>
                    <span>{t('Activités :')}</span>
                    <span className={styles.chipsContainer}>
                        {showAllAsSelected ? (
                            <span className={styles.chip}>{t('Toutes')}</span>
                        ) : (
                            <>
                                {selectedTypes.slice(0, 2).map((type) => (
                                    <span key={type} className={styles.chip}>
                                        {getActivityName(type)}
                                    </span>
                                ))}
                                {selectedTypes.length > 2 && <span className={styles.chip}>+{selectedTypes.length - 2}</span>}
                            </>
                        )}
                    </span>
                    <ArrowDownIcon className={styles.icon} />
                </button>
            }
            offset={1}
            align="center"
            disableShadow
            disableAnimation
            contentClassName={styles.content}
        >
            <DropdownMenu.CheckboxItem
                className={styles.item}
                onSelect={(e) => e.preventDefault()}
                checked={showAllAsSelected}
                onCheckedChange={() => setSelectedTypes([])}
            >
                {showAllAsSelected ? (
                    <DropdownMenu.ItemIndicator className={styles.checkboxIndicator}>
                        <CheckedIcon className={classNames(styles.checkbox, styles.checked)} />
                    </DropdownMenu.ItemIndicator>
                ) : (
                    <span className={styles.checkboxIndicator}>
                        <UncheckedIcon className={styles.checkbox} />
                    </span>
                )}
                {t('Toutes')}
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.Separator className={styles.separator} />
            {availableTypes.map((type) => (
                <DropdownMenu.CheckboxItem
                    key={type}
                    className={styles.item}
                    onSelect={(e) => e.preventDefault()}
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={() => {
                        const newSelectedTypesSet = new Set(selectedTypesSet);
                        if (newSelectedTypesSet.has(type)) {
                            newSelectedTypesSet.delete(type);
                        } else {
                            newSelectedTypesSet.add(type);
                        }
                        setSelectedTypes(Array.from(newSelectedTypesSet));
                    }}
                >
                    {selectedTypes.includes(type) ? (
                        <DropdownMenu.ItemIndicator className={styles.checkboxIndicator}>
                            {' '}
                            <CheckedIcon className={classNames(styles.checkbox, styles.checked)} />
                        </DropdownMenu.ItemIndicator>
                    ) : (
                        <span className={styles.checkboxIndicator}>
                            <UncheckedIcon className={styles.checkbox} />
                        </span>
                    )}
                    {getActivityName(type)}
                </DropdownMenu.CheckboxItem>
            ))}
        </Dropdown>
    );
};
