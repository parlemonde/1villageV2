'use client';

import type { NominatimPlace } from '@app/api/geo/route';
import { ActivityHeader } from '@frontend/components/activities/ActivityHeader';
import { CountrySelect } from '@frontend/components/ui/Form/CountrySelect';
import { Field } from '@frontend/components/ui/Form/Field';
import { Input } from '@frontend/components/ui/Form/Input';
import Map2D from '@frontend/components/worldMaps/WorldMap2D/WorldMap2D';
import type { Coordinates } from '@frontend/components/worldMaps/world-map.types';
import PelicoSearch from '@frontend/svg/pelico/pelico-search.svg';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { Classroom } from '@server/database/schemas/classrooms';
import type { User } from '@server/database/schemas/users';
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
    /** 0-based index of the current class (undefined = single-class mode) */
    classIndex?: number;
    /** Total number of classes being onboarded */
    totalClasses?: number;
}

interface PanelInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    isRequired?: boolean;
    hasError?: boolean;
    disabled?: boolean;
}

const PanelInput = ({ label, value, onChange, onBlur, placeholder, isRequired = false, hasError = false, disabled = false }: PanelInputProps) => (
    <Field
        label={label}
        isRequired={isRequired}
        input={
            <Input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                placeholder={placeholder}
                disabled={disabled}
                hasError={hasError}
                isFullWidth
            />
        }
    />
);

const getFrenchOrdinal = (index: number): string => {
    if (index === 0) return '1ère';
    return `${index + 1}ème`;
};

export const StepProfile = ({ profileData, onProfileDataChange, countryCode, user, classroom, classIndex, totalClasses = 1 }: StepProfileProps) => {
    const t = useExtracted('StepProfile');
    const isMultiClass = totalClasses > 1;

    const updateField = (field: keyof ProfileData, value: string) => {
        onProfileDataChange({ ...profileData, [field]: value });
    };

    const handleAddressBlur = async () => {
        if (!profileData.schoolAddress.trim()) return;
        try {
            const response = await fetch(`/api/geo${serializeToQueryUrl({ query: profileData.schoolAddress })}`);
            const [data] = (await response.json()) as NominatimPlace[];
            if (data) {
                onProfileDataChange({
                    ...profileData,
                    coordinates: { lat: Number(data.lat), lng: Number(data.lon) },
                });
            }
        } catch {
            // silently fail — teacher can adjust the marker manually
        }
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

    const showMap = true;

    return (
        <div className={styles.stepProfileContainer}>
            <div className={styles.stepProfileForm}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                    <PelicoSearch style={{ width: '4rem', height: 'auto', marginRight: '1rem' }} />
                    {isMultiClass && classIndex !== undefined && (
                        <p className={styles.classIndexLabel}>
                            {t('Les informations de votre ')}
                            <strong>{getFrenchOrdinal(classIndex)}</strong>
                            {t(' classe')}
                        </p>
                    )}
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
                        onBlur={handleAddressBlur}
                        placeholder={t('Adresse de votre école')}
                        isRequired
                        hasError={!profileData.schoolAddress.trim()}
                    />
                    <Field label={t('Pays :')} input={<CountrySelect value={countryCode} onChange={() => {}} isFullWidth disabled />} />
                    <PanelInput
                        label={t('Alias :')}
                        value={profileData.classAlias}
                        onChange={(v) => updateField('classAlias', v)}
                        placeholder={`La classe${profileData.classLevel ? ' de ' + profileData.classLevel : ''} à ${profileData.schoolName || classroom.name}`}
                        isRequired={isMultiClass}
                        hasError={isMultiClass && !profileData.classAlias.trim()}
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
                {showMap && (
                    <div style={{ marginTop: '1rem' }}>
                        <span className={styles.stepProfilePreviewTitle}>{t('Est-ce que votre école est bien placée ?')}</span>
                        <p style={{ fontSize: '0.85rem', color: 'var(--grey-500)', marginBottom: '0.5rem' }}>
                            {t('Vérifiez que le marqueur est bien positionné sur votre école. Vous pouvez le déplacer si nécessaire.')}
                        </p>
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
