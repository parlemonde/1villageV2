'use client';

import * as Checkbox from '@radix-ui/react-checkbox';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { CheckIcon } from '@radix-ui/react-icons';
import type { ActivityType } from '@server/database/schemas/activities';
import { ACTIVITY_TYPES_ENUM } from '@server/database/schemas/activities';
import React, { useCallback, useMemo, useState } from 'react';

import styles from './ActivityTypeSelect.module.css';

interface ActivityTypeSelectProps {
    selectedTypes: ActivityType[];
    onToggle: (type: ActivityType) => void;
    onSelectAllToggle?: () => void;
}

const ActivityTypeSelectComponent = ({ selectedTypes, onToggle, onSelectAllToggle }: ActivityTypeSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const allSelected = useMemo(() => selectedTypes.length === ACTIVITY_TYPES_ENUM.length, [selectedTypes.length]);
    const showAllAsSelected = useMemo(() => selectedTypes.length === 0, [selectedTypes.length]);

    const handleToutesClick = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (onSelectAllToggle) {
                onSelectAllToggle();
            } else {
                // Fallback: If all are selected, deselect all; if some/none selected, select all
                if (allSelected) {
                    selectedTypes.forEach((type) => onToggle(type));
                } else {
                    // Select all missing types
                    ACTIVITY_TYPES_ENUM.forEach((type) => {
                        if (!selectedTypes.includes(type)) {
                            onToggle(type);
                        }
                    });
                }
            }
        },
        [onSelectAllToggle, allSelected, selectedTypes, onToggle],
    );

    const handleOptionClick = useCallback(
        (type: ActivityType) => (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle(type);
        },
        [onToggle],
    );

    const chips = useMemo(
        () =>
            selectedTypes.slice(0, 2).map((type) => (
                <span key={type} className={styles.chip}>
                    {type}
                </span>
            )),
        [selectedTypes],
    );

    const triggerContent = useMemo(() => {
        return (
            <>
                <span>Activités:</span>
                <div className={styles.chipsContainer}>
                    {selectedTypes.length === 0 || allSelected ? (
                        <span className={styles.chip}>Toutes</span>
                    ) : (
                        <>
                            {chips}
                            {selectedTypes.length > 2 && <span className={styles.chipMore}>+{selectedTypes.length - 2}</span>}
                        </>
                    )}
                </div>
            </>
        );
    }, [selectedTypes.length, allSelected, chips]);

    return (
        <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenu.Trigger className={styles.trigger}>
                {triggerContent}
                <span className={styles.icon}>▼</span>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content className={styles.content} side="bottom" align="start">
                    <DropdownMenu.Item className={styles.item} onSelect={(e) => e.preventDefault()} onClick={handleToutesClick}>
                        <Checkbox.Root checked={showAllAsSelected || allSelected} className={styles.checkboxRoot}>
                            <Checkbox.Indicator className={styles.checkboxIndicator}>
                                <CheckIcon />
                            </Checkbox.Indicator>
                        </Checkbox.Root>
                        <span>Toutes</span>
                    </DropdownMenu.Item>

                    <DropdownMenu.Separator className={styles.separator} />

                    {ACTIVITY_TYPES_ENUM.map((type) => (
                        <DropdownMenu.Item key={type} className={styles.item} onSelect={(e) => e.preventDefault()} onClick={handleOptionClick(type)}>
                            <Checkbox.Root checked={selectedTypes.includes(type)} className={styles.checkboxRoot}>
                                <Checkbox.Indicator className={styles.checkboxIndicator}>
                                    <CheckIcon />
                                </Checkbox.Indicator>
                            </Checkbox.Root>
                            <span className={styles.optionLabel}>{type}</span>
                        </DropdownMenu.Item>
                    ))}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};

export const ActivityTypeSelect = React.memo(ActivityTypeSelectComponent);
