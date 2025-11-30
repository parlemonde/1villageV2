'use client';

import { Dropdown } from '@frontend/components/ui/Dropdown';
import ArrowDownIcon from '@frontend/svg/arrowDown.svg';
import CheckedIcon from '@frontend/svg/checkedIcon.svg';
import UncheckedIcon from '@frontend/svg/uncheckedIcon.svg';
import type { ActivityType } from '@server/database/schemas/activities';
import { ACTIVITY_TYPES_ENUM } from '@server/database/schemas/activities';
import classNames from 'clsx';
import { DropdownMenu } from 'radix-ui';
import React from 'react';

import styles from './activity-type-select.module.css';

const ACTIVITY_TYPES_MAP: Record<ActivityType, string> = {
    libre: 'Contenu Libre',
    jeu: 'Jeu',
    enigme: 'Enigme',
};

interface ActivityTypeSelectProps {
    selectedTypes: ActivityType[];
    setSelectedTypes: (types: ActivityType[]) => void;
}
export const ActivityTypeSelect = ({ selectedTypes, setSelectedTypes }: ActivityTypeSelectProps) => {
    const selectedTypesSet = new Set(selectedTypes);
    const areAllTypesSelected = ACTIVITY_TYPES_ENUM.every((type) => selectedTypesSet.has(type));
    const showAllAsSelected = areAllTypesSelected || selectedTypesSet.size === 0;

    return (
        <Dropdown
            trigger={
                <button className={styles.trigger}>
                    <span>Activités:</span>
                    <span className={styles.chipsContainer}>
                        {showAllAsSelected ? (
                            <span className={styles.chip}>Toutes</span>
                        ) : (
                            <>
                                {selectedTypes.slice(0, 2).map((type) => (
                                    <span key={type} className={styles.chip}>
                                        {ACTIVITY_TYPES_MAP[type]}
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
                Toutes
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.Separator className={styles.separator} />
            {ACTIVITY_TYPES_ENUM.map((type) => (
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

                    {ACTIVITY_TYPES_MAP[type]}
                </DropdownMenu.CheckboxItem>
            ))}
        </Dropdown>
    );
};
