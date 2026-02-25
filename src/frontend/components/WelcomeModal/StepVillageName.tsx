'use client';

import { sendToast } from '@frontend/components/Toasts/toast-events';
import { Button } from '@frontend/components/ui/Button';
import { useState } from 'react';

import styles from './welcome-modal.module.css';

interface StepVillageNameProps {
    villageName: string;
}

export const StepVillageName = ({ villageName }: StepVillageNameProps) => {
    const [isVisible, setIsVisible] = useState(false);

    const handleReportError = () => {
        sendToast({
            message: 'Une demande de changement de village a été envoyée à un administrateur !',
            type: 'success',
        });
    };

    return (
        <div className={styles.stepCenter}>
            <span className={styles.stepText}>Votre classe appartient au village-monde</span>
            <Button label={isVisible ? 'Cacher' : 'Montrer'} variant="contained" color="primary" size="md" onClick={() => setIsVisible(!isVisible)} />
            <h2 className={styles.villageName} style={{ visibility: isVisible ? 'visible' : 'hidden' }}>
                {villageName}
            </h2>
            <Button
                label="Ce n'est pas mon village-monde !"
                variant="outlined"
                color="grey"
                size="sm"
                isUpperCase={false}
                onClick={handleReportError}
            />
        </div>
    );
};
