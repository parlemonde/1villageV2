'use client';

import { CountryFlag } from '@frontend/components/CountryFlag';
import { Button } from '@frontend/components/ui/Button/Button';
import { Field } from '@frontend/components/ui/Form/Field';
import { Input } from '@frontend/components/ui/Form/Input';
import { Select } from '@frontend/components/ui/Form/Select';
import { Loader } from '@frontend/components/ui/Loader/Loader';
import { COUNTRIES } from '@lib/iso-3166-countries-french';
import { jsonFetcher } from '@lib/json-fetcher';
import type { User, UserRole } from '@server/database/schemas/users';
import type { Village } from '@server/database/schemas/villages';
import { createUser } from '@server-actions/users/create-user';
import { updateUser } from '@server-actions/users/update-user';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import styles from './user-form.module.css';

const ROLE_LABELS: Record<UserRole, string> = {
    admin: 'Admin',
    mediator: 'Médiateur',
    teacher: 'Enseignant',
    parent: 'Parent',
};

const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({
    value,
    label,
}));

const countryOptions = Object.entries(COUNTRIES).map(([key, value]) => ({
    label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CountryFlag size="small" country={key} />
            <span>{value}</span>
        </div>
    ),
    value: key,
}));

interface UserFormProps {
    user?: User;
    classroom?: {
        id: number;
        name: string;
        address: string;
        city: string;
        level?: string | null;
        countryCode: string;
        villageId?: number | null;
    };
    isNew?: boolean;
}

