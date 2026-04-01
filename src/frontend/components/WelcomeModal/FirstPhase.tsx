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
import { useExtracted } from 'next-intl';
import { useContext, useState } from 'react';

import { StepCGU } from './StepCGU';
import { StepCountry } from './StepCountry';
import type { ProfileData } from './StepProfile';
import { StepProfile } from './StepProfile';
import { StepVillageName } from './StepVillageName';
import styles from './welcome-modal.module.css';

// Steps 0-2 are fixed (VillageName, Country, CGU).
// Steps 3+ are one profile step per classroom.
const FIXED_STEPS = 3;

const buildInitialProfileData = (
    classroom: {
        name: string;
        level: string | null;
        address: string;
        alias: string | null;
        coordinates?: { latitude: number; longitude: number } | null;
    },
    userName: string,
): ProfileData => ({
    userName,
    schoolName: classroom.name,
    classLevel: classroom.level || '',
    schoolAddress: classroom.address,
    classAlias: classroom.alias || '',
    ...(classroom.coordinates && {
        coordinates: { lat: classroom.coordinates.latitude, lng: classroom.coordinates.longitude },
    }),
});

export const FirstPhase = () => {
    const t = useExtracted('FirstPhase');
    const { user, setUser, classroom, setClassroom, classrooms, setClassrooms } = useContext(UserContext);
    const { village, invalidateClassrooms } = useContext(VillageContext);
    const [currentStep, setCurrentStep] = useState(0);
    const [cguChecked, setCguChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Use all teacher classrooms if available, otherwise fall back to the single classroom
    const allClassrooms = classrooms.length > 0 ? classrooms : classroom ? [classroom] : [];
    const isMultiClass = allClassrooms.length > 1;
    const TOTAL_STEPS = FIXED_STEPS + allClassrooms.length;
    const [profileDataArray, setProfileDataArray] = useState<ProfileData[]>(() =>
        allClassrooms.map((c) => buildInitialProfileData(c, user?.name || '')),
    );

    if (!user || !village || allClassrooms.length === 0) {
        return null;
    }

    const currentClassroomIndex = currentStep >= FIXED_STEPS ? currentStep - FIXED_STEPS : 0;
    const currentProfileData = profileDataArray[currentClassroomIndex] ?? profileDataArray[0];

    const isProfileStepValid = (data: ProfileData) => {
        const baseValid = data.userName.trim().length > 0 && data.schoolName.trim().length > 0 && data.schoolAddress.trim().length > 0;
        if (isMultiClass) {
            return baseValid && data.classAlias.trim().length > 0;
        }
        return baseValid;
    };

    const updateProfileData = (index: number, data: ProfileData) => {
        setProfileDataArray((prev) => {
            const next = [...prev];
            next[index] = data;
            return next;
        });
    };

    const handleFinish = async () => {
        const lastProfile = profileDataArray[allClassrooms.length - 1];
        if (!isProfileStepValid(lastProfile)) return;

        setIsLoading(true);
        try {
            // Update teacher name
            const { error: userError } = await authClient.updateUser({
                name: lastProfile.userName.trim(),
            });
            if (userError) {
                sendToast({ message: t('Erreur lors de la mise à jour du nom.'), type: 'error' });
                setIsLoading(false);
                return;
            }

            // Update each classroom
            const updatedClassroomsResults = await Promise.all(
                allClassrooms.map((c, i) => {
                    const data = profileDataArray[i];
                    return updateClassroom({
                        id: c.id,
                        teacherId: user.id,
                        name: data.schoolName.trim(),
                        level: data.classLevel.trim(),
                        address: data.schoolAddress.trim(),
                        alias: data.classAlias.trim() || null,
                        ...(data.coordinates && {
                            coordinates: { latitude: data.coordinates.lat, longitude: data.coordinates.lng },
                        }),
                    });
                }),
            );

            const firstError = updatedClassroomsResults.find((r) => r.error);
            if (firstError) {
                sendToast({ message: firstError.error.message ?? t('Une erreur est survenue'), type: 'error' });
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
            setUser({ ...user, name: lastProfile.userName.trim(), firstLogin: 1 });
            const allUpdated = updatedClassroomsResults.flatMap((r) => r.data ?? []);
            if (allUpdated.length > 0) {
                setClassroom(allUpdated[0]);
                setClassrooms(allUpdated);
                invalidateClassrooms();
            }
        } catch {
            sendToast({ message: t('Une erreur inconnue est survenue...'), type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleNextClassStep = () => {
        const nextIndex = currentClassroomIndex + 1;
        // Only propagate userName (teacher-level field) to the next classroom.
        // schoolName, schoolAddress, classLevel, and classAlias are classroom-specific
        // and must keep their original values from the database.
        setProfileDataArray((prev) => {
            const next = [...prev];
            const current = prev[currentClassroomIndex];
            next[nextIndex] = {
                ...next[nextIndex],
                userName: current.userName,
            };
            return next;
        });
        setCurrentStep(currentStep + 1);
    };

    const isLastStep = currentStep === TOTAL_STEPS - 1;
    const isProfileStep = currentStep >= FIXED_STEPS;
    const isCguStep = currentStep === 2;
    const isNextClassStep = isProfileStep && !isLastStep;

    const getNextButton = () => {
        if (isLastStep) {
            return (
                <Button
                    label={t('Terminer')}
                    variant="contained"
                    color="primary"
                    size="sm"
                    disabled={!isProfileStepValid(currentProfileData) || isLoading}
                    onClick={handleFinish}
                />
            );
        }

        if (isNextClassStep) {
            return (
                <Button
                    label={t('Classe suivante')}
                    variant="contained"
                    color="primary"
                    size="sm"
                    disabled={!isProfileStepValid(currentProfileData)}
                    onClick={handleNextClassStep}
                />
            );
        }

        if (isCguStep) {
            return (
                <Button
                    label={t('Accepter')}
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
                {t('Suivant')}
                <ChevronRightIcon />
            </button>
        );
    };

    return (
        <Modal
            isOpen={true}
            onClose={() => {}}
            title={t('Bienvenue sur 1Village !')}
            hasCloseButton={false}
            hasFooter={false}
            width="lg"
            isFullWidth
            onOpenAutoFocus={false}
            className={styles.modal}
        >
            <div className={styles.stepContainer}>
                {currentStep === 0 && <StepVillageName villageName={village.name} />}
                {currentStep === 1 && <StepCountry countryCode={allClassrooms[0].countryCode} />}
                {currentStep === 2 && <StepCGU cguChecked={cguChecked} onCguCheckedChange={setCguChecked} />}
                {currentStep >= FIXED_STEPS && (
                    <StepProfile
                        key={currentClassroomIndex}
                        profileData={currentProfileData}
                        onProfileDataChange={(data) => updateProfileData(currentClassroomIndex, data)}
                        countryCode={allClassrooms[currentClassroomIndex].countryCode}
                        user={user}
                        classroom={allClassrooms[currentClassroomIndex]}
                        classIndex={isMultiClass ? currentClassroomIndex : undefined}
                        totalClasses={allClassrooms.length}
                    />
                )}
            </div>
            <div className={styles.stepper}>
                <button className={styles.stepperButton} onClick={() => setCurrentStep(currentStep - 1)} disabled={currentStep === 0}>
                    <ChevronLeftIcon />
                    {t('Précédent')}
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
