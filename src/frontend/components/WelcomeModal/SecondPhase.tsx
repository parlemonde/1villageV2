'use client';

import { sendToast } from '@frontend/components/Toasts/toast-events';
import { Button } from '@frontend/components/ui/Button';
import { Modal } from '@frontend/components/ui/Modal';
import { UserContext } from '@frontend/contexts/userContext';
import { usePhase } from '@frontend/hooks/usePhase';
import { updateFirstLogin } from '@server-actions/users/update-first-login';
import { useExtracted } from 'next-intl';
import { useContext, useState } from 'react';

import styles from './welcome-modal.module.css';

const FEEDBACK_FORM_URL =
    'https://docs.google.com/forms/d/e/1FAIpQLSfqJKB8UnFZ14DM1tISHlODWd5qOS2MygGHusfJUo5UjxKdtg/viewform?usp=sharing&ouid=101262587132272655135';

export const SecondPhase = () => {
    const t = useExtracted('SecondPhase');
    const { user, setUser } = useContext(UserContext);
    const [, setPhase] = usePhase();
    const [isOpen, setIsOpen] = useState(true);

    if (!user) {
        return null;
    }

    const handleStayPhase1 = () => {
        setPhase(1);
        setIsOpen(false);
    };

    const handleGoToPhase2 = async () => {
        const { error } = await updateFirstLogin(2);
        if (error) {
            sendToast({ message: error.message, type: 'error' });
            return;
        }
        setUser({ ...user, firstLogin: 2 });
        setPhase(2);
        setIsOpen(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={() => {}} title={t('La phase 2 a commencé !')} hasCloseButton={false} hasFooter={false} width="md" isFullWidth>
            <div className={styles.phaseContent}>
                <p>{t('Avant de passer à la phase 2, prenez 5 minutes pour nous faire vos retours sur la phase 1 :')}</p>
                <a href={FEEDBACK_FORM_URL} target="_blank" rel="noopener noreferrer" className={styles.phaseLink}>
                    {t("Vos retours sur la phase 1 d'1Village")}
                </a>
                <div className={styles.phaseActions}>
                    <div className={styles.phaseOption}>
                        <p>{t("Si vous n'avez pas encore découvert le pays mystère, restez en phase 1.")}</p>
                        <Button label={t('Rester en phase 1')} variant="outlined" color="primary" isUpperCase={false} onClick={handleStayPhase1} />
                    </div>
                    <div className={styles.phaseOption}>
                        <p>{t('Pour échanger avec vos pélicopains, passez en phase 2.')}</p>
                        <Button label={t('Passer en phase 2')} variant="outlined" color="primary" isUpperCase={false} onClick={handleGoToPhase2} />
                    </div>
                </div>
            </div>
        </Modal>
    );
};
