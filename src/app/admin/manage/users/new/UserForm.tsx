'use client';

import { Button } from '@frontend/components/ui/Button/Button';
import { Field } from '@frontend/components/ui/Form/Field';
import { Input } from '@frontend/components/ui/Form/Input';
import { Select } from '@frontend/components/ui/Form/Select';
import { Loader } from '@frontend/components/ui/Loader/Loader';
import type { User, UserRole } from '@server/database/schemas/users';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface UserFormProps {
    user?: User;
    isSSOUser?: boolean;
    isNew?: boolean;
}
export const UserForm = ({ user, isSSOUser = false, isNew = false }: UserFormProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [name, setName] = useState(user?.name ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [role, setRole] = useState<UserRole>(user?.role ?? 'teacher');

    const [serverError, setServerError] = useState<string | null>(null);

    const isNameInvalid = name.trim().length === 0;
    const isEmailInvalid = email.trim().length === 0 || !EMAIL_REGEX.test(email);
    const hasValidationErrors = isNameInvalid || isEmailInvalid;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);

        if (hasValidationErrors) {
            return;
        }

        try {
            setIsLoading(true);
            if (isNew) {
                // TODO: Implement create user
            } else if (user) {
                // TODO: Implement update user
            }
            router.push('/admin/manage/users');
        } catch {
            setServerError('Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <Loader isLoading={isLoading} />
            {serverError && <div className={styles.error}>{serverError}</div>}
            <Field
                label="Email"
                name="email"
                input={
                    <Input
                        id="email"
                        name="email"
                        color="secondary"
                        isFullWidth
                        value={email}
                        placeholder="utilisateur@example.com"
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        disabled={isSSOUser}
                        required
                    />
                }
                helperText={
                    isSSOUser
                        ? "L'email ne peut pas être modifié car l'utilisateur est connecté via SSO"
                        : email.length > 0 && isEmailInvalid
                          ? "L'email n'est pas valide"
                          : undefined
                }
                helperTextStyle={isSSOUser ? { color: 'var(--secondary-600)' } : { color: 'var(--error-color)' }}
            />
            <Field
                label="Nom"
                name="name"
                input={
                    <Input
                        id="name"
                        name="name"
                        color="secondary"
                        isFullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nom de l'utilisateur"
                        required
                    />
                }
            />
            <Field
                label="Rôle"
                name="role"
                input={
                    <Select
                        id="role"
                        name="role"
                        color="secondary"
                        isFullWidth
                        value={role}
                        onChange={(value) => setRole(value as UserRole)}
                        options={ROLE_OPTIONS}
                        placeholder="Sélectionner un rôle"
                    />
                }
            />
            <div className={styles.buttons}>
                <Button label="Annuler" variant="outlined" color="grey" type="button" as="a" href="/admin/manage/users" />
                <Button
                    label={isNew ? 'Ajouter' : 'Modifier'}
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
