import { CountryFlag } from '@frontend/components/CountryFlag';

import styles from './country-option.module.css';

interface CountryOptionProps {
    id: string;
    value?: string;
}

export const CountryOption = ({ id, value }: CountryOptionProps) => {
    return (
        <div className={styles.countryOptions}>
            <span className={styles.countryFlag}>
                <CountryFlag size="small" country={id} />
            </span>
            <span>{value}</span>
        </div>
    );
};
