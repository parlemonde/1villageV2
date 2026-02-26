'use client';

import { Button } from '@frontend/components/ui/Button';
import { Modal } from '@frontend/components/ui/Modal';
import { UserContext } from '@frontend/contexts/userContext';
import { VillageContext } from '@frontend/contexts/villageContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useContext, useState } from 'react';

import { StepCGU } from './StepCGU';
import { StepCountry } from './StepCountry';
import { StepVillageName } from './StepVillageName';
import styles from './welcome-modal.module.css';

const TOTAL_STEPS = 3;

export const WelcomeModal = () => {
    const { user, classroom } = useContext(UserContext);
    const { village } = useContext(VillageContext);
    const [currentStep, setCurrentStep] = useState(0);
    const [cguChecked, setCguChecked] = useState(false);

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
            className={styles.modal}
        >
            <div className={styles.stepContainer}>
                {currentStep === 0 && <StepVillageName villageName={village.name} />}
                {currentStep === 1 && classroom && <StepCountry countryCode={classroom.countryCode} />}
                {currentStep === 2 && <StepCGU cguChecked={cguChecked} onCguCheckedChange={setCguChecked} />}
            </div>
            <div className={styles.stepper}>
                <button className={styles.stepperButton} onClick={() => setCurrentStep(currentStep - 1)} disabled={currentStep === 0}>
                    <ChevronLeftIcon />
                    Précédent
                </button>
                <div className={styles.stepperDots}>
                    {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                        <span key={i} className={`${styles.stepperDot} ${i === currentStep ? styles.stepperDotActive : ''}`} />
                    ))}
                </div>
                {currentStep === 2 ? (
                    <Button
                        label="Accepter"
                        variant="contained"
                        color="primary"
                        size="sm"
                        disabled={!cguChecked}
                        onClick={() => setCurrentStep(currentStep + 1)}
                    />
                ) : (
                    <button
                        className={styles.stepperButton}
                        onClick={() => setCurrentStep(currentStep + 1)}
                        disabled={currentStep === TOTAL_STEPS - 1}
                    >
                        Suivant
                        <ChevronRightIcon />
                    </button>
                )}
            </div>
        </Modal>
    );
};
