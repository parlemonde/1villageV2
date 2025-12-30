import { CountryFlag } from '@frontend/components/CountryFlag';
import { COUNTRIES } from '@lib/iso-3166-countries-french';

import type { SelectProps } from './Select';
import { Select } from './Select';
import styles from './country-select.module.css';

interface CountrySelectProps extends Omit<SelectProps, 'options'> {
    onChange: (country: string) => void;
    filter?: (country: string) => boolean;
}

export function CountrySelect(props: CountrySelectProps) {
    const {
        id,
        value,
        onChange,
        name,
        size = 'md',
        color = 'primary',
        isFullWidth = false,
        placeholder = 'Choisir un pays',
        disabled = false,
        filter,
    } = props;

    const filteredCountries = filter ? Object.entries(COUNTRIES).filter(([key, _]) => filter(key)) : Object.entries(COUNTRIES);

    const countryOptions = filteredCountries.map(([key, value]) => ({
        label: (
            <div className={styles.countryOptions}>
                <span className={styles.countryFlag}>
                    <CountryFlag size="small" country={key} />
                </span>
                <span>{value}</span>
            </div>
        ),
        value: key,
    }));

    return (
        <Select
            value={value}
            onChange={(country) => onChange(country)}
            color={color}
            isFullWidth={isFullWidth}
            options={countryOptions}
            placeholder={placeholder}
            id={id}
            name={name}
            size={size}
            disabled={disabled}
        />
    );
}
