'use client';

import { CountryFlag } from '@frontend/components/CountryFlag/CountryFlag';
import { Checkbox } from '@frontend/components/ui/Form/Checkbox';
import { UserContext } from '@frontend/contexts/userContext';
import { VillageContext } from '@frontend/contexts/villageContext';
import { usePhase } from '@frontend/hooks/usePhase';
import PelicoNeutreIcon from '@frontend/svg/pelico/pelico-neutre.svg';
import { useContext, useMemo, useRef, useEffect } from 'react';

import styles from './activity-countries-select.module.css';

interface ActivityCountriesSelectProps {
    selectedCountries: string[];
    isPelico: boolean;
    setSelectedCountries: (countries: string[]) => void;
    setIsPelico: (isPelico: boolean) => void;
}
export const ActivityCountriesSelect = ({ selectedCountries, isPelico, setSelectedCountries, setIsPelico }: ActivityCountriesSelectProps) => {
    const { village } = useContext(VillageContext);
    const { user, classroom } = useContext(UserContext);
    const [phase] = usePhase();

    const isPelicoUser = user?.role === 'admin' || user?.role === 'mediator';
    const isMystery = (countryCode: string) => village?.activePhase === 1 && !isPelicoUser && classroom?.countryCode !== countryCode;

    const availableCountries = useMemo<string[]>(() => village?.countries ?? [], [village]);
    const selectedCountriesSet = new Set(selectedCountries);

    // Update selected countries when available countries change. (village or phase changed.)
    const previousAvailableCountries = useRef(availableCountries);
    const previousPhase = useRef(phase);
    const previousVillageId = useRef(village?.id);
    useEffect(() => {
        const availableCountriesSet = new Set(availableCountries);
        const extraCountries = selectedCountries.filter((country) => !availableCountriesSet.has(country));
        if (
            previousAvailableCountries.current.join(',') !== availableCountries.join(',') ||
            previousPhase.current !== phase ||
            previousVillageId.current !== village?.id
        ) {
            setSelectedCountries(availableCountries); // Reset to all.
            setIsPelico(true); // Reset to true.
        } else if (extraCountries.length > 0) {
            setSelectedCountries(selectedCountries.filter((country) => availableCountriesSet.has(country)));
        }

        previousAvailableCountries.current = availableCountries;
        previousPhase.current = phase;
        previousVillageId.current = village?.id;
    }, [availableCountries, phase, selectedCountries, setSelectedCountries, setIsPelico, village]);

    return (
        <div className={styles.activityCountriesSelect}>
            {village?.countries.map((country, index) => (
                <Checkbox
                    key={isMystery(country) ? `mystery-${index}` : country}
                    name={country}
                    label={<CountryFlag country={country} size="medium" isMystery={isMystery(country)} />}
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
