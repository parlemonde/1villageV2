'use client';

import { getMarginAndPaddingStyle } from '@frontend/components/ui/css-styles';
import type { FilterOptionOption, ThemeConfig } from 'react-select';
import Select from 'react-select';

import type { SelectProps } from './Select';

type Option = {
    label: React.ReactNode;
    value: string;
    searchValue?: string;
};

interface MultiSelectProps extends Omit<SelectProps, 'value' | 'onChange' | 'options'> {
    value: string[];
    onChange: (value: string[]) => void;
    options: Option[];
}

export const MultiSelect = (props: MultiSelectProps) => {
    const {
        name,
        id,
        value,
        onChange,
        options,
        size = 'md',
        color = 'primary',
        isFullWidth = false,
        placeholder = 'Choisir une option',
        style = {},
        hasError = false,
        disabled = false,
        ...marginProps
    } = props;

    const cssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name);

    const selectTheme: ThemeConfig = (theme) => ({
        ...theme,
        borderRadius: 4,
        colors: {
            ...theme.colors,
            primary: hasError ? 'var(--error-color)' : color === 'primary' ? cssVar('--primary-color') : cssVar('--secondary-color'), // focused border
            neutral20: hasError ? 'var(--error-color)' : 'var(--grey-300)', // default border
            neutral30: 'var(--grey-500)', // hover border
            danger: 'var(--error-color)', // delete option cross
            dangerLight: 'var(--error-100)', // delete option cross background
        },
    });

    const SIZE_STYLES = {
        sm: {
            fontSize: '14px',
            lineHeight: '18px',
            minHeight: '36px',
        },
        md: {
            fontSize: '16px',
            lineHeight: '20px',
            padding: '2px 0',
            minHeight: '40px',
        },
        lg: {
            fontSize: '18px',
            padding: '4px 0',
            lineHeight: '22px',
            minHeight: '44px',
        },
    } as const;

    const customFilterOption = (option: FilterOptionOption<Option>, inputValue: string) => {
        const searchBy = option.data.searchValue || option.label?.toString() || option.value;
        return searchBy.toLowerCase().includes(inputValue.toLowerCase());
    };

    return (
        <Select<Option, true>
            isMulti
            placeholder={placeholder}
            value={options.filter((option) => value.includes(option.value))}
            onChange={(e) => {
                const selectedOptions = e.map((option) => option.value);
                onChange(selectedOptions);
            }}
            filterOption={customFilterOption}
            getOptionValue={(option) => option.value}
            options={options}
            isDisabled={disabled}
            styles={{
                control: (base) => ({
                    ...base,
                    ...getMarginAndPaddingStyle(marginProps),
                    ...SIZE_STYLES[size],
                    ...style,
                    cursor: 'pointer',
                }),
                container: (base) => ({
                    ...base,
                    width: isFullWidth ? '100%' : '300px',
                }),
            }}
            theme={selectTheme}
        />
    );
};
