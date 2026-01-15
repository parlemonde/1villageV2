import { COUNTRIES } from '@lib/iso-3166-countries-french';

import { CountryOption } from './CountryOption';
import type { SelectProps } from './Select';
import { Select } from './Select';

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

    const filteredCountries = filter ? Object.entries(COUNTRIES).filter(([key, _]) => key && filter(key)) : Object.entries(COUNTRIES);

    const countryOptions = filteredCountries.map(([key, value]) => ({
        label: <CountryOption id={key} key={key} value={value} />,
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
