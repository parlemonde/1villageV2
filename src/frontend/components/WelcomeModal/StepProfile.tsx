'use client';

import { Field } from '@frontend/components/ui/Form';
import { CountrySelect } from '@frontend/components/ui/Form/CountrySelect';
import { Input } from '@frontend/components/ui/Form/Input';

import styles from './welcome-modal.module.css';

export interface ProfileData {
    userName: string;
    schoolName: string;
    classLevel: string;
    schoolAddress: string;
}

interface StepProfileProps {
    profileData: ProfileData;
    onProfileDataChange: (data: ProfileData) => void;
    countryCode: string;
}

export const StepProfile = ({ profileData, onProfileDataChange, countryCode }: StepProfileProps) => {
    const updateField = (field: keyof ProfileData, value: string) => {
        onProfileDataChange({ ...profileData, [field]: value });
    };

    return (
        <div className={styles.stepProfileContainer}>
            <div className={styles.stepProfileSection}>
                <h3 className={styles.stepProfileTitle}>{"Professionnel de l'éducation"}</h3>
                <Field
                    name="userName"
                    label="Nom"
                    isRequired
                    marginBottom="md"
                    input={
                        <Input
                            id="userName"
                            type="text"
                            isFullWidth
                            hasError={!profileData.userName.trim()}
                            value={profileData.userName}
                            onChange={(e) => updateField('userName', e.target.value)}
                            placeholder="Entrez votre nom"
                        />
                    }
                />
            </div>

            <div className={styles.stepProfileSection}>
                <h3 className={styles.stepProfileTitle}>{'Établissement'}</h3>
                <Field
                    name="schoolName"
                    label="École"
                    isRequired
                    marginBottom="md"
                    input={
                        <Input
                            id="schoolName"
                            type="text"
                            isFullWidth
                            hasError={!profileData.schoolName.trim()}
                            value={profileData.schoolName}
                            onChange={(e) => updateField('schoolName', e.target.value)}
                            placeholder="Nom de votre école"
                        />
                    }
                />
                <Field
                    name="classLevel"
                    label="Niveau de la classe"
                    marginBottom="md"
                    input={
                        <Input
                            id="classLevel"
                            type="text"
                            isFullWidth
                            value={profileData.classLevel}
                            onChange={(e) => updateField('classLevel', e.target.value)}
                            placeholder="Niveau de votre classe"
                        />
                    }
                />
                <Field
                    name="schoolAddress"
                    label="Adresse de l'école"
                    isRequired
                    marginBottom="md"
                    input={
                        <Input
                            id="schoolAddress"
                            type="text"
                            isFullWidth
                            hasError={!profileData.schoolAddress.trim()}
                            value={profileData.schoolAddress}
                            onChange={(e) => updateField('schoolAddress', e.target.value)}
                            placeholder="Adresse de votre école"
                        />
                    }
                />
                <Field
                    style={{ pointerEvents: 'none' }}
                    name="country"
                    label="Pays"
                    marginBottom="md"
                    input={<CountrySelect value={countryCode} onChange={() => {}} isFullWidth disabled />}
                />
            </div>
        </div>
    );
};
