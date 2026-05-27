'use client';

import { CGU } from '@frontend/components/CGU/CGU';
import { Checkbox } from '@frontend/components/ui/Form/Checkbox';
import { useExtracted } from 'next-intl';

import styles from './welcome-modal.module.css';

interface StepCGUProps {
    cguChecked: boolean;
    onCguCheckedChange: (checked: boolean) => void;
}

export const StepCGU = ({ cguChecked, onCguCheckedChange }: StepCGUProps) => {
    const t = useExtracted('StepCGU');
    return (
        <div className={styles.stepCenter}>
            <div className={styles.cguScrollArea}>
                <CGU />
            </div>
            <div className={styles.cguCheckboxArea}>
                <Checkbox
                    name="cgu-accept"
                    isChecked={cguChecked}
                    onChange={onCguCheckedChange}
                    label={t("J'accepte les conditions générales d'utilisation du site")}
                />
            </div>
        </div>
    );
};
