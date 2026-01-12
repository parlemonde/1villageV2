'use client';

import styles from '@app/admin/manage/manage.module.css';
import { Button } from '@frontend/components/ui/Button/Button';
import { IconButton } from '@frontend/components/ui/Button/IconButton';
import { Field } from '@frontend/components/ui/Form/Field';
import { Input } from '@frontend/components/ui/Form/Input';
import { Select } from '@frontend/components/ui/Form/Select';
import { Loader } from '@frontend/components/ui/Loader/Loader';
import { authClient } from '@frontend/lib/auth-client';
import { EyeNoneIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import type { User, UserRole } from '@server/database/schemas/users';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
const isValidPassword = (password: string): boolean => {
    return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9!@#$%^&*]/.test(password);
};

async function updateUser(
    user: User,
    data: { name: string; email: string; role: UserRole; password: string },
): Promise<{ error: { code?: string | undefined; message?: string | undefined; status: number; statusText: string } | null }> {
    if (user.name !== data.name || user.email !== data.email) {
        const { error } = await authClient.admin.updateUser({
            userId: user.id,
            data: {
                name: data.name,
                email: data.email,
            },
        });
        if (error) {
            return { error };
        }
    }

    if (user.role !== data.role) {
        const { error } = await authClient.admin.setRole({
            userId: user.id,
            role: data.role,
        });
        if (error) {
            return { error };
        }
    }

    if (data.password.trim().length > 0) {
        const { error } = await authClient.admin.setUserPassword({
            userId: user.id,
            newPassword: data.password,
        });
        if (error) {
            return { error };
        }
    }

    return { error: null };
}

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
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [serverError, setServerError] = useState<string | null>(null);

    const isNameInvalid = name.trim().length === 0;
    const isEmailInvalid = email.trim().length === 0 || !EMAIL_REGEX.test(email);
    const isPasswordInvalid = isNew
        ? password.trim().length === 0 || !isValidPassword(password)
        : password.trim().length > 0 && !isValidPassword(password); // if not new, password is not required
    const hasValidationErrors = isNameInvalid || isEmailInvalid || isPasswordInvalid;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);

        if (hasValidationErrors) {
            return;
        }

        setIsLoading(true);
        const { error } = isNew
            ? await authClient.admin.createUser({
                  email,
                  password,
                  name,
                  role,
              })
            : user
              ? await updateUser(user, { name, email, role, password })
              : { error: null };
        if (error) {
            setServerError(error.message ?? 'Une erreur est survenue');
        } else {
            router.push('/admin/manage/users');
        }
        setIsLoading(false);
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <Loader isLoading={isLoading} />
            {serverError && <div className={styles.error}>{serverError}</div>}
            <Field
                label="Email"
                name="email"
                isRequired
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
                isRequired
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
            <Field
                label="Mot de passe"
                name="password"
                isRequired={isNew}
                input={
                    <Input
                        id="password"
                        name="password"
                        color="secondary"
                        isFullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? 'text' : 'password'}
                        placeholder={isNew ? 'Entrez un mot de passe' : '********'}
                        required={isNew}
                        iconAdornment={
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => {
                                    setShowPassword(!showPassword);
                                }}
                                variant="borderless"
                                icon={showPassword ? EyeNoneIcon : EyeOpenIcon}
                                iconProps={{ style: { color: 'rgba(0, 0, 0, 0.54)', height: 24, width: 24 } }}
                            ></IconButton>
                        }
                        iconAdornmentProps={{ position: 'right' }}
                    />
                }
                helperText="Minimum 8 caractères : majuscules, minuscules et chiffres/symboles."
                helperTextStyle={{ color: isPasswordInvalid ? 'var(--error-color)' : 'var(--secondary-600)' }}
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
