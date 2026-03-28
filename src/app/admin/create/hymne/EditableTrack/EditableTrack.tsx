import { Button, IconButton } from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Form';
import { Tooltip } from '@frontend/components/ui/Tooltip';
import { Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import classNames from 'clsx';
import Image from 'next/image';
import React from 'react';
import type { FilterOptionOption, SingleValue } from 'react-select';
import Select from 'react-select';

import anthemIcons from './anthem-icons.json';
import styles from './editable-track.module.css';

export interface HymneTrack {
    name: string;
    iconUrl?: string;
    url?: string;
}

type AnthemIconOption = {
    value: string;
    label: string;
};

const ANTHEM_ICON_OPTIONS = anthemIcons as AnthemIconOption[];

const ICON_PICKER_PLACEHOLDER = 'Choisir un instrument';

const filterIconOption = (option: FilterOptionOption<AnthemIconOption>, inputValue: string) => {
    const searchBy = `${option.data.label} ${option.data.value}`.toLowerCase();
    return searchBy.includes(inputValue.toLowerCase());
};

interface EditableTrackProps {
    track: HymneTrack;
    onChange: (track: HymneTrack) => void;
    onEditUrl?: () => void;
    onDelete?: () => void;
    deleteTooltip?: string;
    className?: string;
    style?: React.CSSProperties;
}
export const EditableTrack = ({
    track,
    onChange,
    onEditUrl,
    onDelete,
    deleteTooltip = 'Supprimer la piste',
    className,
    style,
}: EditableTrackProps) => {
    const [isEditingName, setIsEditingName] = React.useState(false);

    const selectedIcon = React.useMemo(() => ANTHEM_ICON_OPTIONS.find((option) => option.value === track.iconUrl) ?? null, [track.iconUrl]);

    const onAutoFocusCallbackRef = React.useCallback((el: HTMLInputElement | null) => {
        el?.focus();
    }, []);

    const selectFormatOptionLabel = React.useCallback((option: AnthemIconOption, meta: { context: 'menu' | 'value' }) => {
        return meta.context === 'menu' ? (
            <span className={styles.IconOption}>
                <Image src={option.value} alt="" width={24} height={24} className={styles.IconOptionImage} unoptimized />
                <span>{option.label}</span>
            </span>
        ) : (
            <Image src={option.value} alt="" width={24} height={24} className={styles.SelectedIconImage} unoptimized />
        );
    }, []);
    const selectClassNames = React.useMemo(
        () => ({
            control: ({ menuIsOpen }: { menuIsOpen?: boolean }) => classNames(styles.IconSelect, { [styles.IconSelectOpen]: menuIsOpen }),
            valueContainer: () => styles.IconSelectValueContainer,
            input: () => styles.IconSelectInput,
            singleValue: () => styles.IconSelectSingleValue,
            option: () => styles.IconSelectOption,
            placeholder: () => styles.IconSelectPlaceholder,
            menu: () => styles.IconSelectMenu,
        }),
        [],
    );
    const selectComponents = React.useMemo(
        () => ({
            IndicatorSeparator: null,
            DropdownIndicator: () => null,
        }),
        [],
    );

    return (
        <div className={classNames(styles.EditableTrack, className)} style={style}>
            <Select<AnthemIconOption, false>
                options={ANTHEM_ICON_OPTIONS}
                value={selectedIcon}
                placeholder={ICON_PICKER_PLACEHOLDER}
                isSearchable
                filterOption={filterIconOption}
                menuPlacement="auto"
                onChange={(option: SingleValue<AnthemIconOption>) => onChange({ ...track, iconUrl: option?.value ?? undefined })}
                formatOptionLabel={selectFormatOptionLabel}
                components={selectComponents}
                classNames={selectClassNames}
            />
            <div className={styles.EditableTrackNameContainer}>
                {isEditingName ? (
                    <Input
                        size="sm"
                        isFullWidth
                        color="secondary"
                        ref={onAutoFocusCallbackRef}
                        value={track.name}
                        onChange={(e) => onChange({ ...track, name: e.target.value })}
                        onBlur={() => setIsEditingName(false)}
                        className={styles.EditableTrackNameInput}
                    />
                ) : (
                    <button className={styles.EditableTrackNameButton} onClick={() => setIsEditingName(true)}>
                        {track.name || 'Piste sans nom'}
                        <span style={{ marginLeft: '4px', display: 'inline-flex' }}>
                            <Pencil1Icon />
                        </span>
                    </button>
                )}
            </div>
            {track.url && <audio src={track.url} controls className={styles.EditableTrackAudioPlayer} />}
            {track.url ? (
                <Tooltip content="Modifier le son" delay={300}>
                    <IconButton icon={Pencil1Icon} variant="outlined" color="secondary" onClick={onEditUrl}></IconButton>
                </Tooltip>
            ) : (
                <Button size="sm" label="Choisir un son" variant="outlined" color="secondary" onClick={onEditUrl}></Button>
            )}
            {onDelete && (
                <Tooltip content={deleteTooltip} delay={300}>
                    <IconButton icon={TrashIcon} variant="outlined" color="error" onClick={onDelete}></IconButton>
                </Tooltip>
            )}
        </div>
    );
};