export const UserForm = ({ user, classroom, isNew = false }: UserFormProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // User form state
    const [name, setName] = useState(user?.name ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [role, setRole] = useState<UserRole>(user?.role ?? 'teacher');

    // Classroom form state
    const [schoolAddress, setSchoolAddress] = useState(classroom?.address ?? '');
    const [schoolCity, setSchoolCity] = useState(classroom?.city ?? '');
    const [postalCode, setPostalCode] = useState('');
    const [schoolName, setSchoolName] = useState(classroom?.name ?? '');
    const [classLevel, setClassLevel] = useState(classroom?.level ?? '');
    const [villageId, setVillageId] = useState<number | null>(classroom?.villageId ?? null);
    const [countryCode, setCountryCode] = useState(classroom?.countryCode ?? '');

    // Server error (from API)
    const [serverError, setServerError] = useState<string | null>(null);

    // Fetch villages
    const { data: villages } = useSWR<Village[]>('/api/villages', jsonFetcher);
    const villageOptions = villages?.map((village) => ({ value: village.id.toString(), label: village.name })) ?? [];

    // Form Validation
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    const isNameEmpty = trimmedName.length === 0;
    const isNameInvalid = isNameEmpty && name.length > 0;

    const isEmailEmpty = trimmedEmail.length === 0;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailFormatInvalid = trimmedEmail.length > 0 && !emailRegex.test(trimmedEmail);
    const isEmailInvalid = (isEmailEmpty && email.length > 0) || isEmailFormatInvalid;

    const isCountryCodeEmpty = !countryCode;
    const isCountryInvalid = isCountryCodeEmpty && countryCode.length > 0;

    const hasValidationErrors = isNameEmpty || isEmailEmpty || isEmailFormatInvalid || isCountryCodeEmpty;

    // Sync form state with props when they change (for edit mode)
    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setRole(user.role);
        }
    }, [user]);

    useEffect(() => {
        if (classroom) {
            setSchoolAddress(classroom.address);
            setSchoolCity(classroom.city);
            setSchoolName(classroom.name);
            setClassLevel(classroom.level ?? '');
            setVillageId(classroom.villageId ?? null);
            setCountryCode(classroom.countryCode);
        }
    }, [classroom]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);

        if (hasValidationErrors) {
            return;
        }

        try {
            setIsLoading(true);

            if (isNew) {
                await createUser({
                    name: trimmedName,
                    email: trimmedEmail,
                    role,
                    classroom: {
                        name: schoolName.trim() || 'École',
                        address: schoolAddress.trim(),
                        city: schoolCity.trim(),
                        level: classLevel.trim() || null,
                        countryCode,
                        villageId: villageId,
                    },
                });
            } else if (user) {
                await updateUser({
                    id: user.id,
                    name: trimmedName,
                    email: trimmedEmail,
                    role,
                    classroom: classroom
                        ? {
                              id: classroom.id,
                              name: schoolName.trim() || 'École',
                              address: schoolAddress.trim(),
                              city: schoolCity.trim(),
                              level: classLevel.trim() || null,
                              countryCode,
                              villageId: villageId,
                          }
                        : undefined,
                });
            }

            router.push('/admin/manage/users');
        } catch (err) {
            setServerError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/admin/manage/users');
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <Loader isLoading={isLoading} />

            {serverError && <div className={styles.error}>{serverError}</div>}

            <div>
                <Field
                    label={
                        <>
                            Email <span className={styles.required}>*</span>
                        </>
                    }
                    input={
                        <Input
                            color="secondary"
                            isFullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="utilisateur@example.com"
                            hasError={isEmailInvalid}
                        />
                    }
                />
                {isEmailEmpty && email.length > 0 && <p className={styles.errorMessage}>L&apos;email est requis</p>}
                {isEmailFormatInvalid && <p className={styles.errorMessage}>L&apos;email n&apos;est pas valide</p>}
            </div>

            <div>
                <Field
                    label={
                        <>
                            Pseudo <span className={styles.required}>*</span>
                        </>
                    }
                    input={
                        <Input
                            color="secondary"
                            isFullWidth
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nom de l'utilisateur"
                            hasError={isNameInvalid}
                        />
                    }
                />
                {isNameInvalid && <p className={styles.errorMessage}>Le pseudo est requis</p>}
            </div>

            <Field
                label="Adresse de l'école"
                input={
                    <Input
                        color="secondary"
                        isFullWidth
                        value={schoolAddress}
                        onChange={(e) => setSchoolAddress(e.target.value)}
                        placeholder="Adresse de l'école"
                    />
                }
            />

            <Field
                label="Ville de l'école"
                input={
                    <Input
                        color="secondary"
                        isFullWidth
                        value={schoolCity}
                        onChange={(e) => setSchoolCity(e.target.value)}
                        placeholder="Ville de l'école"
                    />
                }
            />

            <Field
                label="Code postal"
                input={
                    <Input
                        color="secondary"
                        isFullWidth
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="Code postal"
                    />
                }
            />

            <Field
                label="École"
                input={
                    <Input
                        color="secondary"
                        isFullWidth
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="Nom de l'école"
                    />
                }
            />

            <Field
                label="Niveau de la classe"
                input={
                    <Input
                        color="secondary"
                        isFullWidth
                        value={classLevel}
                        onChange={(e) => setClassLevel(e.target.value)}
                        placeholder="Niveau de la classe"
                    />
                }
            />

            <Field
                label="Rôle"
                input={
                    <Select
                        color="secondary"
                        isFullWidth
                        value={role}
                        onChange={(value) => setRole(value as UserRole)}
                        options={ROLE_OPTIONS}
                        placeholder="Sélectionner un rôle"
                    />
                }
            />

            <Field
                label="Village"
                input={
                    <Select
                        color="secondary"
                        isFullWidth
                        value={villageId?.toString() ?? ''}
                        onChange={(value) => setVillageId(value ? parseInt(value) : null)}
                        options={villageOptions}
                        placeholder="Sélectionner un village"
                    />
                }
            />

            <div>
                <Field
                    label={
                        <>
                            Pays <span className={styles.required}>*</span>
                        </>
                    }
                    input={
                        <Select
                            color="secondary"
                            isFullWidth
                            value={countryCode}
                            onChange={(value) => setCountryCode(value)}
                            options={countryOptions}
                            placeholder="Sélectionner un pays"
                            hasError={isCountryInvalid}
                        />
                    }
                />
                {isCountryInvalid && <p className={styles.errorMessage}>Le pays est requis</p>}
            </div>

            <div className={styles.buttons}>
                <Button label="Annuler" variant="outlined" color="grey" type="button" onClick={handleCancel} />
                <Button
                    label={isNew ? "Ajouter l'utilisateur" : 'Enregistrer'}
                    variant="contained"
                    color="primary"
                    type="submit"
                    isLoading={isLoading}
                    disabled={hasValidationErrors}
                />
            </div>
        </form>
    );
};
