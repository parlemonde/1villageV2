'use client';

import { CountryFlag } from '@frontend/components/CountryFlag/CountryFlag';
import { sendToast } from '@frontend/components/Toasts/toast-events';
import { Button } from '@frontend/components/ui/Button';
import { COUNTRIES } from '@lib/iso-3166-countries-french';
import { useExtracted } from 'next-intl';

import styles from './welcome-modal.module.css';

interface StepCountryProps {
    countryCode: string;
}

export const StepCountry = ({ countryCode }: StepCountryProps) => {
    const t = useExtracted('StepCountry');
    const countryName = COUNTRIES[countryCode.toUpperCase()] ?? countryCode;

    const handleReportError = () => {
        sendToast({
            message: t('Une demande de changement de pays a été envoyée à un administrateur !'),
            type: 'success',
        });
    };

    return (
        <div className={styles.stepCenter}>
            <span className={styles.stepText}>{t('Votre pays')}</span>
            <h2 className={styles.countryName}>
                <span>{countryName}</span>
                <CountryFlag country={countryCode} size="medium" />
            </h2>
            <Button
                label={t("Ce n'est pas mon pays !")}
                variant="outlined"
                color="grey"
                size="sm"
                isUpperCase={false}
                className={styles.reportButton}
                onClick={handleReportError}
            />
        </div>
    );
};
