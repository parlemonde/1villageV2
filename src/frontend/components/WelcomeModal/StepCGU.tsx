'use client';

import { CGU } from '@frontend/components/CGU/CGU';
import { Checkbox } from '@frontend/components/ui/Form/Checkbox';

import styles from './welcome-modal.module.css';

interface StepCGUProps {
    cguChecked: boolean;
    onCguCheckedChange: (checked: boolean) => void;
}

export const StepCGU = ({ cguChecked, onCguCheckedChange }: StepCGUProps) => {
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
                    label="J'accepte les conditions générales d'utilisation du site"
                />
            </div>
        </div>
    );
};
