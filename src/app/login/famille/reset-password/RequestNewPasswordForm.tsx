'use client';

import { Button } from '@frontend/components/ui/Button';
import { Field, Input } from '@frontend/components/ui/Form';
import { Link } from '@frontend/components/ui/Link';
import { Title } from '@frontend/components/ui/Title';
import { requestNewPassword } from '@server-actions/authentication/request-new-password';
import { useExtracted } from 'next-intl';
import { useActionState, useState } from 'react';

import styles from './request-new-password-form.module.css';

type RequestNewPasswordFormProps = {
    error?: string;
};

const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email.length > 0 && emailRegex.test(email);
};

export const RequestNewPasswordForm = ({ error }: RequestNewPasswordFormProps) => {
    const t = useExtracted('app.login.famille.reset-password');
    const [email, setEmail] = useState('');
    const [message, RequestNewPasswordAction, isPending] = useActionState(requestNewPassword, error || '');

    return (
        <div style={{ display: 'flex', width: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <Title variant="h2" color="inherit" marginY="md">
                {t('Réinitialisation du mot de passe')}
            </Title>
            <Title variant="h3">{t("Veuillez renseigner l'email lié à votre compte.")}</Title>

            <form action={RequestNewPasswordAction} className={styles.resetForm}>
                {isPending && <p style={{ color: 'var(--success-color)', textAlign: 'center' }}>{t('Veuillez patienter...')}</p>}
                {message && <p style={{ color: 'var(--error-color)', textAlign: 'center' }}>{message}</p>}
                <Field
                    name="email"
                    label="Email"
                    input={
                        <Input
                            id="email"
                            name="email"
                            value={email}
                            isFullWidth
                            required
                            onChange={(e) => setEmail(e.target.value.trim())}
                            placeholder={t('Entrez votre adresse email')}
                        />
                    }
                />
                <Button label={t('Envoyer')} type="submit" color="primary" disabled={!isValidEmail(email)} />
            </form>
            <span style={{ fontSize: '14px', marginTop: '16px' }}>
                <Link href="/login/famille" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>
                    {t('Retourner à la connexion')}
                </Link>
            </span>
        </div>
    );
};
