'use client';

import { CountrySelect } from '@frontend/components/ui/Form/CountrySelect';
import classNames from 'clsx';

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

interface PanelInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    isRequired?: boolean;
    hasError?: boolean;
    disabled?: boolean;
}

const PanelInput = ({ label, value, onChange, placeholder, isRequired = false, hasError = false, disabled = false }: PanelInputProps) => (
    <div className={styles.panelField}>
        <label>
            {label}
            {isRequired && <span style={{ color: 'red' }}>*</span>}
        </label>
        <input
            type="text"
            className={classNames(styles.panelInput, {
                [styles.panelInputError]: hasError,
                [styles.panelInputDisabled]: disabled,
            })}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
        />
    </div>
);

export const StepProfile = ({ profileData, onProfileDataChange, countryCode }: StepProfileProps) => {
    const updateField = (field: keyof ProfileData, value: string) => {
        onProfileDataChange({ ...profileData, [field]: value });
    };

    return (
        <div className={styles.stepProfileContainer}>
            <div className={styles.stepProfileSection}>
                <h3 className={styles.stepProfileTitle}>{"Professionnel de l'éducation"}</h3>
                <PanelInput
                    label="Nom : "
                    value={profileData.userName}
                    onChange={(v) => updateField('userName', v)}
                    placeholder="Entrez votre nom"
                    isRequired
                    hasError={!profileData.userName.trim()}
                />
            </div>

            <div className={styles.stepProfileSection}>
                <h3 className={styles.stepProfileTitle}>{'Établissement'}</h3>
                <PanelInput
                    label="École : "
                    value={profileData.schoolName}
                    onChange={(v) => updateField('schoolName', v)}
                    placeholder="Nom de votre école"
                    isRequired
                    hasError={!profileData.schoolName.trim()}
                />
                <PanelInput
                    label="Niveau de la classe : "
                    value={profileData.classLevel}
                    onChange={(v) => updateField('classLevel', v)}
                    placeholder="Niveau de votre classe"
                />
                <PanelInput
                    label="Adresse de l'école : "
                    value={profileData.schoolAddress}
                    onChange={(v) => updateField('schoolAddress', v)}
                    placeholder="Adresse de votre école"
                    isRequired
                    hasError={!profileData.schoolAddress.trim()}
                />
                <div className={styles.panelField} style={{ pointerEvents: 'none' }}>
                    <label>Pays :</label>
                    <div style={{ marginLeft: '0.5rem', width: '450px', maxWidth: '100%' }}>
                        <CountrySelect value={countryCode} onChange={() => {}} isFullWidth disabled />
                    </div>
                </div>
            </div>
        </div>
    );
};
