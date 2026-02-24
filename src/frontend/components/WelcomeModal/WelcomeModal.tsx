'use client';

import { Modal } from '@frontend/components/ui/Modal';
import { UserContext } from '@frontend/contexts/userContext';
import { VillageContext } from '@frontend/contexts/villageContext';
import { useContext } from 'react';

import { StepVillageName } from './StepVillageName';
import styles from './welcome-modal.module.css';

export const WelcomeModal = () => {
    const { user } = useContext(UserContext);
    const { village } = useContext(VillageContext);

    if (!user || !village || user.role !== 'teacher' || user.firstLogin !== 0) {
        return null;
    }

    return (
        <Modal
            isOpen={true}
            onClose={() => {}}
            title="Bienvenue sur 1Village !"
            hasCloseButton={false}
            hasFooter={false}
            width="lg"
            isFullWidth
            onOpenAutoFocus={false}
        >
            <div className={styles.stepContainer}>
                <StepVillageName villageName={village.name} />
            </div>
        </Modal>
    );
};
