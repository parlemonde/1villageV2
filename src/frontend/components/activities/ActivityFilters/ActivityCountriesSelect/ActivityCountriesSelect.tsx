'use client';

import { CountryFlag } from '@frontend/components/CountryFlag/CountryFlag';
import { Checkbox } from '@frontend/components/ui/Form/Checkbox';
import { VillageContext } from '@frontend/contexts/villageContext';
import PelicoNeutreIcon from '@frontend/svg/pelico/pelico-neutre.svg';
import { useContext } from 'react';

import styles from './activity-countries-select.module.css';

interface ActivityCountriesSelectProps {
    selectedCountries: string[];
    isPelico: boolean;
    setSelectedCountries: (countries: string[]) => void;
    setIsPelico: (isPelico: boolean) => void;
}
export const ActivityCountriesSelect = ({ selectedCountries, isPelico, setSelectedCountries, setIsPelico }: ActivityCountriesSelectProps) => {
    const { village } = useContext(VillageContext);
    const selectedCountriesSet = new Set(selectedCountries);

    return (
        <div className={styles.activityCountriesSelect}>
            {village?.countries.map((country) => (
                <Checkbox
                    key={country}
                    name={country}
                    label={<CountryFlag country={country} size="medium" />}
                    isChecked={selectedCountriesSet.has(country)}
                    size="md"
                    onChange={() => {
                        const newSelectedCountriesSet = new Set(selectedCountriesSet);
                        if (newSelectedCountriesSet.has(country)) {
                            newSelectedCountriesSet.delete(country);
                        } else {
                            newSelectedCountriesSet.add(country);
                        }
                        setSelectedCountries(Array.from(newSelectedCountriesSet));
                    }}
                />
            ))}
            <Checkbox
                name="pelico"
                label={<PelicoNeutreIcon style={{ width: '24px', height: 'auto' }} />}
                isChecked={isPelico}
                size="md"
                onChange={() => setIsPelico(!isPelico)}
            />
        </div>
    );
};
