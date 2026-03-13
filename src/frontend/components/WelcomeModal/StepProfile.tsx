'use client';

import { ActivityHeader } from '@frontend/components/activities/ActivityHeader';
import { CountrySelect } from '@frontend/components/ui/Form/CountrySelect';
import Map2D from '@frontend/components/worldMaps/WorldMap2D/WorldMap2D';
import type { Coordinates } from '@frontend/components/worldMaps/world-map.types';
import PelicoSearch from '@frontend/svg/pelico/pelico-search.svg';
import type { Classroom } from '@server/database/schemas/classrooms';
import type { User } from '@server/database/schemas/users';
import classNames from 'clsx';
import { useExtracted } from 'next-intl';

import styles from './welcome-modal.module.css';

export interface ProfileData {
    userName: string;
    schoolName: string;
    classLevel: string;
    schoolAddress: string;
    classAlias: string;
    coordinates?: Coordinates;
}

interface StepProfileProps {
    profileData: ProfileData;
    onProfileDataChange: (data: ProfileData) => void;
    countryCode: string;
    user: User;
    classroom: Classroom;
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
        <div
            className={classNames(styles.panelInputWrapper, {
                [styles.panelInputError]: hasError,
                [styles.panelInputDisabled]: disabled,
            })}
        >
            <input
                type="text"
                className={styles.panelInput}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
            />
        </div>
    </div>
);

export const StepProfile = ({ profileData, onProfileDataChange, countryCode, user, classroom }: StepProfileProps) => {
    const t = useExtracted('StepProfile');
    const updateField = (field: keyof ProfileData, value: string) => {
        onProfileDataChange({ ...profileData, [field]: value });
    };

    const previewUser: User = {
        ...user,
        name: profileData.userName || user.name,
    };

    const defaultAlias = `La classe${profileData.classLevel ? ' de ' + profileData.classLevel : ''} à ${profileData.schoolName || classroom.name}`;

    const previewClassroom: Classroom = {
        ...classroom,
        id: -1,
        alias: profileData.classAlias || defaultAlias,
    };

    return (
        <div className={styles.stepProfileContainer}>
            <div className={styles.stepProfileForm}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                    <PelicoSearch style={{ width: '4rem', height: 'auto', marginRight: '1rem' }} />
                </div>
                <div className={styles.stepProfileSection}>
                    <h3 className={styles.stepProfileTitle}>{t("Professionnel de l'éducation")}</h3>
                    <PanelInput
                        label={t('Nom : ')}
                        value={profileData.userName}
                        onChange={(v) => updateField('userName', v)}
                        placeholder={t('Entrez votre nom')}
                        isRequired
                        hasError={!profileData.userName.trim()}
                    />
                </div>

                <div className={styles.stepProfileSection}>
                    <h3 className={styles.stepProfileTitle}>{t('Établissement')}</h3>
                    <PanelInput
                        label={t('École : ')}
                        value={profileData.schoolName}
                        onChange={(v) => updateField('schoolName', v)}
                        placeholder={t('Nom de votre école')}
                        isRequired
                        hasError={!profileData.schoolName.trim()}
                    />
                    <PanelInput
                        label={t('Niveau de la classe : ')}
                        value={profileData.classLevel}
                        onChange={(v) => updateField('classLevel', v)}
                        placeholder={t('Niveau de votre classe')}
                    />
                    <PanelInput
                        label={t("Adresse de l'école : ")}
                        value={profileData.schoolAddress}
                        onChange={(v) => updateField('schoolAddress', v)}
                        placeholder={t("Adresse de votre école")}
                        isRequired
                        hasError={!profileData.schoolAddress.trim()}
                    />
                    <div className={styles.panelField} style={{ pointerEvents: 'none' }}>
                        <label>{t('Pays :')}</label>
                        <div style={{ marginLeft: '0.5rem', width: '450px', maxWidth: '100%' }}>
                            <CountrySelect value={countryCode} onChange={() => {}} isFullWidth disabled />
                        </div>
                    </div>
                    <PanelInput
                        label={t('Alias :')}
                        value={profileData.classAlias}
                        onChange={(v) => updateField('classAlias', v)}
                        placeholder={`La classe${profileData.classLevel ? ' de ' + profileData.classLevel : ''} à ${profileData.schoolName || classroom.name}`}
                    />
                </div>
            </div>

            <div className={styles.stepProfilePreview}>
                <span className={styles.stepProfilePreviewTitle}>{t('Prévisualisation de vos publications :')}</span>
                <div className={styles.previewCard}>
                    <ActivityHeader
                        activity={{
                            type: 'libre',
                            publishDate: new Date().toISOString(),
                        }}
                        user={previewUser}
                        classroom={previewClassroom}
                        className={styles.previewCardHeader}
                    />
                    <div className={styles.previewCardBody}>
                        <h3 className={styles.previewCardTitle}>{t('Présentation de notre école')}</h3>
                        <p className={styles.previewCardText}>........................</p>
                    </div>
                </div>
                {!classroom.coordinates && (
                    <div style={{ marginTop: '1rem' }}>
                        <span className={styles.stepProfilePreviewTitle}>{t('Est-ce que votre école est bien placée ?')}</span>
                        <Map2D
                            coordinates={profileData.coordinates}
                            setCoordinates={(coords) => onProfileDataChange({ ...profileData, coordinates: coords })}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
