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

const FEEDBACK_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfkTrGw6_BYr4cd3bM0yevjU_gOODZQLL91Tg5td9QR8tkyAA/viewform';

export const ThirdPhase = () => {
    const t = useExtracted('ThirdPhase');
    const { user, setUser } = useContext(UserContext);
    const [, setPhase] = usePhase();
    const [isOpen, setIsOpen] = useState(true);

    if (!user) {
        return null;
    }

    const handleStayPhase2 = () => {
        setPhase(2);
        setIsOpen(false);
    };

    const handleGoToPhase3 = async () => {
        const { error } = await updateFirstLogin(3);
        if (error) {
            sendToast({ message: error.message, type: 'error' });
            return;
        }
        setUser({ ...user, firstLogin: 3 });
        setPhase(3);
        setIsOpen(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {}}
            title={t('La phase 3 a commencé !')}
            hasCloseButton={false}
            hasFooter={false}
            width="md"
            isFullWidth
        >
            <div className={styles.phaseContent}>
                <p>{t('Avant de passer à la phase 3, prenez 5 minutes pour nous faire vos retours sur la phase 2 :')}</p>
                <a href={FEEDBACK_FORM_URL} target="_blank" rel="noopener noreferrer" className={styles.phaseLink}>
                    {t("Vos retours sur la phase 2 d'1Village")}
                </a>
                <div className={styles.phaseActions}>
                    <div className={styles.phaseOption}>
                        <p>{t("Si vous n'avez pas encore fini d'échanger avec vos pélicopains, restez en phase 2.")}</p>
                        <Button label={t('Rester en phase 2')} variant="outlined" color="primary" isUpperCase={false} onClick={handleStayPhase2} />
                    </div>
                    <div className={styles.phaseOption}>
                        <p>{t('Pour imaginer le village-monde idéal, passez en phase 3.')}</p>
                        <Button label={t('Passer en phase 3')} variant="outlined" color="primary" isUpperCase={false} onClick={handleGoToPhase3} />
                    </div>
                </div>
            </div>
        </Modal>
    );
};
