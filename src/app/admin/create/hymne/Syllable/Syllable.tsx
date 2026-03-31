import { IconButton } from '@frontend/components/ui/Button';
import { TrashIcon } from '@radix-ui/react-icons';
import classNames from 'clsx';
import React from 'react';

import styles from './syllable.module.css';

const MAX_SYLLABLE_LENGTH = 20;

interface SyllableProps {
    syllable: string;
    onChange?: (syllable: string) => void;
    onDelete?: () => void;
}
export const Syllable = ({ syllable, onChange, onDelete }: SyllableProps) => {
    const isEditable = onChange !== undefined;
    const [isEditing, setIsEditing] = React.useState(false);

    const onAutoFocusCallbackRef = React.useCallback((el: HTMLInputElement | null) => {
        el?.focus();
    }, []);

    return (
        <div
            role={isEditable ? 'button' : undefined}
            tabIndex={isEditable && !isEditing ? 0 : undefined}
            onKeyDown={(e) => {
                if (isEditable && !isEditing && e.key === 'Enter') {
                    setIsEditing(true);
                }
            }}
            className={classNames(styles.Syllable, {
                [styles.SyllableEditing]: isEditing,
                [styles.SyllableEditable]: isEditable,
                [styles.SyllableEditableWithRightPadding]: !onDelete,
            })}
            onClick={!isEditing && isEditable ? () => setIsEditing(true) : undefined}
        >
            <div className={styles.SyllableInputContainer}>
                <span className={classNames(styles.SyllableText, { [styles.SyllableTextHidden]: isEditing })}>{syllable}</span>
                {isEditing && (
                    <input
                        ref={onAutoFocusCallbackRef}
                        type="text"
                        value={syllable}
                        onChange={(e) => onChange?.(e.target.value.slice(0, MAX_SYLLABLE_LENGTH))}
                        className={styles.SyllableInput}
                        onBlur={() => setIsEditing(false)}
                        size={1}
                    />
                )}
            </div>
            {onDelete && (
                <IconButton
                    size="sm"
                    icon={TrashIcon}
                    variant="outlined"
                    color="primary"
                    onClick={onDelete}
                    className={styles.SyllableDeleteButton}
                ></IconButton>
            )}
        </div>
    );
};

export const SyllableReturn = () => {
    return (
        <div className={styles.SyllableReturn}>
            <svg viewBox="10 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 5h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H17.154" stroke="#666" strokeWidth="3"></path>
                <path d="M15.33 19.344a1 1 0 0 1 0-1.688l4.634-2.944a1 1 0 0 1 1.536.845v5.886a1 1 0 0 1-1.536.845l-4.635-2.944Z" fill="#666"></path>
            </svg>
        </div>
    );
};
