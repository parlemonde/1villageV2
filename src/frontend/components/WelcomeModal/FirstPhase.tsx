'use client';

import { sendToast } from '@frontend/components/Toasts/toast-events';
import { Button } from '@frontend/components/ui/Button';
import { Modal } from '@frontend/components/ui/Modal';
import { UserContext } from '@frontend/contexts/userContext';
import { VillageContext } from '@frontend/contexts/villageContext';
import { authClient } from '@frontend/lib/auth-client';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { updateClassroom } from '@server-actions/classrooms/update-classroom';
import { updateFirstLogin } from '@server-actions/users/update-first-login';
import { useContext, useState } from 'react';

import { StepCGU } from './StepCGU';
import { StepCountry } from './StepCountry';
import type { ProfileData } from './StepProfile';
import { StepProfile } from './StepProfile';
import { StepVillageName } from './StepVillageName';
import styles from './welcome-modal.module.css';

const TOTAL_STEPS = 4;

export const FirstPhase = () => {
    const { user, setUser, classroom, setClassroom } = useContext(UserContext);
    const { village, invalidateClassrooms } = useContext(VillageContext);
    const [currentStep, setCurrentStep] = useState(0);
    const [cguChecked, setCguChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [profileData, setProfileData] = useState<ProfileData>({
        userName: user?.name || '',
        schoolName: classroom?.name || '',
        classLevel: classroom?.level || '',
        schoolAddress: classroom?.address || '',
        classAlias: classroom?.alias || '',
    });

    if (!user || !village || !classroom) {
        return null;
    }

    const isProfileValid =
        profileData.userName.trim().length > 0 && profileData.schoolName.trim().length > 0 && profileData.schoolAddress.trim().length > 0;

    const handleFinish = async () => {
        if (!isProfileValid) {
            return;
        }

        setIsLoading(true);

        try {
            // Update user name
            const { error: userError } = await authClient.updateUser({
                name: profileData.userName.trim(),
            });
            if (userError) {
                sendToast({ message: 'Erreur lors de la mise à jour du nom.', type: 'error' });
                setIsLoading(false);
                return;
            }

            // Update classroom
            const { data: updatedClassrooms, error: classroomError } = await updateClassroom({
                id: classroom.id,
                teacherId: user.id,
                name: profileData.schoolName.trim(),
                level: profileData.classLevel.trim(),
                address: profileData.schoolAddress.trim(),
                alias: profileData.classAlias.trim() || null,
            });
            if (classroomError) {
                sendToast({ message: classroomError.message, type: 'error' });
                setIsLoading(false);
                return;
            }

            // Update firstLogin to mark first phase as complete
            const { error: firstLoginError } = await updateFirstLogin(1);
            if (firstLoginError) {
                sendToast({ message: firstLoginError.message, type: 'error' });
                setIsLoading(false);
                return;
            }

            // Update context
            setUser({ ...user, name: profileData.userName.trim(), firstLogin: 1 });
            if (updatedClassrooms?.[0]) {
                setClassroom(updatedClassrooms[0]);
                invalidateClassrooms();
            }
        } catch {
            sendToast({ message: 'Une erreur inconnue est survenue...', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const isLastStep = currentStep === TOTAL_STEPS - 1;
    const isCguStep = currentStep === 2;

    const getNextButton = () => {
        if (isLastStep) {
            return (
                <Button
                    label="Terminer"
                    variant="contained"
                    color="primary"
                    size="sm"
                    disabled={!isProfileValid || isLoading}
                    onClick={handleFinish}
                />
            );
        }

        if (isCguStep) {
            return (
                <Button
                    label="Accepter"
                    variant="contained"
                    color="primary"
                    size="sm"
                    disabled={!cguChecked}
                    onClick={() => setCurrentStep(currentStep + 1)}
                />
            );
        }

        return (
            <button className={styles.stepperButton} onClick={() => setCurrentStep(currentStep + 1)} disabled={currentStep === TOTAL_STEPS - 1}>
                Suivant
                <ChevronRightIcon />
            </button>
        );
    };

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
                {currentStep === 1 && <StepCountry countryCode={classroom.countryCode} />}
                {currentStep === 2 && <StepCGU cguChecked={cguChecked} onCguCheckedChange={setCguChecked} />}
                {currentStep === 3 && (
                    <StepProfile
                        profileData={profileData}
                        onProfileDataChange={setProfileData}
                        countryCode={classroom.countryCode}
                        user={user}
                        classroom={classroom}
                    />
                )}
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
                {getNextButton()}
            </div>
        </Modal>
    );
};
